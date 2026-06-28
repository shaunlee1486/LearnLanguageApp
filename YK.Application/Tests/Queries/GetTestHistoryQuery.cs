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
using YK.Domain.Enums;

namespace YK.Application.Tests.Queries
{
    public class TestHistoryItemDto
    {
        public Guid Id { get; set; }
        public string TestType { get; set; } = string.Empty;
        public int Score { get; set; }
        public int TotalQuestions { get; set; }
        public int Duration { get; set; }
        public DateTime TakenAt { get; set; }
    }

    public class GetTestHistoryQuery : IRequest<ApiResponse<IEnumerable<TestHistoryItemDto>>>
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }

    public class GetTestHistoryQueryHandler : IRequestHandler<GetTestHistoryQuery, ApiResponse<IEnumerable<TestHistoryItemDto>>>
    {
        private readonly IRepository<TestResult> _testResultRepository;
        private readonly ICurrentUserService _currentUserService;

        public GetTestHistoryQueryHandler(IRepository<TestResult> testResultRepository, ICurrentUserService currentUserService)
        {
            _testResultRepository = testResultRepository;
            _currentUserService = currentUserService;
        }

        public async Task<ApiResponse<IEnumerable<TestHistoryItemDto>>> Handle(GetTestHistoryQuery request, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.UserIdGuid;
            if (userId == null || userId == Guid.Empty)
                return ApiResponse<IEnumerable<TestHistoryItemDto>>.FailureResult(new List<string> { "Unauthorized" });

            var query = _testResultRepository.Query()
                .Where(tr => tr.UserId == userId.Value)
                .OrderByDescending(tr => tr.TakenAt);

            var totalCount = await query.CountAsync(cancellationToken);
            var items = await query
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(tr => new TestHistoryItemDto
                {
                    Id = tr.Id,
                    TestType = tr.TestType.ToString(),
                    Score = tr.Score,
                    TotalQuestions = tr.TotalQuestions,
                    Duration = tr.Duration,
                    TakenAt = tr.TakenAt
                })
                .ToListAsync(cancellationToken);

            var paginationMeta = new PaginationMeta(request.Page, request.PageSize, totalCount);
            return ApiResponse<IEnumerable<TestHistoryItemDto>>.SuccessResult(items, paginationMeta);
        }
    }
}
