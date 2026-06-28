using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using YK.Application.Interfaces;
using YK.Common;
using YK.Domain;
using YK.Application.DTOs.Word;
using Microsoft.EntityFrameworkCore;

namespace YK.Application.ReviewLists.Queries
{
    public class GetReviewListQuery : IRequest<ApiResponse<List<WordDto>>>
    {
        public Guid LanguageId { get; set; }
    }

    public class GetReviewListQueryHandler : IRequestHandler<GetReviewListQuery, ApiResponse<List<WordDto>>>
    {
        private readonly IRepository<ReviewList> _reviewListRepository;
        private readonly ICurrentUserService _currentUserService;

        public GetReviewListQueryHandler(
            IRepository<ReviewList> reviewListRepository,
            ICurrentUserService currentUserService)
        {
            _reviewListRepository = reviewListRepository;
            _currentUserService = currentUserService;
        }

        public async Task<ApiResponse<List<WordDto>>> Handle(GetReviewListQuery request, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.UserIdGuid;
            if (userId == null || userId == Guid.Empty)
                return ApiResponse<List<WordDto>>.FailureResult(new List<string> { "User not authenticated." });

            var reviewList = await _reviewListRepository.Query()
                .Include(r => r.ReviewListWords)
                    .ThenInclude(rw => rw.Word)
                        .ThenInclude(w => w.Meanings)
                .Include(r => r.ReviewListWords)
                    .ThenInclude(rw => rw.Word)
                        .ThenInclude(w => w.Examples)
                .FirstOrDefaultAsync(r => r.UserId == userId.Value && r.LanguageId == request.LanguageId, cancellationToken);

            if (reviewList == null)
            {
                // Return empty list if no review list created yet
                return ApiResponse<List<WordDto>>.SuccessResult(new List<WordDto>());
            }

            var words = reviewList.ReviewListWords
                .Select(rw => rw.Word)
                .Select(w => new WordDto
                {
                    Id = w.Id,
                    Text = w.Text,
                    IPA = w.IPA,
                    AudioUrl = w.AudioUrl,
                    ImageUrl = w.ImageUrl,
                    Note = w.Note,
                    Status = w.Status.ToString(),
                    CategoryId = w.CategoryId,
                    CreatedDate = w.CreatedDate,
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
                })
                .ToList();

            return ApiResponse<List<WordDto>>.SuccessResult(words);
        }
    }
}

