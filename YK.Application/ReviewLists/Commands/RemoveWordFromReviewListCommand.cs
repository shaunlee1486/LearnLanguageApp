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
    public class RemoveWordFromReviewListCommand : IRequest<ApiResponse<bool>>
    {
        public Guid LanguageId { get; set; }
        public Guid WordId { get; set; }
    }

    public class RemoveWordFromReviewListCommandHandler : IRequestHandler<RemoveWordFromReviewListCommand, ApiResponse<bool>>
    {
        private readonly IRepository<ReviewList> _reviewListRepository;
        private readonly IRepository<ReviewListWord> _reviewListWordRepository;
        private readonly ICurrentUserService _currentUserService;
        private readonly IUnitOfWork _unitOfWork;

        public RemoveWordFromReviewListCommandHandler(
            IRepository<ReviewList> reviewListRepository,
            IRepository<ReviewListWord> reviewListWordRepository,
            ICurrentUserService currentUserService,
            IUnitOfWork unitOfWork)
        {
            _reviewListRepository = reviewListRepository;
            _reviewListWordRepository = reviewListWordRepository;
            _currentUserService = currentUserService;
            _unitOfWork = unitOfWork;
        }

        public async Task<ApiResponse<bool>> Handle(RemoveWordFromReviewListCommand request, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.UserIdGuid;
            if (userId == null || userId == Guid.Empty)
                return ApiResponse<bool>.FailureResult(new List<string> { "User not authenticated." });

            var reviewList = await _reviewListRepository.Query()
                .FirstOrDefaultAsync(r => r.UserId == userId.Value && r.LanguageId == request.LanguageId, cancellationToken);

            if (reviewList == null)
                return ApiResponse<bool>.FailureResult(new List<string> { "Review list not found." });

            var reviewListWord = await _reviewListWordRepository.Query()
                .FirstOrDefaultAsync(rw => rw.ReviewListId == reviewList.Id && rw.WordId == request.WordId, cancellationToken);

            if (reviewListWord != null)
            {
                _reviewListWordRepository.Delete(reviewListWord);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
            }

            return ApiResponse<bool>.SuccessResult(true);
        }
    }
}

