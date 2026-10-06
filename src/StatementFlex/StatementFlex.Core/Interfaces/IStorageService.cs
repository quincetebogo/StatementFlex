namespace StatementFlex.Core.Interfaces;

public interface IStorageService
{
    public Task<Stream> DownloadFileAsync(string token, CancellationToken cancellationToken = default);
    public Task<string> UploadStatementAsync(Stream statementFile, string fileName, CancellationToken cancellationToken, string contentType);
}
