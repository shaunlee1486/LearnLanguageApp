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

namespace YK.Application.Words.Queries
{
    public class GetWordsByCategoryQuery : IRequest<ApiResponse<List<WordDto>>>
    {
        public Guid CategoryId { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }

    public class GetWordsByCategoryQueryHandler : IRequestHandler<GetWordsByCategoryQuery, ApiResponse<List<WordDto>>>
    {
        private readonly IRepository<Word> _wordRepository;
        private readonly ICurrentUserService _currentUserService;

        public GetWordsByCategoryQueryHandler(
            IRepository<Word> wordRepository,
            ICurrentUserService currentUserService)
        {
            _wordRepository = wordRepository;
            _currentUserService = currentUserService;
        }

        public async Task<ApiResponse<List<WordDto>>> Handle(GetWordsByCategoryQuery request, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.UserIdGuid;
            if (userId == null || userId == Guid.Empty)
                return ApiResponse<List<WordDto>>.FailureResult(new List<string> { "User not authenticated." });

            var query = _wordRepository.Query()
                .Include(w => w.Meanings)
                .Include(w => w.Examples)
                .Where(w => w.CategoryId == request.CategoryId && w.UserId == userId.Value);

            var totalCount = await query.CountAsync(cancellationToken);
            var totalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize);

            var words = await query
                .OrderByDescending(w => w.CreatedDate)
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
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
                .ToListAsync(cancellationToken);

            var meta = new PaginationMeta
            {
                Page = request.Page,
                PageSize = request.PageSize,
                TotalCount = totalCount,
                TotalPages = totalPages
            };

            return ApiResponse<List<WordDto>>.SuccessResult(words, meta);
        }
    }
}

