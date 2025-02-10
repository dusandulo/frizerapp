using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Enums;

namespace API.DTOs
{
    public class UserDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public string Token { get; set; }
    public bool IsUserVerified { get; set; }
    public RoleEnum Role { get; set; } 
}
}