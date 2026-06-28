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
using YK.Application.DTOs.Tests;

namespace YK.Application.Tests.Queries
{
    public class GenerateCustomTestQuery : IRequest<ApiResponse<CustomTestSessionDto>>
    {
    }

    public class GenerateCustomTestQueryHandler : IRequestHandler<GenerateCustomTestQuery, ApiResponse<CustomTestSessionDto>>
    {
        private readonly IRepository<User> _userRepository;
        private readonly IRepository<Word> _wordRepository;
        private readonly IRepository<GrammarRule> _grammarRepository;
        private readonly IRepository<SentenceStructure> _structureRepository;
        private readonly ICurrentUserService _currentUserService;

        public GenerateCustomTestQueryHandler(
            IRepository<User> userRepository,
            IRepository<Word> wordRepository,
            IRepository<GrammarRule> grammarRepository,
            IRepository<SentenceStructure> structureRepository,
            ICurrentUserService currentUserService)
        {
            _userRepository = userRepository;
            _wordRepository = wordRepository;
            _grammarRepository = grammarRepository;
            _structureRepository = structureRepository;
            _currentUserService = currentUserService;
        }

        public async Task<ApiResponse<CustomTestSessionDto>> Handle(GenerateCustomTestQuery request, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.UserIdGuid;
            if (userId == null || userId == Guid.Empty)
                return ApiResponse<CustomTestSessionDto>.FailureResult(new List<string> { "Unauthorized" });

            var user = await _userRepository.Query().FirstOrDefaultAsync(u => u.Id == userId.Value, cancellationToken);
            if (user == null || user.ActiveLanguageId == null)
                return ApiResponse<CustomTestSessionDto>.FailureResult(new List<string> { "No active language selected" });

            var languageId = user.ActiveLanguageId.Value;
            int limit = user.CustomTestQuestionLimit > 0 ? user.CustomTestQuestionLimit : 15;
            int timer = user.CustomTestTimerSeconds > 0 ? user.CustomTestTimerSeconds : 300;

            var questions = new List<CustomTestQuestionDto>();
            var random = new Random();

            // 1. Fetch Words
            var words = await _wordRepository.Query()
                .Include(w => w.Meanings)
                .Where(w => w.UserId == userId.Value && w.LanguageId == languageId && w.Meanings.Any())
                .ToListAsync(cancellationToken);

            // 2. Fetch Grammar Rules
            var grammars = await _grammarRepository.Query()
                .Include(g => g.Examples)
                .Where(g => g.UserId == userId.Value && g.LanguageId == languageId && g.Examples.Any())
                .ToListAsync(cancellationToken);

            // 3. Fetch Sentence Structures
            var structures = await _structureRepository.Query()
                .Include(s => s.Examples)
                .Where(s => s.UserId == userId.Value && s.LanguageId == languageId && s.Examples.Any())
                .ToListAsync(cancellationToken);

            // Calculate allocations (roughly 1/3 each if possible)
            var pool = new List<CustomTestQuestionDto>();

            // Generate Word Questions
            if (words.Count >= 4)
            {
                foreach (var w in words.OrderBy(x => random.Next()))
                {
                    var meaning = w.Meanings.First().MeaningText;
                    var options = words.Where(x => x.Id != w.Id).OrderBy(x => random.Next()).Take(3).Select(x => x.Meanings.First().MeaningText).ToList();
                    options.Add(meaning);
                    options = options.OrderBy(x => random.Next()).ToList();

                    pool.Add(new CustomTestQuestionDto
                    {
                        SourceId = w.Id,
                        SourceType = "Word",
                        Prompt = w.Text,
                        Hint = w.IPA,
                        CorrectAnswer = meaning,
                        Options = options
                    });
                }
            }

            // Generate Grammar Questions
            if (grammars.Count >= 4)
            {
                foreach (var g in grammars.OrderBy(x => random.Next()))
                {
                    var example = g.Examples.OrderBy(x => random.Next()).First();
                    var options = grammars.Where(x => x.Id != g.Id).OrderBy(x => random.Next()).Take(3).Select(x => x.Name).ToList();
                    options.Add(g.Name);
                    options = options.OrderBy(x => random.Next()).ToList();

                    pool.Add(new CustomTestQuestionDto
                    {
                        SourceId = g.Id,
                        SourceType = "Grammar",
                        Prompt = example.Sentence,
                        Hint = null, // No Meaning property on GrammarExample
                        CorrectAnswer = g.Name,
                        Options = options
                    });
                }
            }

            // Generate Structure Questions
            if (structures.Count >= 4)
            {
                foreach (var s in structures.OrderBy(x => random.Next()))
                {
                    var example = s.Examples.OrderBy(x => random.Next()).First();
                    var options = structures.Where(x => x.Id != s.Id).OrderBy(x => random.Next()).Take(3).Select(x => x.Pattern).ToList();
                    options.Add(s.Pattern);
                    options = options.OrderBy(x => random.Next()).ToList();

                    pool.Add(new CustomTestQuestionDto
                    {
                        SourceId = s.Id,
                        SourceType = "Structure",
                        Prompt = example.Sentence,
                        Hint = example.Meaning,
                        CorrectAnswer = s.Pattern,
                        Options = options
                    });
                }
            }

            // Select final questions
            questions = pool.OrderBy(x => random.Next()).Take(limit).ToList();

            if (!questions.Any())
            {
                return ApiResponse<CustomTestSessionDto>.FailureResult(new List<string> { "Not enough data to generate a test. Please add more words, grammar rules, or structures (at least 4 of each)." });
            }

            return ApiResponse<CustomTestSessionDto>.SuccessResult(new CustomTestSessionDto
            {
                TimerSeconds = timer,
                Questions = questions
            });
        }
    }
}
