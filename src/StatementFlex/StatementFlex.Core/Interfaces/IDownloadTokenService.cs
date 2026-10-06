using StatementFlex.Core.Entities;

namespace StatementFlex.Core.Interfaces;

public interface IDownloadTokenService
{
    Task<string> GenerateDownloadTokenAsync(Guid statementId, Guid customerId, string? ipAddress = null, bool enableIpValidation = false, int expirationMinutes = 15, int maxDownloads = 1, CancellationToken cancellationToken = default);
    Task<(bool IsValid, Statement? Statement, string? ErrorMessage)> ValidateAndGetStatementAsync(string token, string? ipAddress = null, CancellationToken cancellationToken = default);
    Task LogDownloadAttemptAsync(Guid statementId, Guid customerId, string token, string ipAddress, string userAgent, bool success, string? failureReason = null, CancellationToken cancellationToken = default);
    Task RevokeTokenAsync(string token, CancellationToken cancellationToken = default);
}
