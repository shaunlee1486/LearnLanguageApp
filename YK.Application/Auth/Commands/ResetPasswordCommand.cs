using MediatR;
using YK.Common;

namespace YK.Application.Auth.Commands
{
    public class ResetPasswordCommand : IRequest<ApiResponse<bool>>
    {
        public string Email { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}
