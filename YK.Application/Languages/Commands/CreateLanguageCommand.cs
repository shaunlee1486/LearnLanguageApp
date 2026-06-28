using MediatR;
using YK.Application.DTOs.Language;
using YK.Common;

namespace YK.Application.Languages.Commands
{
    public class CreateLanguageCommand : IRequest<ApiResponse<LanguageDto>>
    {
        public string Name { get; set; } = string.Empty;
        public string LocaleCode { get; set; } = string.Empty;
    }
}

