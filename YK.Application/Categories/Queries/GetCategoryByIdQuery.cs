using MediatR;
using System;
using YK.Application.DTOs.Category;
using YK.Common;

namespace YK.Application.Categories.Queries
{
    public class GetCategoryByIdQuery : IRequest<ApiResponse<CategoryDto>>
    {
        public Guid Id { get; set; }
    }
}

