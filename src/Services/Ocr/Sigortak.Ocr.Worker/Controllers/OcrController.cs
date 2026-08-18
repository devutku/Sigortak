using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Sigortak.Ocr.Worker.Services;

namespace Sigortak.Ocr.Worker.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class OcrController : ControllerBase
{
    private readonly IPolicyOcrService _ocrService;

    public OcrController(IPolicyOcrService ocrService)
    {
        _ocrService = ocrService;
    }

    [HttpPost("parse-policy")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> ParsePolicyPdf(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("Geçerli bir belge yükleyiniz.");

        var allowedExtensions = new[] { ".pdf", ".png", ".jpg", ".jpeg" };
        var extension = Path.GetExtension(file.FileName).ToLower();
        if (!allowedExtensions.Contains(extension))
            return BadRequest("Sadece PDF, PNG, JPG ve JPEG formatındaki belgeler desteklenmektedir.");

        using var stream = file.OpenReadStream();
        var result = await _ocrService.ExtractPolicyFromPdfAsync(stream);

        return Ok(result);
    }
}
