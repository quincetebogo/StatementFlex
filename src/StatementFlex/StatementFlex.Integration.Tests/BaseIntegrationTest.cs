using Humanizer;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Org.BouncyCastle.Asn1.X509;
using StatementFlex.Core.Interfaces;
using StatementFlex.Infrastructure.Data;
using Xunit.Abstractions;
namespace StatementFlex.Integration.Tests;

public abstract class BaseIntegrationTest : IClassFixture<IntegrationTestWebAppFactory>
{
    private readonly IServiceScope _scope;
    protected readonly ICustomerRepository _customerRepository;
    protected readonly ApplicationDBContext _applicationDbContext;
    protected readonly HttpClient _client;
    protected readonly IntegrationTestWebAppFactory _factory;
    protected readonly CommonTools _commonTools;
    protected readonly ITestOutputHelper _output;
    protected BaseIntegrationTest(IntegrationTestWebAppFactory factory, ITestOutputHelper output)
    {
        _factory = factory;
        _scope = factory.Services.CreateScope();
        _customerRepository = _scope.ServiceProvider.GetRequiredService<ICustomerRepository>();
        _applicationDbContext = _scope.ServiceProvider.GetRequiredService<ApplicationDBContext>();
        _client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false
        });
        _output = output;
        _commonTools = new CommonTools();
    }
}
