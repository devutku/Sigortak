using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Sigortak.Ocr.Worker.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class TestOcrController : ControllerBase
{
    private readonly OcrParser _ocrParser;

    public TestOcrController(OcrParser ocrParser)
    {
        _ocrParser = ocrParser;
    }

    [HttpPost("parse")]
    public IActionResult ParseFile(IFormFile file)
    {
        if (file == null || file.Length == 0) return BadRequest("File is empty");
        using var stream = file.OpenReadStream();
        var result = _ocrParser.ParseDocument(stream);
        return Ok(result);
    }
}
