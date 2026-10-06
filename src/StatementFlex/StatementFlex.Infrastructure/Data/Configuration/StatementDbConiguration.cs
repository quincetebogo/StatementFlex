using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StatementFlex.Core.Entities;
namespace StatementFlex.Infrastructure.Data.Configuration;

public class StatementDbConiguration : IEntityTypeConfiguration<Statement>
{
    public void Configure(EntityTypeBuilder<Statement> builder)
    {
        builder.ToTable("Statements");

        builder.HasKey(c => c.StatementId);
        builder.HasIndex(c => c.StatementId)
        .IsUnique(true);
        
    }
}
