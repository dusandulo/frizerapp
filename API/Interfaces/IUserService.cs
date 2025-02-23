using API.DTOs;
using API.Models;

namespace API.Interfaces
{
    public interface IUserService
    {
        Task<User> Register(RegisterDto registerDto);
        Task<User> Login(LoginDto loginDto);
        Task<User> Update(int id, UpdateUserDto updateDto);
        Task UpdateUser(User user);
        Task<User> GetUserByEmail(string email);
        Task<bool> EmailExist(string email);
        Task<IEnumerable<User>> GetUsers();
        Task<bool> VerifyOtp(string email, string otp);
        string GenerateOTP();
        Task SendOtpMail(string email, string OtpText, string name);
        Task<User> GetUserById(int id);
        Task<User> GetUserByRefreshToken(string refreshToken);
    }
}