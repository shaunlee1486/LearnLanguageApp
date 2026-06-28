using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using YK.Application.Interfaces;
using YK.Common;
using YK.Domain;
using YK.Application.DTOs.SentenceStructure;
using System.Collections.Generic;

namespace YK.Application.SentenceStructures.Queries
{
    public class GetSentenceStructuresQuery : IRequest<ApiResponse<List<SentenceStructureDto>>>
    {
    }

    public class GetSentenceStructuresQueryHandler : IRequestHandler<GetSentenceStructuresQuery, ApiResponse<List<SentenceStructureDto>>>
    {
        private readonly IRepository<SentenceStructure> _sentenceStructureRepository;
        private readonly IRepository<User> _userRepository;
        private readonly ICurrentUserService _currentUserService;

        public GetSentenceStructuresQueryHandler(
            IRepository<SentenceStructure> sentenceStructureRepository,
            IRepository<User> userRepository,
            ICurrentUserService currentUserService)
        {
            _sentenceStructureRepository = sentenceStructureRepository;
            _userRepository = userRepository;
            _currentUserService = currentUserService;
        }

        public async Task<ApiResponse<List<SentenceStructureDto>>> Handle(GetSentenceStructuresQuery request, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.UserIdGuid;
            if (userId == null || userId == Guid.Empty)
                return ApiResponse<List<SentenceStructureDto>>.FailureResult(new List<string> { "Unauthorized" });

            var user = await _userRepository.Query().FirstOrDefaultAsync(u => u.Id == userId.Value, cancellationToken);
            if (user == null || user.ActiveLanguageId == null)
                return ApiResponse<List<SentenceStructureDto>>.FailureResult(new List<string> { "No active language selected" });

            var structures = await _sentenceStructureRepository.Query()
                .Include(s => s.Examples)
                .Where(s => s.UserId == userId.Value && s.LanguageId == user.ActiveLanguageId.Value)
                .OrderByDescending(s => s.CreatedDate)
                .ToListAsync(cancellationToken);

            var dtos = structures.Select(s => new SentenceStructureDto
            {
                Id = s.Id,
                Pattern = s.Pattern,
                VietnameseMeaning = s.VietnameseMeaning,
                Examples = s.Examples.Select(e => new SentenceStructureExampleDto
                {
                    Id = e.Id,
                    Sentence = e.Sentence,
                    Meaning = e.Meaning
                }).ToList()
            }).ToList();

            return ApiResponse<List<SentenceStructureDto>>.SuccessResult(dtos);
        }
    }
}
