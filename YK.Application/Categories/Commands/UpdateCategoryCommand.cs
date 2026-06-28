using MediatR;
using System;
using YK.Application.DTOs.Category;
using YK.Common;

namespace YK.Application.Categories.Commands
{
    public class UpdateCategoryCommand : IRequest<ApiResponse<CategoryDto>>
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
}

