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
    public class UpdateWordCommandHandler : IRequestHandler<UpdateWordCommand, ApiResponse<bool>>
    {
        public readonly IRepository<Word> _wordRepository;
        public readonly ICurrentUserService _currentUserService;
        public readonly IUnitOfWork _unitOfWork;

        public UpdateWordCommandHandler(
            IRepository<Word> wordRepository,
            ICurrentUserService currentUserService,
            IUnitOfWork unitOfWork)
        {
            _wordRepository = wordRepository;
            _currentUserService = currentUserService;
            _unitOfWork = unitOfWork;
        }

        public async Task<ApiResponse<bool>> Handle(UpdateWordCommand request, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.UserIdGuid;
            if (userId == null || userId == Guid.Empty)
                return ApiResponse<bool>.FailureResult(new List<string> { "User not authenticated." });

            var word = await _wordRepository.Query()
                .Include(w => w.Meanings)
                .Include(w => w.Examples)
                .FirstOrDefaultAsync(w => w.Id == request.Id && w.UserId == userId.Value, cancellationToken);

            if (word == null)
                return ApiResponse<bool>.FailureResult(new List<string> { "Word not found or unauthorized." });

            word.Text = request.Text;
            word.IPA = request.IPA;
            word.AudioUrl = request.AudioUrl;
            word.ImageUrl = request.ImageUrl;
            word.Note = request.Note;

            // Update Meanings
            word.Meanings.Clear();
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

            // Update Examples
            word.Examples.Clear();
            foreach (var e in request.Examples)
            {
                word.Examples.Add(new WordExample
                {
                    Id = Guid.NewGuid(),
                    WordId = word.Id,
                    Sentence = e.Sentence
                });
            }

            _wordRepository.Update(word);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return ApiResponse<bool>.SuccessResult(true);
        }
    }
}

