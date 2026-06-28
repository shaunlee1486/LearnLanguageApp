using MediatR;
using Microsoft.AspNetCore.Identity;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using YK.Common;
using YK.Domain;

namespace YK.Application.Auth.Commands
{
    public class RegisterCommandHandler : IRequestHandler<RegisterCommand, ApiResponse<bool>>
    {
        private readonly UserManager<User> _userManager;

        public RegisterCommandHandler(UserManager<User> userManager)
        {
            _userManager = userManager;
        }

        public async Task<ApiResponse<bool>> Handle(RegisterCommand request, CancellationToken cancellationToken)
        {
            var user = new User
            {
                UserName = request.Email,
                Email = request.Email,
                DisplayName = request.DisplayName,
                Id = Guid.NewGuid() // Will be replaced by UuidV7 in Db if configured, but setting Guid.NewGuid() is standard
            };

            var result = await _userManager.CreateAsync(user, request.Password);

            if (result.Succeeded)
            {
                return ApiResponse<bool>.SuccessResult(true);
            }

            var errors = result.Errors.Select(e => e.Description).ToList();
            return ApiResponse<bool>.FailureResult(errors);
        }
    }
}

