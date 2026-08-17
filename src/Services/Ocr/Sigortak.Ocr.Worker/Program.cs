using Serilog;
using Sigortak.EventBus;
using Sigortak.Ocr.Worker;

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft", Serilog.Events.LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .WriteTo.Console(outputTemplate:
        "[{Timestamp:HH:mm:ss} {Level:u3}] {SourceContext}{NewLine}  {Message:lj}{NewLine}{Exception}")
    .CreateLogger();

try
{
    Log.Information("Sigortak OCR Background Worker baslatiliyor...");

    var builder = WebApplication.CreateBuilder(args);
    builder.Host.UseSerilog();

    // OCR Parser & Storage
    builder.Services.AddSingleton<OcrParser>();
    builder.Services.AddSingleton<MinioStorageService>();

    // Kafka EventBus
    builder.Services.AddKafkaEventBus(settings =>
    {
        settings.BootstrapServers = builder.Configuration["Kafka:BootstrapServers"] ?? "localhost:9092";
        settings.DefaultTopic = "vehicle-events";
    });

    // Background hosted service
    builder.Services.AddHostedService<OcrKafkaConsumer>();

    // Health Checks
    builder.Services.AddHealthChecks()
        .AddKafka(setup => setup.BootstrapServers = builder.Configuration["Kafka:BootstrapServers"]!);

    builder.Services.AddControllers();

    var app = builder.Build();

    app.MapControllers();
    app.MapHealthChecks("/health");

    Log.Information("Sigortak OCR Background Worker baslatildi.");
    await app.RunAsync();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Uygulama baslatilamadi!");
}
finally
{
    await Log.CloseAndFlushAsync();
}
