using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using AlbumStore.Application.Commands.AuthCommands;
using AlbumStore.Application.Common;
using AlbumStore.Application.Interfaces;
using AlbumStore.Application.Models;
using AlbumStore.Application.QueryProjections.Mappers;
using AlbumStore.Application.Services;
using AlbumStore.Common.Constants;
using AlbumStore.Domain.Entities;
using AlbumStore.Domain.Repositories;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AlbumStore.Application.Commands;
public  class AuthCommandHandler(UserManager<ApplicationUser> userManager,
    IJwtTokenService tokenService,
    IRepository<ApplicationUser> userRepository,
    IConfiguration configuration,
    ILogRepository<AuthCommandHandler> logRepository)
    : IRequestHandler<UserRegistrationCommand, CommandResponse>,
    IRequestHandler<UserLoginCommand, CommandResponse<UserLoginCommandResponse>>
{
    public async Task<CommandResponse> Handle(UserRegistrationCommand command, CancellationToken cancellationToken)
    {
        try
        {
            ApplicationUser applicationUser = new ApplicationUser
            {
                Email = command.Email,
                UserName = command.Email,
                FirstName = command.FirstName,
                LastName = command.LastName,
                DisplayName = command.DisplayName,
                EmailConfirmed = false
            };
            IdentityResult creationResult = await userManager.CreateAsync(applicationUser, command.Password);
            if (!creationResult.Succeeded)
            {
                var errors = creationResult.Errors.Select(e => e.Description).ToArray();
                return CommandResponse.Failed(errors);
            }

            IdentityResult roleResult = await userManager.AddToRoleAsync(applicationUser, Roles.User);
            if (!roleResult.Succeeded)
            {
                return CommandResponse.Failed(roleResult.Errors.Select(e => e.Description).ToArray());
            }

            return CommandResponse.Ok();

        }
        catch (Exception ex)
        {
            logRepository.LogException(LogLevel.Error,ex);
            throw;
        }
    }
    public async Task<CommandResponse<UserLoginCommandResponse>> Handle(UserLoginCommand command, CancellationToken cancellationToken)
    {
        try
        {
            if (command.IsGuestLogin)
            {
                var guestUser = new ApplicationUser
                {
                    DisplayName = "Guest " + Guid.NewGuid().ToString(),
                    FirstName = "Guest ",
                    LastName = "Guest",
                    Email = null,

                };
               
                var token = GenerateGuestToken(guestUser);

                return new CommandResponse<UserLoginCommandResponse>(new UserLoginCommandResponse()
                {
                    Token = token,
                    User = ApplicationUserToApplicationUserDto(guestUser),
                });
            }


            ApplicationUser? applicationUser = await userManager.FindByEmailAsync(command.Email);

            CommandResponse<UserLoginCommandResponse> validationResult = ValidateUser(applicationUser);
            if (validationResult != null)
            {
                return validationResult;
            }

            bool passwordValid = await userManager.CheckPasswordAsync(applicationUser, command.Password);

            if (!passwordValid)
            {
                return CommandResponse.Failed<UserLoginCommandResponse>("Invalid username or Password!");
            }

            return await GetApplicationUserDto(applicationUser, cancellationToken);

        }
        catch (Exception ex)
        {
            logRepository.LogException(LogLevel.Error, ex);
            throw;
        }
    }

    private async Task<CommandResponse<UserLoginCommandResponse>> GetApplicationUserDto(ApplicationUser applicationUser, CancellationToken cancellationToken)
    {
        ApplicationUserDto? applicationUserDto = await userRepository.Query(u => u.Id == applicationUser.Id).ProjectToDto().FirstOrDefaultAsync(cancellationToken);

        if (applicationUserDto == null)
        {
            return CommandResponse.Failed<UserLoginCommandResponse>("User not found.");
        }

        UserLoginCommandResponse response = new UserLoginCommandResponse
        {
            Token = tokenService.CreateToken(applicationUser, applicationUserDto.Roles),
            User = applicationUserDto
        };

        return CommandResponse.Ok(response);
    }

    private string GenerateGuestToken(ApplicationUser user)
    {
        // You can implement a JWT or temporary token generator here.
        // For example, in case of JWT:
        var token = tokenService.CreateToken(user, new[] { "Guest" });
        return token;
    }

    private CommandResponse<UserLoginCommandResponse> ValidateUser(ApplicationUser? applicationUser)
   =>  applicationUser switch
        {
            null => CommandResponse.Failed<UserLoginCommandResponse>(@"Invalid username Or Password"),
            { IsDisabledByAdmin: true } => CommandResponse.Failed<UserLoginCommandResponse>("User Disabled by Admin!"),
            _ => null
        };

    private ApplicationUserDto ApplicationUserToApplicationUserDto(ApplicationUser user)
    => new ApplicationUserDto
    {
        Id = user.Id,
        Email = user.Email,
        FirstName = user.FirstName,
        LastName = user.LastName,
        DisplayName = user.DisplayName,
        Roles = new[] {"Guest"}
    };

}
