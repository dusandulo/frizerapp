using API.DTOs;
using API.Models;

namespace API.Interfaces
{
    public interface IUserService
    {
        Task<User> Register(RegisterDto registerDto);
        Task<User> Login(LoginDto loginDto);
        Task<User> Update(int id, UpdateUserDto updateDto);
        Task<bool> EmailExist(string email);
        Task<IEnumerable<User>> GetUsers();
    }
}