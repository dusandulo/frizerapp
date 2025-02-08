using API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using API.DTOs;
using API.Services;
using API.Interfaces;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        private readonly IAuthService _authService;

        public UserController(IUserService userService, IAuthService authService)
        {
            _userService = userService;
            _authService = authService;
        }

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
                Token = token
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
                Token = token
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
                Name = user.Name
            });
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
        {
            var users = await _userService.GetUsers();
            var userDtos = users.Select(user => new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name
            });
            
            return Ok(userDtos);
        }
    }
}