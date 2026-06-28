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

namespace YK.Application.GrammarRules.Commands
{
    public class UpdateGrammarRuleCommand : IRequest<ApiResponse<bool>>
    {
        public Guid Id { get; set; }
        public UpdateGrammarRuleRequest Data { get; set; } = null!;
    }

    public class UpdateGrammarRuleCommandHandler : IRequestHandler<UpdateGrammarRuleCommand, ApiResponse<bool>>
    {
        private readonly IRepository<GrammarRule> _grammarRepository;
        private readonly ICurrentUserService _currentUserService;
        private readonly IUnitOfWork _unitOfWork;

        public UpdateGrammarRuleCommandHandler(
            IRepository<GrammarRule> grammarRepository,
            ICurrentUserService currentUserService,
            IUnitOfWork unitOfWork)
        {
            _grammarRepository = grammarRepository;
            _currentUserService = currentUserService;
            _unitOfWork = unitOfWork;
        }

        public async Task<ApiResponse<bool>> Handle(UpdateGrammarRuleCommand request, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.UserIdGuid;
            if (userId == null || userId == Guid.Empty)
                return ApiResponse<bool>.FailureResult(new List<string> { "Unauthorized" });

            var rule = await _grammarRepository.Query()
                .Include(g => g.Examples)
                .FirstOrDefaultAsync(g => g.Id == request.Id && g.UserId == userId.Value, cancellationToken);

            if (rule == null)
                return ApiResponse<bool>.FailureResult(new List<string> { "Rule not found" });

            rule.Name = request.Data.Name;
            rule.Description = request.Data.Description;

            // Simple update: clear existing and add new
            rule.Examples.Clear();
            foreach (var example in request.Data.Examples.Where(e => !string.IsNullOrWhiteSpace(e)))
            {
                rule.Examples.Add(new GrammarExample
                {
                    Id = Guid.NewGuid(),
                    Sentence = example
                });
            }

            _grammarRepository.Update(rule);
            await _unitOfWork.SaveChangesAsync();

            return ApiResponse<bool>.SuccessResult(true);
        }
    }
}
