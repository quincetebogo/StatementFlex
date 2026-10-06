using StatementFlex.Application.Models;
using StatementFlex.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Xunit.Abstractions;

namespace StatementFlex.Integration.Tests;

public class CustomerManagementTests : BaseIntegrationTest
{
    public CustomerManagementTests(IntegrationTestWebAppFactory factory, ITestOutputHelper output) : base(factory, output)
    {
    }

    [Fact]
    public async Task Create_ShouldAdd_A_NewClient_Upon_Registration()
    {
        var request = new Customer()
        {
            Email = "example@gmail.com",
            PhoneNumber = "071234322111",
            FirstName = "VeryFirst",
            LastName = "TestUser",
            HashPassword = "example"
        };
        await _applicationDbContext.Customers.AddAsync(request);
        await _applicationDbContext.SaveChangesAsync();
        var registerResponse  = await _applicationDbContext.Customers.FirstOrDefaultAsync(x => x.Email == request.Email);
        Assert.NotNull(registerResponse);
    }
}
