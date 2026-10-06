using StatementFlex.Core.Entities;
using StatementFlex.Core.Interfaces;
using QuestPDF.Infrastructure;
using QuestPDF.Fluent;
using QuestPDF.Helpers;

namespace StatementFlex.Infrastructure.Services;

public class PdfGenerationService : IPdfGenerationService
{
    public PdfGenerationService()
    {
        QuestPDF.Settings.License = LicenseType.Community;
    }
    public async Task<Stream> GenerateStatementPDFAsync(Customer customer, IEnumerable<Transactions> transactions, DateTime startPeriod, DateTime endPeriod )
    {
        var bytes = await GenerateStatementByteAsync(customer, transactions, startPeriod,endPeriod);
        return new MemoryStream(bytes);
    }
    public Task<byte[]> GenerateStatementByteAsync(Customer customer, IEnumerable<Transactions> transactions, DateTime startPeriod, DateTime endPeriod)
    {
        var transactionList = transactions.ToList();
        var totalCredits = transactionList.Where(x => x.TransactionType == 1).Sum(c => c.TransactionAmount);
        var totalDebits = transactionList.Where(x => x.TransactionType == 2).Sum(c => Math.Abs(c.TransactionAmount));
        var openingBalance = transactionList.FirstOrDefault()?.Balance ?? 0;
        var closingBalance = transactionList.LastOrDefault()?.Balance ?? 0;

        var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(10));

                    page.Header().Element(GenerateHeader);
                    page.Content().Element(content => GenerateStatemntBody(content, customer, transactionList, startPeriod, endPeriod, openingBalance, closingBalance, totalCredits, totalDebits));
                    page.Footer().Element(ComposeFooter);
                });
            }
        );
        return Task.FromResult(document.GeneratePdf());
    }

    private void GenerateHeader(IContainer container)
    {
        container.Row(row =>
        {
            row.RelativeItem().Column(column =>
            {
                column.Item().Text("Capitec Bank").FontSize(20).SemiBold().FontColor(Colors.Blue.Medium);
                column.Item().Text("Account Statement").FontSize(12);
            });

            row.RelativeItem().AlignRight().Column(column => column.Item().Text($"Generated: {DateTime.UtcNow:yyyy-MM-dd HH:mm}").FontSize(9));
        }
        );
    }

    private void GenerateStatemntBody(IContainer container,
    Customer customer,
    List<Transactions> transactions,
    DateTime startPeriod,
    DateTime endPeriod,
    decimal openingBalance,
    decimal closingBalance,
    decimal totalCredits,
    decimal totalDebits)
    {
        container.PaddingVertical(20).Column(column =>
        {
            column.Spacing(15);

            // Customer Information
            column.Item().Row(row =>
            {
                row.RelativeItem().Column(col =>
                {
                    col.Item().Text("Account Holder").SemiBold();
                    col.Item().Text(customer.FirstName + " " + customer.LastName);
                    col.Item().Text(customer.Email).FontSize(9);
                });

                row.RelativeItem().Column(col =>
                {
                    col.Item().Text("Account Details").SemiBold();
                    col.Item().Text($"Account Number: {customer.AccountNumber}");
                });
            });

            // Statement Period
            column.Item().LineHorizontal(1);
            column.Item().Row(row =>
            {
                row.RelativeItem().Text($"Statement Period: {startPeriod:dd MMM yyyy} - {endPeriod:dd MMM yyyy}").SemiBold();
            });

            // Summary
            column.Item().Background(Colors.Grey.Lighten3).Padding(10).Column(col =>
            {
                col.Item().Row(r =>
                {
                    r.RelativeItem().Text($"Opening Balance: R {openingBalance:N2}");
                    r.RelativeItem().Text($"Closing Balance: R {closingBalance:N2}").AlignRight();
                });
                col.Item().Row(r =>
                {
                    r.RelativeItem().Text($"Total Credits: R {totalCredits:N2}").FontColor(Colors.Green.Medium);
                    r.RelativeItem().Text($"Total Debits: R {totalDebits:N2}").FontColor(Colors.Red.Medium).AlignRight();
                });
                col.Item().Row(r =>
                {
                    r.RelativeItem().Text($"Transactions: {transactions.Count}");
                });
            });

            // Transactions Table
            column.Item().Text("Transaction History").FontSize(12).SemiBold();
            column.Item().Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.RelativeColumn(2); // Date
                    columns.RelativeColumn(4); // Description
                    columns.RelativeColumn(2); // Debit
                    columns.RelativeColumn(2); // Credit
                    columns.RelativeColumn(2); // Balance
                });

                // Header
                table.Header(header =>
                {
                    header.Cell().Element(CellStyle).Text("Date").SemiBold();
                    header.Cell().Element(CellStyle).Text("Description").SemiBold();
                    header.Cell().Element(CellStyle).AlignRight().Text("Debit").SemiBold();
                    header.Cell().Element(CellStyle).AlignRight().Text("Credit").SemiBold();
                    header.Cell().Element(CellStyle).AlignRight().Text("Balance").SemiBold();

                    static IContainer CellStyle(IContainer container)
                    {
                        return container.DefaultTextStyle(x => x.SemiBold()).PaddingVertical(5).BorderBottom(1).BorderColor(Colors.Black);
                    }
                });

                // Rows
                foreach (var transaction in transactions)
                {
                    var isCredit = transaction.TransactionType == 1;
                    var isDebit = transaction.TransactionType == 2;

                    table.Cell().Element(CellStyle).Text(transaction.TransactionDate.ToString("dd MMM yyyy"));
                    table.Cell().Element(CellStyle).Text(transaction.Description);
                    table.Cell().Element(CellStyle).AlignRight().Text(isDebit ? $"R {Math.Abs(transaction.TransactionAmount):N2}" : "").FontColor(Colors.Red.Medium);
                    table.Cell().Element(CellStyle).AlignRight().Text(isCredit ? $"R {transaction.TransactionAmount:N2}" : "").FontColor(Colors.Green.Medium);
                    table.Cell().Element(CellStyle).AlignRight().Text($"R {transaction.Balance:N2}");

                    static IContainer CellStyle(IContainer container)
                    {
                        return container.BorderBottom(1).BorderColor(Colors.Grey.Lighten2).PaddingVertical(5);
                    }
                }
            });
        });
    }
    private void ComposeFooter(IContainer container)
    {
        container.AlignCenter().Text(text => text.Span("This is a system-generated statement. For queries, contact support@StatementFlex.com").FontSize(8));
    }
}
