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

    public VehiclesController(IMediator mediator, RabbitMqEventBus eventBus)
    {
        _mediator = mediator;
        _eventBus = eventBus;
    }

    /// <summary>
    /// Yeni araç oluşturma isteğini RabbitMQ kuyruğuna gönderir (Command Side - Async).
    /// </summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status202Accepted)]
    public async Task<IActionResult> Create([FromBody] CreateVehicleCommand command)
    {
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
}
