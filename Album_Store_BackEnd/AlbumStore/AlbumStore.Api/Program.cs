using System.Text;
using AlbumStore.Api.Bootstrap;
using AlbumStore.Application.Bootstrap;
using AlbumStore.Application.Queries.AccountQueries;
using AlbumStore.Common.Config;
using AlbumStore.Domain.Entities;
using AlbumStore.Domain.Repositories;
using AlbumStore.Infrastructure.Bootstrap;
using AlbumStore.Infrastructure.WebSockets;
using AlbumStore.Persistence;
using AlbumStore.Persistence.Bootstrap;
using AlbumStore.Persistence.Repositories.Base;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.AspNetCore.Mvc.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);
const string MyAllowSpecificOrigins = "_myAllowSpecificOrigins";
//Add configuration from appsettings.json
builder.Configuration.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddEnvironmentVariables()
    .AddUserSecrets<Program>();

//settings cors policy
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
        policy =>
        {
            policy.WithOrigins("http://localhost:5173")
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials(); // If using credentials
        });
});

//Configure entity framework
string? connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrEmpty(connectionString))
{
    throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
}
builder.Services.AddDbContext<AlbumStoreDbContext>(options =>
    options.UseNpgsql(connectionString));
builder.Services.AddDbContext<AlbumStoreDbContext>(options =>
    options.UseNpgsql(connectionString));

// jwt token service
IConfigurationSection jwtSettings = builder.Configuration.GetSection("JwtConfig");
string jwtSecret = jwtSettings["secret"];

JwtConfig jwtConfig = new()
{
    Audience = jwtSettings["validAudience"],
    ExpiresIn = Convert.ToDouble(jwtSettings["expiresIn"]),
    Issuer = jwtSettings["validIssuer"],
    Secret = jwtSettings["secret"]
};
builder.Services
    .AddAuthentication(opt =>
    {
        opt.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        opt.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(opt =>
    {
        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["validIssuer"],
            ValidAudience = jwtSettings["validAudience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
        };
    }).AddCookie();
builder.Services.AddIdentity<ApplicationUser, Role>(o =>
{
    o.Password.RequireDigit = true;
    o.Password.RequireLowercase = false;
    o.Password.RequireUppercase = false;
    o.Password.RequireNonAlphanumeric = false;
    o.Password.RequiredLength = 6;
    o.Password.RequireUppercase = false;
    o.User.RequireUniqueEmail = true;
    o.SignIn.RequireConfirmedEmail = false;
}).AddEntityFrameworkStores<AlbumStoreDbContext>()
    .AddDefaultTokenProviders();
builder.Services.AddControllers();

//add mediatr
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(GetLoggedInUserQuery).Assembly));
builder.Services.AddValidatorsFromAssembly(typeof(GetLoggedInUserQuery).Assembly);

builder.Services.AddScoped(typeof(ILogRepository<>), typeof(LogRepository<>));

builder.Services.RegisterInfrastructureComponents();
builder.Services.RegisterApplicationServices();
builder.Services.RegisterRepositories();
builder.Services.RegisterWebAPIServices();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.EnableAnnotations();

    // Add JWT Bearer Authentication to Swagger
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Description = "Enter 'Bearer' followed by your token",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    // Apply security requirements globally in Swagger
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});
// Register WebSocketManager as a singleton
builder.Services.AddSingleton<AlbumStore.Infrastructure.WebSockets.WebSocketManager>();
builder.Services.AddSingleton<IActionContextAccessor, ActionContextAccessor>();
builder.Services.AddSingleton(jwtConfig);
builder.Services.AddScoped(x =>
{
    ActionContext actionContext = x.GetRequiredService<IActionContextAccessor>().ActionContext;
    IUrlHelperFactory factory = x.GetRequiredService<IUrlHelperFactory>();
    return factory.GetUrlHelper(actionContext);
});

builder.Services.AddSignalR();
var app = builder.Build();
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();

}
else
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}




app.UseSwagger();
app.UseSwaggerUI();
app.UseHttpsRedirection();
app.UseRouting();
app.UseCors(MyAllowSpecificOrigins);

app.UseAuthentication();
app.UseAuthorization();
app.MapHub<AlbumStoreHub>("/hubs/albumstore");
app.MapControllers();
app.Run();