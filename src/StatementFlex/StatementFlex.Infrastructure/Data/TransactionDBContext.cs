using Microsoft.EntityFrameworkCore;
using StatementFlex.Core.Entities;

namespace StatementFlex.Infrastructure.Data;

public class TransactionDBContext :DbContext
{
    public TransactionDBContext(DbContextOptions<TransactionDBContext> options) : base(options)
    {

    }
    public DbSet<Transactions> Transactions => Set<Transactions>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(TransactionDBContext).Assembly);
    }
}
