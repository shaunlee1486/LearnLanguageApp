using FluentValidation;

namespace YK.Application.Words.Commands
{
    public class UpdateWordCommandValidator : AbstractValidator<UpdateWordCommand>
    {
        public UpdateWordCommandValidator()
        {
            RuleFor(x => x.Id).NotEmpty();
            RuleFor(x => x.Text).NotEmpty().MaximumLength(200);
            RuleFor(x => x.IPA).MaximumLength(150);
            RuleFor(x => x.AudioUrl).MaximumLength(500);
            RuleFor(x => x.ImageUrl).MaximumLength(500);
            RuleFor(x => x.Note).MaximumLength(1000);
            
            RuleFor(x => x.Meanings).NotEmpty().WithMessage("At least one meaning is required.");
            RuleForEach(x => x.Meanings).SetValidator(new UpdateWordMeaningCommandValidator());
            RuleForEach(x => x.Examples).SetValidator(new UpdateWordExampleCommandValidator());
        }
    }

    public class UpdateWordMeaningCommandValidator : AbstractValidator<UpdateWordMeaningCommand>
    {
        public UpdateWordMeaningCommandValidator()
        {
            RuleFor(x => x.TypeOfWord).NotEmpty();
            RuleFor(x => x.MeaningText).NotEmpty().MaximumLength(1000);
        }
    }

    public class UpdateWordExampleCommandValidator : AbstractValidator<UpdateWordExampleCommand>
    {
        public UpdateWordExampleCommandValidator()
        {
            RuleFor(x => x.Sentence).NotEmpty().MaximumLength(1000);
        }
    }
}

