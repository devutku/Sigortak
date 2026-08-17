namespace Sigortak.Quote.Application.Interfaces;

public interface IQuoteStorageService
{
    Task<string> UploadQuoteDocumentAsync(Stream fileStream, string fileName, string contentType, CancellationToken cancellationToken = default);
    Task<(Stream FileStream, string ContentType)> DownloadQuoteDocumentAsync(string fileName, CancellationToken cancellationToken = default);
}


