using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using System;
using System.Threading.Tasks;
using YK.Application.SentenceStructures.Commands;
using YK.Application.SentenceStructures.Queries;
using YK.Application.DTOs.SentenceStructure;
using YK.Common;
using System.Collections.Generic;

namespace YK.Presentation.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/v1/sentence-structure")]
    public class SentenceStructureController : ControllerBase
    {
        private readonly IMediator _mediator;

        public SentenceStructureController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<List<SentenceStructureDto>>>> GetStructures()
        {
            var response = await _mediator.Send(new GetSentenceStructuresQuery());
            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse<Guid>>> CreateStructure([FromBody] CreateSentenceStructureRequest request)
        {
            var response = await _mediator.Send(new CreateSentenceStructureCommand { Data = request });
            if (!response.Success)
                return BadRequest(response);

            return CreatedAtAction(nameof(GetStructures), new { id = response.Data }, response);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> UpdateStructure(Guid id, [FromBody] UpdateSentenceStructureRequest request)
        {
            var response = await _mediator.Send(new UpdateSentenceStructureCommand { Id = id, Data = request });
            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteStructure(Guid id)
        {
            var response = await _mediator.Send(new DeleteSentenceStructureCommand { Id = id });
            if (!response.Success)
                return NotFound(response);

            return Ok(response);
        }

        [HttpGet("test/generate")]
        public async Task<ActionResult<ApiResponse<List<StructureTestQuestionDto>>>> GenerateTest([FromQuery] int count = 10)
        {
            var response = await _mediator.Send(new GenerateStructureTestQuery { Count = count });
            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }

        [HttpPost("test/submit")]
        public async Task<ActionResult<ApiResponse<Guid>>> SubmitTest([FromBody] SubmitStructureTestCommand command)
        {
            var response = await _mediator.Send(command);
            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }
    }
}
