using StatementFlex.Application.DTOs;
using StatementFlex.Core.Entities;
namespace StatementFlex.Application.Models;

public class CustomerLoginResponse
{
    public string Token { get; set; }
    public string RefreshToken { get; set; }
    public int ExpiresIn { get; set; }
    public CustomerDTO Customer { get; set; }
}
