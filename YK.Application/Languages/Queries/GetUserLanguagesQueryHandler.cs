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
    public class GetUserLanguagesQueryHandler : IRequestHandler<GetUserLanguagesQuery, ApiResponse<IEnumerable<LanguageDto>>>
    {
        private readonly IRepository<UserLanguage> _userLanguageRepository;
        private readonly ICurrentUserService _currentUserService;
        private readonly IMapper _mapper;

        public GetUserLanguagesQueryHandler(
            IRepository<UserLanguage> userLanguageRepository,
            ICurrentUserService currentUserService,
            IMapper mapper)
        {
            _userLanguageRepository = userLanguageRepository;
            _currentUserService = currentUserService;
            _mapper = mapper;
        }

        public async Task<ApiResponse<IEnumerable<LanguageDto>>> Handle(GetUserLanguagesQuery request, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.UserIdGuid;

            if (!userId.HasValue)
            {
                return ApiResponse<IEnumerable<LanguageDto>>.FailureResult("Unauthorized");
            }

            var userLanguages = await _userLanguageRepository.Query()
                .Include(ul => ul.Language)
                .Where(ul => ul.UserId == userId.Value)
                .Select(ul => ul.Language)
                .ToListAsync(cancellationToken);

            var languageDtos = _mapper.Map<IEnumerable<LanguageDto>>(userLanguages);

            return ApiResponse<IEnumerable<LanguageDto>>.SuccessResult(languageDtos);
        }
    }
}
