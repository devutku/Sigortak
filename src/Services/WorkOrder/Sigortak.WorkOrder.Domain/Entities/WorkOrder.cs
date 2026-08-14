using Sigortak.Common.Entities;
using Sigortak.WorkOrder.Domain.Enums;

namespace Sigortak.WorkOrder.Domain.Entities;

public class WorkOrder : AuditableEntity
{
    public string OrderNumber { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public WorkOrderType OrderType { get; set; } = WorkOrderType.ClaimFile;
    public WorkOrderStatus Status { get; set; } = WorkOrderStatus.New;
    public WorkOrderPriority Priority { get; set; } = WorkOrderPriority.Medium;

    // References to other contexts
    public Guid? RelatedEntityId { get; set; } // VehicleId, PolicyId, etc.
    public Guid? AssignedUserId { get; set; }   // Identity UserId of the operator

    // Additional fields for claims or adjusters
    public string SpecialNotes { get; set; } = string.Empty;
}
