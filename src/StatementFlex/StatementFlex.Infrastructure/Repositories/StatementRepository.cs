using StatementFlex.Core.Interfaces;
using StatementFlex.Core.Entities;
using StatementFlex.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace StatementFlex.Infrastructure.Repositories;

public class StatementRepository(ApplicationDBContext applicationDBContext) : IStatementRepository
{
    public ApplicationDBContext _applicationDBContext = applicationDBContext;
    public Task UploadBatchStatementMetadata(IEnumerable<Statement> statements, CancellationToken cancellationToken)
    {
        _applicationDBContext.AddRange(statements);

        return _applicationDBContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<IEnumerable<Statement>> GetStatementsByAccountNumberAsync(string AccountNumber)
    {
        return await _applicationDBContext.Statements
            .Where(x => x.FileName == AccountNumber && !x.IsArchived)
            .OrderByDescending(x => x.DateCreated)
            .ToListAsync();
    }

    public async Task<IEnumerable<Statement>> GetExpiredStatementsAsync(CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        return await _applicationDBContext.Statements
            .Where(s => s.ExpiryDate < now && !s.IsArchived)
            .ToListAsync(cancellationToken);
    }

    public async Task ArchiveStatementsAsync(IEnumerable<Guid> statementIds, CancellationToken cancellationToken)
    {
        var statements = await _applicationDBContext.Statements
            .Where(s => statementIds.Contains(s.StatementId))
            .ToListAsync(cancellationToken);

        foreach (var statement in statements)
        {
            statement.IsArchived = true;
            statement.ArchivedDate = DateTime.UtcNow;
        }

        await _applicationDBContext.SaveChangesAsync(cancellationToken);
    }
}
