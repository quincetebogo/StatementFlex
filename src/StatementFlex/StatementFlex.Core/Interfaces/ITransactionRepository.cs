using StatementFlex.Core.Entities;

namespace StatementFlex.Core.Interfaces;

public interface ITransactionRepository
{
    Task<Dictionary<string, List<Transactions>>> GetBatchTransactionsAsync(List<Customer> customers, DateTime startOfMonth, DateTime endOfMonth);
}
