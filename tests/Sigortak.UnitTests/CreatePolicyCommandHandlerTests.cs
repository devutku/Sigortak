using Moq;
using Xunit;
using Sigortak.Policy.Application.Commands.CreatePolicy;
using Sigortak.Policy.Domain.Interfaces;
using Sigortak.Policy.Application.Interfaces;
using Sigortak.EventBus.Kafka;
using Sigortak.Policy.Domain.Enums;
using Sigortak.Common.Models;
using Sigortak.Policy.Application.Events;
using PolicyEntity = Sigortak.Policy.Domain.Entities.Policy;

namespace Sigortak.UnitTests
{
    public class CreatePolicyCommandHandlerTests
    {
        private readonly Mock<IPolicyRepository> _policyRepositoryMock;
        private readonly Mock<IPolicyStorageService> _storageServiceMock;
        private readonly Mock<KafkaEventBus> _eventBusMock;
        private readonly CreatePolicyCommandHandler _handler;

        public CreatePolicyCommandHandlerTests()
        {
            _policyRepositoryMock = new Mock<IPolicyRepository>();
            _storageServiceMock = new Mock<IPolicyStorageService>();
            _eventBusMock = new Mock<KafkaEventBus>();
            _handler = new CreatePolicyCommandHandler(
                _policyRepositoryMock.Object,
                _storageServiceMock.Object,
                _eventBusMock.Object
            );
        }

        [Fact]
        public async Task Handle_WithValidCommand_ShouldCreatePolicyAndPublishEvent()
        {
            // Arrange
            var command = new CreatePolicyCommand
            {
                PolicyNumber = "POL123456",
                SbmPolicyNumber = "SBM654321",
                VehicleId = Guid.NewGuid(),
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddYears(1),
                Premium = 1250.50m,
                PolicyType = PolicyType.Traffic,
                DocumentUrl = "http://minio/policies/test.pdf"
            };

            _policyRepositoryMock
                .Setup(r => r.CreateAsync(It.IsAny<PolicyEntity>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((PolicyEntity p, CancellationToken c) => p);

            _eventBusMock
                .Setup(eb => eb.PublishAsync(It.IsAny<PolicyCreatedEvent>(), It.IsAny<CancellationToken>()))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result.IsSuccess);
            Assert.NotEqual(Guid.Empty, result.Data);
            
            _policyRepositoryMock.Verify(
                r => r.CreateAsync(It.Is<PolicyEntity>(p => p.PolicyNumber == command.PolicyNumber), It.IsAny<CancellationToken>()),
                Times.Once
            );

            _eventBusMock.Verify(
                eb => eb.PublishAsync(It.Is<PolicyCreatedEvent>(e => e.PolicyNumber == command.PolicyNumber), It.IsAny<CancellationToken>()),
                Times.Once
            );
        }

        [Fact]
        public async Task Handle_WithFileStream_ShouldUploadDocumentAndSetDocumentUrl()
        {
            // Arrange
            using var fileStream = new MemoryStream(new byte[] { 1, 2, 3 });
            var command = new CreatePolicyCommand
            {
                PolicyNumber = "POL123456",
                VehicleId = Guid.NewGuid(),
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddYears(1),
                Premium = 1250.50m,
                PolicyType = PolicyType.Traffic,
                FileStream = fileStream,
                FileName = "policy.pdf",
                ContentType = "application/pdf"
            };

            const string uploadedUrl = "http://minio/policies/uploaded.pdf";

            _storageServiceMock
                .Setup(s => s.UploadPolicyDocumentAsync(
                    It.IsAny<Stream>(),
                    It.IsAny<string>(),
                    It.IsAny<string>(),
                    It.IsAny<CancellationToken>()))
                .ReturnsAsync(uploadedUrl);

            _policyRepositoryMock
                .Setup(r => r.CreateAsync(It.IsAny<PolicyEntity>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((PolicyEntity p, CancellationToken c) => p);

            _eventBusMock
                .Setup(eb => eb.PublishAsync(It.IsAny<PolicyCreatedEvent>(), It.IsAny<CancellationToken>()))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result.IsSuccess);
            
            _storageServiceMock.Verify(
                s => s.UploadPolicyDocumentAsync(
                    command.FileStream,
                    It.Is<string>(name => name.Contains(command.FileName)),
                    command.ContentType,
                    It.IsAny<CancellationToken>()),
                Times.Once
            );

            _policyRepositoryMock.Verify(
                r => r.CreateAsync(It.Is<PolicyEntity>(p => p.DocumentUrl == uploadedUrl), It.IsAny<CancellationToken>()),
                Times.Once
            );
        }
    }
}
