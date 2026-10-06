using static System.Runtime.InteropServices.JavaScript.JSType;
namespace StatementFlex.Core.Entities;

public class Account
{
    public string AccountNumber { get; set; }
    public int AccountType { get; set; }
    public DateTime AccountOpenDate { get; set; }
    public string Currency { get; set; }
    public int BranchCode { get; set; }
    public decimal CurrentBalance { get; set; }
}
