using FluentValidation;

namespace YK.Application.Auth.Commands
{
    public class RegisterCommandValidator : AbstractValidator<RegisterCommand>
    {
        public RegisterCommandValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required.")
                .EmailAddress().WithMessage("A valid email is required.");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required.")
                .MinimumLength(6).WithMessage("Password must be at least 6 characters.");

            RuleFor(x => x.DisplayName)
                .NotEmpty().WithMessage("Display Name is required.")
                .MaximumLength(150).WithMessage("Display Name must not exceed 150 characters.");
        }
    }
}
