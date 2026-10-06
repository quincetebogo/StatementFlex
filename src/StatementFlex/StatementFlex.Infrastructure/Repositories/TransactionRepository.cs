using Microsoft.AspNetCore.JsonPatch.Internal;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualBasic;
using StatementFlex.Core.Entities;
using StatementFlex.Core.Interfaces;
using StatementFlex.Infrastructure.Data;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace StatementFlex.Infrastructure.Repositories;

public class TransactionRepository(TransactionDBContext transactionsDBContext) : ITransactionRepository
{
    public TransactionDBContext _transactionsDBContext = transactionsDBContext;

    public async Task<Dictionary<string, List<Transactions>>> GetBatchTransactionsAsync(List<Customer> customers, DateTime startOfMonth, DateTime endOfMonth)
    {
        var customerIds = customers.Select(x => x.Id).ToList();

        return await _transactionsDBContext.Transactions
            .Where(t => customerIds.Contains(t.CustomerId)
                     && t.TransactionDate >= startOfMonth
                     && t.TransactionDate <= endOfMonth)
            .OrderBy(t => t.TransactionDate)
            .GroupBy(t => t.AccountNumber)
            .ToDictionaryAsync(g => g.Key, g => g.ToList());
    }
}
