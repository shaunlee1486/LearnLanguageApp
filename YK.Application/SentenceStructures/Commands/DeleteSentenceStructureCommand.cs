using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using YK.Application.Interfaces;
using YK.Common;
using YK.Domain;
using System.Collections.Generic;

namespace YK.Application.SentenceStructures.Commands
{
    public class DeleteSentenceStructureCommand : IRequest<ApiResponse<bool>>
    {
        public Guid Id { get; set; }
    }

    public class DeleteSentenceStructureCommandHandler : IRequestHandler<DeleteSentenceStructureCommand, ApiResponse<bool>>
    {
        private readonly IRepository<SentenceStructure> _sentenceStructureRepository;
        private readonly ICurrentUserService _currentUserService;
        private readonly IUnitOfWork _unitOfWork;

        public DeleteSentenceStructureCommandHandler(
            IRepository<SentenceStructure> sentenceStructureRepository,
            ICurrentUserService currentUserService,
            IUnitOfWork unitOfWork)
        {
            _sentenceStructureRepository = sentenceStructureRepository;
            _currentUserService = currentUserService;
            _unitOfWork = unitOfWork;
        }

        public async Task<ApiResponse<bool>> Handle(DeleteSentenceStructureCommand request, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.UserIdGuid;
            if (userId == null || userId == Guid.Empty)
                return ApiResponse<bool>.FailureResult(new List<string> { "Unauthorized" });

            var structure = await _sentenceStructureRepository.Query()
                .FirstOrDefaultAsync(s => s.Id == request.Id && s.UserId == userId.Value, cancellationToken);

            if (structure == null)
                return ApiResponse<bool>.FailureResult(new List<string> { "Structure not found" });

            _sentenceStructureRepository.Delete(structure);
            await _unitOfWork.SaveChangesAsync();

            return ApiResponse<bool>.SuccessResult(true);
        }
    }
}
