using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using System.Threading.Tasks;
using YK.Application.Dashboard.Queries;
using YK.Application.DTOs.Dashboard;
using YK.Common;

namespace YK.Presentation.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/v1/dashboard")]
    public class DashboardController : ControllerBase
    {
        private readonly IMediator _mediator;

        public DashboardController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("stats")]
        public async Task<ActionResult<ApiResponse<DashboardStatsDto>>> GetStats()
        {
            var response = await _mediator.Send(new GetDashboardStatsQuery());
            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }
    }
}
