using API.Enums;

namespace API.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public RoleEnum Role { get; set; } = RoleEnum.Client;
        public DateTime CreatedAt { get; set; }
        public string OTP { get; set; }
        public DateTime? OTPExpiration { get; set; }
        public bool IsUserVerified { get; set; }
        public string RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiryTime { get; set; }
    }
}