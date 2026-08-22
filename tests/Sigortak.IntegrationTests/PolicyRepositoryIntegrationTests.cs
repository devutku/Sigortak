using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Moq;
using Testcontainers.PostgreSql;
using Xunit;
using Sigortak.Common;
using Sigortak.Policy.Domain.Enums;
using Sigortak.Policy.Infrastructure.Persistence;
using PolicyEntity = Sigortak.Policy.Domain.Entities.Policy;

namespace Sigortak.IntegrationTests
{
    public class PolicyRepositoryIntegrationTests : IAsyncLifetime
    {
        private readonly PostgreSqlContainer _dbContainer;
        private PolicyDbContext _dbContext = null!;
        private PolicyRepository _repository = null!;
        private readonly Guid _testTenantId = Guid.NewGuid();

        public PolicyRepositoryIntegrationTests()
        {
            _dbContainer = new PostgreSqlBuilder("postgres:16-alpine")
                .WithDatabase("test_policy_db")
                .WithUsername("postgres")
                .WithPassword("postgres")
                .Build();
        }

        public async Task InitializeAsync()
        {
            await _dbContainer.StartAsync();

            var options = new DbContextOptionsBuilder<PolicyDbContext>()
                .UseNpgsql(_dbContainer.GetConnectionString())
                .Options;

            var tenantProviderMock = new Mock<ITenantProvider>();
            tenantProviderMock.Setup(t => t.TenantId).Returns(_testTenantId);

            _dbContext = new PolicyDbContext(options, tenantProviderMock.Object);
            
            // Ensure the schema is created (runs migrations)
            await _dbContext.Database.EnsureCreatedAsync();

            _repository = new PolicyRepository(_dbContext);
        }

        public async Task DisposeAsync()
        {
            if (_dbContext != null)
            {
                await _dbContext.DisposeAsync();
            }
            await _dbContainer.StopAsync();
        }

        [Fact]
        public async Task CreateAsync_ShouldPersistPolicyInDatabase()
        {
            // Arrange
            var policy = new PolicyEntity
            {
                Id = Guid.NewGuid(),
                PolicyNumber = "INT-123456",
                SbmPolicyNumber = "SBM-987654",
                VehicleId = Guid.NewGuid(),
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddYears(1),
                Premium = 1500.00m,
                PolicyType = PolicyType.Traffic,
                IsActive = true,
                TenantId = _testTenantId
            };

            // Act
            await _repository.CreateAsync(policy);

            // Assert
            var persistedPolicy = await _repository.GetByIdAsync(policy.Id);
            Assert.NotNull(persistedPolicy);
            Assert.Equal(policy.PolicyNumber, persistedPolicy.PolicyNumber);
            Assert.Equal(policy.Premium, persistedPolicy.Premium);
            Assert.Equal(_testTenantId, persistedPolicy.TenantId);
        }

        [Fact]
        public async Task GetActivePolicyByVehicleIdAsync_ShouldReturnActivePolicy()
        {
            // Arrange
            var vehicleId = Guid.NewGuid();
            var activePolicy = new PolicyEntity
            {
                Id = Guid.NewGuid(),
                PolicyNumber = "ACTIVE-01",
                VehicleId = vehicleId,
                StartDate = DateTime.UtcNow.AddDays(-5),
                EndDate = DateTime.UtcNow.AddDays(5),
                Premium = 1000m,
                PolicyType = PolicyType.Traffic,
                IsActive = true,
                TenantId = _testTenantId
            };

            var inactivePolicy = new PolicyEntity
            {
                Id = Guid.NewGuid(),
                PolicyNumber = "INACTIVE-01",
                VehicleId = vehicleId,
                StartDate = DateTime.UtcNow.AddDays(-10),
                EndDate = DateTime.UtcNow.AddDays(-1), // Expired
                Premium = 800m,
                PolicyType = PolicyType.Traffic,
                IsActive = true,
                TenantId = _testTenantId
            };

            await _repository.CreateAsync(activePolicy);
            await _repository.CreateAsync(inactivePolicy);

            // Act
            var result = await _repository.GetActivePolicyByVehicleIdAsync(vehicleId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(activePolicy.PolicyNumber, result.PolicyNumber);
        }
    }
}
