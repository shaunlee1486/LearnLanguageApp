using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Identity;
using System.Threading;
using System.Threading.Tasks;
using YK.Application.DTOs.Category;
using YK.Application.Interfaces;
using YK.Common;
using YK.Domain;

namespace YK.Application.Categories.Commands
{
    public class CreateCategoryCommandHandler : IRequestHandler<CreateCategoryCommand, ApiResponse<CategoryDto>>
    {
        private readonly IRepository<Category> _categoryRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly UserManager<User> _userManager;
        private readonly ICurrentUserService _currentUserService;
        private readonly IMapper _mapper;

        public CreateCategoryCommandHandler(
            IRepository<Category> categoryRepository,
            IUnitOfWork unitOfWork,
            UserManager<User> userManager,
            ICurrentUserService currentUserService,
            IMapper mapper)
        {
            _categoryRepository = categoryRepository;
            _unitOfWork = unitOfWork;
            _userManager = userManager;
            _currentUserService = currentUserService;
            _mapper = mapper;
        }

        public async Task<ApiResponse<CategoryDto>> Handle(CreateCategoryCommand request, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.UserId;
            if (userId == null) return ApiResponse<CategoryDto>.FailureResult("Unauthorized");

            var user = await _userManager.FindByIdAsync(userId);
            if (user?.ActiveLanguageId == null)
            {
                return ApiResponse<CategoryDto>.FailureResult("No active language selected. Please select a language first.");
            }

            var category = new Category
            {
                Name = request.Name,
                Description = request.Description,
                LanguageId = user.ActiveLanguageId.Value
            };

            await _categoryRepository.AddAsync(category, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var categoryDto = _mapper.Map<CategoryDto>(category);

            return ApiResponse<CategoryDto>.SuccessResult(categoryDto, "Category created successfully");
        }
    }
}
