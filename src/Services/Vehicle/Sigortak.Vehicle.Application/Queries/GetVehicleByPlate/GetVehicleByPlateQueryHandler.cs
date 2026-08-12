using System.Text.Json;
using MediatR;
using StackExchange.Redis;
using Sigortak.Common.Models;
using Sigortak.Common.Exceptions;
using Sigortak.Vehicle.Application.DTOs;
using Sigortak.Vehicle.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace Sigortak.Vehicle.Application.Queries.GetVehicleByPlate;

public class GetVehicleByPlateQueryHandler : IRequestHandler<GetVehicleByPlateQuery, Result<VehicleDto>>
{
    private readonly IVehicleRepository _vehicleRepository;
    private readonly IDatabase _redisDatabase;
    private readonly ILogger<GetVehicleByPlateQueryHandler> _logger;

    public GetVehicleByPlateQueryHandler(
        IVehicleRepository vehicleRepository,
        IConnectionMultiplexer redisConnection,
        ILogger<GetVehicleByPlateQueryHandler> logger)
    {
        _vehicleRepository = vehicleRepository;
        _redisDatabase = redisConnection.GetDatabase();
        _logger = logger;
    }

    public async Task<Result<VehicleDto>> Handle(GetVehicleByPlateQuery request, CancellationToken cancellationToken)
    {
        var cacheKey = $"vehicle:plate:{request.Plate.ToUpperInvariant()}";

        try
        {
            var cachedData = await _redisDatabase.StringGetAsync(cacheKey);
            if (cachedData.HasValue)
            {
                _logger.LogInformation("Araç ({Plate}) Redis cache'ten getirildi.", request.Plate);
                var vehicle = JsonSerializer.Deserialize<VehicleDto>(cachedData.ToString());
                return Result.Success(vehicle!, "Araç bilgisi (Cache).");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Redis cache okuma hatası.");
        }

        _logger.LogInformation("Araç ({Plate}) veritabanından çekiliyor.", request.Plate);
        var dbVehicle = await _vehicleRepository.GetByPlateAsync(request.Plate, cancellationToken);
        if (dbVehicle == null)
            throw new NotFoundException("Vehicle", request.Plate);

        var dto = new VehicleDto
        {
            Id = dbVehicle.Id,
            Plate = dbVehicle.Plate,
            Brand = dbVehicle.Brand,
            Model = dbVehicle.Model,
            Year = dbVehicle.Year,
            EngineNumber = dbVehicle.EngineNumber,
            ChassisNumber = dbVehicle.ChassisNumber,
            OwnerId = dbVehicle.OwnerId,
            BodyType = dbVehicle.BodyType.ToString(),
            IsActive = dbVehicle.IsActive,
            CreatedAt = dbVehicle.CreatedAt,
            UpdatedAt = dbVehicle.UpdatedAt
        };

        try
        {
            await _redisDatabase.StringSetAsync(cacheKey, JsonSerializer.Serialize(dto), TimeSpan.FromMinutes(15));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Redis cache yazma hatası.");
        }

        return Result.Success(dto, "Araç bilgisi (Veritabanı).");
    }
}
