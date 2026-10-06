using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StatementFlex.Core.Entities;

namespace StatementFlex.Infrastructure.Data.Configuration;

public class TransactionDbConfiguration : IEntityTypeConfiguration<Transactions>
{
    public void Configure(EntityTypeBuilder<Transactions> builder)
    {
        builder.ToTable("Transactions");

        builder.HasKey(t => t.TransactionId);

        builder.Property(t => t.TransactionId)
            .IsRequired();

        builder.Property(t => t.TransactionType)
            .IsRequired();

        builder.Property(t => t.TransactionDate)
            .IsRequired();

        builder.Property(t => t.TransactionAmount)
            .IsRequired()
            .HasColumnType("decimal(18,2)");

        builder.Property(t => t.Balance)
            .IsRequired()
            .HasColumnType("decimal(18,2)");

        builder.Property(t => t.Reference)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(t => t.Description)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(t => t.AccountNumber)
            .IsRequired()
            .HasMaxLength(11);

        builder.Property(t => t.CustomerId)
            .IsRequired();

        builder.HasIndex(t => t.AccountNumber);
        builder.HasIndex(t => t.CustomerId);
        builder.HasIndex(t => t.TransactionDate);
    }
}
