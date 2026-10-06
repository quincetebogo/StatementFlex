using StatementFlex.Core.Entities;
namespace StatementFlex.Core.Interfaces;

public interface IPdfGenerationService
{
    Task<Stream> GenerateStatementPDFAsync(Customer customer, IEnumerable<Transactions> transactions, DateTime startPeriod, DateTime endPeriod );
    Task<byte[]> GenerateStatementByteAsync(Customer customer, IEnumerable<Transactions> transactions, DateTime startPeriod, DateTime endPeriod);
}
