using static System.Net.Mime.MediaTypeNames;
using Microsoft.AspNetCore.Http;
namespace StatementFlex.Core.Exceptions;

public class NotFoundException : ApplicationBaseException
{
    public NotFoundException( string message = "Resource not found",
          string errorCode = "NOT_FOUND",
          object? details = null)
          : base(message, StatusCodes.Status404NotFound, errorCode, details)
    {
        
    }
}
