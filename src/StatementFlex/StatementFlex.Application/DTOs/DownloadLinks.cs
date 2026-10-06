using static System.Runtime.InteropServices.JavaScript.JSType;
namespace StatementFlex.Application.DTOs;

public class DownloadLinks
{
    public string DownloadLink { get; set; }
    public DateTime ExpiresIn { get; set; }
    public DateTime DateCreated { get; set; }
    public DateTime StatementPeriod { get; set; }
}
