using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using YK.Application.Interfaces;
using YK.Common;
using YK.Domain;

namespace YK.Application.Auth.Commands
{
    public class ForgotPasswordCommandHandler : IRequestHandler<ForgotPasswordCommand, ApiResponse<bool>>
    {
        private readonly UserManager<User> _userManager;
        private readonly IEmailService _emailService;

        public ForgotPasswordCommandHandler(UserManager<User> userManager, IEmailService emailService)
        {
            _userManager = userManager;
            _emailService = emailService;
        }

        public async Task<ApiResponse<bool>> Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
            {
                // Return success even if user not found to prevent user enumeration
                return ApiResponse<bool>.SuccessResult(true);
            }

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            // Encode token to be URL safe
            var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));

            // Generate reset link. In a real app, this base URL should be configured
            // For now, assume a frontend reset URL format: /reset-password?token={encodedToken}&email={email}
            var resetLink = $"http://localhost:3000/reset-password?token={encodedToken}&email={request.Email}";

            await _emailService.SendPasswordResetEmailAsync(user.Email!, resetLink);

            return ApiResponse<bool>.SuccessResult(true);
        }
    }
}

