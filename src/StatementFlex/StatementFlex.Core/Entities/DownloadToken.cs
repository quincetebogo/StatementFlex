namespace StatementFlex.Core.Entities;

public class DownloadToken
{
    public Guid Id { get; set; }
    public Guid StatementId { get; set; }
    public string Token { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public int MaxDownloads { get; set; } = 1;
    public int DownloadCount { get; set; } = 0;
    public bool IsRevoked { get; set; } = false;
    public string? IpAddress { get; set; }
    public bool IpValidationEnabled { get; set; } = false;

    // Navigation property
    public Statement? Statement { get; set; }
}
