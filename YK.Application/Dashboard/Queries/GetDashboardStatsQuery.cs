using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using YK.Application.Interfaces;
using YK.Common;
using YK.Domain;
using YK.Domain.Enums;
using YK.Application.DTOs.Dashboard;
using System.Collections.Generic;

namespace YK.Application.Dashboard.Queries
{
    public class GetDashboardStatsQuery : IRequest<ApiResponse<DashboardStatsDto>>
    {
    }

    public class GetDashboardStatsQueryHandler : IRequestHandler<GetDashboardStatsQuery, ApiResponse<DashboardStatsDto>>
    {
        private readonly IRepository<User> _userRepository;
        private readonly IRepository<Word> _wordRepository;
        private readonly IRepository<GrammarRule> _grammarRepository;
        private readonly IRepository<SentenceStructure> _structureRepository;
        private readonly IRepository<TestResult> _testResultRepository;
        private readonly ICurrentUserService _currentUserService;

        public GetDashboardStatsQueryHandler(
            IRepository<User> userRepository,
            IRepository<Word> wordRepository,
            IRepository<GrammarRule> grammarRepository,
            IRepository<SentenceStructure> structureRepository,
            IRepository<TestResult> testResultRepository,
            ICurrentUserService currentUserService)
        {
            _userRepository = userRepository;
            _wordRepository = wordRepository;
            _grammarRepository = grammarRepository;
            _structureRepository = structureRepository;
            _testResultRepository = testResultRepository;
            _currentUserService = currentUserService;
        }

        public async Task<ApiResponse<DashboardStatsDto>> Handle(GetDashboardStatsQuery request, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.UserIdGuid;
            if (userId == null || userId == Guid.Empty)
                return ApiResponse<DashboardStatsDto>.FailureResult(new List<string> { "Unauthorized" });

            var user = await _userRepository.Query().FirstOrDefaultAsync(u => u.Id == userId.Value, cancellationToken);
            if (user == null || user.ActiveLanguageId == null)
                return ApiResponse<DashboardStatsDto>.FailureResult(new List<string> { "No active language selected" });

            var languageId = user.ActiveLanguageId.Value;
            var now = DateTime.UtcNow;

            var wordsQuery = _wordRepository.Query().Where(w => w.UserId == userId.Value && w.LanguageId == languageId);

            var wordsLearned = await wordsQuery.CountAsync(w => w.Status == WordStatus.Learned, cancellationToken);
            var wordsKnown = await wordsQuery.CountAsync(w => w.Status == WordStatus.AlreadyKnown, cancellationToken);
            var wordsDue = await wordsQuery.CountAsync(w => w.NextReviewDate.HasValue && w.NextReviewDate.Value <= now, cancellationToken);

            var grammars = await _grammarRepository.Query()
                .CountAsync(g => g.UserId == userId.Value && g.LanguageId == languageId, cancellationToken);

            var structures = await _structureRepository.Query()
                .CountAsync(s => s.UserId == userId.Value && s.LanguageId == languageId, cancellationToken);

            var recentTests = await _testResultRepository.Query()
                .Where(t => t.UserId == userId.Value && t.LanguageId == languageId)
                .OrderByDescending(t => t.TakenAt)
                .Take(5)
                .Select(t => new RecentTestScoreDto
                {
                    TestType = t.TestType.ToString(),
                    Score = t.Score,
                    TotalQuestions = t.TotalQuestions,
                    TakenAt = t.TakenAt
                })
                .ToListAsync(cancellationToken);

            var dto = new DashboardStatsDto
            {
                TotalWordsLearned = wordsLearned,
                TotalWordsKnown = wordsKnown,
                WordsDueForReview = wordsDue,
                TotalGrammars = grammars,
                TotalStructures = structures,
                CurrentStreak = user.CurrentStreak,
                LongestStreak = user.LongestStreak,
                RecentTestScores = recentTests
            };

            return ApiResponse<DashboardStatsDto>.SuccessResult(dto);
        }
    }
}
