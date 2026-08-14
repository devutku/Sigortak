using MediatR;
using Sigortak.Common.Models;
using Sigortak.WorkOrder.Domain.Enums;

namespace Sigortak.WorkOrder.Application.Commands.CreateWorkOrder;

public class CreateWorkOrderCommand : IRequest<Result<Guid>>
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public WorkOrderType OrderType { get; set; } = WorkOrderType.ClaimFile;
    public WorkOrderPriority Priority { get; set; } = WorkOrderPriority.Medium;
    public Guid? RelatedEntityId { get; set; }
    public Guid? AssignedUserId { get; set; }
    public string SpecialNotes { get; set; } = string.Empty;
}
