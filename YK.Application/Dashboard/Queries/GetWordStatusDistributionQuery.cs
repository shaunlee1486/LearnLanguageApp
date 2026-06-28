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
using YK.Domain.Enums;

namespace YK.Application.Dashboard.Queries
{
    public class GetWordStatusDistributionQuery : IRequest<ApiResponse<List<WordStatusDistributionDto>>>
    {
    }

    public class GetWordStatusDistributionQueryHandler : IRequestHandler<GetWordStatusDistributionQuery, ApiResponse<List<WordStatusDistributionDto>>>
    {
        private readonly IRepository<User> _userRepository;
        private readonly IRepository<Word> _wordRepository;
        private readonly ICurrentUserService _currentUserService;

        public GetWordStatusDistributionQueryHandler(
            IRepository<User> userRepository,
            IRepository<Word> wordRepository,
            ICurrentUserService currentUserService)
        {
            _userRepository = userRepository;
            _wordRepository = wordRepository;
            _currentUserService = currentUserService;
        }

        public async Task<ApiResponse<List<WordStatusDistributionDto>>> Handle(GetWordStatusDistributionQuery request, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.UserIdGuid;
            if (userId == null || userId == Guid.Empty)
                return ApiResponse<List<WordStatusDistributionDto>>.FailureResult("Unauthorized");

            var user = await _userRepository.Query().FirstOrDefaultAsync(u => u.Id == userId.Value, cancellationToken);
            if (user == null || user.ActiveLanguageId == null)
                return ApiResponse<List<WordStatusDistributionDto>>.FailureResult("No active language selected");

            var languageId = user.ActiveLanguageId.Value;

            var distribution = await _wordRepository.Query()
                .Where(w => w.UserId == userId.Value && w.LanguageId == languageId)
                .GroupBy(w => w.Status)
                .Select(g => new WordStatusDistributionDto
                {
                    Status = g.Key.ToString(),
                    Count = g.Count()
                })
                .ToListAsync(cancellationToken);

            var allStatuses = new[] { WordStatus.NotLearned, WordStatus.Learned, WordStatus.AlreadyKnown };
            var result = allStatuses.Select(status => new WordStatusDistributionDto
            {
                Status = status.ToString(),
                Count = distribution.FirstOrDefault(d => d.Status == status.ToString())?.Count ?? 0
            }).ToList();

            return ApiResponse<List<WordStatusDistributionDto>>.SuccessResult(result);
        }
    }
}
