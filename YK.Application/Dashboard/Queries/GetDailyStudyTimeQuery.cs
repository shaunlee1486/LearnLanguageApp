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
    public class GetDailyStudyTimeQuery : IRequest<ApiResponse<List<DailyStudyTimeDto>>>
    {
    }

    public class GetDailyStudyTimeQueryHandler : IRequestHandler<GetDailyStudyTimeQuery, ApiResponse<List<DailyStudyTimeDto>>>
    {
        private readonly IRepository<User> _userRepository;
        private readonly IRepository<StudySession> _studySessionRepository;
        private readonly ICurrentUserService _currentUserService;

        public GetDailyStudyTimeQueryHandler(
            IRepository<User> userRepository,
            IRepository<StudySession> studySessionRepository,
            ICurrentUserService currentUserService)
        {
            _userRepository = userRepository;
            _studySessionRepository = studySessionRepository;
            _currentUserService = currentUserService;
        }

        public async Task<ApiResponse<List<DailyStudyTimeDto>>> Handle(GetDailyStudyTimeQuery request, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.UserIdGuid;
            if (userId == null || userId == Guid.Empty)
                return ApiResponse<List<DailyStudyTimeDto>>.FailureResult("Unauthorized");

            var user = await _userRepository.Query().FirstOrDefaultAsync(u => u.Id == userId.Value, cancellationToken);
            if (user == null || user.ActiveLanguageId == null)
                return ApiResponse<List<DailyStudyTimeDto>>.FailureResult("No active language selected");

            var languageId = user.ActiveLanguageId.Value;
            var startDate = DateTime.UtcNow.Date.AddDays(-29);

            var sessions = await _studySessionRepository.Query()
                .Where(s => s.UserId == userId.Value && s.LanguageId == languageId && s.StartTime >= startDate)
                .ToListAsync(cancellationToken);

            var studyTimes = sessions
                .GroupBy(s => s.StartTime.Date)
                .ToDictionary(
                    g => g.Key,
                    g => g.Sum(s => s.EndTime.HasValue ? (s.EndTime.Value - s.StartTime).TotalMinutes : 0.0)
                );

            var result = new List<DailyStudyTimeDto>();
            for (int i = 0; i < 30; i++)
            {
                var date = startDate.AddDays(i);
                studyTimes.TryGetValue(date, out var minutes);
                result.Add(new DailyStudyTimeDto
                {
                    Date = date.ToString("yyyy-MM-dd"),
                    Minutes = Math.Round(minutes, 1)
                });
            }

            return ApiResponse<List<DailyStudyTimeDto>>.SuccessResult(result);
        }
    }
}
