using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Sigortak.Ocr.Worker;

public class MinioStorageService
{
    private readonly IAmazonS3 _s3Client;
    private readonly string _quoteBucket;
    private readonly string _policyBucket;
    private readonly ILogger<MinioStorageService> _logger;

    public MinioStorageService(IConfiguration configuration, ILogger<MinioStorageService> logger)
    {
        _logger = logger;
        var endpoint = configuration["Minio:Endpoint"] ?? "http://localhost:9000";
        var accessKey = configuration["Minio:AccessKey"] ?? "sigortak_minio";
        var secretKey = configuration["Minio:SecretKey"] ?? "SigortakMinio2026!Secure";
        _quoteBucket = "quote-documents";
        _policyBucket = "policy-documents";

        var config = new AmazonS3Config
        {
            ServiceURL = endpoint,
            ForcePathStyle = true
        };

        _s3Client = new AmazonS3Client(accessKey, secretKey, config);
    }

    public async Task<Stream> DownloadDocumentAsync(string fileUrl, CancellationToken cancellationToken = default)
    {
        var parts = fileUrl.Split('/');
        var fileName = parts[^1];
        var isQuote = fileUrl.Contains("quotes");
        var bucket = isQuote ? _quoteBucket : _policyBucket;

        _logger.LogInformation("Downloading {FileName} from bucket {Bucket}", fileName, bucket);

        var getRequest = new GetObjectRequest
        {
            BucketName = bucket,
            Key = fileName
        };

        var response = await _s3Client.GetObjectAsync(getRequest, cancellationToken);
        return response.ResponseStream;
    }
}
