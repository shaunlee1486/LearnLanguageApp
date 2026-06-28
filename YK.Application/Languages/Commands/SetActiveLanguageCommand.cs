using MediatR;
using System;
using YK.Common;

namespace YK.Application.Languages.Commands
{
    public class SetActiveLanguageCommand : IRequest<ApiResponse<bool>>
    {
        public Guid LanguageId { get; set; }
    }
}

