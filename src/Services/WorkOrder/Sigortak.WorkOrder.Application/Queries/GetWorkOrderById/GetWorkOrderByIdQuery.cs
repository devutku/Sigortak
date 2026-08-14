using MediatR;
using Sigortak.Common.Models;
using Sigortak.WorkOrder.Application.DTOs;

namespace Sigortak.WorkOrder.Application.Queries.GetWorkOrderById;

public class GetWorkOrderByIdQuery : IRequest<Result<WorkOrderDto>>
{
    public Guid Id { get; }

    public GetWorkOrderByIdQuery(Guid id)
    {
        Id = id;
    }
}
