namespace NzbWebDAV.Exceptions;

public class RetryableDownloadException(string message) : Exception(message)
{
}