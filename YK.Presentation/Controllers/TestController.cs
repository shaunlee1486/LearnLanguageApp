using Microsoft.AspNetCore.Mvc;
using System;
using YK.Common;

namespace YK.Presentation.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class TestController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
            return Ok(ApiResponse<string>.SuccessResult("Phase 1 Backend scaffolding works perfectly!"));
        }

        [HttpGet("error")]
        public IActionResult GetError()
        {
            throw new Exception("This is a simulated test error to verify global exception handling!");
        }
    }
}
