using Usenet.Nzb;

namespace NzbWebDAV.Extensions;

public static class NzbDocumentExtensions
{
    public static string? GetMetadataName(this NzbDocument nzbDocument)
    {
        return nzbDocument.MetaData.TryGetValue("name", out var name)
            ? name.FirstOrDefault()
            : null;
    }

    public static string GetShortCode(this NzbDocument nzbDocument)
    {
        return nzbDocument.GetHashCode().ToString("x8");
    }
}