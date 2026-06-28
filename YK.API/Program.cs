using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using YK.Application.Auth.Commands;
using YK.Application.Interfaces;
using YK.Domain;
using YK.Infrastructure;
using YK.Infrastructure.Interceptors;
using YK.Infrastructure.Repositories;
using YK.Infrastructure.Services;
using YK.Presentation.MappingProfiles;
using YK.Presentation.Middleware;
using YK.Presentation.Services;

var builder = WebApplication.CreateBuilder(args);

// Add controllers from Presentation layer
builder.Services.AddControllers()
    .AddApplicationPart(typeof(YK.Presentation.Controllers.AuthController).Assembly);

// Add HttpContextAccessor for CurrentUserService
builder.Services.AddHttpContextAccessor();

// Add CORS policy for the frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("DefaultPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:3000") // standard Next.js port
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Configure Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "YK Language Learning API",
        Version = "v1",
        Description = "Backend API for YK Language Learning App"
    });

    // Configure JWT authentication in Swagger
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter 'Bearer' [space] and then your token in the text input below.\r\n\r\nExample: \"Bearer 12345abcdef\""
    });

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

// Add DbContext
builder.Services.AddSingleton<AuditSaveChangesInterceptor>();
builder.Services.AddDbContext<AppDbContext>((sp, options) =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    
    var dbHost = Environment.GetEnvironmentVariable("DB_HOST");
    var dbPort = Environment.GetEnvironmentVariable("DB_PORT");
    var dbName = Environment.GetEnvironmentVariable("DB_NAME");
    var dbUser = Environment.GetEnvironmentVariable("DB_USER");
    var dbPassword = Environment.GetEnvironmentVariable("DB_PASSWORD");

    if (string.IsNullOrEmpty(connectionString) && !string.IsNullOrEmpty(dbHost))
    {
        connectionString = $"Host={dbHost};Port={dbPort ?? "5432"};Database={dbName ?? "yk_learning_db"};Username={dbUser ?? "postgres"};Password={dbPassword ?? "postgres"};Include Error Detail=true";
    }

    var auditInterceptor = sp.GetRequiredService<AuditSaveChangesInterceptor>();
    options.UseNpgsql(connectionString)
           .AddInterceptors(auditInterceptor);
});

// Add Identity
builder.Services.AddIdentityCore<User>(options =>
{
    options.Password.RequireDigit = false;
    options.Password.RequireLowercase = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 6;
})
.AddRoles<Role>()
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders()
.AddSignInManager<SignInManager<User>>();

// Add Authentication and Authorization (JWT)
var jwtSettings = builder.Configuration.GetSection("Jwt");
var secretKey = jwtSettings["Secret"] ?? "SuperSecretKeyForDevelopmentOnlyPleaseChangeLater";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"] ?? "YKApi",
        ValidAudience = jwtSettings["Audience"] ?? "YKFrontEnd",
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// Add MediatR
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(RegisterCommand).Assembly));

// Add AutoMapper
builder.Services.AddAutoMapper(config => {}, typeof(AuthMappingProfile).Assembly);

// Add Repositories
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// Add Services
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddScoped<IImageStorageService, LocalImageStorageService>();
builder.Services.AddScoped<IUserStreakService, YK.Application.Services.UserStreakService>();
builder.Services.AddHttpClient<IDictionaryService, DictionaryApiService>();

var app = builder.Build();

// Register the global exception handling middleware
app.UseMiddleware<ExceptionMiddleware>();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "YK Language Learning API v1");
    });
}

app.UseHttpsRedirection();
app.UseStaticFiles(); // Enable serving files from wwwroot

app.UseCors("DefaultPolicy");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
