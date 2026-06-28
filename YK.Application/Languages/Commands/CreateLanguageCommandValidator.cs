using FluentValidation;

namespace YK.Application.Languages.Commands
{
    public class CreateLanguageCommandValidator : AbstractValidator<CreateLanguageCommand>
    {
        public CreateLanguageCommandValidator()
        {
            RuleFor(x => x.Name).NotEmpty().WithMessage("Name is required.")
                .MaximumLength(100).WithMessage("Name must not exceed 100 characters.");
            
            RuleFor(x => x.LocaleCode).NotEmpty().WithMessage("Locale code is required.")
                .MaximumLength(10).WithMessage("Locale code must not exceed 10 characters.");
        }
    }
}
