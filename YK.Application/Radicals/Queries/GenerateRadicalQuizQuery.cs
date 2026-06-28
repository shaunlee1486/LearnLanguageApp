using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using YK.Application.Interfaces;
using YK.Common;
using YK.Domain;

namespace YK.Application.Radicals.Queries
{
    public class RadicalQuizQuestionDto
    {
        public Guid RadicalId { get; set; }
        public string QuestionType { get; set; } = string.Empty; // "RadicalToMeaning" or "MeaningToRadical"
        public string Prompt { get; set; } = string.Empty; // The character or the meaning
        public List<string> Options { get; set; } = new();
        public string CorrectAnswer { get; set; } = string.Empty;
    }

    public class GenerateRadicalQuizQuery : IRequest<ApiResponse<List<RadicalQuizQuestionDto>>>
    {
        public int QuestionCount { get; set; } = 10;
    }

    public class GenerateRadicalQuizQueryHandler : IRequestHandler<GenerateRadicalQuizQuery, ApiResponse<List<RadicalQuizQuestionDto>>>
    {
        private readonly IRepository<Radical> _radicalRepository;

        public GenerateRadicalQuizQueryHandler(IRepository<Radical> radicalRepository)
        {
            _radicalRepository = radicalRepository;
        }

        public async Task<ApiResponse<List<RadicalQuizQuestionDto>>> Handle(GenerateRadicalQuizQuery request, CancellationToken cancellationToken)
        {
            var radicals = await _radicalRepository.Query().ToListAsync(cancellationToken);

            if (radicals.Count < 4)
                return ApiResponse<List<RadicalQuizQuestionDto>>.FailureResult(new List<string> { "Not enough radicals in database to generate a quiz." });

            var random = new Random();
            var questions = new List<RadicalQuizQuestionDto>();
            var limit = Math.Min(request.QuestionCount, radicals.Count);

            // Shuffle pool
            var pool = radicals.OrderBy(x => random.Next()).Take(limit).ToList();

            foreach (var radical in pool)
            {
                var isRadicalToMeaning = random.Next(2) == 0;
                var question = new RadicalQuizQuestionDto
                {
                    RadicalId = radical.Id,
                    QuestionType = isRadicalToMeaning ? "RadicalToMeaning" : "MeaningToRadical"
                };

                if (isRadicalToMeaning)
                {
                    question.Prompt = radical.Character;
                    question.CorrectAnswer = radical.VietnameseMeaning;

                    var distractors = radicals
                        .Where(r => r.Id != radical.Id)
                        .OrderBy(x => random.Next())
                        .Take(3)
                        .Select(r => r.VietnameseMeaning)
                        .ToList();

                    question.Options = distractors.Concat(new[] { question.CorrectAnswer }).OrderBy(x => random.Next()).ToList();
                }
                else
                {
                    question.Prompt = radical.VietnameseMeaning;
                    question.CorrectAnswer = radical.Character;

                    var distractors = radicals
                        .Where(r => r.Id != radical.Id)
                        .OrderBy(x => random.Next())
                        .Take(3)
                        .Select(r => r.Character)
                        .ToList();

                    question.Options = distractors.Concat(new[] { question.CorrectAnswer }).OrderBy(x => random.Next()).ToList();
                }

                questions.Add(question);
            }

            return ApiResponse<List<RadicalQuizQuestionDto>>.SuccessResult(questions);
        }
    }
}
