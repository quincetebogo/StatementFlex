using System.Dynamic;
using Microsoft.EntityFrameworkCore;
using static System.Net.Mime.MediaTypeNames;
using StatementFlex.Core.Entities;
namespace StatementFlex.Infrastructure.Data;

public class ApplicationDBContext(DbContextOptions<ApplicationDBContext> options) : DbContext(options)
{
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Statement> Statements => Set<Statement>();
    public DbSet<DownloadToken> DownloadTokens => Set<DownloadToken>();
    public DbSet<StatementDownloadLog> StatementDownloadLogs => Set<StatementDownloadLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDBContext).Assembly);

        // Configure DownloadToken
        modelBuilder.Entity<DownloadToken>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Token).IsUnique();
            entity.HasIndex(e => new { e.StatementId, e.ExpiresAt });
            entity.HasOne(e => e.Statement)
                .WithMany()
                .HasForeignKey(e => e.StatementId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure StatementDownloadLog
        modelBuilder.Entity<StatementDownloadLog>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.StatementId);
            entity.HasIndex(e => e.CustomerId);
            entity.HasIndex(e => e.DownloadedAt);
        });
    }
}
