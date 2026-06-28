using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using YK.Application.DTOs.Radicals;
using YK.Application.Radicals.Commands;
using YK.Application.Radicals.Queries;
using YK.Common;

namespace YK.Presentation.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/v1/[controller]")]
    public class RadicalsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public RadicalsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<RadicalGroupDto>>>> GetRadicals()
        {
            var response = await _mediator.Send(new GetRadicalsQuery());
            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<ApiResponse<RadicalDto>>> GetRadicalById(Guid id)
        {
            var response = await _mediator.Send(new GetRadicalByIdQuery { Id = id });
            if (!response.Success)
                return NotFound(response);

            return Ok(response);
        }

        [HttpGet("quiz/generate")]
        public async Task<ActionResult<ApiResponse<List<RadicalQuizQuestionDto>>>> GenerateQuiz([FromQuery] int count = 10)
        {
            var response = await _mediator.Send(new GenerateRadicalQuizQuery { QuestionCount = count });
            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }

        [HttpPost("quiz/submit")]
        public async Task<ActionResult<ApiResponse<bool>>> SubmitQuiz([FromBody] SubmitRadicalQuizCommand command)
        {
            var response = await _mediator.Send(command);
            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }
    }
}
