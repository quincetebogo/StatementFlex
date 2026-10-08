using System.Collections.Immutable;
using Microsoft.EntityFrameworkCore;
using StatementFlex.Core.Entities;
using StatementFlex.Core.Interfaces;
using StatementFlex.Infrastructure.Data;

namespace StatementFlex.Infrastructure.Repositories;

public class CustomerRepository(ApplicationDBContext applicationDBContext) : ICustomerRepository
{
    public ApplicationDBContext _applicationDBContext = applicationDBContext;
    public async Task<Customer?> GetCustomerByEmailAsync(string email, CancellationToken cancellationToken)
    {
        var response = await _applicationDBContext.Customers.FirstOrDefaultAsync(x => x.Email == email, cancellationToken);
        return response;
    }
    public async Task<Customer> RegisterCustomerAsync(Customer customer, CancellationToken cancellationToken)
    {
        _applicationDBContext.Customers.Add(customer);
        await _applicationDBContext.SaveChangesAsync(cancellationToken);

        await _applicationDBContext.Entry(customer).ReloadAsync(cancellationToken);//this is just so I can reload the db and get the account number thats been created in the DB

        return customer;
    }

    public bool CustomerExists(string email)
    {
        return _applicationDBContext.Customers
            .Any(x => x.Email.ToLower() == email.ToLower());
    }

    public async Task<bool> CustomerExistsAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _applicationDBContext.Customers
            .AnyAsync(x => x.Email.ToLower() == email.ToLower(), cancellationToken);
    }

    public Task<List<Customer>> GetBatchCustomersAsync(int startFrom, int pageSize)
    {
        return _applicationDBContext.Customers.Skip(startFrom).Take(pageSize).ToListAsync();
    }

}
