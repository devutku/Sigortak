using MediatR;
using Sigortak.Common.Models;
using Sigortak.WorkOrder.Application.DTOs;
using Sigortak.WorkOrder.Domain.Interfaces;

namespace Sigortak.WorkOrder.Application.Queries.GetWorkOrders;

public class GetWorkOrdersQueryHandler : IRequestHandler<GetWorkOrdersQuery, Result<List<WorkOrderDto>>>
{
    private readonly IWorkOrderRepository _repository;

    public GetWorkOrdersQueryHandler(IWorkOrderRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<List<WorkOrderDto>>> Handle(GetWorkOrdersQuery request, CancellationToken cancellationToken)
    {
        var orders = await _repository.GetAllAsync(cancellationToken);

        var dtos = orders.Select(o => new WorkOrderDto
        {
            Id = o.Id,
            OrderNumber = o.OrderNumber,
            Title = o.Title,
            Description = o.Description,
            OrderType = o.OrderType.ToString(),
            Status = o.Status.ToString(),
            Priority = o.Priority.ToString(),
            RelatedEntityId = o.RelatedEntityId,
            AssignedUserId = o.AssignedUserId,
            SpecialNotes = o.SpecialNotes,
            CreatedAt = o.CreatedAt
        }).ToList();

        return Result.Success(dtos, "İş emirleri başarıyla listelendi.");
    }
}
