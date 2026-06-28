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

namespace YK.Application.SentenceStructures.Queries
{
    public class StructureTestQuestionDto
    {
        public Guid StructureId { get; set; }
        public string VietnameseMeaning { get; set; } = string.Empty;
        public string ExampleSentence { get; set; } = string.Empty;
        public string CorrectOption { get; set; } = string.Empty;
        public List<string> Options { get; set; } = new();
    }

    public class GenerateStructureTestQuery : IRequest<ApiResponse<List<StructureTestQuestionDto>>>
    {
        public int Count { get; set; } = 10;
    }

    public class GenerateStructureTestQueryHandler : IRequestHandler<GenerateStructureTestQuery, ApiResponse<List<StructureTestQuestionDto>>>
    {
        private readonly IRepository<SentenceStructure> _sentenceStructureRepository;
        private readonly IRepository<User> _userRepository;
        private readonly ICurrentUserService _currentUserService;

        public GenerateStructureTestQueryHandler(
            IRepository<SentenceStructure> sentenceStructureRepository,
            IRepository<User> userRepository,
            ICurrentUserService currentUserService)
        {
            _sentenceStructureRepository = sentenceStructureRepository;
            _userRepository = userRepository;
            _currentUserService = currentUserService;
        }

        public async Task<ApiResponse<List<StructureTestQuestionDto>>> Handle(GenerateStructureTestQuery request, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.UserIdGuid;
            if (userId == null || userId == Guid.Empty)
                return ApiResponse<List<StructureTestQuestionDto>>.FailureResult(new List<string> { "Unauthorized" });

            var user = await _userRepository.Query().FirstOrDefaultAsync(u => u.Id == userId.Value, cancellationToken);
            if (user == null || user.ActiveLanguageId == null)
                return ApiResponse<List<StructureTestQuestionDto>>.FailureResult(new List<string> { "No active language selected" });

            var allStructures = await _sentenceStructureRepository.Query()
                .Include(s => s.Examples)
                .Where(s => s.UserId == userId.Value && s.LanguageId == user.ActiveLanguageId.Value && s.Examples.Any())
                .ToListAsync(cancellationToken);

            if (allStructures.Count < 2)
            {
                return ApiResponse<List<StructureTestQuestionDto>>.FailureResult(new List<string> { "Not enough structures with examples to generate a test. Need at least 2." });
            }

            var rnd = new Random();
            var questions = new List<StructureTestQuestionDto>();

            var selectedStructures = allStructures.OrderBy(x => rnd.Next()).Take(request.Count).ToList();

            foreach (var structure in selectedStructures)
            {
                var example = structure.Examples.OrderBy(x => rnd.Next()).First();
                
                var options = new List<string> { structure.Pattern };
                var distractors = allStructures.Where(s => s.Id != structure.Id).OrderBy(x => rnd.Next()).Take(3).Select(s => s.Pattern).ToList();
                options.AddRange(distractors);

                while (options.Count < 4)
                {
                    options.Add($"Dummy Pattern {options.Count}");
                }

                options = options.OrderBy(x => rnd.Next()).ToList();

                questions.Add(new StructureTestQuestionDto
                {
                    StructureId = structure.Id,
                    VietnameseMeaning = structure.VietnameseMeaning,
                    ExampleSentence = example.Sentence, // They need to guess which pattern this sentence belongs to
                    CorrectOption = structure.Pattern,
                    Options = options
                });
            }

            return ApiResponse<List<StructureTestQuestionDto>>.SuccessResult(questions);
        }
    }
}
