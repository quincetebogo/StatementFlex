using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using StatementFlex.Core.Entities;
using StatementFlex.Core.Interfaces;
using StatementFlex.Infrastructure.Data;

namespace StatementFlex.Infrastructure.Services;

public class DownloadTokenService : IDownloadTokenService
{
    private readonly ApplicationDBContext _context;

    public DownloadTokenService(ApplicationDBContext context)
    {
        _context = context;
    }

    public async Task<string> GenerateDownloadTokenAsync(
        Guid statementId,
        Guid customerId,
        string? ipAddress = null,
        bool enableIpValidation = false,
        int expirationMinutes = 15,
        int maxDownloads = 1,
        CancellationToken cancellationToken = default)
    {
        // Generate cryptographically secure random token
        var tokenBytes = new byte[32];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(tokenBytes);
        }
        var token = Convert.ToBase64String(tokenBytes)
            .Replace("+", "-")
            .Replace("/", "_")
            .Replace("=", "");

        var downloadToken = new DownloadToken
        {
            Id = Guid.NewGuid(),
            StatementId = statementId,
            Token = token,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddMinutes(expirationMinutes),
            MaxDownloads = maxDownloads,
            DownloadCount = 0,
            IsRevoked = false,
            IpAddress = ipAddress,
            IpValidationEnabled = enableIpValidation
        };

        _context.DownloadTokens.Add(downloadToken);
        await _context.SaveChangesAsync(cancellationToken);

        return token;
    }

    public async Task<(bool IsValid, Statement? Statement, string? ErrorMessage)> ValidateAndGetStatementAsync(
        string token,
        string? ipAddress = null,
        CancellationToken cancellationToken = default)
    {
        var downloadToken = await _context.DownloadTokens
            .Include(dt => dt.Statement)
            .FirstOrDefaultAsync(dt => dt.Token == token, cancellationToken);

        if (downloadToken == null)
        {
            return (false, null, "Invalid or expired download token");
        }

        if (downloadToken.IsRevoked)
        {
            return (false, null, "Download token has been revoked");
        }

        if (DateTime.UtcNow > downloadToken.ExpiresAt)
        {
            return (false, null, "Download token has expired");
        }

        if (downloadToken.DownloadCount >= downloadToken.MaxDownloads)
        {
            return (false, null, "Download limit exceeded");
        }

        if (downloadToken.IpValidationEnabled && !string.IsNullOrEmpty(downloadToken.IpAddress))
        {
            if (ipAddress != downloadToken.IpAddress)
            {
                return (false, null, "IP address mismatch");
            }
        }

        // Check if statement is archived
        if (downloadToken.Statement?.IsArchived == true)
        {
            return (false, null, "Statement has been archived");
        }

        // Increment download count
        downloadToken.DownloadCount++;
        await _context.SaveChangesAsync(cancellationToken);

        return (true, downloadToken.Statement, null);
    }

    public async Task LogDownloadAttemptAsync(
        Guid statementId,
        Guid customerId,
        string token,
        string ipAddress,
        string userAgent,
        bool success,
        string? failureReason = null,
        CancellationToken cancellationToken = default)
    {
        var log = new StatementDownloadLog
        {
            Id = Guid.NewGuid(),
            StatementId = statementId,
            CustomerId = customerId,
            DownloadToken = token,
            DownloadedAt = DateTime.UtcNow,
            IpAddress = ipAddress,
            UserAgent = userAgent,
            Success = success,
            FailureReason = failureReason
        };

        _context.StatementDownloadLogs.Add(log);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task RevokeTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        var downloadToken = await _context.DownloadTokens
            .FirstOrDefaultAsync(dt => dt.Token == token, cancellationToken);

        if (downloadToken != null)
        {
            downloadToken.IsRevoked = true;
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
