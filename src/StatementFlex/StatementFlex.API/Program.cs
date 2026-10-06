using Microsoft.EntityFrameworkCore;
using OpenApiUi;
using StatementFlex.Core.CommonConfigs;
using StatementFlex.Application.Services;
using StatementFlex.Core.Entities;
using StatementFlex.Core.Interfaces;
using StatementFlex.Infrastructure.Data;
using StatementFlex.Infrastructure.Repositories;
using StatementFlex.Application.Mappers;
using FluentValidation;
using StatementFlex.Application.Models;
using StatementFlex.Application.Validators;
using FluentValidation.AspNetCore;
using StatementFlex.API.Middleware;
using StatementFlex.Infrastructure.Services;
using StatementFlex.Infrastructure.Storage;
using Hangfire;
using StatementFlex.Infrastructure.Jobs;
using StatementGenerationService = StatementFlex.Infrastructure.Services.StatementManagementService;
using Minio;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;
using Amazon.RDS.Util;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.Configure<StatementProcessing>(
    builder.Configuration.GetSection(StatementProcessing.SectionName)
);

// Register StatementProcessing as a singleton for direct injection
var statementProcessingConfig = new StatementProcessing();
builder.Configuration.GetSection(StatementProcessing.SectionName).Bind(statementProcessingConfig);
builder.Services.AddSingleton(statementProcessingConfig);

// Configure DbContext (Aurora PostgreSQL with IAM authentication)
var rdsHost = "statementflex.cluster-chy8q4kqw5ee.eu-north-1.rds.amazonaws.com";
var rdsPort = 5432;
var dbUser = "postgres";
var dbName = "statementflex";
var region = "eu-north-1";

var token = RDS.GenerateAuthenticationToken(
    hostname: rdsHost,
    port: rdsPort,
    username: dbUser,
    region: region
);

var connectionString = $"Host={rdsHost};Port={rdsPort};Database={dbName};Username={dbUser};Password={token};SslMode=Require";

builder.Services.AddDbContext<ApplicationDBContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddDbContext<TransactionDBContext>(options =>
    options.UseNpgsql(connectionString));

// Configure JWT settings
var jwtSettings = new JwtSettings
{
    Issuer = builder.Configuration["JwtSettings:Issuer"] ?? "StatementFlex",
    Audience = builder.Configuration["JwtSettings:Audience"] ?? "StatementFlex",
    Secret = builder.Configuration["JwtSettings:Secret"] ?? "YourSuperSecretKeyThatShouldBeAtLeast32CharactersLong!",
    ExpiryInMin = int.TryParse(builder.Configuration["JwtSettings:ExpirationMinutes"], out var exp) ? exp : 30
};
builder.Services.AddSingleton(jwtSettings);

// Configure JWT Authentication
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
        ValidIssuer = jwtSettings.Issuer,
        ValidAudience = jwtSettings.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret)),
        ClockSkew = TimeSpan.Zero
    };

    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
            var token = context.Request.Headers["Authorization"].ToString();
            logger.LogInformation($"Token received: {(string.IsNullOrEmpty(token) ? "NONE" : "Present")}");
            return Task.CompletedTask;
        },
        OnAuthenticationFailed = context =>
        {
            var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
            logger.LogError($"Authentication failed: {context.Exception.GetType().Name} - {context.Exception.Message}");
            if (context.Exception.InnerException != null)
            {
                logger.LogError($"Inner exception: {context.Exception.InnerException.Message}");
            }
            return Task.CompletedTask;
        },
        OnTokenValidated = context =>
        {
            var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
            var claims = string.Join(", ", context.Principal?.Claims.Select(c => $"{c.Type}={c.Value}") ?? Array.Empty<string>());
            logger.LogInformation($"Token validated successfully. Claims: {claims}");
            return Task.CompletedTask;
        }
    };
});

// Register AutoMapper
builder.Services.AddAutoMapper(typeof(MappingProfile));

// Register repositories
builder.Services.AddScoped<ICustomerRepository, CustomerRepository>();

// Register services
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<AuthenticationService>();
builder.Services.AddScoped<ProduceStatements>();

builder.Services.AddControllers();

// .NET 8 - Use Swashbuckle/Swagger instead of built-in OpenAPI
builder.Services.AddEndpointsApiExplorer();

