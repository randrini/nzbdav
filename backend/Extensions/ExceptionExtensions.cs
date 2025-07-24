using NzbWebDAV.Exceptions;

namespace NzbWebDAV.Extensions;

public static class ExceptionExtensions
{
    public static bool IsNonRetryableDownloadException(this Exception exception)
    {
        return exception is NonRetryableDownloadException
            or SharpCompress.Common.InvalidFormatException
            or Usenet.Exceptions.InvalidYencDataException;
    }
}