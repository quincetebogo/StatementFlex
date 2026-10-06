using System.Transactions;
using static System.Runtime.InteropServices.JavaScript.JSType;
namespace StatementFlex.Core.Entities;

public class Transactions
{
    public Guid TransactionId { get; set; }
    public int TransactionType { get; set; }
    public DateTime TransactionDate { get; set; }
    public decimal TransactionAmount { get; set; }
    public decimal Balance { get; set; }
    public string Reference { get; set; }
    public string Description { get; set; }
    public string AccountNumber { get; set; }
    public Guid CustomerId { get; set; }
}
