using MediatR;
using Sigortak.Common.Models;
using Sigortak.Common.Exceptions;
using Sigortak.WorkOrder.Application.DTOs;
using Sigortak.WorkOrder.Domain.Interfaces;

namespace Sigortak.WorkOrder.Application.Queries.GetWorkOrderById;

public class GetWorkOrderByIdQueryHandler : IRequestHandler<GetWorkOrderByIdQuery, Result<WorkOrderDto>>
{
    private readonly IWorkOrderRepository _repository;

    public GetWorkOrderByIdQueryHandler(IWorkOrderRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<WorkOrderDto>> Handle(GetWorkOrderByIdQuery request, CancellationToken cancellationToken)
    {
        var o = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (o == null)
        {
            throw new NotFoundException("WorkOrder", request.Id.ToString());
        }

        var dto = new WorkOrderDto
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
        };

        return Result.Success(dto, "İş emri detayı başarıyla getirildi.");
    }
}
