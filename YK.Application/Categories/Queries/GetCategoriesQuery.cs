using MediatR;
using System.Collections.Generic;
using YK.Application.DTOs.Category;
using YK.Common;

namespace YK.Application.Categories.Queries
{
    public class GetCategoriesQuery : IRequest<ApiResponse<IEnumerable<CategoryDto>>>
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        // Optionally pass language id, if not it will use the user's active language
    }
}
