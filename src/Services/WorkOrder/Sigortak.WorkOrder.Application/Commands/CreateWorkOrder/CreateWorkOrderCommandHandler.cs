using MediatR;
using Sigortak.Common.Models;
using Sigortak.WorkOrder.Domain.Interfaces;
using Sigortak.WorkOrder.Domain.Entities;
using Sigortak.WorkOrder.Domain.Enums;

namespace Sigortak.WorkOrder.Application.Commands.CreateWorkOrder;

public class CreateWorkOrderCommandHandler : IRequestHandler<CreateWorkOrderCommand, Result<Guid>>
{
    private readonly IWorkOrderRepository _repository;

    public CreateWorkOrderCommandHandler(IWorkOrderRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<Guid>> Handle(CreateWorkOrderCommand request, CancellationToken cancellationToken)
    {
        var randomSuffix = new Random().Next(10000, 99999);
        var orderNumber = $"WO-{DateTime.UtcNow.Year}-{randomSuffix}";

        var workOrder = new Domain.Entities.WorkOrder
        {
            Id = Guid.NewGuid(),
            OrderNumber = orderNumber,
            Title = request.Title,
            Description = request.Description,
            OrderType = request.OrderType,
            Status = WorkOrderStatus.New,
            Priority = request.Priority,
            RelatedEntityId = request.RelatedEntityId,
            AssignedUserId = request.AssignedUserId,
            SpecialNotes = request.SpecialNotes
        };

        await _repository.CreateAsync(workOrder, cancellationToken);

        return Result.Success(workOrder.Id, $"İş emri ({orderNumber}) başarıyla oluşturuldu.");
    }
}
