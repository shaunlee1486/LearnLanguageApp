using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using YK.Application.DTOs.Category;
using YK.Application.Interfaces;
using YK.Common;
using YK.Domain;

namespace YK.Application.Categories.Queries
{
    public class GetCategoriesQueryHandler : IRequestHandler<GetCategoriesQuery, ApiResponse<IEnumerable<CategoryDto>>>
    {
        private readonly IRepository<Category> _categoryRepository;
        private readonly UserManager<User> _userManager;
        private readonly ICurrentUserService _currentUserService;
        private readonly IMapper _mapper;

        public GetCategoriesQueryHandler(
            IRepository<Category> categoryRepository,
            UserManager<User> userManager,
            ICurrentUserService currentUserService,
            IMapper mapper)
        {
            _categoryRepository = categoryRepository;
            _userManager = userManager;
            _currentUserService = currentUserService;
            _mapper = mapper;
        }

        public async Task<ApiResponse<IEnumerable<CategoryDto>>> Handle(GetCategoriesQuery request, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.UserId;
            if (userId == null) return ApiResponse<IEnumerable<CategoryDto>>.FailureResult("Unauthorized");

            var user = await _userManager.FindByIdAsync(userId);
            if (user?.ActiveLanguageId == null)
                return ApiResponse<IEnumerable<CategoryDto>>.FailureResult("No active language selected");

            var query = _categoryRepository.Query()
                .Where(c => c.LanguageId == user.ActiveLanguageId && !c.IsDeleted)
                .OrderByDescending(c => c.CreatedDate);

            var totalItems = await query.CountAsync(cancellationToken);
            var categories = await query
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync(cancellationToken);

            var categoryDtos = _mapper.Map<IEnumerable<CategoryDto>>(categories);

            var paginationMeta = new PaginationMeta(request.Page, request.PageSize, totalItems);

            return ApiResponse<IEnumerable<CategoryDto>>.SuccessResult(categoryDtos, paginationMeta);
        }
    }
}
