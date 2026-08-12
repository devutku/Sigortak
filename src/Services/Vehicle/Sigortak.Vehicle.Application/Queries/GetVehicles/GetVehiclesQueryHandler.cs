using System.Text.Json;
using MediatR;
using StackExchange.Redis;
using Sigortak.Common.Models;
using Sigortak.Vehicle.Application.DTOs;
using Sigortak.Vehicle.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace Sigortak.Vehicle.Application.Queries.GetVehicles;

public class GetVehiclesQueryHandler : IRequestHandler<GetVehiclesQuery, Result<List<VehicleDto>>>
{
    private readonly IVehicleRepository _vehicleRepository;
    private readonly IDatabase _redisDatabase;
    private readonly ILogger<GetVehiclesQueryHandler> _logger;
    private const string CacheKey = "vehicles:all";

    public GetVehiclesQueryHandler(
        IVehicleRepository vehicleRepository,
        IConnectionMultiplexer redisConnection,
        ILogger<GetVehiclesQueryHandler> logger)
    {
        _vehicleRepository = vehicleRepository;
        _redisDatabase = redisConnection.GetDatabase();
        _logger = logger;
    }

    public async Task<Result<List<VehicleDto>>> Handle(GetVehiclesQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var cachedData = await _redisDatabase.StringGetAsync(CacheKey);
            if (cachedData.HasValue)
            {
                _logger.LogInformation("Araç listesi Redis cache'ten getirildi.");
                var vehicles = JsonSerializer.Deserialize<List<VehicleDto>>(cachedData.ToString());
                return Result.Success(vehicles!, "Araç listesi (Cache).");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Redis cache okuma hatası.");
        }

        _logger.LogInformation("Araç listesi veritabanından çekiliyor.");
        var dbVehicles = await _vehicleRepository.GetAllAsync(cancellationToken);
        var dtos = dbVehicles.Select(v => new VehicleDto
        {
            Id = v.Id,
            Plate = v.Plate,
            Brand = v.Brand,
            Model = v.Model,
            Year = v.Year,
            EngineNumber = v.EngineNumber,
            ChassisNumber = v.ChassisNumber,
            OwnerId = v.OwnerId,
            BodyType = v.BodyType.ToString(),
            IsActive = v.IsActive,
            CreatedAt = v.CreatedAt,
            UpdatedAt = v.UpdatedAt
        }).ToList();

        try
        {
            await _redisDatabase.StringSetAsync(CacheKey, JsonSerializer.Serialize(dtos), TimeSpan.FromMinutes(10));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Redis cache yazma hatası.");
        }

        return Result.Success(dtos, "Araç listesi (Veritabanı).");
    }
}
