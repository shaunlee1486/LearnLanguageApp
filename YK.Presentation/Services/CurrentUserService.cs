using Microsoft.AspNetCore.Http;
using System;
using System.Security.Claims;
using YK.Application.Interfaces;

namespace YK.Presentation.Services
{
    public class CurrentUserService : ICurrentUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CurrentUserService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public string? UserId => _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);

        public Guid? UserIdGuid
        {
            get
            {
                if (Guid.TryParse(UserId, out var guid))
                {
                    return guid;
                }
                return null;
            }
        }
    }
}
