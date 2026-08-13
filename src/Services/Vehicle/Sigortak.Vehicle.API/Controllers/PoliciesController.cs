using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Sigortak.Common.Models;
using Sigortak.Vehicle.Application.Commands.CreatePolicy;
using Sigortak.Vehicle.Application.Commands.RenewPolicy;
using Sigortak.Vehicle.Application.Interfaces;

namespace Sigortak.Vehicle.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class PoliciesController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IPolicyStorageService _storageService;

    public PoliciesController(IMediator mediator, IPolicyStorageService storageService)
    {
        _mediator = mediator;
        _storageService = storageService;
    }

    /// <summary>
    /// Yeni bir poliçe oluşturur (PDF yüklemeli).
    /// </summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromForm] string policyNumber, [FromForm] Guid vehicleId, [FromForm] DateTime startDate, [FromForm] DateTime endDate, [FromForm] decimal premium, IFormFile? file)
    {
        var command = new CreatePolicyCommand
        {
            PolicyNumber = policyNumber,
            VehicleId = vehicleId,
            StartDate = startDate,
            EndDate = endDate,
            Premium = premium
        };

        if (file != null)
        {
            command.FileStream = file.OpenReadStream();
            command.FileName = file.FileName;
            command.ContentType = file.ContentType;
        }

        var result = await _mediator.Send(command);
        if (!result.IsSuccess)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Poliçeyi yeniler (eski poliçeyi pasife çeker, yeni PDF ve tarihlerle yenisini oluşturur).
    /// </summary>
    [HttpPost("renew")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Renew([FromForm] Guid vehicleId, [FromForm] string policyNumber, [FromForm] DateTime startDate, [FromForm] DateTime endDate, [FromForm] decimal premium, IFormFile? file)
    {
        var command = new RenewPolicyCommand
        {
            VehicleId = vehicleId,
            PolicyNumber = policyNumber,
            StartDate = startDate,
            EndDate = endDate,
            Premium = premium
        };

        if (file != null)
        {
            command.FileStream = file.OpenReadStream();
            command.FileName = file.FileName;
            command.ContentType = file.ContentType;
        }

        var result = await _mediator.Send(command);
        if (!result.IsSuccess)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// MinIO üzerindeki poliçe PDF belgesini indirir/okur.
    /// </summary>
    [HttpGet("document/{fileName}")]
    public async Task<IActionResult> GetDocument(string fileName)
    {
        try
        {
            var (stream, contentType) = await _storageService.DownloadPolicyDocumentAsync(fileName);
            return File(stream, contentType, fileName);
        }
        catch (Exception)
        {
            return NotFound("Poliçe belgesi bulunamadı.");
        }
    }

    /// <summary>
    /// Poliçe süre sonu kontrollerini manuel olarak tetikler (Test amaçlı).
    /// </summary>
    [HttpPost("trigger-expiration-check")]
    public async Task<IActionResult> TriggerExpirationCheck([FromServices] Sigortak.Vehicle.Infrastructure.BackgroundServices.PolicyExpirationWorker worker)
    {
        await worker.CheckExpiringPoliciesAsync(HttpContext.RequestAborted);
        return Ok(new { Message = "Poliçe süre sonu kontrolleri tetiklendi. Logları kontrol edin." });
    }
}
