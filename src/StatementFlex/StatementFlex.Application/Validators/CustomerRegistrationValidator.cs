using FluentValidation;
using StatementFlex.Application.Models;
using StatementFlex.Core.Entities;
using StatementFlex.Core.Interfaces;
using System.Data;

namespace StatementFlex.Application.Validators;

public class CustomerRegistrationValidator : AbstractValidator<RegisterCustomerRequest>
{
    public CustomerRegistrationValidator(ICustomerRepository _customerRepository)
    {
        ValidatorOptions.Global.PropertyNameResolver = (type, memberInfo, expression) =>
        {
            if (memberInfo != null)
            {
                return char.ToLowerInvariant(memberInfo.Name[0]) + memberInfo.Name[1..];
            }
            return null;
        };

        RuleLevelCascadeMode = CascadeMode.Stop;

    RuleFor(x => x.Email)
        .NotEmpty()
        .EmailAddress().WithMessage("Invalid email format")
        .MustAsync(async (email, cancellationToken) => !await _customerRepository.CustomerExistsAsync(email, cancellationToken))
        .WithMessage("This email is already registered. Please use another one.")
        .Matches(CommonValidators.EmailExpression).WithMessage("Invalid email address");

        RuleFor(x => x.FirstName)
            .NotEmpty().NotEmpty().WithMessage("First name is required.")
            .MinimumLength(2).WithMessage("First name must be at least 2 characters long.")
            .MaximumLength(50).WithMessage("First name must not exceed 50 characters.")
            .Matches(CommonValidators.FirstNameAndLastNameExpression).WithMessage("First name can only contain letters, spaces, hyphens, apostrophes, or periods.");

        RuleFor(x => x.LastName)
            .NotEmpty().NotEmpty().WithMessage("Last name is required.")
            .MinimumLength(2).WithMessage("Last name must be at least 2 characters long.")
            .MaximumLength(50).WithMessage("Last name must not exceed 50 characters.")
            .Matches(CommonValidators.FirstNameAndLastNameExpression).WithMessage("Last name can only contain letters, spaces, hyphens, apostrophes, or periods.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required.")
            .MinimumLength(8).WithMessage("Password must be at least 8 characters long.")
            .MaximumLength(20).WithMessage("Password must not exceed 16 characters.")
            .Matches(@"[A-Z]").WithMessage("Password must contain at least one uppercase letter.")
            .Matches(@"[a-z]").WithMessage("Password must contain at least one lowercase letter.")
            .Matches(@"[0-9]").WithMessage("Password must contain at least one number.")
            .Matches(CommonValidators.PasswordExpression).WithMessage("Password must contain at least one special character.");

        RuleFor(x => x.PhoneNumber)
            .NotEmpty().WithMessage("Cellphone number is required.")
            .Matches(CommonValidators.CellphoneNumberExpression).WithMessage("Please enter a valid South African cellphone number.");;
    }
}
