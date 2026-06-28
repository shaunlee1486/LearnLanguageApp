using AutoMapper;
using YK.Application.Categories.Commands;
using YK.Application.DTOs.Category;
using YK.Domain;
using YK.Presentation.DTOs.Category;

namespace YK.Presentation.MappingProfiles
{
    public class CategoryMappingProfile : Profile
    {
        public CategoryMappingProfile()
        {
            CreateMap<Category, CategoryDto>();
            CreateMap<CreateCategoryRequest, CreateCategoryCommand>();
            CreateMap<UpdateCategoryRequest, UpdateCategoryCommand>();
        }
    }
}
