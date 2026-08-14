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
    private readonly IVehiclePolicyReadRepository _readRepository;
    private readonly IDatabase _redisDatabase;
    private readonly ILogger<GetVehiclesQueryHandler> _logger;
    private readonly Sigortak.Common.ITenantProvider _tenantProvider;

    public GetVehiclesQueryHandler(
        IVehiclePolicyReadRepository readRepository,
        IConnectionMultiplexer redisConnection,
        Sigortak.Common.ITenantProvider tenantProvider,
        ILogger<GetVehiclesQueryHandler> logger)
    {
        _readRepository = readRepository;
        _redisDatabase = redisConnection.GetDatabase();
        _tenantProvider = tenantProvider;
        _logger = logger;
    }

    public async Task<Result<List<VehicleDto>>> Handle(GetVehiclesQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantProvider.TenantId ?? Guid.Empty;
        var cacheKey = $"vehicles:all:tenant:{tenantId}";

        try
        {
            var cachedData = await _redisDatabase.StringGetAsync(cacheKey);
            if (cachedData.HasValue)
            {
                _logger.LogInformation("Araç listesi Redis cache'ten getirildi. Tenant: {TenantId}", tenantId);
                var vehicles = JsonSerializer.Deserialize<List<VehicleDto>>(cachedData.ToString());
                return Result.Success(vehicles!, "Araç listesi (Cache).");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Redis cache okuma hatası.");
        }

        _logger.LogInformation("Araç listesi Read veritabanından çekiliyor. Tenant: {TenantId}", tenantId);
        var dbVehicles = await _readRepository.GetAllAsync(cancellationToken);
        var dtos = dbVehicles.Select(v => new VehicleDto
        {
            Id = v.VehicleId,
            Plate = v.Plate,
            Brand = v.Brand,
            Model = v.Model,
            Year = v.Year,
            OwnerId = v.OwnerId,
            OwnerName = v.OwnerName,
            OwnerTcNo = v.OwnerTcNo,
            OwnerAddress = v.OwnerAddress,
            UsageType = v.UsageType,
            TrafficRegistrationDate = v.TrafficRegistrationDate,
            BodyType = v.BodyType,
            EngineCapacity = v.EngineCapacity,
            ChassisNumber = v.ChassisNumber,
            RegistrationNumber = v.RegistrationNumber,
            InspectionDate = v.InspectionDate,
            InsuranceEndDate = v.EndDate,
            PolicyId = v.PolicyId,
            PolicyNumber = v.PolicyNumber,
            SbmPolicyNumber = v.SbmPolicyNumber,
            PolicyStartDate = v.StartDate,
            PolicyEndDate = v.EndDate,
            PolicyPremium = v.Premium,
            PolicyDocumentUrl = v.DocumentUrl,
            IsActive = true,
            CreatedAt = v.UpdatedAt
        }).ToList();

        try
        {
            await _redisDatabase.StringSetAsync(cacheKey, JsonSerializer.Serialize(dtos), TimeSpan.FromMinutes(10));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Redis cache yazma hatası.");
        }

        return Result.Success(dtos, "Araç listesi (Veritabanı).");
    }
}
