using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.ValueGeneration;

namespace StatementFlex.Infrastructure.Data.ValueGenerators;

public class AccountNumberGenerator : ValueGenerator<string>
{
    private static long _counter = 10000000000; // Start at 11 digits

    public override bool GeneratesTemporaryValues => false;

    public override string Next(EntityEntry entry)
    {
        return Interlocked.Increment(ref _counter).ToString();
    }
}
