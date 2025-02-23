using API.Models;

namespace API.Interfaces
{
    public interface IAuthService
    {
        (string AccessToken, string RefreshToken) CreateTokens(User user);
        public string GenerateRefreshToken();
    }
}