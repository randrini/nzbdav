namespace NzbWebDAV.Exceptions;

public class CouldNotConnectToUsenetException(string message) : RetryableDownloadException(message)
{
}