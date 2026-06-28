using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using YK.Application.Interfaces;
using YK.Common;
using YK.Domain;

namespace YK.Application.Tests.Queries
{
    public class TestSettingsDto
    {
        public int QuestionLimit { get; set; }
        public int TimerSeconds { get; set; }
    }

    public class GetTestSettingsQuery : IRequest<ApiResponse<TestSettingsDto>>
    {
    }

    public class GetTestSettingsQueryHandler : IRequestHandler<GetTestSettingsQuery, ApiResponse<TestSettingsDto>>
    {
        private readonly IRepository<User> _userRepository;
        private readonly ICurrentUserService _currentUserService;

        public GetTestSettingsQueryHandler(IRepository<User> userRepository, ICurrentUserService currentUserService)
        {
            _userRepository = userRepository;
            _currentUserService = currentUserService;
        }

        public async Task<ApiResponse<TestSettingsDto>> Handle(GetTestSettingsQuery request, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.UserIdGuid;
            if (userId == null || userId == Guid.Empty)
                return ApiResponse<TestSettingsDto>.FailureResult(new List<string> { "Unauthorized" });

            var user = await _userRepository.Query().FirstOrDefaultAsync(u => u.Id == userId.Value, cancellationToken);
            if (user == null)
                return ApiResponse<TestSettingsDto>.FailureResult(new List<string> { "User not found" });

            return ApiResponse<TestSettingsDto>.SuccessResult(new TestSettingsDto
            {
                QuestionLimit = user.CustomTestQuestionLimit,
                TimerSeconds = user.CustomTestTimerSeconds
            });
        }
    }
}
