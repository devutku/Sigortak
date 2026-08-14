namespace Sigortak.Policy.Application.Interfaces;

public interface IPolicyStorageService
{
    Task<string> UploadPolicyDocumentAsync(Stream fileStream, string fileName, string contentType, CancellationToken cancellationToken = default);
    Task<(Stream FileStream, string ContentType)> DownloadPolicyDocumentAsync(string fileName, CancellationToken cancellationToken = default);
}
