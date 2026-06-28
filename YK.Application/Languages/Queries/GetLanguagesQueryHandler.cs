using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using YK.Application.DTOs.Language;
using YK.Application.Interfaces;
using YK.Common;
using YK.Domain;

namespace YK.Application.Languages.Queries
{
    public class GetLanguagesQueryHandler : IRequestHandler<GetLanguagesQuery, ApiResponse<IEnumerable<LanguageDto>>>
    {
        private readonly IRepository<Language> _languageRepository;
        private readonly ICurrentUserService _currentUserService;
        private readonly IMapper _mapper;

        public GetLanguagesQueryHandler(
            IRepository<Language> languageRepository,
            ICurrentUserService currentUserService,
            IMapper mapper)
        {
            _languageRepository = languageRepository;
            _currentUserService = currentUserService;
            _mapper = mapper;
        }

        public async Task<ApiResponse<IEnumerable<LanguageDto>>> Handle(GetLanguagesQuery request, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.UserIdGuid;

            // Get default languages and custom languages created by this user
            var languages = await _languageRepository.Query()
                .Where(l => l.IsDefault || (userId.HasValue && l.CreatedBy == userId.Value.ToString()))
                .OrderBy(l => l.Name)
                .ToListAsync(cancellationToken);

            var languageDtos = _mapper.Map<IEnumerable<LanguageDto>>(languages);

            return ApiResponse<IEnumerable<LanguageDto>>.SuccessResult(languageDtos);
        }
    }
}
