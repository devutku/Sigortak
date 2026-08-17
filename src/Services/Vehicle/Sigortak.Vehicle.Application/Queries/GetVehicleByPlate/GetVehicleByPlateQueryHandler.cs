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
    private readonly IVehiclePolicyReadRepository _readRepository;
    private readonly IDatabase _redisDatabase;
    private readonly ILogger<GetVehicleByPlateQueryHandler> _logger;

    public GetVehicleByPlateQueryHandler(
        IVehiclePolicyReadRepository readRepository,
        IConnectionMultiplexer redisConnection,
        ILogger<GetVehicleByPlateQueryHandler> logger)
    {
        _readRepository = readRepository;
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

        _logger.LogInformation("Araç ({Plate}) Read veritabanından çekiliyor.", request.Plate);
        var dbVehicle = await _readRepository.GetByPlateAsync(request.Plate, cancellationToken);
        if (dbVehicle == null)
            throw new NotFoundException("Vehicle", request.Plate);

        var dto = new VehicleDto
        {
            Id = dbVehicle.VehicleId,
            Plate = dbVehicle.Plate,
            Brand = dbVehicle.Brand,
            Model = dbVehicle.Model,
            Year = dbVehicle.Year,
            OwnerId = dbVehicle.OwnerId,
            BodyType = dbVehicle.BodyType,
            InspectionDate = dbVehicle.InspectionDate,
            InspectionPassed = dbVehicle.InspectionPassed,
            InspectionDocumentUrl = dbVehicle.InspectionDocumentUrl,
            InsuranceEndDate = dbVehicle.EndDate,
            PolicyId = dbVehicle.PolicyId,
            PolicyNumber = dbVehicle.PolicyNumber,
            PolicyStartDate = dbVehicle.StartDate,
            PolicyEndDate = dbVehicle.EndDate,
            PolicyPremium = dbVehicle.Premium,
            PolicyDocumentUrl = dbVehicle.DocumentUrl,
            IsActive = true,
            CreatedAt = dbVehicle.UpdatedAt
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
