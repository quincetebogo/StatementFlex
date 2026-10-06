using System.ComponentModel;
using AutoMapper.Execution;
using FluentValidation;
using StatementFlex.Application.Models;
using StatementFlex.Core.Entities;
using StatementFlex.Core.Interfaces;
using System.Data;
using System.Security.Cryptography.Xml;
namespace StatementFlex.Application.Validators;

public class CustomerLoginValidator : AbstractValidator<CustomerLoginRequest>
{
    private readonly CancellationToken _cancellationToken;
    public CustomerLoginValidator(ICustomerRepository customerRepository)
    {
        ValidatorOptions.Global.PropertyNameResolver = (type, memberInfo, expression) =>
        {
            if (memberInfo != null)
            {
                return char.ToLowerInvariant(memberInfo.Name[0]) + memberInfo.Name[1..];
            }
            return null;
        };

        RuleFor(x => x.Email)
        .NotEmpty()
        .Length(1, 50)
        .Matches(CommonValidators.EmailExpression);


        RuleFor(x => x.Password)
        .NotEmpty();
    }
}
