using StatementFlex.Core.Interfaces;
using StatementFlex.Core.CommonConfigs;
using StatementFlex.Core.Entities;
using Microsoft.Extensions.Logging;

namespace StatementFlex.Infrastructure.Services;

public class StatementManagementService
{
    private readonly ICustomerRepository _customerRepository;
    private readonly ITransactionRepository _transactionRepository;
    private readonly IPdfGenerationService _pdfGenerationService;
    private readonly IStorageService _storageService;
    private readonly IStatementRepository _statementRepository;
    private readonly StatementProcessing _statementProcessing;
    private readonly ILogger<StatementManagementService> _logger;

    public StatementManagementService(
        ICustomerRepository customerRepository,
        ITransactionRepository transactionRepository,
        StatementProcessing statementProcessing,
        IPdfGenerationService pdfGenerationService,
        IStorageService storageService,
        IStatementRepository statementRepository,
        ILogger<StatementManagementService> logger)
    {
        _customerRepository = customerRepository;
        _transactionRepository = transactionRepository;
        _statementProcessing = statementProcessing;
        _pdfGenerationService = pdfGenerationService;
        _storageService = storageService;
        _statementRepository = statementRepository;
        _logger = logger;
    }

    public async Task GenerateAndStoreStatement(CancellationToken cancellationToken = default)
    {
        bool hasMoreCustomers = true;
        var pageSize = _statementProcessing.PageSize;
        var startIndex = _statementProcessing.InitialPageIndex;
        DateTime today = DateTime.UtcNow.Date;
        DateTime previousMonthDate = today.AddMonths(-1);

        var firstDayOfPreviousMonth = new DateTime(previousMonthDate.Year, previousMonthDate.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        int daysInMonth = DateTime.DaysInMonth(previousMonthDate.Year, previousMonthDate.Month);
        DateTime lastDayMidnight = new DateTime(previousMonthDate.Year, previousMonthDate.Month, daysInMonth, 0, 0, 0, DateTimeKind.Utc);

        while (hasMoreCustomers)
        {
            var skipCount = pageSize * startIndex;
            var customers = await _customerRepository.GetBatchCustomersAsync(skipCount, pageSize);

            Console.WriteLine($"Batch {startIndex}: Skipping {skipCount}, fetched {customers?.Count ?? 0} customers");

            if (customers == null || customers.Count == 0)
            {
                hasMoreCustomers = false;
                break;
            }
            var transactions = await _transactionRepository.GetBatchTransactionsAsync(customers, firstDayOfPreviousMonth, lastDayMidnight);

            var statementTasks = customers.Select(async customer =>
            {
                transactions.TryGetValue(customer.AccountNumber, out var customerTransactions);
                var statementStream = await _pdfGenerationService.GenerateStatementPDFAsync(customer, customerTransactions ?? [], firstDayOfPreviousMonth, lastDayMidnight);
                var storageKey = await _storageService.UploadStatementAsync(statementStream, customer.AccountNumber, cancellationToken, "application/pdf");

                return new Statement()
                {
                    StatementId = Guid.NewGuid(),
                    DownloadToken = storageKey,
                    ContetnType = "application/pdf",
                    CustomerId = customer.Id,
                    StatementStatus = 1,
                    FileName = customer.AccountNumber,
                    StatementPeriodStartDate = firstDayOfPreviousMonth,
                    StatementPeriodEndDate = lastDayMidnight,
                    ExpiryDate = DateTime.UtcNow.AddMinutes(2), //for testing purposes, this should expire two min after creation //DateTime.SpecifyKind(lastDayMidnight.AddMonths(1), DateTimeKind.Utc), //this will expire two months after creating
                    DateCreated = DateTime.UtcNow
                };
            });

            var batchStatements = await Task.WhenAll(statementTasks);
            await _statementRepository.UploadBatchStatementMetadata(batchStatements, cancellationToken);
            startIndex++;
        }
        return;
    }

    public async Task ArchiveExpiredStatementsAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Starting statement archiving process...");

            var expiredStatements = await _statementRepository.GetExpiredStatementsAsync(cancellationToken);
            var statementsList = expiredStatements.ToList();

            if (statementsList.Count == 0)
            {
                _logger.LogInformation("No expired statements found to archive.");
                return;
            }

            _logger.LogInformation("Found {Count} expired statements to archive.", statementsList.Count);

            // Archive database records (soft delete)
            var statementIds = statementsList.Select(s => s.StatementId).ToList();
            await _statementRepository.ArchiveStatementsAsync(statementIds, cancellationToken);

            _logger.LogInformation("Successfully archived {Count} statements in database.", statementsList.Count);

            // Optional: Delete files from MinIO to save storage space
            // Commented out by default - uncomment if you want to delete files
            /*
            var deletedCount = 0;
            foreach (var statement in statementsList)
            {
                try
                {
                    await _storageService.DeleteFileAsync(statement.DownloadToken, cancellationToken);
                    deletedCount++;
                }
                catch (Exception ex)
                {
                    _logger.LogWarning("Failed to delete file for statement {StatementId}: {Message}", statement.StatementId, ex.Message);
                }
            }
            _logger.LogInformation("Deleted {DeletedCount} of {TotalCount} statement files from storage.", deletedCount, statementsList.Count);
            */
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred during statement archiving process.");
            throw;
        }
    }

    public async Task<int> GetExpiredStatementsCountAsync(CancellationToken cancellationToken = default)
    {
        var expiredStatements = await _statementRepository.GetExpiredStatementsAsync(cancellationToken);
        return expiredStatements.Count();
    }
}
