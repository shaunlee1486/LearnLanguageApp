using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using System;
using System.Threading.Tasks;
using YK.Application.GrammarRules.Commands;
using YK.Application.GrammarRules.Queries;
using YK.Application.DTOs.Grammar;
using YK.Common;
using System.Collections.Generic;

namespace YK.Presentation.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/v1/grammar")]
    public class GrammarController : ControllerBase
    {
        private readonly IMediator _mediator;

        public GrammarController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<List<GrammarRuleDto>>>> GetRules()
        {
            var response = await _mediator.Send(new GetGrammarRulesQuery());
            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse<Guid>>> CreateRule([FromBody] CreateGrammarRuleRequest request)
        {
            var response = await _mediator.Send(new CreateGrammarRuleCommand { Data = request });
            if (!response.Success)
                return BadRequest(response);

            return CreatedAtAction(nameof(GetRules), new { id = response.Data }, response);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> UpdateRule(Guid id, [FromBody] UpdateGrammarRuleRequest request)
        {
            var response = await _mediator.Send(new UpdateGrammarRuleCommand { Id = id, Data = request });
            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteRule(Guid id)
        {
            var response = await _mediator.Send(new DeleteGrammarRuleCommand { Id = id });
            if (!response.Success)
                return NotFound(response);

            return Ok(response);
        }

        [HttpGet("test/generate")]
        public async Task<ActionResult<ApiResponse<List<GrammarTestQuestionDto>>>> GenerateTest([FromQuery] int count = 10)
        {
            var response = await _mediator.Send(new GenerateGrammarTestQuery { Count = count });
            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }

        [HttpPost("test/submit")]
        public async Task<ActionResult<ApiResponse<Guid>>> SubmitTest([FromBody] SubmitGrammarTestCommand command)
        {
            var response = await _mediator.Send(command);
            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }
    }
}
