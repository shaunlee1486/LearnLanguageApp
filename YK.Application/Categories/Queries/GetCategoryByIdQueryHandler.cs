using AutoMapper;
using MediatR;
using System.Threading;
using System.Threading.Tasks;
using YK.Application.DTOs.Category;
using YK.Application.Interfaces;
using YK.Common;
using YK.Domain;

namespace YK.Application.Categories.Queries
{
    public class GetCategoryByIdQueryHandler : IRequestHandler<GetCategoryByIdQuery, ApiResponse<CategoryDto>>
    {
        private readonly IRepository<Category> _categoryRepository;
        private readonly IMapper _mapper;

        public GetCategoryByIdQueryHandler(IRepository<Category> categoryRepository, IMapper mapper)
        {
            _categoryRepository = categoryRepository;
            _mapper = mapper;
        }

        public async Task<ApiResponse<CategoryDto>> Handle(GetCategoryByIdQuery request, CancellationToken cancellationToken)
        {
            var category = await _categoryRepository.GetByIdAsync(request.Id, cancellationToken);
            
            if (category == null || category.IsDeleted)
            {
                return ApiResponse<CategoryDto>.FailureResult("Category not found");
            }

            var categoryDto = _mapper.Map<CategoryDto>(category);
            return ApiResponse<CategoryDto>.SuccessResult(categoryDto);
        }
    }
}

