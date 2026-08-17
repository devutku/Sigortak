using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sigortak.Common.Models;
using Sigortak.EventBus.RabbitMq;
using Sigortak.Vehicle.Application.Commands.CreateVehicle;
using Sigortak.Vehicle.Application.Commands.UpdateVehicle;
using Sigortak.Vehicle.Application.DTOs;
using Sigortak.Vehicle.Application.Queries.GetVehicleByPlate;
using Sigortak.Vehicle.Application.Queries.GetVehicles;

using Sigortak.Vehicle.Application.Commands.UpdateVehicleInspection;
using Sigortak.Vehicle.Application.Interfaces;

namespace Sigortak.Vehicle.API.Controllers;

/// <summary>
/// Araç yönetim uç noktaları.
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
public class VehiclesController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly RabbitMqEventBus _eventBus;
    private readonly Sigortak.Common.ITenantProvider _tenantProvider;
    private readonly IPolicyStorageService _storageService;

    public VehiclesController(
        IMediator mediator, 
        RabbitMqEventBus eventBus, 
        Sigortak.Common.ITenantProvider tenantProvider,
        IPolicyStorageService storageService)
    {
        _mediator = mediator;
        _eventBus = eventBus;
        _tenantProvider = tenantProvider;
        _storageService = storageService;
    }

    /// <summary>
    /// Yeni araç oluşturma isteğini RabbitMQ kuyruğuna gönderir (Command Side - Async).
    /// </summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status202Accepted)]
    public async Task<IActionResult> Create([FromBody] CreateVehicleCommand command)
    {
        command.TenantId = _tenantProvider.TenantId ?? Guid.Empty;
        // Asenkron kuyruğa gönder
        await _eventBus.PublishAsync(command);
        return Accepted(new { Message = "Araç oluşturma isteği alındı ve işlenmek üzere kuyruğa eklendi." });
    }

    /// <summary>
    /// Araç bilgilerini günceller (Command Side - Sync).
    /// </summary>
    [HttpPut]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update([FromBody] UpdateVehicleCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    /// <summary>
    /// Tüm araçları listeler (Query Side - Read DB).
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var result = await _mediator.Send(new GetVehiclesQuery());
        return Ok(result);
    }

    /// <summary>
    /// Plakaya göre araç bilgisini getirir (Query Side - Read DB).
    /// </summary>
    [HttpGet("{plate}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByPlate(string plate)
    {
        var result = await _mediator.Send(new GetVehicleByPlateQuery(plate));
        return Ok(result);
    }

    /// <summary>
    /// Araç muayene bilgilerini günceller ve muayene belgesini yükler.
    /// </summary>
    [HttpPost("inspection")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateInspection(
        [FromForm] Guid vehicleId,
        [FromForm] DateTime inspectionDate,
        [FromForm] bool inspectionPassed,
        IFormFile? file)
    {
        string? documentUrl = null;

        if (file != null)
        {
            try
            {
                var uniqueFileName = $"{Guid.NewGuid()}_{file.FileName}";
                using var stream = file.OpenReadStream();
                documentUrl = await _storageService.UploadPolicyDocumentAsync(stream, uniqueFileName, file.ContentType);
            }
            catch (Exception ex)
            {
                return BadRequest(Result.Failure("Muayene belgesi yüklenemedi: " + ex.Message));
            }
        }

        var command = new UpdateVehicleInspectionCommand(
            vehicleId,
            inspectionDate,
            inspectionPassed,
            documentUrl
        );

        var result = await _mediator.Send(command);
        if (!result.IsSuccess)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }
}
