using MediatR;
using YK.Application.Auth.DTOs;
using YK.Common;

namespace YK.Application.Auth.Commands
{
    public class RefreshTokenCommand : IRequest<ApiResponse<AuthResponseDto>>
    {
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
    }
}

