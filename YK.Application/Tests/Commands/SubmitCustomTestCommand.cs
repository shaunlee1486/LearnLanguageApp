using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using YK.Application.Interfaces;
using YK.Common;
using YK.Domain;
using YK.Domain.Enums;
using YK.Application.DTOs.Tests;

namespace YK.Application.Tests.Commands
{
    public class SubmitCustomTestCommand : IRequest<ApiResponse<Guid>>
    {
        public CustomTestSubmitDto Payload { get; set; } = null!;
    }

    public class SubmitCustomTestCommandHandler : IRequestHandler<SubmitCustomTestCommand, ApiResponse<Guid>>
    {
        private readonly IRepository<TestResult> _testResultRepository;
        private readonly IRepository<User> _userRepository;
        private readonly ICurrentUserService _currentUserService;
        private readonly IUserStreakService _userStreakService;
        private readonly IUnitOfWork _unitOfWork;

        public SubmitCustomTestCommandHandler(
            IRepository<TestResult> testResultRepository,
            IRepository<User> userRepository,
            ICurrentUserService currentUserService,
            IUserStreakService userStreakService,
            IUnitOfWork unitOfWork)
        {
            _testResultRepository = testResultRepository;
            _userRepository = userRepository;
            _currentUserService = currentUserService;
            _userStreakService = userStreakService;
            _unitOfWork = unitOfWork;
        }

        public async Task<ApiResponse<Guid>> Handle(SubmitCustomTestCommand request, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.UserIdGuid;
            if (userId == null || userId == Guid.Empty)
                return ApiResponse<Guid>.FailureResult(new List<string> { "Unauthorized" });

            var user = await _userRepository.Query().FirstOrDefaultAsync(u => u.Id == userId.Value, cancellationToken);
            if (user == null || user.ActiveLanguageId == null)
                return ApiResponse<Guid>.FailureResult(new List<string> { "No active language selected" });

            var configSnapshot = new
            {
                Type = "Custom",
                QuestionLimit = user.CustomTestQuestionLimit,
                TimerSeconds = user.CustomTestTimerSeconds
            };

            var result = new TestResult
            {
                Id = Guid.NewGuid(),
                UserId = userId.Value,
                LanguageId = user.ActiveLanguageId.Value,
                TestType = TestType.Custom,
                Score = request.Payload.Score,
                TotalQuestions = request.Payload.TotalQuestions,
                Duration = request.Payload.DurationSeconds,
                ConfigSnapshot = JsonSerializer.Serialize(configSnapshot),
                TakenAt = DateTime.UtcNow
            };

            await _testResultRepository.AddAsync(result);
            await _userStreakService.UpdateStreakAsync(userId.Value, cancellationToken);
            await _unitOfWork.SaveChangesAsync();

            return ApiResponse<Guid>.SuccessResult(result.Id);
        }
    }
}
