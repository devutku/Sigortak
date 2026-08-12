using MediatR;
using Sigortak.Common.Models;
using Sigortak.Vehicle.Application.DTOs;

namespace Sigortak.Vehicle.Application.Queries.GetVehicleByPlate;

/// <summary>
/// Plakaya göre araç sorgusu.
/// </summary>
public record GetVehicleByPlateQuery(string Plate) : IRequest<Result<VehicleDto>>;
