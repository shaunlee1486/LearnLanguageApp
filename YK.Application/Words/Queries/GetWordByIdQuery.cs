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
    public class GetWordByIdQuery : IRequest<ApiResponse<WordDto>>
    {
        public Guid Id { get; set; }
    }

    public class GetWordByIdQueryHandler : IRequestHandler<GetWordByIdQuery, ApiResponse<WordDto>>
    {
        private readonly IRepository<Word> _wordRepository;
        private readonly ICurrentUserService _currentUserService;

        public GetWordByIdQueryHandler(
            IRepository<Word> wordRepository,
            ICurrentUserService currentUserService)
        {
            _wordRepository = wordRepository;
            _currentUserService = currentUserService;
        }

        public async Task<ApiResponse<WordDto>> Handle(GetWordByIdQuery request, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.UserIdGuid;
            if (userId == null || userId == Guid.Empty)
                return ApiResponse<WordDto>.FailureResult(new List<string> { "User not authenticated." });

            var word = await _wordRepository.Query()
                .Include(w => w.Meanings)
                .Include(w => w.Examples)
                .Where(w => w.Id == request.Id && w.UserId == userId.Value)
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
                .FirstOrDefaultAsync(cancellationToken);

            if (word == null)
                return ApiResponse<WordDto>.FailureResult(new List<string> { "Word not found or unauthorized." });

            return ApiResponse<WordDto>.SuccessResult(word);
        }
    }
}

