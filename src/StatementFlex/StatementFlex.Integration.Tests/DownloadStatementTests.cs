using System.Net;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.DependencyInjection;
using StatementFlex.Application.Models;
using StatementFlex.Infrastructure.Services;
using Xunit.Abstractions;

namespace StatementFlex.Integration.Tests;

public class DownloadStatementTests : BaseIntegrationTest
{
    public DownloadStatementTests(IntegrationTestWebAppFactory _factory, ITestOutputHelper _output) : base(_factory, _output)
    {

    }
    [Fact]
    public async Task DownloadStatement_ShouldReturnPdf_WhenValidToken()
    {
        var registerContent = _commonTools.ValidRegistrationRequest();
        var registerContentJson = _commonTools.SerializeStringContent(registerContent);
        await _client.PostAsync("/api/auth/register", registerContentJson);
        var scope = _factory.Services.CreateScope();
        var statementService = scope.ServiceProvider.GetRequiredService<StatementManagementService>();
        await statementService.GenerateAndStoreStatement(CancellationToken.None);
        // Log in to get authentication token

        var loginContent = _commonTools.ValidLoginRequest();
        var loginJsonContent = _commonTools.SerializeStringContent(loginContent);
        var loginResponse = await _client.PostAsync("/api/auth/login", loginJsonContent);
        loginResponse.EnsureSuccessStatusCode();

        await using var loginStream = await loginResponse.Content.ReadAsStreamAsync();
        var loginData = await JsonSerializer.DeserializeAsync<CustomerLoginResponse>(
            loginStream,
            JsonSerializerOptions.Web
        );

        Assert.NotNull(loginData?.Token);

        // Add JWT token to client headers
        _client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", loginData.Token);


        // Act - Call the statement-list endpoint
        var response = await _client.GetAsync("/api/StatementFlex/statement-list");

        // Assert
        response.EnsureSuccessStatusCode();
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        await using var responseStream = await response.Content.ReadAsStreamAsync();
        var statementList = await JsonSerializer.DeserializeAsync<StatementListResponse>(
            responseStream,
            JsonSerializerOptions.Web
        );
        var downloadResponse = await _client.GetAsync(statementList.DownloadLinks[0].DownloadLink);

        Assert.Equal("application/pdf", downloadResponse.Content.Headers.ContentType?.MediaType);
        var pdfBytes = await downloadResponse.Content.ReadAsByteArrayAsync();
        Assert.NotNull(pdfBytes);
        Assert.True(pdfBytes.Length > 0, "PDF file should not be empty");
        var pdfHeader = Encoding.ASCII.GetString(pdfBytes.Take(4).ToArray());
        Assert.Equal("%PDF", pdfHeader);

        Assert.True(downloadResponse.Content.Headers.ContentDisposition != null,
          "Content-Disposition header should be present");
        Assert.Contains("statement_", downloadResponse.Content.Headers.ContentDisposition?.FileName);
        Assert.Contains(".pdf", downloadResponse.Content.Headers.ContentDisposition?.FileName);
    }
}
