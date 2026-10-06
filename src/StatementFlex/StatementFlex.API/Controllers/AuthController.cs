using StatementFlex.Application.Models;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using StatementFlex.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;
using FluentValidation;

namespace StatementFlex.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AuthenticationService _authenticationService;
    private readonly IValidator<RegisterCustomerRequest> _registerValidator;
    private readonly IValidator<CustomerLoginRequest> _loginValidator;

    public AuthController(
        AuthenticationService authenticationService,
        IValidator<RegisterCustomerRequest> registerValidator,
        IValidator<CustomerLoginRequest> loginValidator)
    {
        _authenticationService = authenticationService;
        _registerValidator = registerValidator;
        _loginValidator = loginValidator;
    }
    [HttpPost("login", Name = "Login")]
    [EnableRateLimiting("fixed")]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AuthenticateCustomer(CustomerLoginRequest customerLoginRequest, CancellationToken cancellationToken)
    {
        var validationResult = await _loginValidator.ValidateAsync(customerLoginRequest, cancellationToken);
        if (!validationResult.IsValid)
        {
            return Unauthorized(validationResult.Errors);
        }

        var response = await _authenticationService.AuthenticateCustomer(customerLoginRequest, cancellationToken);
        return Ok(response);
    }

    [HttpPost("register", Name = "Register")]
    [EnableRateLimiting("fixed")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> RegisterCustomer(RegisterCustomerRequest registerCustomerRequest, CancellationToken cancellationToken)
    {
        // Manual validation to support async validators
        var validationResult = await _registerValidator.ValidateAsync(registerCustomerRequest, cancellationToken);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.Errors);
        }

        var response = await _authenticationService.RegisterCustomer(registerCustomerRequest, cancellationToken);
        return Ok(response);
    }

}
