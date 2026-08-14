namespace Sigortak.WorkOrder.Application.DTOs;

public class WorkOrderDto
{
    public Guid Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string OrderType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public Guid? RelatedEntityId { get; set; }
    public Guid? AssignedUserId { get; set; }
    public string SpecialNotes { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
