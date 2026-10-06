using Microsoft.EntityFrameworkCore.Migrations;
namespace StatementFlex.Infrastructure.Data.MigrationConfig;

public class AddAccountNumberSequence : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateSequence<long>(
            name: "AccountNumberSequence",
            startValue: 110000000,
            incrementBy: 1
        );
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropSequence(name: "AccountNumberSequence");
    }
}
