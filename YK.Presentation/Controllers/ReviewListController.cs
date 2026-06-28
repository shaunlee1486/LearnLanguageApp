using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using YK.Application.ReviewLists.Commands;
using YK.Application.ReviewLists.Queries;

namespace YK.Presentation.Controllers
{
    [ApiController]
    [Route("api/v1/review-list")]
    [Authorize]
    public class ReviewListController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ReviewListController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("{languageId:guid}")]
        public async Task<IActionResult> GetReviewList(Guid languageId)
        {
            var result = await _mediator.Send(new GetReviewListQuery { LanguageId = languageId });
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> AddWordsToReviewList([FromBody] AddWordsToReviewListCommand command)
        {
            var result = await _mediator.Send(command);
            if (result.Success)
                return Ok(result);

            return BadRequest(result);
        }

        [HttpDelete("{languageId:guid}/words/{wordId:guid}")]
        public async Task<IActionResult> RemoveWordFromReviewList(Guid languageId, Guid wordId)
        {
            var result = await _mediator.Send(new RemoveWordFromReviewListCommand { LanguageId = languageId, WordId = wordId });
            if (result.Success)
                return Ok(result);

            return BadRequest(result);
        }
    }
}
