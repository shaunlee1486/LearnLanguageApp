using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using YK.Application.Interfaces;
using YK.Common;
using YK.Domain;

namespace YK.Application.ReviewSessions.Queries
{
    public class GenerateQuizOptionsQuery : IRequest<ApiResponse<List<string>>>
    {
        public Guid WordId { get; set; }
        public int Count { get; set; } = 3;
    }

    public class GenerateQuizOptionsQueryHandler : IRequestHandler<GenerateQuizOptionsQuery, ApiResponse<List<string>>>
    {
        private readonly IRepository<Word> _wordRepository;
        private readonly IRepository<WordMeaning> _meaningRepository;
        private readonly ICurrentUserService _currentUserService;

        public GenerateQuizOptionsQueryHandler(
            IRepository<Word> wordRepository,
            IRepository<WordMeaning> meaningRepository,
            ICurrentUserService currentUserService)
        {
            _wordRepository = wordRepository;
            _meaningRepository = meaningRepository;
            _currentUserService = currentUserService;
        }

        public async Task<ApiResponse<List<string>>> Handle(GenerateQuizOptionsQuery request, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.UserIdGuid;
            if (userId == null || userId == Guid.Empty)
                return ApiResponse<List<string>>.FailureResult(new List<string> { "Unauthorized" });

            var word = await _wordRepository.Query()
                .FirstOrDefaultAsync(w => w.Id == request.WordId && w.UserId == userId.Value, cancellationToken);

            if (word == null)
                return ApiResponse<List<string>>.FailureResult(new List<string> { "Word not found" });

            // Get random meanings from the SAME language but DIFFERENT words
            var randomMeanings = await _meaningRepository.Query()
                .Include(m => m.Word)
                .Where(m => m.Word.LanguageId == word.LanguageId && m.WordId != request.WordId)
                .OrderBy(m => Guid.NewGuid()) // shuffle
                .Select(m => m.MeaningText)
                .Take(request.Count)
                .ToListAsync(cancellationToken);

            // Fallbacks if not enough words in DB
            while (randomMeanings.Count < request.Count)
            {
                randomMeanings.Add($"Dummy Option {randomMeanings.Count + 1}");
            }

            return ApiResponse<List<string>>.SuccessResult(randomMeanings);
        }
    }
}
