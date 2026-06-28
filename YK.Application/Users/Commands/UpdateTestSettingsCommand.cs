using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using YK.Application.Interfaces;
using YK.Common;
using YK.Domain;

namespace YK.Application.Users.Commands
{
    public class UpdateTestSettingsCommand : IRequest<ApiResponse<bool>>
    {
        public int QuestionLimit { get; set; }
        public int TimerSeconds { get; set; }
    }

    public class UpdateTestSettingsCommandHandler : IRequestHandler<UpdateTestSettingsCommand, ApiResponse<bool>>
    {
        private readonly IRepository<User> _userRepository;
        private readonly ICurrentUserService _currentUserService;
        private readonly IUnitOfWork _unitOfWork;

        public UpdateTestSettingsCommandHandler(
            IRepository<User> userRepository,
            ICurrentUserService currentUserService,
            IUnitOfWork unitOfWork)
        {
            _userRepository = userRepository;
            _currentUserService = currentUserService;
            _unitOfWork = unitOfWork;
        }

        public async Task<ApiResponse<bool>> Handle(UpdateTestSettingsCommand request, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.UserIdGuid;
            if (userId == null || userId == Guid.Empty)
                return ApiResponse<bool>.FailureResult(new List<string> { "Unauthorized" });

            var user = await _userRepository.Query().FirstOrDefaultAsync(u => u.Id == userId.Value, cancellationToken);
            if (user == null)
                return ApiResponse<bool>.FailureResult(new List<string> { "User not found" });

            if (request.QuestionLimit < 5 || request.QuestionLimit > 100)
                return ApiResponse<bool>.FailureResult(new List<string> { "Question limit must be between 5 and 100." });

            if (request.TimerSeconds < 60 || request.TimerSeconds > 3600)
                return ApiResponse<bool>.FailureResult(new List<string> { "Timer must be between 60 and 3600 seconds." });

            user.CustomTestQuestionLimit = request.QuestionLimit;
            user.CustomTestTimerSeconds = request.TimerSeconds;

            _userRepository.Update(user);
            await _unitOfWork.SaveChangesAsync();

            return ApiResponse<bool>.SuccessResult(true);
        }
    }
}
