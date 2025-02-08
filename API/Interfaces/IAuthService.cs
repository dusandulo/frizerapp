using API.Models;

namespace API.Interfaces
{
    public interface IAuthService
    {
        string CreateToken(User user);
    }
}