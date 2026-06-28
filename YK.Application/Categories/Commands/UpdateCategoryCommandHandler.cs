using AutoMapper;
using MediatR;
using System.Threading;
using System.Threading.Tasks;
using YK.Application.DTOs.Category;
using YK.Application.Interfaces;
using YK.Common;
using YK.Domain;

namespace YK.Application.Categories.Commands
{
    public class UpdateCategoryCommandHandler : IRequestHandler<UpdateCategoryCommand, ApiResponse<CategoryDto>>
    {
        private readonly IRepository<Category> _categoryRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public UpdateCategoryCommandHandler(
            IRepository<Category> categoryRepository,
            IUnitOfWork unitOfWork,
            IMapper mapper)
        {
            _categoryRepository = categoryRepository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<ApiResponse<CategoryDto>> Handle(UpdateCategoryCommand request, CancellationToken cancellationToken)
        {
            var category = await _categoryRepository.GetByIdAsync(request.Id, cancellationToken);
            
            if (category == null || category.IsDeleted)
            {
                return ApiResponse<CategoryDto>.FailureResult("Category not found");
            }

            category.Name = request.Name;
            category.Description = request.Description;

            _categoryRepository.Update(category);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var categoryDto = _mapper.Map<CategoryDto>(category);

            return ApiResponse<CategoryDto>.SuccessResult(categoryDto, "Category updated successfully");
        }
    }
}
