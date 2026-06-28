using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using YK.Application.Interfaces;
using YK.Common;
using YK.Domain;
using YK.Application.DTOs.Grammar;
using System.Collections.Generic;

namespace YK.Application.GrammarRules.Queries
{
    public class GetGrammarRulesQuery : IRequest<ApiResponse<List<GrammarRuleDto>>>
    {
    }

    public class GetGrammarRulesQueryHandler : IRequestHandler<GetGrammarRulesQuery, ApiResponse<List<GrammarRuleDto>>>
    {
        private readonly IRepository<GrammarRule> _grammarRepository;
        private readonly IRepository<User> _userRepository;
        private readonly ICurrentUserService _currentUserService;

        public GetGrammarRulesQueryHandler(
            IRepository<GrammarRule> grammarRepository,
            IRepository<User> userRepository,
            ICurrentUserService currentUserService)
        {
            _grammarRepository = grammarRepository;
            _userRepository = userRepository;
            _currentUserService = currentUserService;
        }

        public async Task<ApiResponse<List<GrammarRuleDto>>> Handle(GetGrammarRulesQuery request, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.UserIdGuid;
            if (userId == null || userId == Guid.Empty)
                return ApiResponse<List<GrammarRuleDto>>.FailureResult(new List<string> { "Unauthorized" });

            var user = await _userRepository.Query().FirstOrDefaultAsync(u => u.Id == userId.Value, cancellationToken);
            if (user == null || user.ActiveLanguageId == null)
                return ApiResponse<List<GrammarRuleDto>>.FailureResult(new List<string> { "No active language selected" });

            var rules = await _grammarRepository.Query()
                .Include(g => g.Examples)
                .Where(g => g.UserId == userId.Value && g.LanguageId == user.ActiveLanguageId.Value)
                .OrderByDescending(g => g.CreatedDate)
                .ToListAsync(cancellationToken);

            var dtos = rules.Select(r => new GrammarRuleDto
            {
                Id = r.Id,
                Name = r.Name,
                Description = r.Description,
                Examples = r.Examples.Select(e => new GrammarExampleDto
                {
                    Id = e.Id,
                    Sentence = e.Sentence
                }).ToList()
            }).ToList();

            return ApiResponse<List<GrammarRuleDto>>.SuccessResult(dtos);
        }
    }
}
