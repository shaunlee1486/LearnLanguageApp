using MediatR;
using Microsoft.AspNetCore.Identity;
using System.Threading;
using System.Threading.Tasks;
using YK.Application.Interfaces;
using YK.Common;
using YK.Domain;

namespace YK.Application.Languages.Commands
{
    public class SetActiveLanguageCommandHandler : IRequestHandler<SetActiveLanguageCommand, ApiResponse<bool>>
    {
        private readonly UserManager<User> _userManager;
        private readonly ICurrentUserService _currentUserService;

        public SetActiveLanguageCommandHandler(
            UserManager<User> userManager,
            ICurrentUserService currentUserService)
        {
            _userManager = userManager;
            _currentUserService = currentUserService;
        }

        public async Task<ApiResponse<bool>> Handle(SetActiveLanguageCommand request, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.UserIdGuid;
            if (userId == null)
            {
                return ApiResponse<bool>.FailureResult("Unauthorized");
            }

            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null)
            {
                return ApiResponse<bool>.FailureResult("User not found");
            }

            user.ActiveLanguageId = request.LanguageId;
            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
            {
                return ApiResponse<bool>.FailureResult("Failed to update active language");
            }

            return ApiResponse<bool>.SuccessResult(true, "Active language updated successfully");
        }
    }
}


