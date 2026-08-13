namespace Sigortak.Vehicle.Application.Interfaces;

public interface IPolicyStorageService
{
    /// <summary>
    /// Uploads a policy PDF document to S3/MinIO.
    /// </summary>
    /// <param name="fileStream">Stream of the PDF file.</param>
    /// <param name="fileName">The target file name.</param>
    /// <param name="contentType">Content type, e.g. application/pdf.</param>
    /// <returns>The URL of the uploaded document.</returns>
    Task<string> UploadPolicyDocumentAsync(Stream fileStream, string fileName, string contentType, CancellationToken cancellationToken = default);

    /// <summary>
    /// Downloads a policy PDF document from S3/MinIO.
    /// </summary>
    /// <param name="fileName">The key/name of the file in the bucket.</param>
    /// <returns>A tuple containing the file stream and content type.</returns>
    Task<(Stream FileStream, string ContentType)> DownloadPolicyDocumentAsync(string fileName, CancellationToken cancellationToken = default);
}
