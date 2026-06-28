using AutoMapper;
using YK.Application.DTOs.Language;
using YK.Application.Languages.Commands;
using YK.Domain;
using YK.Presentation.DTOs.Language;

namespace YK.Presentation.MappingProfiles
{
    public class LanguageMappingProfile : Profile
    {
        public LanguageMappingProfile()
        {
            CreateMap<Language, LanguageDto>();
            CreateMap<CreateLanguageRequest, CreateLanguageCommand>();
            CreateMap<SetActiveLanguageRequest, SetActiveLanguageCommand>();
            CreateMap<AddUserLanguageRequest, AddUserLanguageCommand>();
        }
    }
}
