using MediatR;
using YK.Application.DTOs.Category;
using YK.Common;

namespace YK.Application.Categories.Commands
{
    public class CreateCategoryCommand : IRequest<ApiResponse<CategoryDto>>
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
}

