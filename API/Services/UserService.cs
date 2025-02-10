using API.Data;
using API.DTOs;
using API.Enums;
using API.Interfaces;
using API.Models;
using Microsoft.EntityFrameworkCore;

namespace API.Services
{
    public class UserService : IUserService
    {
        private readonly DataContext _context;
        private readonly IEmailService _emailService;

        public UserService(DataContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

       public async Task<User> Register(RegisterDto registerDto)
        {
            if (!Enum.TryParse(registerDto.Role.ToString(), out RoleEnum role))
                {
                    throw new ArgumentException("Invalid role");
                }
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password);
            var otp = GenerateOTP();

            var user = new User
            {
                Email = registerDto.Email.ToLower(),
                Name = registerDto.Name,
                PasswordHash = passwordHash,
                Role = role, 
                CreatedAt = DateTime.UtcNow,
                OTP = otp,
                OTPExpiration = DateTime.UtcNow.AddMinutes(10),
                IsUserVerified = false
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            await SendOtpMail(user.Email, otp, user.Name);

            return user;
        }

        public async Task<User> Login(LoginDto loginDto)
        {
            var user = await _context.Users
                .SingleOrDefaultAsync(x => x.Email == loginDto.Email.ToLower());

            if (user == null) return null;

            if (!BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash)) return null;

            return user;
        }

        public async Task<User> Update(int id, UpdateUserDto updateDto) // edit-profile

        {
            var user = await _context.Users.FindAsync(id);

            if (user == null) return null;

            if (!string.IsNullOrEmpty(updateDto.Name))
                user.Name = updateDto.Name;

            if (!string.IsNullOrEmpty(updateDto.Email))
                user.Email = updateDto.Email.ToLower();

            if (!string.IsNullOrEmpty(updateDto.Password))
            {
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(updateDto.Password);
            }

            await _context.SaveChangesAsync();
            return user;
        }

        public async Task UpdateUser(User user) // otp
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }

        public async Task<User> GetUserByEmail(string email)
        {
            return await _context.Users.SingleOrDefaultAsync(x => x.Email == email);
        }

        public async Task<bool> EmailExist(string email)
        {
            return await _context.Users.AnyAsync(x => x.Email == email.ToLower());
        }

        public async Task<IEnumerable<User>> GetUsers()
        {
            return await _context.Users.ToListAsync();
        }

        public string GenerateOTP()
        {
            Random random = new Random();
            string randomNumber = random.Next(0, 1000000).ToString("D6");
            return randomNumber;
        }

        private string GenerateBodyOTP(string name, string otp)
        {
            string emailBody = string.Empty;
            emailBody += "<h1>Hi " + name + "</h1>";
            emailBody += "<p>Your OTP for verification is: " + otp + "</p>";
            return emailBody;
        }

        public async Task SendOtpMail(string email, string OtpText, string name)
        {
            var mailRequest = new MailRequest();
            mailRequest.Email = email;
            mailRequest.Subject = "Frizer | OTP for verification";
            mailRequest.Body = GenerateBodyOTP(name, OtpText);
            await this._emailService.SendEmail(mailRequest);
        }

        public async Task<bool> VerifyOtp(string email, string otp)
        {
            var user = await _context.Users.SingleOrDefaultAsync(x => x.Email == email);

            if (user == null) return false;

            if (user.OTP != otp) return false;

            if (user.OTPExpiration < DateTime.UtcNow) return false;

            user.OTP = null;
            user.OTPExpiration = null;
            user.IsUserVerified = true;

            await _context.SaveChangesAsync();
            return true;
        }
    }
}