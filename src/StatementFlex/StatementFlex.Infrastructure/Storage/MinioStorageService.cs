using Minio;
using Minio.DataModel.Args;
using StatementFlex.Core.Interfaces;

namespace StatementFlex.Infrastructure.Storage;

public class MinioStorageService : IStorageService
{
    private readonly IMinioClient _minioClient;
    private readonly string _bucketName;
    public MinioStorageService(IMinioClient minioClient, string bucketName)
    {
        _minioClient = minioClient;
        _bucketName = bucketName;
    }
    public async Task<string> UploadStatementAsync(Stream statementFile, string fileName, CancellationToken cancellationToken, string contentType = "application/pdf")
    {
        await EnsureBucketExists(cancellationToken);
        var storageKey = GenerateStorageKey(fileName);

        var putObjectArgs = new PutObjectArgs()
        .WithBucket(_bucketName)
        .WithContentType(contentType)
        .WithObject(storageKey)
        .WithStreamData(statementFile)
        .WithObjectSize(statementFile.Length);

       await _minioClient.PutObjectAsync(putObjectArgs);
        return storageKey;
    }

    private async Task EnsureBucketExists(CancellationToken cancellationToken)
    {
        var bucketExistsArgs = new BucketExistsArgs()
            .WithBucket(_bucketName);

        var bucketExists = await _minioClient.BucketExistsAsync(bucketExistsArgs, cancellationToken);
        if (!bucketExists)
        {
            var makeBucketArgs = new MakeBucketArgs()
            .WithBucket(_bucketName);

            await _minioClient.MakeBucketAsync(makeBucketArgs, cancellationToken);
        }
    }

    public async Task<Stream> DownloadFileAsync(string token, CancellationToken cancellationToken = default)
    {
        var memoryStream = new MemoryStream();
        var getObjectArgs = new GetObjectArgs()
            .WithBucket(_bucketName)
            .WithObject(token)
            .WithCallbackStream(stream =>
            {
                stream.CopyTo(memoryStream);
                memoryStream.Position = 0;
            });

        await _minioClient.GetObjectAsync(getObjectArgs, cancellationToken);
        return memoryStream;
    }
    private string GenerateStorageKey(string fileName)
    {
        var dateFolder = DateTime.UtcNow.ToString("yyyy/MM");
        var uniqueId = Guid.NewGuid();
        return $"statement/{dateFolder}/{uniqueId}/{fileName}";
    }
}
