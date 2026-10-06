using StatementFlex.Application.DTOs;
using StatementFlex.Application.Models;
using StatementFlex.Core.Interfaces;
using Microsoft.AspNetCore.Http;

namespace StatementFlex.Application.Services;

public class ProduceStatements
{
    private readonly IStatementRepository _statementRepository;
    private readonly IStorageService _storageService;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IDownloadTokenService _downloadTokenService;

    public ProduceStatements(
        IStatementRepository statementRepository,
        IStorageService storageService,
        IHttpContextAccessor httpContextAccessor,
        IDownloadTokenService downloadTokenService)
    {
        _statementRepository = statementRepository;
        _storageService = storageService;
        _httpContextAccessor = httpContextAccessor;
        _downloadTokenService = downloadTokenService;
    }

    public async Task<StatementListResponse> GetStatementListAsync(string accountNumber, Guid customerId)
    {
        try
        {
            var statementList = await _statementRepository.GetStatementsByAccountNumberAsync(accountNumber);
            var baseUrl = GetBaseUrl();
            var ipAddress = _httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString();

            var downloadLinks = new List<DownloadLinks>();

            // Generate tokens sequentially to avoid DbContext threading issues
            foreach (var statement in statementList)
            {
                // Generate a secure download token with multiple uses
                var token = await _downloadTokenService.GenerateDownloadTokenAsync(
                    statement.StatementId,
                    customerId,
                    ipAddress,
                    enableIpValidation: false, // Set to true for stricter security
                    expirationMinutes: 60,     // 1 hour expiration
                    maxDownloads: 5            // Allow 5 downloads per token
                );

                downloadLinks.Add(new DownloadLinks
                {
                    DownloadLink = $"{baseUrl}/api/StatementFlex/download/{token}",
                    ExpiresIn = statement.ExpiryDate,
                    DateCreated = statement.DateCreated,
                    StatementPeriod = statement.StatementPeriodStartDate
                });
            }

            return new StatementListResponse
            {
                AccountNumber = accountNumber,
                DownloadLinks = downloadLinks
            };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error fetching statements for account {accountNumber}: {ex.Message}");
            return new StatementListResponse
            {
                AccountNumber = accountNumber,
                DownloadLinks = []
            };
        }
    }

    private string GetBaseUrl()
    {
        var request = _httpContextAccessor.HttpContext?.Request;
        if (request == null)
            return "http://localhost:5006"; // Fallback for non-HTTP contexts

        var scheme = request.Scheme; // http or https
        var host = request.Host.Value; // localhost:5006 or yourdomain.com

        return $"{scheme}://{host}";
    }
    public async Task<(bool IsValid, Stream? FileStream, string? ErrorMessage)> ValidateAndDownloadFileAsync(string downloadToken, string ipAddress, CancellationToken cancellationToken = default)
    {
        var (isValid, statement, errorMessage) = await _downloadTokenService.ValidateAndGetStatementAsync(downloadToken, ipAddress, cancellationToken);

        if (!isValid || statement == null)
        {
            return (false, null, errorMessage);
        }

        try
        {
            var fileStream = await _storageService.DownloadFileAsync(statement.DownloadToken, cancellationToken);
            return (true, fileStream, null);
        }
        catch (Exception ex)
        {
            return (false, null, $"Failed to retrieve file: {ex.Message}");
        }
    }

}
