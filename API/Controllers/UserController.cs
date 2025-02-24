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
        public async Task<ActionResult> Register(RegisterDto registerDto)
        {
            if (await _userService.EmailExist(registerDto.Email))
                return BadRequest("Email already exists");

            var user = await _userService.Register(registerDto);
            return Ok(new
            {
                Message = "Registracija uspešna, proverite email za OTP",
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                IsUserVerified = user.IsUserVerified,
                Role = user.Role
            });
        }

        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
        {
            var user = await _userService.Login(loginDto);
            if (user == null)
                return Unauthorized("Invalid email or password");

            if (!user.IsUserVerified)
            {
                return Ok(new UserDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    Name = user.Name,
                    IsUserVerified = user.IsUserVerified
                });
            }

            var token = _authService.CreateToken(user);
            var refreshToken = await _userService.GenerateRefreshTokenAsync(user.Id);
            SetRefreshTokenCookie(refreshToken);

            return Ok(new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                Token = token,
                IsUserVerified = user.IsUserVerified
            });
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var refreshToken = Request.Cookies["refreshToken"];
            if (!string.IsNullOrEmpty(refreshToken))
                await _userService.RevokeRefreshTokenAsync(refreshToken);

            Response.Cookies.Delete("refreshToken");
            return Ok();
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<ActionResult<UserDto>> Update(int id, UpdateUserDto updateDto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null || int.Parse(userIdClaim) != id)
                return Unauthorized();

            var currentUser = await _userService.GetUserById(id);

            if (currentUser == null)
                return NotFound("User not found.");

            if (!string.Equals(currentUser.Email, updateDto.Email, StringComparison.OrdinalIgnoreCase))
            {
                if (await _userService.EmailExist(updateDto.Email))
                {
                    return BadRequest("Email already exists.");
                }
            }

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

        [HttpGet("users")]
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
                return BadRequest(new { message = "Invalid or expired OTP." });

            var user = await _userService.GetUserByEmail(otpDto.Email);
            var token = _authService.CreateToken(user);
            var refreshToken = await _userService.GenerateRefreshTokenAsync(user.Id);
            SetRefreshTokenCookie(refreshToken);

            return Ok(new { message = "OTP verified successfully.", token = token });
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

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken()
        {
            var refreshToken = Request.Cookies["refreshToken"];
            if (string.IsNullOrEmpty(refreshToken))
                return Unauthorized("No refresh token provided");

            var refreshTokenEntity = await _userService.GetRefreshTokenAsync(refreshToken);
            if (refreshTokenEntity == null || refreshTokenEntity.IsRevoked || refreshTokenEntity.ExpiryDate < DateTime.UtcNow)
                return Unauthorized("Invalid or expired refresh token");

            var user = await _userService.GetUserById(refreshTokenEntity.UserId);
            if (user == null)
                return NotFound("User not found");

            var newAccessToken = _authService.CreateToken(user);
            var newRefreshToken = await _userService.GenerateRefreshTokenAsync(user.Id);
            SetRefreshTokenCookie(newRefreshToken);
            await _userService.RevokeRefreshTokenAsync(refreshToken);

            return Ok(new { Token = newAccessToken });
        }

        // Helper methods
        private void SetRefreshTokenCookie(RefreshToken refreshToken)
        {
            Response.Cookies.Append("refreshToken", refreshToken.Token, new CookieOptions
            {
                HttpOnly = true,
                Secure = false, // change to true if using HTTPS
                SameSite = SameSiteMode.Strict,
                Expires = refreshToken.ExpiryDate
            });
        }
    }
}