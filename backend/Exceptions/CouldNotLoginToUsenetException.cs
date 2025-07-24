namespace NzbWebDAV.Exceptions;

public class CouldNotLoginToUsenetException(string message) : RetryableDownloadException(message)
{
}