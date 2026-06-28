using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using YK.Application.DTOs.Dashboard;
using YK.Application.Interfaces;
using YK.Common;
using YK.Domain;

namespace YK.Application.Dashboard.Queries
{
    public class GetExamScoreHistoryQuery : IRequest<ApiResponse<List<ExamScoreDto>>>
    {
    }

    public class GetExamScoreHistoryQueryHandler : IRequestHandler<GetExamScoreHistoryQuery, ApiResponse<List<ExamScoreDto>>>
    {
        private readonly IRepository<User> _userRepository;
        private readonly IRepository<TestResult> _testResultRepository;
        private readonly ICurrentUserService _currentUserService;

        public GetExamScoreHistoryQueryHandler(
            IRepository<User> userRepository,
            IRepository<TestResult> testResultRepository,
            ICurrentUserService currentUserService)
        {
            _userRepository = userRepository;
            _testResultRepository = testResultRepository;
            _currentUserService = currentUserService;
        }

        public async Task<ApiResponse<List<ExamScoreDto>>> Handle(GetExamScoreHistoryQuery request, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.UserIdGuid;
            if (userId == null || userId == Guid.Empty)
                return ApiResponse<List<ExamScoreDto>>.FailureResult("Unauthorized");

            var user = await _userRepository.Query().FirstOrDefaultAsync(u => u.Id == userId.Value, cancellationToken);
            if (user == null || user.ActiveLanguageId == null)
                return ApiResponse<List<ExamScoreDto>>.FailureResult("No active language selected");

            var languageId = user.ActiveLanguageId.Value;

            var result = await _testResultRepository.Query()
                .Where(t => t.UserId == userId.Value && t.LanguageId == languageId)
                .OrderBy(t => t.TakenAt)
                .Select(t => new ExamScoreDto
                {
                    Id = t.Id,
                    TestType = t.TestType.ToString(),
                    Score = t.Score,
                    TotalQuestions = t.TotalQuestions,
                    TakenAt = t.TakenAt
                })
                .ToListAsync(cancellationToken);

            return ApiResponse<List<ExamScoreDto>>.SuccessResult(result);
        }
    }
}
