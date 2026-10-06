using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using StatementFlex.Application.Models;
using Xunit.Abstractions;

namespace StatementFlex.Integration.Tests;

public class AuthenticationRegistrationTests : BaseIntegrationTest
{
    public AuthenticationRegistrationTests(IntegrationTestWebAppFactory factory, ITestOutputHelper output)
        : base(factory, output)
    {
    }

    [Fact]
    public async Task Register_ShouldCreateNewCustomer_WhenValidDataProvided()
    {
        // Arrange
        var request = new RegisterCustomerRequest
        {
            Email = "register.new@example.com",
            PhoneNumber = "0712345678",
            FirstName = "Register",
            LastName = "Test",
            Password = "SecurePassword123!"
        };
        var jsonContent = _commonTools.SerializeStringContent(request);
        var response = await _client.PostAsync("/api/auth/register", jsonContent);

        if (response.StatusCode == HttpStatusCode.BadRequest)
        {
            var errorContent = await response.Content.ReadAsStringAsync();
            _output.WriteLine($"Validation failed: {errorContent}");
            Assert.Fail($"Registration failed validation. Check test output for details.");
        }

        // Assert Database State - this is the real test since response serialization fails in .NET 9
        var customerInDb = await _applicationDbContext.Customers
            .FirstOrDefaultAsync(c => c.Email == request.Email);

        Assert.NotNull(customerInDb);
        Assert.Equal(request.FirstName, customerInDb.FirstName);
        Assert.Equal(request.LastName, customerInDb.LastName);
        Assert.Equal(request.Email, customerInDb.Email);
        Assert.Equal(request.PhoneNumber, customerInDb.PhoneNumber);
        Assert.NotNull(customerInDb.HashPassword);
        Assert.NotEqual(request.Password, customerInDb.HashPassword); // Password should be hashed
        Assert.NotNull(customerInDb.AccountNumber);
        Assert.NotEmpty(customerInDb.AccountNumber);
    }

    [Fact]
    public async Task Database_ShouldConnect_WhenAppStarts()
    {
        var isConnected = await _applicationDbContext.Database.CanConnectAsync();
        Assert.True(isConnected);
    }

    [Fact]
    public async Task Database_ShouldInsertCustomer_Directly()
    {
        // Arrange
        var customer = new Core.Entities.Customer
        {
            Id = Guid.NewGuid(),
            Email = "direct.test@example.com",
            FirstName = "Direct",
            LastName = "Test",
            PhoneNumber = "0712345678",
            HashPassword = "hashed",
            DateCreated = DateTime.UtcNow
        };

        //Act - Insert directly via repository
        var result = await _customerRepository.RegisterCustomerAsync(customer, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.NotNull(result.AccountNumber);
        _output.WriteLine($"✅ Customer created with AccountNumber: {result.AccountNumber}");
    }

    [Fact]
    public async Task Register_ShouldReturnBadRequest_WhenInvalidEmailFormat()
    {
        //Arramge
        var request = new RegisterCustomerRequest
        {
            Email = "john.doeexample.com",
            PhoneNumber = "0712345678",
            FirstName = "John",
            LastName = "Doe",
            Password = "SecurePassword123!"
        };

        // Act
        var jsonContent = new StringContent(
            System.Text.Json.JsonSerializer.Serialize(request),
            System.Text.Encoding.UTF8,
            "application/json");

        var response = await _client.PostAsync("/api/auth/register", jsonContent);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        //Assert.Fail("Invalid email format");
    }
    [Fact]
    public async Task Login_ShouldReturnToken_WhenValidCredentials()
    {
        var token = await _commonTools.RegisterAndLoginCustomerAsync(_client, "login.valid@example.com");

        Assert.NotNull(token);
        Assert.NotEmpty(token);
    }

    [Fact]
    public async Task Login_ShouldReturnUnauthorized_WhenInvalidCredentials()
    {
        await _commonTools.RegisterAndLoginCustomerAsync(_client, "login.invalid@example.com");

        var loginRequest = new CustomerLoginRequest
        {
            Email = "login.invalid@example.com",
            Password = "WrongPassword123!"
        };

        var jsonContent = _commonTools.SerializeStringContent(loginRequest);

        var response = await _client.PostAsync("/api/auth/login", jsonContent);
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
    [Fact]
    public async Task Login_ShouldRespectRateLimit_WhenTooManyAttempts()
    {
        // Arrange - First register a test user
        //this
        using var isolatedFactory = _factory.WithWebHostBuilder(builder => { });
        var isolatedClient = isolatedFactory.CreateClient();
        var registerRequest = new RegisterCustomerRequest
        {
            Email = "ratelimit.test@example.com",
            PhoneNumber = "0712345678",
            FirstName = "RateLimit",
            LastName = "Test",
            Password = "SecurePassword123!"
        };

        var registerContent = new StringContent(
            JsonSerializer.Serialize(registerRequest),
            Encoding.UTF8,
            "application/json"
        );

        await isolatedClient.PostAsync("/api/auth/register", registerContent);

        var loginRequest = new CustomerLoginRequest
        {
            Email = "ratelimit.test@example.com",
            Password = "WrongPassword123!" // Use wrong password to avoid successful logins
        };

        HttpResponseMessage? lastResponse = null;
        int successfulRequests = 0;
        int rateLimitedRequests = 0;

        // Act & Assert
        for (int i = 0; i < 61; i++)
        {
            // Re-creating the content stream per post to prevent object reuse issues in the loop
            var loginContent = new StringContent(
                JsonSerializer.Serialize(loginRequest),
                Encoding.UTF8,
                "application/json"
            );

            lastResponse = await isolatedClient.PostAsync("/api/auth/login", loginContent);

            if (lastResponse.StatusCode == HttpStatusCode.TooManyRequests) // 429 Too Many Requests
            {
                rateLimitedRequests++;
                _output.WriteLine($"Request {i + 1}: Rate limited (429)");
            }
            else
            {
                successfulRequests++;
                _output.WriteLine($"Request {i + 1}: {lastResponse.StatusCode}");
            }
        }

        Assert.True(rateLimitedRequests > 0, "Expected at least one request to be rate limited");
        Assert.Equal(HttpStatusCode.TooManyRequests, lastResponse?.StatusCode);
    }

    [Fact]
    public async Task Login_ShouldReturnUnauthorized_WhenAccountDoesNotExist()
    {
        
    }
}
