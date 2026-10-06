using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StatementFlex.Application.Models;
using StatementFlex.Application.Services;
using System.Security.Claims;
using System.Security.Principal;
using StatementFlex.Core.Interfaces;
using Microsoft.AspNetCore.RateLimiting;

namespace StatementFlex.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StatementFlexController : ControllerBase
{
    private readonly ProduceStatements _produceStatements;
    private readonly IDownloadTokenService _downloadTokenService;

    public StatementFlexController(ProduceStatements produceStatements, IDownloadTokenService downloadTokenService)
    {
        _produceStatements = produceStatements;
        _downloadTokenService = downloadTokenService;
    }
    [HttpGet("statement-list")]
    [EnableRateLimiting("fixed")]
    [ProducesResponseType(typeof(StatementListResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<StatementListResponse>> GetStatementList()
    {
        var accountNumberClaim = GetAccountNumber();
        var customerId = GetCustomerId();
        var statementList = await _produceStatements.GetStatementListAsync(accountNumberClaim, customerId);
        return Ok(statementList);
    }

    [HttpGet("download/{downloadToken}")]
    [EnableRateLimiting("fixed")]
    [ProducesResponseType(typeof(FileResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status410Gone)]
    [AllowAnonymous]
    [ApiExplorerSettings(IgnoreApi = true)]
    public async Task<IActionResult> DownloadStatement(string downloadToken, CancellationToken cancellationToken)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
        var userAgent = Request.Headers["User-Agent"].ToString();

        try
        {
            var (isValid, fileStream, errorMessage) = await _produceStatements.ValidateAndDownloadFileAsync(
                downloadToken,
                ipAddress,
                cancellationToken);

            if (!isValid || fileStream == null)
            {
                // Log failed attempt
                await _downloadTokenService.LogDownloadAttemptAsync(
                    Guid.Empty,
                    Guid.Empty,
                    downloadToken,
                    ipAddress,
                    userAgent,
                    false,
                    errorMessage,
                    cancellationToken);

                return errorMessage switch
                {
                    string msg when msg.Contains("expired") => StatusCode(410, new { message = errorMessage }),
                    string msg when msg.Contains("revoked") => StatusCode(403, new { message = errorMessage }),
                    string msg when msg.Contains("limit exceeded") => StatusCode(429, new { message = errorMessage }),
                    string msg when msg.Contains("IP address") => StatusCode(403, new { message = errorMessage }),
                    _ => NotFound(new { message = errorMessage })
                };
            }

            var fileName = $"statement_{DateTime.UtcNow:yyyyMMdd}.pdf";
            return File(fileStream, "application/pdf", fileName, enableRangeProcessing: true);
        }
        catch (Exception ex)
        {
            await _downloadTokenService.LogDownloadAttemptAsync(
                Guid.Empty,
                Guid.Empty,
                downloadToken,
                ipAddress,
                userAgent,
                false,
                ex.Message,
                cancellationToken);

            return StatusCode(500, new { message = "An error occurred while processing your download" });
        }
    }

    private string GetAccountNumber()
    {
        var accountNumberClaim = User.FindFirst("AccountNumber")?.Value;
        if (string.IsNullOrEmpty(accountNumberClaim))
        {
            throw new UnauthorizedAccessException("Invalid account number in token");
        }
        return accountNumberClaim;
    }

    private Guid GetCustomerId()
    {
        var customerIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                           ?? User.FindFirst("sub")?.Value;

        if (string.IsNullOrEmpty(customerIdClaim) || !Guid.TryParse(customerIdClaim, out var customerId))
        {
            throw new UnauthorizedAccessException("Invalid customer ID in token");
        }
        return customerId;
    }
}
