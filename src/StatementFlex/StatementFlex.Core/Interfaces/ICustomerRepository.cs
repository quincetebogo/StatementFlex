using StatementFlex.Core.Entities;

namespace StatementFlex.Core.Interfaces;

public interface ICustomerRepository
{
    Task<Customer?> GetCustomerByEmailAsync(string email, CancellationToken cancellationToken);
    Task<Customer> RegisterCustomerAsync(Customer customer, CancellationToken cancellationToken);
    Task<List<Customer>> GetBatchCustomersAsync(int startFrom, int pageSize);
    bool CustomerExists(string email);
    Task<bool> CustomerExistsAsync(string email, CancellationToken cancellationToken = default);
}
