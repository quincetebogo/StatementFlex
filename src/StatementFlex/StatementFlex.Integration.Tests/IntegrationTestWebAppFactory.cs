using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.VisualStudio.TestPlatform.TestHost;
using StatementFlex.Infrastructure.Data;
using Testcontainers.PostgreSql;
using static System.Net.Mime.MediaTypeNames;
namespace StatementFlex.Integration.Tests;

public class IntegrationTestWebAppFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly PostgreSqlContainer _postgresSqlContainer;

    public IntegrationTestWebAppFactory()
    {
        _postgresSqlContainer = new PostgreSqlBuilder()
            .WithImage("postgres:16-alpine")
            .WithDatabase("statementflex")
            .WithUsername("myuser")
            .WithPassword("mypass")
            .WithCleanUp(true)
            .Build();
    }
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureTestServices(services =>
        {
            // Replace DbContexts with test container connections
            var applicationDescriptor = services.SingleOrDefault(s => s.ServiceType == typeof(DbContextOptions<ApplicationDBContext>));
            if (applicationDescriptor is not null)
            {
                services.Remove(applicationDescriptor);
            }
            var transactionDescriptor = services.SingleOrDefault(s => s.ServiceType == typeof(DbContextOptions<TransactionDBContext>));
            if (transactionDescriptor is not null)
            {
                services.Remove(transactionDescriptor);
            }

            services.AddDbContext<ApplicationDBContext>(options => options.UseNpgsql(_postgresSqlContainer.GetConnectionString()));
            services.AddDbContext<TransactionDBContext>(options => options.UseNpgsql(_postgresSqlContainer.GetConnectionString()));

            // Remove Hangfire to avoid dispose issues in tests
            var hangfireDescriptors = services.Where(d => d.ServiceType.FullName?.Contains("Hangfire") == true).ToList();
            foreach (var descriptor in hangfireDescriptors)
            {
                services.Remove(descriptor);
            }

            // Configure JSON options to avoid PipeWriter issues in tests
            services.Configure<Microsoft.AspNetCore.Mvc.JsonOptions>(options =>
            {
                options.JsonSerializerOptions.DefaultBufferSize = 4096;
            });
        });
        builder.ConfigureLogging( logging =>
        {
            logging.ClearProviders();
            logging.AddConsole();
            logging.AddDebug();
            logging.SetMinimumLevel(LogLevel.Trace);

            // Log all errors with full stack traces
            logging.AddFilter("Microsoft.AspNetCore", LogLevel.Warning);
            logging.AddFilter("StatementFlex", LogLevel.Trace);
        });
    }

    public async Task InitializeAsync()
    {
        try
        {
            Console.WriteLine("🔄 Starting test PostgreSQL container...");
            await _postgresSqlContainer.StartAsync();
            Console.WriteLine($"✅ Test container started: {_postgresSqlContainer.GetConnectionString()}");

            using var scope = Services.CreateScope();
            var applicationContext = scope.ServiceProvider.GetRequiredService<ApplicationDBContext>();
            var transactionContext = scope.ServiceProvider.GetRequiredService<TransactionDBContext>();

            Console.WriteLine("🔄 Creating database schema...");
            await applicationContext.Database.EnsureCreatedAsync();
            await transactionContext.Database.EnsureCreatedAsync();
            Console.WriteLine("✅ Test database schema created successfully");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Failed to initialize test database: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            throw;
        }
    }
    public new Task DisposeAsync()
    {
        return _postgresSqlContainer.StopAsync();
    }
}
