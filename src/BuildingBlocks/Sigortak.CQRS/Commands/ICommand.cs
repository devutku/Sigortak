using MediatR;

namespace Sigortak.CQRS.Commands;

/// <summary>
/// CQRS Command marker interface — durum değiştiren işlemler için.
/// </summary>
public interface ICommand<out TResponse> : IRequest<TResponse>
{
}

/// <summary>
/// Response döndürmeyen command'lar için.
/// </summary>
public interface ICommand : IRequest
{
}
