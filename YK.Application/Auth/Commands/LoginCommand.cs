using MediatR;
using YK.Application.Auth.DTOs;
using YK.Common;

namespace YK.Application.Auth.Commands
{
    public class LoginCommand : IRequest<ApiResponse<AuthResponseDto>>
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}

