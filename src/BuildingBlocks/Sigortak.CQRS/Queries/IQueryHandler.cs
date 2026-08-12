using MediatR;

namespace Sigortak.CQRS.Queries;

/// <summary>
/// Query handler — salt okunur sorguları yürütür.
/// </summary>
public interface IQueryHandler<in TQuery, TResponse> : IRequestHandler<TQuery, TResponse>
    where TQuery : IQuery<TResponse>
{
}
