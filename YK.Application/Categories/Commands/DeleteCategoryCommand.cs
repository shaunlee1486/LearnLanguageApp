using MediatR;
using System;
using YK.Common;

namespace YK.Application.Categories.Commands
{
    public class DeleteCategoryCommand : IRequest<ApiResponse<bool>>
    {
        public Guid Id { get; set; }
    }
}

