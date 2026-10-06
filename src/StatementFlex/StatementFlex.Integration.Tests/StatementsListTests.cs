using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using StatementFlex.Application.Models;
using StatementFlex.Application.Services;
using StatementFlex.Infrastructure.Services;
using Xunit.Abstractions;

namespace StatementFlex.Integration.Tests;

public class StatementsListTests: BaseIntegrationTest
{
    public StatementsListTests(IntegrationTestWebAppFactory _factory, ITestOutputHelper output) : base(_factory, output)
    {
    }
    [Fact]
    public async Task GetStatementList_ShouldReturnStatements_WhenAuthenticatedCustomer()
    {
        var token = await _commonTools.RegisterAndLoginCustomerAsync(_client, "statement1.test@example.com");

        _client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var response = await _client.GetAsync("/api/StatementFlex/statement-list");

        response.EnsureSuccessStatusCode();
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        await using var responseStream = await response.Content.ReadAsStreamAsync();
        var statementList = await JsonSerializer.DeserializeAsync<StatementListResponse>(
            responseStream,
            JsonSerializerOptions.Web
        );

        Assert.NotNull(statementList);
        Assert.NotNull(statementList.AccountNumber);
        Assert.NotNull(statementList.DownloadLinks);
    }

    [Fact]
    public async Task GetStatementList_ShouldReturnUnauthorized_WhenNoToken()
    {
        await _commonTools.RegisterAndLoginCustomerAsync(_client, "statement2.test@example.com");

        _client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", "");

        var response = await _client.GetAsync("/api/StatementFlex/statement-list");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetStatementList_ShouldReturnUnauthorized_WhenInvalidToken()
    {
        var token = await _commonTools.RegisterAndLoginCustomerAsync(_client, "statement3.test@example.com");

        _client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token + "InvalidSuffix");

        var response = await _client.GetAsync("/api/StatementFlex/statement-list");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
    [Fact]
    public async Task GetStatementList_ShouldReturnUnauthorized_WhenExpiredToken()
    {
        using var shortLivedFactory = _factory.WithWebHostBuilder(builder =>
          {
              builder.ConfigureTestServices(services =>
              {
                  var jwtDescriptor = services.SingleOrDefault(s => s.ServiceType == typeof(JwtSettings));
                  if (jwtDescriptor != null)
                  {
                      services.Remove(jwtDescriptor);
                  }

                  services.AddSingleton(new JwtSettings
                  {
                      Issuer = "StatementFlex",
                      Audience = "StatementFlex",
                      Secret = "YourSuperSecretKeyThatShouldBeAtLeast32CharactersLong!",
                      ExpiryInMin = 0
                  });
              });
          });

        var shortLivedClient = shortLivedFactory.CreateClient();
        var registerRequest = new RegisterCustomerRequest
        {
            Email = "expired.test@example.com",
            PhoneNumber = "0712345678",
            FirstName = "Expired",
            LastName = "Test",
            Password = "SecurePassword123!"
        };

        await shortLivedClient.PostAsync("/api/auth/register", _commonTools.SerializeStringContent(registerRequest));

        var loginRequest = new CustomerLoginRequest
        {
            Email = "expired.test@example.com",
            Password = "SecurePassword123!"
        };

        var loginResponse = await shortLivedClient.PostAsync("/api/auth/login", _commonTools.SerializeStringContent(loginRequest));

        await using var loginStream = await loginResponse.Content.ReadAsStreamAsync();

        var loginData = await JsonSerializer.DeserializeAsync<CustomerLoginResponse>(
            loginStream,
            JsonSerializerOptions.Web);
        Assert.NotNull(loginData?.Token);

        shortLivedClient.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", loginData.Token);

        await Task.Delay(2000);

        var response = await shortLivedClient.GetAsync("/api/StatementFlex/statement-list");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetStatementList_ShouldReturnEmptyList_WhenNoStatementsExist()
    {
        var token = await _commonTools.RegisterAndLoginCustomerAsync(_client, "statement4.test@example.com");

        _client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var response = await _client.GetAsync("/api/StatementFlex/statement-list");

        response.EnsureSuccessStatusCode();
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        await using var responseStream = await response.Content.ReadAsStreamAsync();
        var statementList = await JsonSerializer.DeserializeAsync<StatementListResponse>(
            responseStream,
            JsonSerializerOptions.Web
        );

        Assert.NotNull(statementList);
        Assert.NotNull(statementList.AccountNumber);
        Assert.NotNull(statementList.DownloadLinks);
        Assert.Empty(statementList.DownloadLinks);
    }
    [Fact]
    public async Task GetStatementList_ShouldOnlyReturnCustomersOwnStatements()
    {
        // Create first customer and generate statements for all customers
        var token1 = await _commonTools.RegisterAndLoginCustomerAsync(_client, "customer1.test@example.com");

        var scope = _factory.Services.CreateScope();
        var statementService = scope.ServiceProvider.GetRequiredService<StatementManagementService>();
        await statementService.GenerateAndStoreStatement(CancellationToken.None);

        // Create second customer with their own statements
        var token2 = await _commonTools.RegisterAndLoginCustomerAsync(_client, "customer2.test@example.com");
        await statementService.GenerateAndStoreStatement(CancellationToken.None);

        // Login as first customer and verify they only see their own statements
        _client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token1);

        var response1 = await _client.GetAsync("/api/StatementFlex/statement-list");
        response1.EnsureSuccessStatusCode();

        await using var responseStream1 = await response1.Content.ReadAsStreamAsync();
        var statementList1 = await JsonSerializer.DeserializeAsync<StatementListResponse>(
            responseStream1,
            JsonSerializerOptions.Web
        );

        Assert.NotNull(statementList1);
        Assert.NotNull(statementList1.AccountNumber);
        Assert.NotEmpty(statementList1.DownloadLinks);

        // Login as second customer and verify they only see their own statements
        _client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token2);

        var response2 = await _client.GetAsync("/api/StatementFlex/statement-list");
        response2.EnsureSuccessStatusCode();

        await using var responseStream2 = await response2.Content.ReadAsStreamAsync();
        var statementList2 = await JsonSerializer.DeserializeAsync<StatementListResponse>(
            responseStream2,
            JsonSerializerOptions.Web
        );

        Assert.NotNull(statementList2);
        Assert.NotNull(statementList2.AccountNumber);
        Assert.NotEmpty(statementList2.DownloadLinks);

        // Verify customers have different account numbers and don't see each other's statements
        Assert.NotEqual(statementList1.AccountNumber, statementList2.AccountNumber);
    }
}
