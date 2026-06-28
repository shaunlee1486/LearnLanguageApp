using AutoMapper;
using MediatR;
using System.Threading;
using System.Threading.Tasks;
using YK.Application.DTOs.Language;
using YK.Application.Interfaces;
using YK.Common;
using YK.Domain;

namespace YK.Application.Languages.Commands
{
    public class CreateLanguageCommandHandler : IRequestHandler<CreateLanguageCommand, ApiResponse<LanguageDto>>
    {
        private readonly IRepository<Language> _languageRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public CreateLanguageCommandHandler(
            IRepository<Language> languageRepository,
            IUnitOfWork unitOfWork,
            IMapper mapper)
        {
            _languageRepository = languageRepository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<ApiResponse<LanguageDto>> Handle(CreateLanguageCommand request, CancellationToken cancellationToken)
        {
            var language = new Language
            {
                Name = request.Name,
                LocaleCode = request.LocaleCode,
                IsDefault = false
            };

            await _languageRepository.AddAsync(language, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var languageDto = _mapper.Map<LanguageDto>(language);

            return ApiResponse<LanguageDto>.SuccessResult(languageDto, "Language created successfully");
        }
    }
}

