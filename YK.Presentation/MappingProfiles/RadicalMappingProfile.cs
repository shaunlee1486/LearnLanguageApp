using AutoMapper;
using YK.Application.DTOs.Radicals;
using YK.Domain;

namespace YK.Presentation.MappingProfiles
{
    public class RadicalMappingProfile : Profile
    {
        public RadicalMappingProfile()
        {
            CreateMap<Radical, RadicalDto>();
            CreateMap<RadicalExample, RadicalExampleDto>();
        }
    }
}
