using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sigortak.Common.Models;
using Sigortak.Policy.Application.Commands.CreatePolicy;
using Sigortak.Policy.Application.Commands.RenewPolicy;
using Sigortak.Policy.Application.Interfaces;
using Sigortak.Policy.Domain.Enums;

namespace Sigortak.Policy.API.Controllers;

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
    public async Task<IActionResult> Create(
        [FromForm] string policyNumber, 
        [FromForm] string? sbmPolicyNumber, 
        [FromForm] Guid vehicleId, 
        [FromForm] DateTime startDate, 
        [FromForm] DateTime endDate, 
        [FromForm] decimal premium, 
        [FromForm] PolicyType policyType, 
        [FromForm] string? documentUrl,
        [FromForm] string? companyName,
        [FromForm] string? renewalNumber,
        [FromForm] string? agencyCode,
        [FromForm] decimal? netPremium,
        [FromForm] decimal? commission,
        [FromForm] decimal? vehicleValue,
        [FromForm] string? immLimit,
        [FromForm] decimal? personalAccidentCoverage,
        [FromForm] decimal? legalProtection,
        [FromForm] int? noClaimDiscountRate,
        [FromForm] int? noClaimStep,
        [FromForm] string? tramerDocumentNo,
        [FromForm] DateTime? tramerDocumentDate,
        [FromForm] List<string>? discounts,
        [FromForm] List<string>? extraCoverages,
        IFormFile? file)
    {
        var command = new CreatePolicyCommand
        {
            PolicyNumber = policyNumber,
            SbmPolicyNumber = sbmPolicyNumber ?? string.Empty,
            VehicleId = vehicleId,
            StartDate = startDate,
            EndDate = endDate,
            Premium = premium,
            PolicyType = policyType,
            DocumentUrl = documentUrl ?? string.Empty,
            
            // Extended mapping
            CompanyName = companyName ?? string.Empty,
            RenewalNumber = renewalNumber ?? "0",
            AgencyCode = agencyCode ?? string.Empty,
            NetPremium = netPremium ?? 0,
            Commission = commission ?? 0,
            VehicleValue = vehicleValue,
            ImmLimit = immLimit ?? string.Empty,
            PersonalAccidentCoverage = personalAccidentCoverage,
            LegalProtection = legalProtection,
            NoClaimDiscountRate = noClaimDiscountRate,
            NoClaimStep = noClaimStep,
            TramerDocumentNo = tramerDocumentNo ?? string.Empty,
            TramerDocumentDate = tramerDocumentDate,
            Discounts = discounts ?? new(),
            ExtraCoverages = extraCoverages ?? new()
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
    public async Task<IActionResult> Renew(
        [FromForm] Guid vehicleId, 
        [FromForm] string policyNumber, 
        [FromForm] string? sbmPolicyNumber, 
        [FromForm] DateTime startDate, 
        [FromForm] DateTime endDate, 
        [FromForm] decimal premium, 
        [FromForm] PolicyType policyType, 
        [FromForm] string? companyName,
        [FromForm] string? renewalNumber,
        [FromForm] string? agencyCode,
        [FromForm] decimal? netPremium,
        [FromForm] decimal? commission,
        [FromForm] decimal? vehicleValue,
        [FromForm] string? immLimit,
        [FromForm] decimal? personalAccidentCoverage,
        [FromForm] decimal? legalProtection,
        [FromForm] int? noClaimDiscountRate,
        [FromForm] int? noClaimStep,
        [FromForm] string? tramerDocumentNo,
        [FromForm] DateTime? tramerDocumentDate,
        [FromForm] List<string>? discounts,
        [FromForm] List<string>? extraCoverages,
        IFormFile? file)
    {
        var command = new RenewPolicyCommand
        {
            VehicleId = vehicleId,
            PolicyNumber = policyNumber,
            SbmPolicyNumber = sbmPolicyNumber ?? string.Empty,
            StartDate = startDate,
            EndDate = endDate,
            Premium = premium,
            PolicyType = policyType,

            // Extended mapping
            CompanyName = companyName ?? string.Empty,
            RenewalNumber = renewalNumber ?? "0",
            AgencyCode = agencyCode ?? string.Empty,
            NetPremium = netPremium ?? 0,
            Commission = commission ?? 0,
            VehicleValue = vehicleValue,
            ImmLimit = immLimit ?? string.Empty,
            PersonalAccidentCoverage = personalAccidentCoverage,
            LegalProtection = legalProtection,
            NoClaimDiscountRate = noClaimDiscountRate,
            NoClaimStep = noClaimStep,
            TramerDocumentNo = tramerDocumentNo ?? string.Empty,
            TramerDocumentDate = tramerDocumentDate,
            Discounts = discounts ?? new(),
            ExtraCoverages = extraCoverages ?? new()
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
    public async Task<IActionResult> TriggerExpirationCheck([FromServices] Sigortak.Policy.Infrastructure.BackgroundServices.PolicyExpirationWorker worker)
    {
        await worker.CheckExpiringPoliciesAsync(HttpContext.RequestAborted);
        return Ok(new { Message = "Poliçe süre sonu kontrolleri tetiklendi. Logları kontrol edin." });
    }

    /// <summary>
    /// Bir poliçeyi ödendi olarak işaretler.
    /// </summary>
    [HttpPatch("{policyId}/mark-paid")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> MarkAsPaid(Guid policyId, [FromBody] MarkPaidRequest? request)
    {
        var dbContext = HttpContext.RequestServices.GetRequiredService<Sigortak.Policy.Infrastructure.Persistence.PolicyDbContext>();
        var policy = await dbContext.Policies.IgnoreQueryFilters().FirstOrDefaultAsync(p => p.Id == policyId);
        if (policy == null) return NotFound("Poliçe bulunamadı.");

        policy.IsPaid = true;
        policy.PaymentDate = DateTime.UtcNow;
        policy.PaymentNote = request?.Note ?? "Ödeme onaylandı";
        await dbContext.SaveChangesAsync();

        return Ok(new { Message = "Poliçe ödendi olarak işaretlendi.", PolicyId = policyId });
    }

    /// <summary>
    /// Tüm aktif poliçeleri döner (faturalandırma ve hatırlatıcılar için).
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var dbContext = HttpContext.RequestServices.GetRequiredService<Sigortak.Policy.Infrastructure.Persistence.PolicyDbContext>();
        var policies = await dbContext.Policies.IgnoreQueryFilters().OrderByDescending(p => p.CreatedAt).ToListAsync();

        var result = policies.Select(p => new
        {
            p.Id,
            p.PolicyNumber,
            p.SbmPolicyNumber,
            p.VehicleId,
            p.StartDate,
            p.EndDate,
            p.Premium,
            p.NetPremium,
            p.Commission,
            p.CompanyName,
            p.AgencyCode,
            p.RenewalNumber,
            p.IsActive,
            p.IsPaid,
            p.PaymentDate,
            p.PaymentNote,
            p.PolicyType,
            p.DocumentUrl,
            p.VehicleValue,
            p.ImmLimit,
            p.PersonalAccidentCoverage,
            p.LegalProtection,
            p.NoClaimDiscountRate,
            p.NoClaimStep,
            p.TramerDocumentNo,
            p.TramerDocumentDate,
            p.Discounts,
            p.ExtraCoverages,
            p.CreatedAt
        });

        return Ok(result);
    }
}

public class MarkPaidRequest
{
    public string? Note { get; set; }
}
