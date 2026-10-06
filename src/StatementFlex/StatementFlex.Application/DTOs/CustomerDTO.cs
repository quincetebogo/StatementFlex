namespace StatementFlex.Application.DTOs;

public class CustomerDTO
{
    public Guid Id { get; set; }
    public string AccountNumber { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public string FullName { get; set; } = string.Empty;
}
