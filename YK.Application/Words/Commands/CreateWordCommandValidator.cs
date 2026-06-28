using FluentValidation;

namespace YK.Application.Words.Commands
{
    public class CreateWordCommandValidator : AbstractValidator<CreateWordCommand>
    {
        public CreateWordCommandValidator()
        {
            RuleFor(x => x.CategoryId).NotEmpty();
            RuleFor(x => x.Text).NotEmpty().MaximumLength(200);
            RuleFor(x => x.IPA).MaximumLength(150);
            RuleFor(x => x.AudioUrl).MaximumLength(500);
            RuleFor(x => x.ImageUrl).MaximumLength(500);
            RuleFor(x => x.Note).MaximumLength(1000);
            
            RuleFor(x => x.Meanings).NotEmpty().WithMessage("At least one meaning is required.");
            RuleForEach(x => x.Meanings).SetValidator(new CreateWordMeaningCommandValidator());
            RuleForEach(x => x.Examples).SetValidator(new CreateWordExampleCommandValidator());
        }
    }

    public class CreateWordMeaningCommandValidator : AbstractValidator<CreateWordMeaningCommand>
    {
        public CreateWordMeaningCommandValidator()
        {
            RuleFor(x => x.TypeOfWord).NotEmpty();
            RuleFor(x => x.MeaningText).NotEmpty().MaximumLength(1000);
        }
    }

    public class CreateWordExampleCommandValidator : AbstractValidator<CreateWordExampleCommand>
    {
        public CreateWordExampleCommandValidator()
        {
            RuleFor(x => x.Sentence).NotEmpty().MaximumLength(1000);
        }
    }
}

