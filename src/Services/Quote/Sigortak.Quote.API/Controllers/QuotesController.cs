using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Sigortak.Common.Models;
using Sigortak.Quote.Application.Commands.SubmitQuote;
using Sigortak.Quote.Application.Commands.ApproveQuote;
using Sigortak.Quote.Application.Commands.RejectQuote;
using Sigortak.Quote.Application.Queries.GetQuotes;
using Sigortak.Quote.Application.Interfaces;
using Sigortak.Quote.Domain.Enums;

namespace Sigortak.Quote.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class QuotesController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IQuoteStorageService _storageService;

    public QuotesController(IMediator mediator, IQuoteStorageService storageService)
    {
        _mediator = mediator;
        _storageService = storageService;
    }

    /// <summary>
    /// Tüm teklifleri listeler.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var result = await _mediator.Send(new GetQuotesQuery());
        return Ok(result);
    }

    /// <summary>
    /// Yeni sigorta teklifi gönderir.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SubmitQuote(
        [FromForm] Guid vehicleId,
        [FromForm] string vehiclePlate,
        [FromForm] string vehicleInfo,
        [FromForm] string insuranceCompany,
        [FromForm] string agentName,
        [FromForm] PolicyType policyType,
        [FromForm] decimal premium,
        [FromForm] DateTime validityDate,
        [FromForm] string immLimit,
        [FromForm] string replacementCarDuration,
        [FromForm] string exemptStatus,
        [FromForm] bool glassCovered,
        [FromForm] string asstServices,
        IFormFile? file)
    {
        var command = new SubmitQuoteCommand
        {
            VehicleId = vehicleId,
            VehiclePlate = vehiclePlate,
            VehicleInfo = vehicleInfo,
            InsuranceCompany = insuranceCompany,
            AgentName = agentName,
            PolicyType = policyType,
            Premium = premium,
            ValidityDate = validityDate,
            ImmLimit = immLimit,
            ReplacementCarDuration = replacementCarDuration,
            ExemptStatus = exemptStatus,
            GlassCovered = glassCovered,
            AsstServices = asstServices
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
    /// Teklifi onaylar ve poliçeleştirilmesini tetikler.
    /// </summary>
    [HttpPost("{id}/approve")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Approve(Guid id)
    {
        var result = await _mediator.Send(new ApproveQuoteCommand(id));
        if (!result.IsSuccess)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    /// <summary>
    /// Teklifi reddeder.
    /// </summary>
    [HttpPost("{id}/reject")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Reject(Guid id)
    {
        var result = await _mediator.Send(new RejectQuoteCommand(id));
        if (!result.IsSuccess)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    /// <summary>
    /// MinIO üzerindeki teklif belgesini indirir/okur.
    /// </summary>
    [HttpGet("document/{fileName}")]
    public async Task<IActionResult> GetDocument(string fileName)
    {
        try
        {
            var (stream, contentType) = await _storageService.DownloadQuoteDocumentAsync(fileName);
            return File(stream, contentType, fileName);
        }
        catch (Exception)
        {
            return NotFound("Teklif belgesi bulunamadı.");
        }
    }
}
