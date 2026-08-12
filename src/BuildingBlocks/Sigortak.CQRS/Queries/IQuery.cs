using MediatR;

namespace Sigortak.CQRS.Queries;

/// <summary>
/// CQRS Query marker interface — salt okunur sorgular için.
/// </summary>
public interface IQuery<out TResponse> : IRequest<TResponse>
{
}
