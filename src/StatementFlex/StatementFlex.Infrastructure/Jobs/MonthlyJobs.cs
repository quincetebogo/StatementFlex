using Microsoft.Extensions.DependencyInjection;
using StatementFlex.Infrastructure.Services;

namespace StatementFlex.Infrastructure.Jobs;

public class MonthlyJobs
{
    private readonly IServiceScopeFactory _serviceScopeFactory;

    public MonthlyJobs(IServiceScopeFactory serviceScopeFactory)
    {
        _serviceScopeFactory = serviceScopeFactory;
    }
    public async Task ExecuteAsync()
    {
        using var scope = _serviceScopeFactory.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<StatementManagementService>();
        await service.GenerateAndStoreStatement();
    }

    public async Task ArchiveExpiredStatementsAsync()
    {
        using var scope = _serviceScopeFactory.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<StatementManagementService>();
        Console.WriteLine("Now attempting to archive the statements");
        await service.ArchiveExpiredStatementsAsync();
    }
}
