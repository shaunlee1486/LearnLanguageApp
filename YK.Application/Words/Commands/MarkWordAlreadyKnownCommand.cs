using MediatR;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using YK.Application.Interfaces;
using YK.Common;
using YK.Domain;
using YK.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace YK.Application.Words.Commands
{
    public class MarkWordAlreadyKnownCommand : IRequest<ApiResponse<bool>>
    {
        public Guid Id { get; set; }
    }

    public class MarkWordAlreadyKnownCommandHandler : IRequestHandler<MarkWordAlreadyKnownCommand, ApiResponse<bool>>
    {
        private readonly IRepository<Word> _wordRepository;
        private readonly ICurrentUserService _currentUserService;
        private readonly IUnitOfWork _unitOfWork;

        public MarkWordAlreadyKnownCommandHandler(
            IRepository<Word> wordRepository,
            ICurrentUserService currentUserService,
            IUnitOfWork unitOfWork)
        {
            _wordRepository = wordRepository;
            _currentUserService = currentUserService;
            _unitOfWork = unitOfWork;
        }

        public async Task<ApiResponse<bool>> Handle(MarkWordAlreadyKnownCommand request, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.UserIdGuid;
            if (userId == null || userId == Guid.Empty)
                return ApiResponse<bool>.FailureResult(new List<string> { "User not authenticated." });

            var word = await _wordRepository.Query()
                .FirstOrDefaultAsync(w => w.Id == request.Id && w.UserId == userId.Value, cancellationToken);

            if (word == null)
                return ApiResponse<bool>.FailureResult(new List<string> { "Word not found or unauthorized." });

            word.Status = WordStatus.AlreadyKnown;

            _wordRepository.Update(word);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return ApiResponse<bool>.SuccessResult(true);
        }
    }
}

