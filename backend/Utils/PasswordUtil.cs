using Microsoft.AspNetCore.Identity;

namespace NzbWebDAV.Utils;

public static class PasswordUtil
{
    private static readonly PasswordHasher<object> Hasher = new();

    public static string Hash(string password, string salt = "")
    {
        return Hasher.HashPassword(null!, password + salt);
    }

    public static bool Verify(string hash, string password, string salt = "")
    {
        return Hasher.VerifyHashedPassword(null!, hash, password + salt) == PasswordVerificationResult.Success;
    }
}