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

namespace YK.Application.GrammarRules.Commands
{
    public class CreateGrammarRuleCommand : IRequest<ApiResponse<Guid>>
    {
        public CreateGrammarRuleRequest Data { get; set; } = null!;
    }

    public class CreateGrammarRuleCommandHandler : IRequestHandler<CreateGrammarRuleCommand, ApiResponse<Guid>>
    {
        private readonly IRepository<GrammarRule> _grammarRepository;
        private readonly IRepository<User> _userRepository;
        private readonly ICurrentUserService _currentUserService;
        private readonly IUnitOfWork _unitOfWork;

        public CreateGrammarRuleCommandHandler(
            IRepository<GrammarRule> grammarRepository,
            IRepository<User> userRepository,
            ICurrentUserService currentUserService,
            IUnitOfWork unitOfWork)
        {
            _grammarRepository = grammarRepository;
            _userRepository = userRepository;
            _currentUserService = currentUserService;
            _unitOfWork = unitOfWork;
        }

        public async Task<ApiResponse<Guid>> Handle(CreateGrammarRuleCommand request, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.UserIdGuid;
            if (userId == null || userId == Guid.Empty)
                return ApiResponse<Guid>.FailureResult(new System.Collections.Generic.List<string> { "Unauthorized" });

            var user = await _userRepository.Query().FirstOrDefaultAsync(u => u.Id == userId.Value, cancellationToken);
            if (user == null || user.ActiveLanguageId == null)
                return ApiResponse<Guid>.FailureResult(new System.Collections.Generic.List<string> { "No active language selected" });

            var grammarRule = new GrammarRule
            {
                Id = Guid.NewGuid(),
                Name = request.Data.Name,
                Description = request.Data.Description,
                UserId = userId.Value,
                LanguageId = user.ActiveLanguageId.Value
            };

            foreach (var example in request.Data.Examples.Where(e => !string.IsNullOrWhiteSpace(e)))
            {
                grammarRule.Examples.Add(new GrammarExample
                {
                    Id = Guid.NewGuid(),
                    Sentence = example
                });
            }

            await _grammarRepository.AddAsync(grammarRule);
            await _unitOfWork.SaveChangesAsync();

            return ApiResponse<Guid>.SuccessResult(grammarRule.Id);
        }
    }
}
