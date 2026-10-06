using System.Security.Principal;
using static System.Runtime.InteropServices.JavaScript.JSType;
namespace StatementFlex.Core.Entities;

public class Statement
{
    public Guid StatementId { get; set; }
    public Guid CustomerId { get; set; }
    public string FileName { get; set; }
    public DateTime DateCreated { get; set; }
    public string ContetnType { get; set; } = "application/pdf";
    public DateTime StatementPeriodStartDate { get; set; }
    public DateTime StatementPeriodEndDate { get; set; }
    public DateTime ExpiryDate { get; set; }
    public byte StatementStatus { get; set; }
    public string DownloadToken { get; set; } //this is gonna be used as that unique string so that people dont guess the download link
    public bool IsArchived { get; set; } = false;
    public DateTime? ArchivedDate { get; set; }
}
