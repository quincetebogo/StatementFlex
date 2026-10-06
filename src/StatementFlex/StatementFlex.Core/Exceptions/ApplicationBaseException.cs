namespace StatementFlex.Core.Exceptions;

public class ApplicationBaseException : Exception
{
    public int StatusCode { get; }
      public string ErrorCode { get; }
      public object? Details { get; }

      protected ApplicationBaseException(
          string message,
          int statusCode,
          string errorCode,
          object? details = null)
          : base(message)
      {
          StatusCode = statusCode;
          ErrorCode = errorCode;
          Details = details;
      }
}
