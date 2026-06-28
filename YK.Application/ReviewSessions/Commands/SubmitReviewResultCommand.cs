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
using YK.Application.DTOs.Review;

namespace YK.Application.ReviewSessions.Commands
{
    public class SubmitReviewResultCommand : IRequest<ApiResponse<ReviewSummaryDto>>
    {
        public Guid SessionId { get; set; }
        public List<ReviewResultItemDto> Results { get; set; } = new();
    }

    public class SubmitReviewResultCommandHandler : IRequestHandler<SubmitReviewResultCommand, ApiResponse<ReviewSummaryDto>>
    {
        private readonly IRepository<StudySession> _studySessionRepository;
        private readonly IRepository<Word> _wordRepository;
        private readonly IRepository<ReviewList> _reviewListRepository;
        private readonly ICurrentUserService _currentUserService;
        private readonly IUnitOfWork _unitOfWork;

        public SubmitReviewResultCommandHandler(
            IRepository<StudySession> studySessionRepository,
            IRepository<Word> wordRepository,
            IRepository<ReviewList> reviewListRepository,
            ICurrentUserService currentUserService,
            IUnitOfWork unitOfWork)
        {
            _studySessionRepository = studySessionRepository;
            _wordRepository = wordRepository;
            _reviewListRepository = reviewListRepository;
            _currentUserService = currentUserService;
            _unitOfWork = unitOfWork;
        }

        public async Task<ApiResponse<ReviewSummaryDto>> Handle(SubmitReviewResultCommand request, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.UserIdGuid;
            if (userId == null || userId == Guid.Empty)
                return ApiResponse<ReviewSummaryDto>.FailureResult(new List<string> { "Unauthorized" });

            var session = await _studySessionRepository.Query()
                .FirstOrDefaultAsync(s => s.Id == request.SessionId && s.UserId == userId.Value, cancellationToken);

            if (session == null)
                return ApiResponse<ReviewSummaryDto>.FailureResult(new List<string> { "Session not found" });

            if (session.EndTime.HasValue)
                return ApiResponse<ReviewSummaryDto>.FailureResult(new List<string> { "Session already submitted" });

            session.EndTime = DateTime.UtcNow;
            _studySessionRepository.Update(session);

            var wordIds = request.Results.Select(r => r.WordId).ToList();
            var words = await _wordRepository.Query()
                .Where(w => wordIds.Contains(w.Id) && w.UserId == userId.Value)
                .ToListAsync(cancellationToken);

            var reviewList = await _reviewListRepository.Query()
                .Include(r => r.ReviewListWords)
                .FirstOrDefaultAsync(r => r.UserId == userId.Value && r.LanguageId == session.LanguageId, cancellationToken);

            int correctCount = 0;
            foreach (var result in request.Results)
            {
                var word = words.FirstOrDefault(w => w.Id == result.WordId);
                if (word == null) continue;

                if (result.IsCorrect)
                {
                    correctCount++;
                    // Basic progression logic
                    if (word.Status == WordStatus.NotLearned)
                    {
                        word.Status = WordStatus.Learned;
                    }
                    else if (word.Status == WordStatus.Learned)
                    {
                        word.Status = WordStatus.AlreadyKnown;
                        
                        // Remove from review list if mastered
                        if (reviewList != null)
                        {
                            var reviewItem = reviewList.ReviewListWords.FirstOrDefault(rw => rw.WordId == word.Id);
                            if (reviewItem != null)
                            {
                                reviewList.ReviewListWords.Remove(reviewItem);
                            }
                        }
                    }
                }
                else
                {
                    // If incorrect, demote status or keep it as NotLearned
                    if (word.Status == WordStatus.AlreadyKnown)
                        word.Status = WordStatus.Learned;
                    else if (word.Status == WordStatus.Learned)
                        word.Status = WordStatus.NotLearned;
                }
                _wordRepository.Update(word);
            }

            if (reviewList != null)
            {
                _reviewListRepository.Update(reviewList);
            }

            await _unitOfWork.SaveChangesAsync();

            var duration = (session.EndTime.Value - session.StartTime).TotalSeconds;

            var summary = new ReviewSummaryDto
            {
                TotalWords = request.Results.Count,
                CorrectCount = correctCount,
                ScorePercentage = request.Results.Count > 0 ? Math.Round((double)correctCount / request.Results.Count * 100, 2) : 0,
                DurationSeconds = (int)duration
            };

            return ApiResponse<ReviewSummaryDto>.SuccessResult(summary);
        }
    }
}
