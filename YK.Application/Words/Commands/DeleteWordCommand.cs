using MediatR;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using YK.Application.Interfaces;
using YK.Common;
using YK.Domain;
using Microsoft.EntityFrameworkCore;

namespace YK.Application.Words.Commands
{
    public class DeleteWordCommand : IRequest<ApiResponse<bool>>
    {
        public Guid Id { get; set; }
    }

    public class DeleteWordCommandHandler : IRequestHandler<DeleteWordCommand, ApiResponse<bool>>
    {
        private readonly IRepository<Word> _wordRepository;
        private readonly ICurrentUserService _currentUserService;
        private readonly IUnitOfWork _unitOfWork;

        public DeleteWordCommandHandler(
            IRepository<Word> wordRepository,
            ICurrentUserService currentUserService,
            IUnitOfWork unitOfWork)
        {
            _wordRepository = wordRepository;
            _currentUserService = currentUserService;
            _unitOfWork = unitOfWork;
        }

        public async Task<ApiResponse<bool>> Handle(DeleteWordCommand request, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.UserIdGuid;
            if (userId == null || userId == Guid.Empty)
                return ApiResponse<bool>.FailureResult(new List<string> { "User not authenticated." });

            var word = await _wordRepository.Query()
                .FirstOrDefaultAsync(w => w.Id == request.Id && w.UserId == userId.Value, cancellationToken);

            if (word == null)
                return ApiResponse<bool>.FailureResult(new List<string> { "Word not found or unauthorized." });

            _wordRepository.Delete(word);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return ApiResponse<bool>.SuccessResult(true);
        }
    }
}

