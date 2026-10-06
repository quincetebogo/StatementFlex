using System.Text.Json;
using StatementFlex.API.Models;

namespace StatementFlex.API.Middleware;

public class ExceptionHandlingMiddleware
{
      private readonly RequestDelegate _next;
      private readonly ILogger<ExceptionHandlingMiddleware> _logger;

      public ExceptionHandlingMiddleware(
          RequestDelegate next,
          ILogger<ExceptionHandlingMiddleware> logger)
      {
          _next = next;
          _logger = logger;
      }

      public async Task InvokeAsync(HttpContext context)
      {
          try
          {
              await _next(context);
          }
          catch (Exception exception)
          {
              await HandleExceptionAsync(context, exception);
          }
      }

      private async Task HandleExceptionAsync(HttpContext context, Exception exception)
      {
          var errorResponse = exception switch
          {
              Core.Exceptions.ApplicationBaseException appEx => new ErrorResponse
              {
                  StatusCode = appEx.StatusCode,
                  Message = appEx.Message,
                  ErrorCode = appEx.ErrorCode,
                  Details = appEx.Details,
                  TraceId = context.TraceIdentifier
              },
              UnauthorizedAccessException => new ErrorResponse
              {
                  StatusCode = StatusCodes.Status401Unauthorized,
                  Message = "Unauthorized access",
                  ErrorCode = "UNAUTHORIZED",
                  TraceId = context.TraceIdentifier
              },
              _ => new ErrorResponse
              {
                  StatusCode = StatusCodes.Status500InternalServerError,
                  Message = "An unexpected error occurred",
                  ErrorCode = "INTERNAL_SERVER_ERROR",
                  TraceId = context.TraceIdentifier
              }
          };

          // Log the exception
          _logger.LogError(exception,
              "Error occurred: {ErrorCode} - {Message}. TraceId: {TraceId}",
              errorResponse.ErrorCode,
              errorResponse.Message,
              errorResponse.TraceId);

          // Set response
          context.Response.ContentType = "application/json";
          context.Response.StatusCode = errorResponse.StatusCode;

          var jsonOptions = new JsonSerializerOptions
          {
              PropertyNamingPolicy = JsonNamingPolicy.CamelCase
          };

          await context.Response.WriteAsync(
              JsonSerializer.Serialize(errorResponse, jsonOptions));
      }
}
