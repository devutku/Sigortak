namespace Sigortak.Vehicle.Application.Interfaces;

public interface INotificationService
{
    Task SendPushNotificationAsync(string targetTokenOrTopic, string title, string body, Dictionary<string, string>? data = null, CancellationToken cancellationToken = default);
}
