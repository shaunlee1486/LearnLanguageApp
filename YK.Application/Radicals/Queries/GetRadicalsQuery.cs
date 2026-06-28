using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using YK.Application.DTOs.Radicals;
using YK.Application.Interfaces;
using YK.Common;
using YK.Domain;

namespace YK.Application.Radicals.Queries
{
    public class GetRadicalsQuery : IRequest<ApiResponse<IEnumerable<RadicalGroupDto>>>
    {
    }

    public class GetRadicalsQueryHandler : IRequestHandler<GetRadicalsQuery, ApiResponse<IEnumerable<RadicalGroupDto>>>
    {
        private readonly IRepository<Radical> _radicalRepository;
        private readonly IMapper _mapper;

        public GetRadicalsQueryHandler(IRepository<Radical> radicalRepository, IMapper mapper)
        {
            _radicalRepository = radicalRepository;
            _mapper = mapper;
        }

        public async Task<ApiResponse<IEnumerable<RadicalGroupDto>>> Handle(GetRadicalsQuery request, CancellationToken cancellationToken)
        {
            var radicals = await _radicalRepository.Query()
                .OrderBy(r => r.StrokeCount)
                .ThenBy(r => r.Character)
                .ToListAsync(cancellationToken);

            var dtos = _mapper.Map<IEnumerable<RadicalDto>>(radicals);

            var grouped = dtos.GroupBy(r => r.StrokeCount)
                .Select(g => new RadicalGroupDto
                {
                    StrokeCount = g.Key,
                    Radicals = g.ToList()
                })
                .OrderBy(g => g.StrokeCount)
                .ToList();

            return ApiResponse<IEnumerable<RadicalGroupDto>>.SuccessResult(grouped);
        }
    }
}
