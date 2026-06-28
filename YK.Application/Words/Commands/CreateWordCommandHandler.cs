using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;
using YK.Application.Interfaces;
using YK.Common;
using YK.Domain;
using YK.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace YK.Application.Words.Commands
{
    public class CreateWordCommandHandler : IRequestHandler<CreateWordCommand, ApiResponse<Guid>>
    {
        public readonly IRepository<Word> _wordRepository;
        public readonly IRepository<Category> _categoryRepository;
        public readonly ICurrentUserService _currentUserService;
        public readonly IUnitOfWork _unitOfWork;

        public CreateWordCommandHandler(
            IRepository<Word> wordRepository,
            IRepository<Category> categoryRepository,
            ICurrentUserService currentUserService,
            IUnitOfWork unitOfWork)
        {
            _wordRepository = wordRepository;
            _categoryRepository = categoryRepository;
            _currentUserService = currentUserService;
            _unitOfWork = unitOfWork;
        }

        public async Task<ApiResponse<Guid>> Handle(CreateWordCommand request, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.UserIdGuid;
            if (userId == null || userId == Guid.Empty)
                return ApiResponse<Guid>.FailureResult(new List<string> { "User not authenticated." });

            var category = await _categoryRepository.Query()
                .FirstOrDefaultAsync(c => c.Id == request.CategoryId && c.UserId == userId.Value, cancellationToken);

            if (category == null)
                return ApiResponse<Guid>.FailureResult(new List<string> { "Category not found or unauthorized." });

            var word = new Word
            {
                Id = Guid.NewGuid(),
                CategoryId = category.Id,
                UserId = userId.Value,
                LanguageId = category.LanguageId,
                Text = request.Text,
                IPA = request.IPA,
                AudioUrl = request.AudioUrl,
                ImageUrl = request.ImageUrl,
                Note = request.Note,
                Status = WordStatus.NotLearned
            };

            foreach (var m in request.Meanings)
            {
                if (Enum.TryParse<TypeOfWord>(m.TypeOfWord, true, out var typeOfWord))
                {
                    word.Meanings.Add(new WordMeaning
                    {
                        Id = Guid.NewGuid(),
                        WordId = word.Id,
                        TypeOfWord = typeOfWord,
                        MeaningText = m.MeaningText
                    });
                }
            }

            foreach (var e in request.Examples)
            {
                word.Examples.Add(new WordExample
                {
                    Id = Guid.NewGuid(),
                    WordId = word.Id,
                    Sentence = e.Sentence
                });
            }

            await _wordRepository.AddAsync(word);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return ApiResponse<Guid>.SuccessResult(word.Id);
        }
    }
}


