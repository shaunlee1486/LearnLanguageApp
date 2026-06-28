using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using YK.Application.Interfaces;
using YK.Common;
using YK.Domain;
using Microsoft.EntityFrameworkCore;

namespace YK.Application.ReviewLists.Commands
{
    public class AddWordsToReviewListCommand : IRequest<ApiResponse<bool>>
    {
        public Guid LanguageId { get; set; }
        public List<Guid> WordIds { get; set; } = new();
    }

    public class AddWordsToReviewListCommandHandler : IRequestHandler<AddWordsToReviewListCommand, ApiResponse<bool>>
    {
        private readonly IRepository<ReviewList> _reviewListRepository;
        private readonly IRepository<ReviewListWord> _reviewListWordRepository;
        private readonly IRepository<Word> _wordRepository;
        private readonly ICurrentUserService _currentUserService;
        private readonly IUnitOfWork _unitOfWork;

        public AddWordsToReviewListCommandHandler(
            IRepository<ReviewList> reviewListRepository,
            IRepository<ReviewListWord> reviewListWordRepository,
            IRepository<Word> wordRepository,
            ICurrentUserService currentUserService,
            IUnitOfWork unitOfWork)
        {
            _reviewListRepository = reviewListRepository;
            _reviewListWordRepository = reviewListWordRepository;
            _wordRepository = wordRepository;
            _currentUserService = currentUserService;
            _unitOfWork = unitOfWork;
        }

        public async Task<ApiResponse<bool>> Handle(AddWordsToReviewListCommand request, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.UserIdGuid;
            if (userId == null || userId == Guid.Empty)
                return ApiResponse<bool>.FailureResult(new List<string> { "User not authenticated." });

            if (!request.WordIds.Any())
                return ApiResponse<bool>.FailureResult(new List<string> { "No words provided." });

            // Ensure ReviewList exists
            var reviewList = await _reviewListRepository.Query()
                .FirstOrDefaultAsync(r => r.UserId == userId.Value && r.LanguageId == request.LanguageId, cancellationToken);

            if (reviewList == null)
            {
                reviewList = new ReviewList
                {
                    Id = Guid.NewGuid(),
                    UserId = userId.Value,
                    LanguageId = request.LanguageId
                };
                await _reviewListRepository.AddAsync(reviewList);
            }

            // Fetch existing review list words for this list to avoid duplicates
            var existingWordIds = await _reviewListWordRepository.Query()
                .Where(rw => rw.ReviewListId == reviewList.Id)
                .Select(rw => rw.WordId)
                .ToListAsync(cancellationToken);

            var wordsToAdd = request.WordIds.Except(existingWordIds).ToList();

            // Verify words exist and belong to user/language
            var validWords = await _wordRepository.Query()
                .Where(w => wordsToAdd.Contains(w.Id) && w.UserId == userId.Value && w.LanguageId == request.LanguageId)
                .Select(w => w.Id)
                .ToListAsync(cancellationToken);

            foreach (var wordId in validWords)
            {
                await _reviewListWordRepository.AddAsync(new ReviewListWord
                {
                    Id = Guid.NewGuid(),
                    ReviewListId = reviewList.Id,
                    WordId = wordId
                });
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return ApiResponse<bool>.SuccessResult(true);
        }
    }
}


