using System.Text.RegularExpressions;
using Usenet.Nzb;

namespace NzbWebDAV.Extensions;

public static class NzbFileExtensions
{
    public static string[] GetOrderedSegmentIds(this NzbFile file)
    {
        return file.Segments
            .OrderBy(x => x.Number)
            .Select(x => x.MessageId.Value)
            .ToArray();
    }

    public static string GetSubjectFileName(this NzbFile file)
    {
        return FirstNonEmpty(
            () => TryParseFilename1(file),
            () => TryParseFilename2(file)
        );
    }

    private static string TryParseFilename1(this NzbFile file)
    {
        var match = Regex.Match(file.Subject, "\\\"(.*)\\\"");
        if (match.Success) return match.Groups[1].Value;
        return "";
    }

    private static string TryParseFilename2(this NzbFile file)
    {
        var matches = Regex.Matches(file.Subject, @"\[([^\[\]]*)\]");
        return matches
            .Select(x => x.Groups[1].Value)
            .Where(x => Path.GetExtension(x).StartsWith("."))
            .FirstOrDefault(x => Path.GetExtension(x).Length < 6) ?? "";
    }

    private static string FirstNonEmpty(params Func<string>[] funcs)
    {
        return funcs.Select(x => x.Invoke()).FirstOrDefault(x => x != "") ?? "";
    }
}