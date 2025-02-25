using System.Security.Claims;
using API.Interfaces;
using API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    public class AppointmentController : ControllerBase
    {
        private readonly IAppointmentService _appointmentService;

        public AppointmentController(IAppointmentService appointmentService)
        {
            _appointmentService = appointmentService;
        }

        [HttpGet("calendar")]
        public async Task<ActionResult<IEnumerable<Appointment>>> GetCalendar(DateTime start, DateTime end)
        {
            var appointments = await _appointmentService.GetCalendarAppointments(start, end);
            return Ok(appointments);
        }

        [HttpPost("book/{appointmentId}")]
        public async Task<ActionResult<Appointment>> BookAppointment(int appointmentId, [FromBody] BookingRequest request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null) return Unauthorized();
            int clientId = int.Parse(userIdClaim);

            var appointment = await _appointmentService.BookAppointment(appointmentId, clientId, request.StylingServiceId);
            if (appointment == null) return BadRequest("Appointment not available.");

            return Ok(appointment);
        }

        public class BookingRequest
        {
            public int? StylingServiceId { get; set; }
        }

        [Authorize(Roles = "Stylist")]
        [HttpGet("stylist")]
        public async Task<ActionResult<IEnumerable<Appointment>>> GetAppointmentsForStylist()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null) return Unauthorized();
            int stylistId = int.Parse(userIdClaim);

            var appointments = await _appointmentService.GetAppointmentsByStylist(stylistId);
            return Ok(appointments);
        }

        [HttpGet("getstylists")]
        public async Task<ActionResult<IEnumerable<object>>> GetStylists()
        {
            var stylists = await _appointmentService.GetStylists();
            return Ok(stylists);
        }

        [HttpPost("create")]
        public async Task<ActionResult<Appointment>> CreateAppointment([FromBody] Appointment appointment)
        {
            var created = await _appointmentService.CreateAppointment(appointment);
            return Ok(created);
        }

        [HttpGet("client/{clientId}")]
        public async Task<ActionResult<IEnumerable<Appointment>>> GetAppointmentsByClient(int clientId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null || int.Parse(userIdClaim) != clientId)
                return Unauthorized(); // Osigurava da korisnik može videti samo svoje termine

            var appointments = await _appointmentService.GetAppointmentsByClient(clientId);
            return Ok(appointments);
        }
    }

    public class BookingRequest
    {
        public int? StylingServiceId { get; set; }
    }
}