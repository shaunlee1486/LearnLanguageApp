using MediatR;
using System.Collections.Generic;
using YK.Application.DTOs.Language;
using YK.Common;

namespace YK.Application.Languages.Queries
{
    public class GetUserLanguagesQuery : IRequest<ApiResponse<IEnumerable<LanguageDto>>>
    {
    }
}
