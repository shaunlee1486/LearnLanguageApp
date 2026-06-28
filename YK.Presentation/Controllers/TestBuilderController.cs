using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using System;
using System.Threading.Tasks;
using YK.Application.Tests.Queries;
using YK.Application.Tests.Commands;
using YK.Application.Users.Commands;
using YK.Application.DTOs.Tests;
using YK.Common;

namespace YK.Presentation.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/v1/tests/custom")]
    public class TestBuilderController : ControllerBase
    {
        private readonly IMediator _mediator;

        public TestBuilderController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("settings")]
        public async Task<ActionResult<ApiResponse<TestSettingsDto>>> GetSettings()
        {
            var response = await _mediator.Send(new GetTestSettingsQuery());
            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }

        [HttpGet("generate")]
        public async Task<ActionResult<ApiResponse<CustomTestSessionDto>>> GenerateTest()
        {
            var response = await _mediator.Send(new GenerateCustomTestQuery());
            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }

        [HttpPost("submit")]
        public async Task<ActionResult<ApiResponse<Guid>>> SubmitTest([FromBody] CustomTestSubmitDto payload)
        {
            var response = await _mediator.Send(new SubmitCustomTestCommand { Payload = payload });
            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }

        [HttpPut("settings")]
        public async Task<ActionResult<ApiResponse<bool>>> UpdateSettings([FromBody] UpdateTestSettingsCommand command)
        {
            var response = await _mediator.Send(command);
            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }

        [HttpGet("history")]
        public async Task<ActionResult<ApiResponse<IEnumerable<TestHistoryItemDto>>>> GetHistory([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var response = await _mediator.Send(new GetTestHistoryQuery { Page = page, PageSize = pageSize });
            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }
    }
}
