using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using StatementFlex.Core.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StatementFlex.Infrastructure.Data.ValueGenerators;
namespace StatementFlex.Infrastructure.Data.Configuration;

public class CustomerDbConfiguration : IEntityTypeConfiguration<Customer>
{
    public void Configure(EntityTypeBuilder<Customer> builder)
    {
        builder.ToTable("Customers");

        builder.HasKey(c => c.Id);

        builder.HasIndex(c => c.Id)
            .IsUnique(true);

        builder.Property(c => c.AccountNumber)
            .HasMaxLength(11)
            .HasValueGenerator<AccountNumberGenerator>()
            .ValueGeneratedOnAdd();
        builder.Property(c => c.Email)
            .IsRequired(true)
            .HasMaxLength(50);
        builder.HasIndex(c => c.Email)
            .IsUnique(true);
        builder.Property(c => c.FirstName)
            .IsRequired(true)
            .HasMaxLength(100);
        builder.Property(c => c.LastName)
            .IsRequired(true)
            .HasMaxLength(100);
        builder.Property(c => c.LastLogin)
            .IsRequired(false);
        builder.Property(c => c.HashPassword)
            .IsRequired(true)
            .HasMaxLength(500);
        builder.Property(c => c.DateCreated)
            .IsRequired(true);
        builder.Property(x => x.PhoneNumber)
            .IsRequired(true);
    }
}
