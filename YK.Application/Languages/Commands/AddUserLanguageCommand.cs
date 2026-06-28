using MediatR;
using System;
using YK.Common;

namespace YK.Application.Languages.Commands
{
    public class AddUserLanguageCommand : IRequest<ApiResponse<bool>>
    {
        public Guid LanguageId { get; set; }
    }
}

