using Microsoft.AspNetCore.Http;
namespace StatementFlex.Core.Exceptions;

public class ForbiddenException: ApplicationBaseException
{
    public ForbiddenException(
            string message = "Forbidden",
            string errorCode = "FORBIDDEN",
            object? details = null)
          : base(message, StatusCodes.Status403Forbidden, errorCode, details)
    {
        
    }
}
