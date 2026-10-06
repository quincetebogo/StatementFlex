using Microsoft.AspNetCore.Http;
namespace StatementFlex.Core.Exceptions;

public class UnauthorizedCustomerException : ApplicationBaseException
{
    public UnauthorizedCustomerException(
            string message = "Unauthorized access",
            string errorCode = "UNAUTHORIZED",
            object? details = null)
            : base(message, StatusCodes.Status401Unauthorized, errorCode, details)
    {

    }
}
