using MediatR;
using Sigortak.Common.Models;
using Sigortak.WorkOrder.Domain.Enums;

namespace Sigortak.WorkOrder.Application.Commands.UpdateWorkOrderStatus;

public class UpdateWorkOrderStatusCommand : IRequest<Result>
{
    public Guid Id { get; set; }
    public WorkOrderStatus Status { get; set; }
}
