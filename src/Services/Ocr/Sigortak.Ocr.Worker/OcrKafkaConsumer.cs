using System.Text;
using System.Text.Json;
using Confluent.Kafka;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Sigortak.EventBus.Kafka;

namespace Sigortak.Ocr.Worker;

public class OcrKafkaConsumer : BackgroundService
{
    private readonly ILogger<OcrKafkaConsumer> _logger;
    private readonly KafkaSettings _settings;
    private readonly MinioStorageService _storageService;
    private readonly OcrParser _ocrParser;
    private readonly KafkaEventBus _eventBus;
    private readonly IConsumer<string, string> _consumer;

    public OcrKafkaConsumer(
        ILogger<OcrKafkaConsumer> logger,
        KafkaSettings settings,
        MinioStorageService storageService,
        OcrParser ocrParser,
        KafkaEventBus eventBus)
    {
        _logger = logger;
        _settings = settings;
        _storageService = storageService;
        _ocrParser = ocrParser;
        _eventBus = eventBus;

        var config = new ConsumerConfig
        {
            BootstrapServers = settings.BootstrapServers,
            GroupId = "ocr-worker-group",
            AutoOffsetReset = AutoOffsetReset.Earliest,
            EnableAutoCommit = true
        };

        _consumer = new ConsumerBuilder<string, string>(config)
            .SetErrorHandler((_, error) => _logger.LogError("Kafka OCR Consumer Hatasi: {Reason}", error.Reason))
            .Build();
    }

    protected override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _consumer.Subscribe("vehicle-events");
        _logger.LogInformation("Kafka OCR Consumer 'vehicle-events' dinlemeye basladi.");

        Task.Run(async () =>
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var consumeResult = _consumer.Consume(stoppingToken);
                    if (consumeResult == null) continue;

                    string eventType = string.Empty;
                    if (consumeResult.Message.Headers.TryGetLastBytes("event-type", out var headerBytes))
                    {
                        eventType = Encoding.UTF8.GetString(headerBytes);
                    }

                    _logger.LogInformation("Kafka'dan OCR event'i alindi. EventType: {EventType}", eventType);

                    string fileUrl = string.Empty;
                    Guid documentId = Guid.Empty;

                    if (eventType == "QuoteReceivedEvent")
                    {
                        var quoteEvent = JsonSerializer.Deserialize<QuoteReceivedPayload>(consumeResult.Message.Value);
                        if (quoteEvent != null)
                        {
                            fileUrl = quoteEvent.PdfDocumentUrl;
                            documentId = quoteEvent.QuoteId;
                        }
                    }
                    else if (eventType == "PolicyCreatedEvent")
                    {
                        var policyEvent = JsonSerializer.Deserialize<PolicyCreatedPayload>(consumeResult.Message.Value);
                        if (policyEvent != null)
                        {
                            fileUrl = policyEvent.DocumentUrl;
                            documentId = policyEvent.PolicyId;
                        }
                    }

                    if (!string.IsNullOrEmpty(fileUrl))
                    {
                        _logger.LogInformation("OCR icin belge indiriliyor: {Url}", fileUrl);
                        try
                        {
                            using var stream = await _storageService.DownloadDocumentAsync(fileUrl, stoppingToken);
                            var parsedData = _ocrParser.ParseDocument(stream);

                            _logger.LogInformation(
                                "OCR BASARIYLA TAMAMLANDI! Belge: {Id}, Plaka: {Plate}, Sasi: {Chassis}, Tutar: {Premium} TL, Sirket: {Company}",
                                documentId, parsedData.Plate, parsedData.ChassisNumber, parsedData.Premium, parsedData.InsuranceCompany);

                            // Publish result to event bus
                            var processedEvent = new DocumentOcrProcessedEvent(
                                documentId,
                                parsedData.Plate,
                                parsedData.ChassisNumber,
                                parsedData.Premium,
                                parsedData.InsuranceCompany
                            );

                            await _eventBus.PublishAsync(processedEvent, stoppingToken);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "OCR isleme sirasinda hata olustu. Belge: {Url}", fileUrl);
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Kafka OCR dinleme dongusunde hata olustu.");
                    await Task.Delay(2000, stoppingToken);
                }
            }
        }, stoppingToken);

        return Task.CompletedTask;
    }
}

public class QuoteReceivedPayload
{
    public Guid QuoteId { get; set; }
    public string PdfDocumentUrl { get; set; } = string.Empty;
}

public class PolicyCreatedPayload
{
    public Guid PolicyId { get; set; }
    public string DocumentUrl { get; set; } = string.Empty;
}
