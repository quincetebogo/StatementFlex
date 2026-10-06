using System.Reflection.Metadata.Ecma335;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using StatementFlex.Application.Models;
using StatementFlex.Core.Entities;
using StatementFlex.Core.Interfaces;
using System.Text;
using Microsoft.AspNetCore.Mvc.ApiExplorer;
using Microsoft.IdentityModel.JsonWebTokens;
using System.Security.Claims;
using static System.Runtime.InteropServices.JavaScript.JSType;
using Microsoft.VisualBasic;
using System.Security.Cryptography;
using StatementFlex.Application.Mappers;
using StatementFlex.Application.DTOs;
using AutoMapper;
using System.Linq.Expressions;
using StatementFlex.Core.Constants;
using StatementFlex.Core.Exceptions;
namespace StatementFlex.Application.Services;

public class AuthenticationService
{
    private readonly ICustomerRepository _customerRepository;
    private readonly JwtSettings _jwtSettings;
    private readonly IMapper _mapper;
    public AuthenticationService(ICustomerRepository customerRepository, JwtSettings jwtSettings, IMapper mapper)
    {
        _customerRepository = customerRepository;
        _jwtSettings = jwtSettings;
        _mapper = mapper;
    }

    public async Task<CustomerLoginResponse> AuthenticateCustomer(CustomerLoginRequest request, CancellationToken cancellationToken)
    {
        var customer = await _customerRepository.GetCustomerByEmailAsync(request.Email, cancellationToken);

        if (customer == null)
        {
        throw new UnauthorizedCustomerException(
          "Invalid email or password",
          ErrorCodeConstants.INVALID_CREDENTIALS);
        }
        var hasher = new PasswordHasher<object>();
        PasswordVerificationResult verificationResult = hasher.VerifyHashedPassword(customer, customer.HashPassword, request.Password);
        if (verificationResult == PasswordVerificationResult.Failed)
        {
            throw new UnauthorizedCustomerException(
            "Invalid email or password",
             ErrorCodeConstants.INVALID_CREDENTIALS);
        }
        var token = GenerateJWTToken(customer);
        //var refreshToken
        var refreshToken = GenerateRefreshToken();
        return new CustomerLoginResponse()
        {
            Token = token,
            RefreshToken = refreshToken,
            Customer = _mapper.Map<CustomerDTO>(customer),
            ExpiresIn = _jwtSettings.ExpiryInMin,
        };

    }
    public async Task<RegisterCustomerResponse> RegisterCustomer(RegisterCustomerRequest registerCustomerRequest, CancellationToken cancellationToken)
    {
        var passwordHash = new PasswordHasher<Customer>();
        var user = new Customer { Email = registerCustomerRequest.Email };

        var storedPasswordHash = passwordHash.HashPassword(user, registerCustomerRequest.Password);
        var customer = new Customer
        {
            Email = registerCustomerRequest.Email,
            FirstName = registerCustomerRequest.FirstName,
            LastName = registerCustomerRequest.LastName,
            HashPassword = storedPasswordHash,
            Id = Guid.NewGuid(),
            DateCreated = DateTime.UtcNow,
            PhoneNumber = registerCustomerRequest.PhoneNumber
        };
        var response = await _customerRepository.RegisterCustomerAsync(customer, cancellationToken);
        var customerResponse = new RegisterCustomerResponse
        {
            AccountNumber = response.AccountNumber,
            DateCreated = response.DateCreated,
            Email = response.Email,
            FirstName = response.FirstName,
            LastName = response.LastName,
            Phonenumber = response.PhoneNumber
        };
        return customerResponse;
    }

    public string GenerateJWTToken(Customer customer)
    {
        var secretKey = _jwtSettings.Secret;
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));

        var signingCredentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
        var claims = new Dictionary<string, object>()
        {
            {
                JwtRegisteredClaimNames.Sub, customer.Id
            },
            {
                JwtRegisteredClaimNames.Name, customer.GetFullNames()
            },
            {
                JwtRegisteredClaimNames.Email, customer.Email
            },
            {
                "AccountNumber", customer.AccountNumber
            }
        };
        var tokenDescriptor = new SecurityTokenDescriptor()
        {
            Issuer = _jwtSettings.Issuer,
            Audience = _jwtSettings.Audience,
            Claims = claims,
            Expires = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiryInMin),
            SigningCredentials = signingCredentials
        };

        var tokenHandler = new JsonWebTokenHandler();
        string jwtToken = tokenHandler.CreateToken(tokenDescriptor);

        return jwtToken;
    }
    
    public string GenerateRefreshToken()
    {
        byte[] randomBytes = RandomNumberGenerator.GetBytes(32);

        return Convert.ToBase64String(randomBytes); 
    }
}

public class JwtSettings
{
    public string Issuer { get; set; }
    public string Audience { get; set; }
    public string Secret { get; set; }
    public int ExpiryInMin { get; set; } = 30;
    public int ResfreshTokenExpiryDays { get; set; } = 7;
}