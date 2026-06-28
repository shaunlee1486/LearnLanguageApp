using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using System;
using System.Threading.Tasks;
using YK.Application.ReviewSessions.Commands;
using YK.Application.ReviewSessions.Queries;
using YK.Application.DTOs.Review;
using YK.Common;

namespace YK.Presentation.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/v1/review")]
    public class ReviewController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ReviewController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("start")]
        public async Task<ActionResult<ApiResponse<ReviewSessionDto>>> StartSession([FromBody] StartReviewSessionCommand command)
        {
            var response = await _mediator.Send(command);
            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }

        [HttpGet("session/{id}")]
        public async Task<ActionResult<ApiResponse<ReviewSessionDto>>> GetSession(Guid id)
        {
            var response = await _mediator.Send(new GetReviewSessionQuery { SessionId = id });
            if (!response.Success)
                return NotFound(response);

            return Ok(response);
        }

        [HttpPost("session/{id}/submit")]
        public async Task<ActionResult<ApiResponse<ReviewSummaryDto>>> SubmitSession(Guid id, [FromBody] SubmitReviewResultCommand command)
        {
            command.SessionId = id;
            var response = await _mediator.Send(command);
            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }

        [HttpGet("options/{wordId}")]
        public async Task<ActionResult<ApiResponse<System.Collections.Generic.List<string>>>> GetQuizOptions(Guid wordId, [FromQuery] int count = 3)
        {
            var response = await _mediator.Send(new GenerateQuizOptionsQuery { WordId = wordId, Count = count });
            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }
    }
}
