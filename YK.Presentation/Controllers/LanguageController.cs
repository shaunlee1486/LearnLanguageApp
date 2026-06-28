using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using YK.Application.DTOs.Language;
using YK.Application.Languages.Commands;
using YK.Application.Languages.Queries;
using YK.Common;
using YK.Presentation.DTOs.Language;

namespace YK.Presentation.Controllers
{
    [ApiController]
    [Route("api/v1/languages")]
    [Authorize] // All language endpoints require authentication
    public class LanguageController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IMapper _mapper;

        public LanguageController(IMediator mediator, IMapper mapper)
        {
            _mediator = mediator;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<LanguageDto>>>> GetLanguages()
        {
            var result = await _mediator.Send(new GetLanguagesQuery());
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse<LanguageDto>>> CreateLanguage([FromBody] CreateLanguageRequest request)
        {
            var command = _mapper.Map<CreateLanguageCommand>(request);
            var result = await _mediator.Send(command);
            
            if (result.Success)
            {
                return Ok(result);
            }
            
            return BadRequest(result);
        }

        [HttpPut("active")]
        public async Task<ActionResult<ApiResponse<bool>>> SetActiveLanguage([FromBody] SetActiveLanguageRequest request)
        {
            var command = _mapper.Map<SetActiveLanguageCommand>(request);
            var result = await _mediator.Send(command);
            
            if (result.Success)
            {
                return Ok(result);
            }
            
            return BadRequest(result);
        }

        [HttpGet("mine")]
        public async Task<ActionResult<ApiResponse<IEnumerable<LanguageDto>>>> GetUserLanguages()
        {
            var result = await _mediator.Send(new GetUserLanguagesQuery());
            return Ok(result);
        }

        [HttpPost("mine")]
        public async Task<ActionResult<ApiResponse<bool>>> AddUserLanguage([FromBody] AddUserLanguageRequest request)
        {
            var command = _mapper.Map<AddUserLanguageCommand>(request);
            var result = await _mediator.Send(command);
            
            if (result.Success)
            {
                return Ok(result);
            }
            
            return BadRequest(result);
        }
    }
}
