using MediatR;

namespace Sigortak.CQRS.Commands;

/// <summary>
/// Command handler — durum değiştiren işlemleri yürütür.
/// </summary>
public interface ICommandHandler<in TCommand, TResponse> : IRequestHandler<TCommand, TResponse>
    where TCommand : ICommand<TResponse>
{
}

/// <summary>
/// Response döndürmeyen command handler.
/// </summary>
public interface ICommandHandler<in TCommand> : IRequestHandler<TCommand>
    where TCommand : ICommand
{
}
