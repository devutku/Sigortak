using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Sigortak.Quote.Application.Interfaces;

namespace Sigortak.Quote.Infrastructure.Storage;

public class MinioStorageService : IQuoteStorageService
{
    private readonly IAmazonS3 _s3Client;
    private readonly string _bucketName;
    private readonly ILogger<MinioStorageService> _logger;

    public MinioStorageService(IConfiguration configuration, ILogger<MinioStorageService> logger)
    {
        _logger = logger;
        
        var endpoint = configuration["Minio:Endpoint"] ?? "http://localhost:9000";
        var accessKey = configuration["Minio:AccessKey"] ?? "sigortak_minio";
        var secretKey = configuration["Minio:SecretKey"] ?? "SigortakMinio2026!Secure";
        _bucketName = configuration["Minio:BucketName"] ?? "quote-documents";

        var config = new AmazonS3Config
        {
            ServiceURL = endpoint,
            ForcePathStyle = true
        };

        _s3Client = new AmazonS3Client(accessKey, secretKey, config);
    }

    public async Task<string> UploadQuoteDocumentAsync(Stream fileStream, string fileName, string contentType, CancellationToken cancellationToken = default)
    {
        try
         {
            var bucketExists = await Amazon.S3.Util.AmazonS3Util.DoesS3BucketExistV2Async(_s3Client, _bucketName);
            if (!bucketExists)
            {
                _logger.LogInformation("MinIO bucket '{Bucket}' not found. Creating it...", _bucketName);
                await _s3Client.PutBucketAsync(new PutBucketRequest { BucketName = _bucketName }, cancellationToken);
            }

            var putRequest = new PutObjectRequest
            {
                BucketName = _bucketName,
                Key = fileName,
                InputStream = fileStream,
                ContentType = contentType
            };

            await _s3Client.PutObjectAsync(putRequest, cancellationToken);
            
            return $"/api/v1/quotes/document/{fileName}";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to upload document to MinIO");
            throw;
        }
    }

    public async Task<(Stream FileStream, string ContentType)> DownloadQuoteDocumentAsync(string fileName, CancellationToken cancellationToken = default)
    {
        try
        {
            var getRequest = new GetObjectRequest
            {
                BucketName = _bucketName,
                Key = fileName
            };

            var response = await _s3Client.GetObjectAsync(getRequest, cancellationToken);
            return (response.ResponseStream, response.Headers.ContentType);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to download document from MinIO: {FileName}", fileName);
            throw;
        }
    }
}


