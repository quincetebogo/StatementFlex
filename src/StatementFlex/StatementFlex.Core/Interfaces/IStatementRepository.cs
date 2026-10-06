using StatementFlex.Core.Entities;

namespace StatementFlex.Core.Interfaces;

public interface IStatementRepository
{
    Task UploadBatchStatementMetadata(IEnumerable<Statement> statements, CancellationToken cancellationToken);
    Task<IEnumerable<Statement>> GetStatementsByAccountNumberAsync(string acccountNumber);
    Task<IEnumerable<Statement>> GetExpiredStatementsAsync(CancellationToken cancellationToken);
    Task ArchiveStatementsAsync(IEnumerable<Guid> statementIds, CancellationToken cancellationToken);
}
