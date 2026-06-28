using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using YK.Application.DTOs.Radicals;
using YK.Application.Interfaces;
using YK.Common;
using YK.Domain;

namespace YK.Application.Radicals.Queries
{
    public class GetRadicalByIdQuery : IRequest<ApiResponse<RadicalDto>>
    {
        public Guid Id { get; set; }
    }

    public class GetRadicalByIdQueryHandler : IRequestHandler<GetRadicalByIdQuery, ApiResponse<RadicalDto>>
    {
        private readonly IRepository<Radical> _radicalRepository;
        private readonly IMapper _mapper;

        public GetRadicalByIdQueryHandler(IRepository<Radical> radicalRepository, IMapper mapper)
        {
            _radicalRepository = radicalRepository;
            _mapper = mapper;
        }

        public async Task<ApiResponse<RadicalDto>> Handle(GetRadicalByIdQuery request, CancellationToken cancellationToken)
        {
            var radical = await _radicalRepository.Query()
                .Include(r => r.Examples)
                .FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken);

            if (radical == null)
                return ApiResponse<RadicalDto>.FailureResult(new List<string> { "Radical not found." });

            var dto = _mapper.Map<RadicalDto>(radical);
            return ApiResponse<RadicalDto>.SuccessResult(dto);
        }
    }
}
