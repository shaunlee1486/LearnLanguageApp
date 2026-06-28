using System;

namespace YK.Application.Interfaces
{
    public interface ICurrentUserService
    {
        string? UserId { get; }
        Guid? UserIdGuid { get; }
    }
}

