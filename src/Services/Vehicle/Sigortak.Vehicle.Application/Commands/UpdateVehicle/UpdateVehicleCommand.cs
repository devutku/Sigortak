using MediatR;
using Sigortak.Common.Models;
using Sigortak.Vehicle.Domain.Enums;

namespace Sigortak.Vehicle.Application.Commands.UpdateVehicle;

/// <summary>
/// Araç güncelleme komutu.
/// </summary>
public record UpdateVehicleCommand(
    Guid Id,
    string Brand,
    string Model,
    int Year,
    string EngineNumber,
    string ChassisNumber,
    VehicleBodyType BodyType,
    DateTime? InspectionDate,
    DateTime? InsuranceEndDate
) : IRequest<Result<bool>>;
