using Microsoft.AspNetCore.Http;
namespace StatementFlex.Core.Exceptions;

public class ConflictException: ApplicationBaseException
{
    public ConflictException(
            string message = "Resource conflict",
            string errorCode = "CONFLICT",
            object? details = null)
          : base(message, StatusCodes.Status409Conflict, errorCode, details)
    {
    }
}