// Configure CORS - use environment-specific policies
builder.Services.AddCors(options =>
{
    options.AddPolicy("Development",
        policy => policy
            .WithOrigins(
                "http://localhost:3000" //from the UI
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());

    options.AddPolicy("Production",
        policy => policy
            .WithOrigins(
                builder.Configuration["FrontendUrl"] ?? "https://capitecbank.co.za"
            )
            .WithMethods("GET", "POST", "PUT", "DELETE")
            .WithHeaders("Authorization", "Content-Type")
            .AllowCredentials()
            .SetIsOriginAllowedToAllowWildcardSubdomains());

    // Swagger/Testing policy - for Swagger UI and Postman testing
    options.AddPolicy("INT",
        policy => policy
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader());
});

builder.Services.AddTransient<IValidator<CustomerLoginRequest>, CustomerLoginValidator>();
builder.Services.AddTransient<IValidator<RegisterCustomerRequest>, CustomerRegistrationValidator>();
builder.Services.AddScoped<ICustomerRepository, CustomerRepository>();
builder.Services.AddScoped<IPdfGenerationService, PdfGenerationService>();
builder.Services.AddScoped<IStatementRepository, StatementRepository>();
builder.Services.AddScoped<ITransactionRepository, TransactionRepository>();
builder.Services.AddScoped<IDownloadTokenService, DownloadTokenService>();

// Configure MinIO client
var minioEndpoint = builder.Configuration["StorageSettings:MinIO:Endpoint"] ?? "localhost:9002";
var minioAccessKey = builder.Configuration["StorageSettings:MinIO:AccessKey"] ?? "minioadmin";
var minioSecretKey = builder.Configuration["StorageSettings:MinIO:SecretKey"] ?? "minioadmin";
var minioBucketName = builder.Configuration["StorageSettings:MinIO:BucketName"] ?? "statements";
var minioUseSSL = bool.Parse(builder.Configuration["StorageSettings:MinIO:UseSSL"] ?? "false");

builder.Services.AddSingleton<IMinioClient>(sp =>
{
    return new MinioClient()
        .WithEndpoint(minioEndpoint)
        .WithCredentials(minioAccessKey, minioSecretKey)
        .WithSSL(minioUseSSL)
        .Build();
});

// Register MinioStorageService with bucket name
builder.Services.AddScoped<IStorageService>(sp =>
{
    var minioClient = sp.GetRequiredService<IMinioClient>();
    return new MinioStorageService(minioClient, minioBucketName);
});

builder.Services.AddRateLimiter( options =>
{
          options.AddFixedWindowLimiter("fixed", opt =>
      {
          opt.Window = TimeSpan.FromMinutes(1);
          opt.PermitLimit = 60;
          opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
          opt.QueueLimit = 0;
      });

      // Sliding window: Smoother than fixed
      options.AddSlidingWindowLimiter("sliding", opt =>
      {
          opt.Window = TimeSpan.FromMinutes(1);
          opt.PermitLimit = 60;
          opt.SegmentsPerWindow = 6;
      });

      // Token bucket: Burst handling
      options.AddTokenBucketLimiter("token", opt =>
      {
          opt.ReplenishmentPeriod = TimeSpan.FromMinutes(1);
          opt.TokensPerPeriod = 60;
      });

      // Concurrency: Max concurrent requests
      options.AddConcurrencyLimiter("concurrent", opt =>
      {
          opt.PermitLimit = 10;
          opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
          opt.QueueLimit = 5;
      });

      options.OnRejected = async (context, token) =>
      {
          context.HttpContext.Response.StatusCode = 429;
          await context.HttpContext.Response.WriteAsync(
              "Too many requests. Please try again later.", token);
      };
});

// Removed automatic validation - using manual validation in controllers to support async validators
// builder.Services.AddFluentValidationAutoValidation();

// Only add Hangfire in non-test environments
if (!builder.Environment.IsEnvironment("Testing"))
{
    builder.Services.AddHangfire(config => config.UseInMemoryStorage());
    builder.Services.AddHangfireServer();
}

builder.Services.AddScoped<MonthlyJobs>();
builder.Services.AddScoped<StatementManagementService>();

var app = builder.Build();

// Automatically create database and tables on startup
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();

    try
    {
        logger.LogInformation("Starting database initialization...");

        var applicationContext = services.GetRequiredService<ApplicationDBContext>();
        var transactionContext = services.GetRequiredService<TransactionDBContext>();

        // EnsureCreated creates the database and tables if they don't exist (only if not exists)
        var appCreated = applicationContext.Database.EnsureCreated();
        logger.LogInformation($"ApplicationDBContext - Database created: {appCreated}");

        var transCreated = transactionContext.Database.EnsureCreated();
        logger.LogInformation($"TransactionDBContext - Database created: {transCreated}");

        logger.LogInformation("Database initialization completed successfully.");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred while creating the database.");
        throw; 
    }
}

// Use exception middleware to properly handle custom exceptions
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment() || app.Environment.IsEnvironment("Testing"))
{
    // Developer exception page can still be used alongside middleware
    // The middleware will handle our custom exceptions (like UnauthorizedCustomerException)
    // while unexpected exceptions can still show detailed error pages
}

if (app.Environment.IsDevelopment())
{
    app.UseCors("Development");
}
else if (app.Environment.IsEnvironment("INT"))
{
    app.UseCors("INT");
}
else
{
    app.UseCors("Production");
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    // .NET 8 - OpenApiUi should still work
    app.UseOpenApiUi(config =>
    {
        config.OpenApiSpecPath = "/openapi/v1.json";
    });
}
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

// Only configure Hangfire in non-test environments
if (!app.Environment.IsEnvironment("Testing"))
{
    app.UseHangfireDashboard("/hangfire", new DashboardOptions
    {

    });

    // Configure Hangfire recurring jobs
    try
    {
        // Generate monthly statements (runs every minute for testing)
        RecurringJob.AddOrUpdate<MonthlyJobs>(
            "monthly-statement-operation",
            job => job.ExecuteAsync(),
            Cron.Minutely());


        RecurringJob.AddOrUpdate<MonthlyJobs>(
            "archive-expired-statements",
            job => job.ArchiveExpiredStatementsAsync(),
            Cron.MinuteInterval(2));
            //Cron.Monthly(2)); every month at 2 in the morning

        var logger = app.Services.GetRequiredService<ILogger<Program>>();
        logger.LogInformation("Hangfire recurring jobs configured:");
        logger.LogInformation("  - monthly-statement-operation: Every minute");
        logger.LogInformation("  - archive-expired-statements: Daily at 2:00 AM");
        logger.LogInformation("Hangfire dashboard available at: /hangfire");
    }
    catch (Exception ex)
    {
        var logger = app.Services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Failed to configure Hangfire recurring jobs");
    }
}

app.MapControllers();

app.Run();

// Make the implicit Program class available to integration tests
public partial class Program { }
