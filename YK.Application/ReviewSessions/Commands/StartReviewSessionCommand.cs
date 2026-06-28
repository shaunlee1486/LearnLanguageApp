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
using YK.Application.DTOs.Review;
using YK.Application.DTOs.Word;

namespace YK.Application.ReviewSessions.Commands
{
    public class StartReviewSessionCommand : IRequest<ApiResponse<ReviewSessionDto>>
    {
        public int WordLimit { get; set; }
        public StudyMode Mode { get; set; }
    }

    public class StartReviewSessionCommandHandler : IRequestHandler<StartReviewSessionCommand, ApiResponse<ReviewSessionDto>>
    {
        private readonly IRepository<StudySession> _studySessionRepository;
        private readonly IRepository<ReviewList> _reviewListRepository;
        private readonly IRepository<Word> _wordRepository;
        private readonly IRepository<User> _userRepository;
        private readonly ICurrentUserService _currentUserService;
        private readonly IUnitOfWork _unitOfWork;

        public StartReviewSessionCommandHandler(
            IRepository<StudySession> studySessionRepository,
            IRepository<ReviewList> reviewListRepository,
            IRepository<Word> wordRepository,
            IRepository<User> userRepository,
            ICurrentUserService currentUserService,
            IUnitOfWork unitOfWork)
        {
            _studySessionRepository = studySessionRepository;
            _reviewListRepository = reviewListRepository;
            _wordRepository = wordRepository;
            _userRepository = userRepository;
            _currentUserService = currentUserService;
            _unitOfWork = unitOfWork;
        }

        public async Task<ApiResponse<ReviewSessionDto>> Handle(StartReviewSessionCommand request, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.UserIdGuid;
            if (userId == null || userId == Guid.Empty)
                return ApiResponse<ReviewSessionDto>.FailureResult(new List<string> { "Unauthorized" });

            // Since we need active language, we will inject IRepository<User> instead of using unitOfWork.
            var user = await _userRepository.Query().FirstOrDefaultAsync(u => u.Id == userId.Value, cancellationToken);
            if (user == null || user.ActiveLanguageId == null)
                return ApiResponse<ReviewSessionDto>.FailureResult(new List<string> { "No active language selected" });

            var languageId = user.ActiveLanguageId.Value;

            // Fetch words from review list
            var reviewList = await _reviewListRepository.Query()
                .Include(r => r.ReviewListWords)
                .FirstOrDefaultAsync(r => r.UserId == userId.Value && r.LanguageId == languageId, cancellationToken);

            if (reviewList == null || !reviewList.ReviewListWords.Any())
            {
                return ApiResponse<ReviewSessionDto>.FailureResult(new List<string> { "Review list is empty" });
            }

            var wordIds = reviewList.ReviewListWords.Select(rw => rw.WordId).ToList();

            var wordsQuery = _wordRepository.Query()
                .Include(w => w.Meanings)
                .Include(w => w.Examples)
                .Where(w => wordIds.Contains(w.Id));

            // Execute query and order in memory since random ordering in EF can be tricky across providers
            var allWords = await wordsQuery.ToListAsync(cancellationToken);
            
            var now = DateTime.UtcNow;

            // Priority:
            // 1. Due words (NextReviewDate <= now) or never reviewed (NextReviewDate == null)
            // 2. Status (NotLearned first, then Learned)
            var selectedWords = allWords
                .OrderBy(w => w.NextReviewDate.HasValue && w.NextReviewDate.Value > now ? 1 : 0) // Due first
                .ThenBy(w => w.Status)
                .ThenBy(w => w.NextReviewDate ?? DateTime.MinValue) // Older due dates first
                .Take(request.WordLimit)
                .ToList();

            if (!selectedWords.Any())
            {
                return ApiResponse<ReviewSessionDto>.FailureResult(new List<string> { "No words available for review" });
            }

            var studySession = new StudySession
            {
                Id = Guid.NewGuid(),
                UserId = userId.Value,
                LanguageId = languageId,
                StartTime = DateTime.UtcNow,
                Mode = request.Mode
            };

            await _studySessionRepository.AddAsync(studySession);
            await _unitOfWork.SaveChangesAsync();

            var sessionDto = new ReviewSessionDto
            {
                Id = studySession.Id,
                LanguageId = studySession.LanguageId,
                StartTime = studySession.StartTime,
                Mode = studySession.Mode,
                Words = selectedWords.Select(w => new ReviewWordDto
                {
                    Id = w.Id,
                    Text = w.Text,
                    IPA = w.IPA,
                    AudioUrl = w.AudioUrl,
                    ImageUrl = w.ImageUrl,
                    Note = w.Note,
                    Status = w.Status,
                    Meanings = w.Meanings.Select(m => new WordMeaningDto
                    {
                        Id = m.Id,
                        TypeOfWord = m.TypeOfWord.ToString(),
                        MeaningText = m.MeaningText
                    }).ToList(),
                    Examples = w.Examples.Select(e => new WordExampleDto
                    {
                        Id = e.Id,
                        Sentence = e.Sentence
                    }).ToList()
                }).ToList()
            };

            return ApiResponse<ReviewSessionDto>.SuccessResult(sessionDto);
        }
    }
}
