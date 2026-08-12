using MediatR;
using Sigortak.Common.Models;
using Sigortak.Vehicle.Application.DTOs;

namespace Sigortak.Vehicle.Application.Queries.GetVehicles;

/// <summary>
/// Tüm araçları listeleme sorgusu.
/// </summary>
public record GetVehiclesQuery : IRequest<Result<List<VehicleDto>>>;
