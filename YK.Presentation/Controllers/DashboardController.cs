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

        [HttpGet("study-time")]
        public async Task<ActionResult<ApiResponse<System.Collections.Generic.List<DailyStudyTimeDto>>>> GetStudyTime()
        {
            var response = await _mediator.Send(new GetDailyStudyTimeQuery());
            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }

        [HttpGet("word-status")]
        public async Task<ActionResult<ApiResponse<System.Collections.Generic.List<WordStatusDistributionDto>>>> GetWordStatus()
        {
            var response = await _mediator.Send(new GetWordStatusDistributionQuery());
            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }

        [HttpGet("exam-scores")]
        public async Task<ActionResult<ApiResponse<System.Collections.Generic.List<ExamScoreDto>>>> GetExamScores()
        {
            var response = await _mediator.Send(new GetExamScoreHistoryQuery());
            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }
    }
}
