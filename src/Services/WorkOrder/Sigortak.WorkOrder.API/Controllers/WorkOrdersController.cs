using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Sigortak.Common.Models;
using Sigortak.WorkOrder.Application.Commands.CreateWorkOrder;
using Sigortak.WorkOrder.Application.Commands.UpdateWorkOrderStatus;
using Sigortak.WorkOrder.Application.Queries.GetWorkOrders;
using Sigortak.WorkOrder.Application.Queries.GetWorkOrderById;
using Sigortak.WorkOrder.Application.DTOs;

namespace Sigortak.WorkOrder.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class WorkOrdersController : ControllerBase
{
    private readonly IMediator _mediator;

    public WorkOrdersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Yeni bir iş emri oluşturur.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateWorkOrderCommand command)
    {
        var result = await _mediator.Send(command);
        if (!result.IsSuccess)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// İş emrinin durumunu günceller.
    /// </summary>
    [HttpPut("status")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateStatus([FromBody] UpdateWorkOrderStatusCommand command)
    {
        var result = await _mediator.Send(command);
        if (!result.IsSuccess)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Tüm iş emirlerini listeler.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var result = await _mediator.Send(new GetWorkOrdersQuery());
        return Ok(result);
    }

    /// <summary>
    /// ID ile iş emri detayını getirir.
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetWorkOrderByIdQuery(id));
        return Ok(result);
    }
}
