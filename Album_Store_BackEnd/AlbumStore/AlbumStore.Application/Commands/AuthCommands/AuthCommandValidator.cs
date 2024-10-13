using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AlbumStore.Application.Commands.AuthCommands
{
    public class UserRegistrationCommandValidator : AbstractValidator<UserRegistrationCommand>
    {
        public UserRegistrationCommandValidator()
        {
            RuleFor(e => e.Email).NotNull().NotEmpty().EmailAddress();
            RuleFor(e => e.Password).NotNull().NotEmpty();
            RuleFor(e => e.ConfirmPassword).Equal(e => e.Password);
            RuleFor(e => e.FirstName).NotNull().NotEmpty();
            RuleFor(e => e.LastName).NotNull().NotEmpty();
        }
    }

    public class UserLoginCommandValidator : AbstractValidator<UserLoginCommand>
    {
        public UserLoginCommandValidator()
        {
            RuleFor(e => e.Email).NotNull().NotEmpty().EmailAddress();
            RuleFor(e => e.Password).NotNull().NotEmpty();
        }
    }

}
