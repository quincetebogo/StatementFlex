using static System.Runtime.InteropServices.JavaScript.JSType;
namespace StatementFlex.Core.Entities;

public class Customer
{
    public Guid Id { get; set; }
    public string AccountNumber { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public string HashPassword { get; set; }
    public DateTime DateCreated { get; set; }
    public string LastLogin { get; set; }
    public string PhoneNumber { get; set; }

    public string GetFullNames()
    {
        return FirstName + " " + LastName;
    }
}
