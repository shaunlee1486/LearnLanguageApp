using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using YK.Application.Interfaces;
using YK.Common;
using YK.Domain;
using System.Collections.Generic;

namespace YK.Application.GrammarRules.Commands
{
    public class DeleteGrammarRuleCommand : IRequest<ApiResponse<bool>>
    {
        public Guid Id { get; set; }
    }

    public class DeleteGrammarRuleCommandHandler : IRequestHandler<DeleteGrammarRuleCommand, ApiResponse<bool>>
    {
        private readonly IRepository<GrammarRule> _grammarRepository;
        private readonly ICurrentUserService _currentUserService;
        private readonly IUnitOfWork _unitOfWork;

        public DeleteGrammarRuleCommandHandler(
            IRepository<GrammarRule> grammarRepository,
            ICurrentUserService currentUserService,
            IUnitOfWork unitOfWork)
        {
            _grammarRepository = grammarRepository;
            _currentUserService = currentUserService;
            _unitOfWork = unitOfWork;
        }

        public async Task<ApiResponse<bool>> Handle(DeleteGrammarRuleCommand request, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.UserIdGuid;
            if (userId == null || userId == Guid.Empty)
                return ApiResponse<bool>.FailureResult(new List<string> { "Unauthorized" });

            var rule = await _grammarRepository.Query()
                .FirstOrDefaultAsync(g => g.Id == request.Id && g.UserId == userId.Value, cancellationToken);

            if (rule == null)
                return ApiResponse<bool>.FailureResult(new List<string> { "Rule not found" });

            _grammarRepository.Delete(rule);
            await _unitOfWork.SaveChangesAsync();

            return ApiResponse<bool>.SuccessResult(true);
        }
    }
}
