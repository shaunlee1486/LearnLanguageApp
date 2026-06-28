using MediatR;
using YK.Common;

namespace YK.Application.Auth.Commands
{
    public class RegisterCommand : IRequest<ApiResponse<bool>>
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
    }
}

