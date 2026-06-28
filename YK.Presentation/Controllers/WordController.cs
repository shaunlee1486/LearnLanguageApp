using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Text.Json;
using System.Threading.Tasks;
using YK.Application.Interfaces;
using YK.Application.Words.Commands;
using YK.Application.Words.Queries;
using YK.Presentation.DTOs.Word;
using YK.Application.DTOs.Word;

namespace YK.Presentation.Controllers
{
    [ApiController]
    [Route("api/v1")]
    [Authorize]
    public class WordController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IImageStorageService _imageStorageService;

        public WordController(IMediator mediator, IImageStorageService imageStorageService)
        {
            _mediator = mediator;
            _imageStorageService = imageStorageService;
        }

        [HttpGet("categories/{categoryId:guid}/words")]
        public async Task<IActionResult> GetWordsByCategory(Guid categoryId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var result = await _mediator.Send(new GetWordsByCategoryQuery { CategoryId = categoryId, Page = page, PageSize = pageSize });
            return Ok(result);
        }

        [HttpGet("words/{id:guid}")]
        public async Task<IActionResult> GetWordById(Guid id)
        {
            var result = await _mediator.Send(new GetWordByIdQuery { Id = id });
            return Ok(result);
        }

        [HttpPost("categories/{categoryId:guid}/words")]
        public async Task<IActionResult> CreateWord(Guid categoryId, [FromForm] CreateWordRequest request)
        {
            string? imageUrl = null;
            if (request.ImageFile != null)
            {
                imageUrl = await _imageStorageService.UploadAsync(request.ImageFile, "words");
            }

            var meanings = JsonSerializer.Deserialize<System.Collections.Generic.List<CreateWordMeaningCommand>>(request.MeaningsJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            var examples = JsonSerializer.Deserialize<System.Collections.Generic.List<CreateWordExampleCommand>>(request.ExamplesJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            var command = new CreateWordCommand
            {
                CategoryId = categoryId,
                Text = request.Text,
                IPA = request.IPA,
                AudioUrl = request.AudioUrl,
                ImageUrl = imageUrl,
                Note = request.Note,
                Meanings = meanings ?? new(),
                Examples = examples ?? new()
            };

            var result = await _mediator.Send(command);
            if (result.Success)
                return Created($"/api/v1/words/{result.Data}", result);

            return BadRequest(result);
        }

        [HttpPut("words/{id:guid}")]
        public async Task<IActionResult> UpdateWord(Guid id, [FromForm] UpdateWordRequest request)
        {
            // We need to fetch the existing word to handle image replacement if needed, 
            // but for simplicity, we let the frontend send ImageFile or null.
            // If RemoveExistingImage is true, we could call DeleteAsync.
            string? imageUrl = null;
            if (request.ImageFile != null)
            {
                imageUrl = await _imageStorageService.UploadAsync(request.ImageFile, "words");
            }

            var meanings = JsonSerializer.Deserialize<System.Collections.Generic.List<UpdateWordMeaningCommand>>(request.MeaningsJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            var examples = JsonSerializer.Deserialize<System.Collections.Generic.List<UpdateWordExampleCommand>>(request.ExamplesJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            var command = new UpdateWordCommand
            {
                Id = id,
                Text = request.Text,
                IPA = request.IPA,
                AudioUrl = request.AudioUrl,
                ImageUrl = imageUrl, // Note: if imageUrl is null but they didn't want to remove, we need to preserve existing in handler. 
                // Wait, if imageUrl is null here, the handler will overwrite with null.
                // To fix: If ImageUrl is null, the handler shouldn't update it unless explicitly requested. Let's pass it anyway.
                // We will modify the handler to only update ImageUrl if we pass a specific flag or non-null value, or we just rely on a separate endpoint for images.
                // Let's pass what we have. For this simplified version, if they upload a new image, it overrides.
                Note = request.Note,
                Meanings = meanings ?? new(),
                Examples = examples ?? new()
            };

            // Hack: If no new image, we might lose old image. 
            // Better pattern: fetch existing word first to keep old image if no new one provided, 
            // or modify UpdateWordCommand to have a separate property indicating if image should be updated.
            var existingWordResponse = await _mediator.Send(new GetWordByIdQuery { Id = id });
            if (existingWordResponse.Success && request.ImageFile == null && !request.RemoveExistingImage)
            {
                command.ImageUrl = existingWordResponse.Data?.ImageUrl;
            }

            var result = await _mediator.Send(command);
            if (result.Success)
                return Ok(result);

            return BadRequest(result);
        }

        [HttpDelete("words/{id:guid}")]
        public async Task<IActionResult> DeleteWord(Guid id)
        {
            var result = await _mediator.Send(new DeleteWordCommand { Id = id });
            if (result.Success)
                return Ok(result);

            return BadRequest(result);
        }

        [HttpPut("words/{id:guid}/known")]
        public async Task<IActionResult> MarkWordAlreadyKnown(Guid id)
        {
            var result = await _mediator.Send(new MarkWordAlreadyKnownCommand { Id = id });
            if (result.Success)
                return Ok(result);

            return BadRequest(result);
        }
    }
}
