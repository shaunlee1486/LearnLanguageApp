using MediatR;
using YK.Common;

namespace YK.Application.Auth.Commands
{
    public class LogoutCommand : IRequest<ApiResponse<bool>>
    {
        public string RefreshToken { get; set; } = string.Empty;
    }
}

