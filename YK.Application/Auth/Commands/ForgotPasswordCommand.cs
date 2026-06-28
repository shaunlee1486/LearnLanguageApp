using MediatR;
using YK.Common;

namespace YK.Application.Auth.Commands
{
    public class ForgotPasswordCommand : IRequest<ApiResponse<bool>>
    {
        public string Email { get; set; } = string.Empty;
    }
}

