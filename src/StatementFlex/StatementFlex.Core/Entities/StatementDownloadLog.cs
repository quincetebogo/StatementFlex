namespace StatementFlex.Core.Entities;

public class StatementDownloadLog
{
    public Guid Id { get; set; }
    public Guid StatementId { get; set; }
    public Guid CustomerId { get; set; }
    public string DownloadToken { get; set; } = string.Empty;
    public DateTime DownloadedAt { get; set; }
    public string IpAddress { get; set; } = string.Empty;
    public string UserAgent { get; set; } = string.Empty;
    public bool Success { get; set; }
    public string? FailureReason { get; set; }
}
