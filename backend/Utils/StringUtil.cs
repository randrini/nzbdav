namespace NzbWebDAV.Utils;

public static class StringUtil
{
    public static string? EmptyToNull(string? value)
    {
        return value == "" ? null : value;
    }
}