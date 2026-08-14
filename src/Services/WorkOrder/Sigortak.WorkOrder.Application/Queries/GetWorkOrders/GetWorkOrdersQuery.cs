using MediatR;
using Sigortak.Common.Models;
using Sigortak.WorkOrder.Application.DTOs;

namespace Sigortak.WorkOrder.Application.Queries.GetWorkOrders;

public class GetWorkOrdersQuery : IRequest<Result<List<WorkOrderDto>>>
{
}
