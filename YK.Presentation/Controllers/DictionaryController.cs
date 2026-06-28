using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using YK.Application.Interfaces;
using YK.Common;

namespace YK.Presentation.Controllers
{
    [ApiController]
    [Route("api/v1/dictionary")]
    [Authorize]
    public class DictionaryController : ControllerBase
    {
        private readonly IDictionaryService _dictionaryService;

        public DictionaryController(IDictionaryService dictionaryService)
        {
            _dictionaryService = dictionaryService;
        }

        [HttpGet("lookup")]
        public async Task<IActionResult> Lookup([FromQuery] string word, [FromQuery] string lang = "en")
        {
            if (string.IsNullOrWhiteSpace(word))
                return BadRequest(ApiResponse<object>.FailureResult(new System.Collections.Generic.List<string> { "Word is required" }));

            var result = await _dictionaryService.LookupAsync(word, lang);
            
            if (result == null)
                return NotFound(ApiResponse<object>.FailureResult(new System.Collections.Generic.List<string> { "Dictionary entry not found" }));

            return Ok(ApiResponse<DictionaryResultDto>.SuccessResult(result));
        }
    }
}
