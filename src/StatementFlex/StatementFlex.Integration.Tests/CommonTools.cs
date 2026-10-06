using System.Text;
using System.Text.Json;
using StatementFlex.Application.Models;

namespace StatementFlex.Integration.Tests;

public class CommonTools
{
    public StringContent SerializeStringContent(object objectContet)
    {
        var loginContent = new StringContent(
            JsonSerializer.Serialize(objectContet),
            Encoding.UTF8,
            "application/json"
        );
        return loginContent;
    }

    public CustomerLoginRequest ValidLoginRequest()
    {
        return new CustomerLoginRequest
        {
            Email = "statementtest@example.com",
            Password = "SecurePassword123!"
        };
    }

    public RegisterCustomerRequest ValidRegistrationRequest()
    {
        return new RegisterCustomerRequest
        {
            Email = "statementtest@example.com",
            PhoneNumber = "0712345678",
            FirstName = "Statement",
            LastName = "Test",
            Password = "SecurePassword123!"
        };
    }

    public async Task<string> RegisterAndLoginCustomerAsync(
        HttpClient client,
        string email,
        string password = "SecurePassword123!",
        string phoneNumber = "0712345678",
        string firstName = "Test",
        string lastName = "User")
    {
        var registerRequest = new RegisterCustomerRequest
        {
            Email = email,
            PhoneNumber = phoneNumber,
            FirstName = firstName,
            LastName = lastName,
            Password = password
        };

        await client.PostAsync("/api/auth/register", SerializeStringContent(registerRequest));

        var loginRequest = new CustomerLoginRequest { Email = email, Password = password };
        var loginResponse = await client.PostAsync("/api/auth/login", SerializeStringContent(loginRequest));
        loginResponse.EnsureSuccessStatusCode();

        await using var stream = await loginResponse.Content.ReadAsStreamAsync();
        var loginData = await JsonSerializer.DeserializeAsync<CustomerLoginResponse>(stream, JsonSerializerOptions.Web);

        return loginData?.Token ?? throw new InvalidOperationException("Login failed");
    }
}
