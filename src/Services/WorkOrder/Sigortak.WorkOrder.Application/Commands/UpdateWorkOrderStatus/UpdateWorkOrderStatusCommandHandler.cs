using MediatR;
using Sigortak.Common.Models;
using Sigortak.Common.Exceptions;
using Sigortak.WorkOrder.Domain.Interfaces;

namespace Sigortak.WorkOrder.Application.Commands.UpdateWorkOrderStatus;

public class UpdateWorkOrderStatusCommandHandler : IRequestHandler<UpdateWorkOrderStatusCommand, Result>
{
    private readonly IWorkOrderRepository _repository;

    public UpdateWorkOrderStatusCommandHandler(IWorkOrderRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result> Handle(UpdateWorkOrderStatusCommand request, CancellationToken cancellationToken)
    {
        var workOrder = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (workOrder == null)
        {
            throw new NotFoundException("WorkOrder", request.Id.ToString());
        }

        workOrder.Status = request.Status;
        await _repository.UpdateAsync(workOrder, cancellationToken);

        return Result.Success($"İş emri durumu '{request.Status}' olarak güncellendi.");
    }
}
