using API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using API.DTOs;
using API.Interfaces;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController(IUserService userService, IAuthService authService) : ControllerBase
    {
        private readonly IUserService _userService = userService;
        private readonly IAuthService _authService = authService;

        [HttpPost("register")]
        public async Task<ActionResult<User>> Register(RegisterDto registerDto)
        {
            if (await _userService.EmailExist(registerDto.Email))
                return BadRequest("Email already exists");

            var user = await _userService.Register(registerDto);
            var token = _authService.CreateToken(user);

            return Ok(new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                Token = token,
                IsUserVerified = user.IsUserVerified
            });
        }

        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
        {
            var user = await _userService.Login(loginDto);

            if (user == null)
                return Unauthorized("Invalid email or password");

            var token = _authService.CreateToken(user);

            return Ok(new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                Token = token,
                IsUserVerified = user.IsUserVerified
            });
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<ActionResult<UserDto>> Update(int id, UpdateUserDto updateDto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null || int.Parse(userIdClaim) != id)
                return Unauthorized();

            var user = await _userService.Update(id, updateDto);
            if (user == null)
                return NotFound();

            return Ok(new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                IsUserVerified = user.IsUserVerified
            });
        }

        [HttpGet("current")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null || !int.TryParse(userIdClaim, out int loggedInUserId))
            {
                return Unauthorized("You are not authorized.");
            }

            var users = await _userService.GetUsers();
            var user = users.FirstOrDefault(x => x.Id == loggedInUserId);

            if (user == null)
            {
                return NotFound("User not found.");
            }

            return Ok(user);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
        {
            var users = await _userService.GetUsers();
            var userDtos = users.Select(user => new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                IsUserVerified = user.IsUserVerified
            });

            return Ok(userDtos);
        }

        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpDto otpDto)
        {
            var isVerified = await _userService.VerifyOtp(otpDto.Email, otpDto.OTP);

            if (!isVerified)
            {
                return BadRequest(new { message = "Invalid or expired OTP." });
            }

            return Ok(new { message = "OTP verified successfully." });
        }

        [HttpPost("resend-otp")]
        public async Task<IActionResult> ResendOtp([FromBody] ResendOtpDto resendOtpDto)
        {
            var user = await _userService.GetUserByEmail(resendOtpDto.Email);

            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            var otp = _userService.GenerateOTP();
            user.OTP = otp;
            user.OTPExpiration = DateTime.UtcNow.AddMinutes(10);

            await _userService.UpdateUser(user);

            await _userService.SendOtpMail(user.Email, otp, user.Name);

            return Ok(new { message = "OTP resent successfully." });
        }
    }
}