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
using YK.Application.DTOs.Grammar;

namespace YK.Application.GrammarRules.Queries
{
    public class GrammarTestQuestionDto
    {
        public Guid RuleId { get; set; }
        public string Description { get; set; } = string.Empty;
        public string ExampleSentence { get; set; } = string.Empty;
        public string CorrectOption { get; set; } = string.Empty;
        public List<string> Options { get; set; } = new(); // Name of the rules
    }

    public class GenerateGrammarTestQuery : IRequest<ApiResponse<List<GrammarTestQuestionDto>>>
    {
        public int Count { get; set; } = 10;
    }

    public class GenerateGrammarTestQueryHandler : IRequestHandler<GenerateGrammarTestQuery, ApiResponse<List<GrammarTestQuestionDto>>>
    {
        private readonly IRepository<GrammarRule> _grammarRepository;
        private readonly IRepository<User> _userRepository;
        private readonly ICurrentUserService _currentUserService;

        public GenerateGrammarTestQueryHandler(
            IRepository<GrammarRule> grammarRepository,
            IRepository<User> userRepository,
            ICurrentUserService currentUserService)
        {
            _grammarRepository = grammarRepository;
            _userRepository = userRepository;
            _currentUserService = currentUserService;
        }

        public async Task<ApiResponse<List<GrammarTestQuestionDto>>> Handle(GenerateGrammarTestQuery request, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.UserIdGuid;
            if (userId == null || userId == Guid.Empty)
                return ApiResponse<List<GrammarTestQuestionDto>>.FailureResult(new List<string> { "Unauthorized" });

            var user = await _userRepository.Query().FirstOrDefaultAsync(u => u.Id == userId.Value, cancellationToken);
            if (user == null || user.ActiveLanguageId == null)
                return ApiResponse<List<GrammarTestQuestionDto>>.FailureResult(new List<string> { "No active language selected" });

            var allRules = await _grammarRepository.Query()
                .Include(g => g.Examples)
                .Where(g => g.UserId == userId.Value && g.LanguageId == user.ActiveLanguageId.Value && g.Examples.Any())
                .ToListAsync(cancellationToken);

            if (allRules.Count < 2)
            {
                return ApiResponse<List<GrammarTestQuestionDto>>.FailureResult(new List<string> { "Not enough grammar rules with examples to generate a test. Need at least 2." });
            }

            var rnd = new Random();
            var questions = new List<GrammarTestQuestionDto>();

            var selectedRules = allRules.OrderBy(x => rnd.Next()).Take(request.Count).ToList();

            foreach (var rule in selectedRules)
            {
                var example = rule.Examples.OrderBy(x => rnd.Next()).First();
                
                var options = new List<string> { rule.Name };
                var distractors = allRules.Where(r => r.Id != rule.Id).OrderBy(x => rnd.Next()).Take(3).Select(r => r.Name).ToList();
                options.AddRange(distractors);

                // Add dummy options if not enough rules
                while (options.Count < 4)
                {
                    options.Add($"Dummy Rule {options.Count}");
                }

                options = options.OrderBy(x => rnd.Next()).ToList();

                questions.Add(new GrammarTestQuestionDto
                {
                    RuleId = rule.Id,
                    Description = rule.Description, // Provide description as a hint
                    ExampleSentence = example.Sentence, // They need to guess which rule this sentence belongs to
                    CorrectOption = rule.Name,
                    Options = options
                });
            }

            return ApiResponse<List<GrammarTestQuestionDto>>.SuccessResult(questions);
        }
    }
}
