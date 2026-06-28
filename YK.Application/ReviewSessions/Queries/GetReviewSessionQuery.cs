using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using YK.Application.Interfaces;
using YK.Common;
using YK.Domain;
using YK.Application.DTOs.Review;
using YK.Application.DTOs.Word;

namespace YK.Application.ReviewSessions.Queries
{
    public class GetReviewSessionQuery : IRequest<ApiResponse<ReviewSessionDto>>
    {
        public Guid SessionId { get; set; }
    }

    public class GetReviewSessionQueryHandler : IRequestHandler<GetReviewSessionQuery, ApiResponse<ReviewSessionDto>>
    {
        private readonly IRepository<StudySession> _studySessionRepository;
        private readonly ICurrentUserService _currentUserService;

        public GetReviewSessionQueryHandler(
            IRepository<StudySession> studySessionRepository,
            ICurrentUserService currentUserService)
        {
            _studySessionRepository = studySessionRepository;
            _currentUserService = currentUserService;
        }

        public async Task<ApiResponse<ReviewSessionDto>> Handle(GetReviewSessionQuery request, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.UserIdGuid;
            if (userId == null || userId == Guid.Empty)
                return ApiResponse<ReviewSessionDto>.FailureResult(new List<string> { "Unauthorized" });

            var session = await _studySessionRepository.Query()
                .FirstOrDefaultAsync(s => s.Id == request.SessionId && s.UserId == userId.Value, cancellationToken);

            if (session == null)
                return ApiResponse<ReviewSessionDto>.FailureResult(new List<string> { "Session not found" });

            // For now, returning words is not strictly stored in session table (since session doesn't save word IDs in MVP to save time)
            // But realistically a session SHOULD have session words.
            // Wait, StartReviewSessionCommand returns the words, and the frontend will hold them in state.
            // We might not even need this GET endpoint if frontend holds the state.
            // Let's implement it minimally just returning the session info without words for now,
            // or we could add a StudySessionWord entity to properly track it.
            // Since MVP uses frontend state, we just return basic info.

            var dto = new ReviewSessionDto
            {
                Id = session.Id,
                LanguageId = session.LanguageId,
                StartTime = session.StartTime,
                Mode = session.Mode,
                Words = new() // Empty as frontend holds the state
            };

            return ApiResponse<ReviewSessionDto>.SuccessResult(dto);
        }
    }
}
