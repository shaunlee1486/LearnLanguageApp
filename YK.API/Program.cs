using Microsoft.OpenApi.Models;
using YK.Presentation.Middleware;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using YK.Domain;
using YK.Infrastructure;
using YK.Infrastructure.Interceptors;
using YK.Application.Interfaces;
using YK.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Add controllers from Presentation layer
builder.Services.AddControllers()
    .AddApplicationPart(typeof(YK.Presentation.Controllers.TestController).Assembly);

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
.AddDefaultTokenProviders();

// Add Repositories
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// Add Authentication and Authorization placeholders (fully configured in Phase 3)
builder.Services.AddAuthentication();
builder.Services.AddAuthorization();

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

app.UseCors("DefaultPolicy");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
