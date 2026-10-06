using StatementFlex.Application.DTOs;
namespace StatementFlex.Application.Models;

public class StatementListResponse
{
    public string AccountNumber { get; set; }
    public List<DownloadLinks> DownloadLinks { get; set; }
}
