using MediatR;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using YK.Application.Interfaces;
using YK.Common;
using YK.Domain;
using YK.Domain.Enums;

namespace YK.Application.Radicals.Commands
{
    public class SubmitRadicalQuizCommand : IRequest<ApiResponse<bool>>
    {
        public int Score { get; set; }
        public int TotalQuestions { get; set; }
        public int DurationSeconds { get; set; }
    }

    public class SubmitRadicalQuizCommandHandler : IRequestHandler<SubmitRadicalQuizCommand, ApiResponse<bool>>
    {
        private readonly IRepository<TestResult> _testResultRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUserService;
        private readonly IUserStreakService _streakService;

        public SubmitRadicalQuizCommandHandler(
            IRepository<TestResult> testResultRepository,
            IUnitOfWork unitOfWork,
            ICurrentUserService currentUserService,
            IUserStreakService streakService)
        {
            _testResultRepository = testResultRepository;
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
            _streakService = streakService;
        }

        public async Task<ApiResponse<bool>> Handle(SubmitRadicalQuizCommand request, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.UserIdGuid;
            if (userId == null || userId == Guid.Empty)
                return ApiResponse<bool>.FailureResult(new List<string> { "Unauthorized" });

            var testResult = new TestResult
            {
                UserId = userId.Value,
                LanguageId = Guid.Empty, // Will be updated if needed, but TestResult requires it. Wait, actually TestResult has LanguageId. We can just use an empty Guid if it's language agnostic, but let's query the user.
            };

            // Let's just resolve the user repo to get the language
            // Actually, we don't have user repository injected here. I'll just use Guid.Empty for LanguageId for Radicals as they apply to both Chinese and Japanese.
            testResult.LanguageId = Guid.Empty;
            testResult.TestType = TestType.RadicalTest;
            testResult.Score = request.Score;
            testResult.TotalQuestions = request.TotalQuestions;
            testResult.Duration = request.DurationSeconds;
            testResult.ConfigSnapshot = "{}";
            testResult.TakenAt = DateTime.UtcNow;

            await _testResultRepository.AddAsync(testResult, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            await _streakService.UpdateStreakAsync(userId.Value, cancellationToken);

            return ApiResponse<bool>.SuccessResult(true);
        }
    }
}
