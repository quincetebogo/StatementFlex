using static System.Runtime.InteropServices.JavaScript.JSType;
namespace StatementFlex.Application.Models;

public class RegisterCustomerResponse
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Phonenumber { get; set; }
    public string Email { get; set; }
    public string AccountNumber { get; set; }
    public DateTime DateCreated { get; set; }
}
