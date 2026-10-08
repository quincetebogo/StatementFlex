using StatementFlex.Core.Interfaces;
using Amazon.S3;
using Microsoft.AspNetCore.Http;
using Amazon.S3.Model;
using Microsoft.Extensions.Configuration;
using static Amazon.AWSConfigs;
using System.Text.Json;
using Amazon;

namespace StatementFlex.Infrastructure.Storage;

public class AWSS3BucketService : IStorageService
{
    private readonly IAmazonS3 _s3Client;
    private readonly string _accessPointArm ;
    public AWSS3BucketService(IAmazonS3 s3Client, IConfiguration configuration)
    {
        _s3Client = s3Client;
        _accessPointArm = configuration["AWSSettings:AccessPointArn"]
    ?? throw new InvalidOperationException("AccessPointArn configuration is missing");
    }

    public async Task<Stream> DownloadFileAsync(string token, CancellationToken cancellationToken = default)
    {
        var bucketExists = Amazon.S3.Util.AmazonS3Util.DoesS3BucketExistV2Async(_s3Client, _accessPointArm);
        var memoryStream = new MemoryStream();
        var getObjectRequest = new GetObjectRequest
        {
            BucketName = _accessPointArm,
            Key = token
        };

        using (var response = await _s3Client.GetObjectAsync(getObjectRequest, cancellationToken))
        {
            await response.ResponseStream.CopyToAsync(memoryStream, cancellationToken);
            memoryStream.Position = 0;
        }
        return memoryStream;
        }

    public async Task<string> UploadStatementAsync(Stream statementFile, string fileName, CancellationToken cancellationToken, string contentType)
    {
        Console.WriteLine($"DEBUG: Using Access Point ARN: {_accessPointArm}");
        //I will come back to this method to add some validation incase the bucket doesn't exist
       // var bucketExists = await Amazon.S3.Util.AmazonS3Util.DoesS3BucketExistV2Async(_s3Client, _accessPointArm);
        //Console.WriteLine($"Does the bucket exist? :{bucketExists}");
        //await _s3Client.PutBucketAsync("testing-if-this-works");

        var storageKey = GenerateStorageKey(fileName);
        Console.WriteLine($"DEBUG: FileName: {fileName}");
        Console.WriteLine($"DEBUG: StorageKey: {storageKey}");
        Console.WriteLine($"DEBUG: ContentType: {contentType}");
        
        var sanitizedContentType = string.IsNullOrEmpty(contentType) 
        ? "application/octet-stream" 
        : new string(contentType.Where(c => c <= 127).ToArray());
    // Check if any character is non-ASCII
        var hasNonAscii = storageKey.Any(c => c > 127);
    Console.WriteLine($"DEBUG: Has non-ASCII chars (Key): {hasNonAscii}");

        var request = new PutObjectRequest
        {
            BucketName = _accessPointArm,
            Key = storageKey,
            InputStream = statementFile,
            ContentType = sanitizedContentType,
            DisablePayloadSigning = true
        };

        AWSConfigs.LoggingConfig.LogTo = LoggingOptions.Console;
        AWSConfigs.LoggingConfig.LogResponses = ResponseLoggingOption.Always;
        await _s3Client.PutObjectAsync(request, cancellationToken);
        return storageKey;
    }

    private string GenerateStorageKey(string fileName)
    {
        var dateFolder = DateTime.UtcNow.ToString("yyyy/MM");
        var uniqueId = Guid.NewGuid();
        return $"statement/{dateFolder}/{uniqueId}/{fileName}";
    }
}
