using API.Data;
using API.Enums;
using API.Interfaces;
using API.Models;
using Microsoft.EntityFrameworkCore;

namespace API.Services
{
    public class AppointmentService : IAppointmentService
    {
        private readonly DataContext _context;

        public AppointmentService(DataContext context)
        {
            _context = context;
        }

        public async Task<List<Appointment>> GetCalendarAppointments(DateTime start, DateTime end)
        {
            return await _context.Appointments
                .Where(a => a.StartTime >= start && a.EndTime <= end)
                .ToListAsync();
        }

        public async Task<Appointment> BookAppointment(int appointmentId, int clientId, int? stylingServiceId)
        {
            var appointment = await _context.Appointments.FirstOrDefaultAsync(a => a.Id == appointmentId && !a.IsBooked);
            if (appointment == null) return null;

            appointment.IsBooked = true;
            appointment.ClientId = clientId;
            await _context.SaveChangesAsync();
            return appointment;
        }

        public async Task<List<Appointment>> GetAppointmentsByStylist(int stylistId)
        {
            return await _context.Appointments
                .Where(a => a.StylistId == stylistId)
                .ToListAsync();
        }

        public async Task<Appointment> CreateAppointment(Appointment appointment)
        {
            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();
            return appointment;
        }

        public async Task<List<object>> GetStylists()
        {
            var stylists = await _context.Users
                .Where(u => u.Role == RoleEnum.Stylist)
                .Select(u => new { id = u.Id.ToString(), name = u.Name })
                .ToListAsync();
            return stylists.Cast<object>().ToList();
        }

        public async Task<List<Appointment>> GetAppointmentsByClient(int clientId)
        {
            return await _context.Appointments
                .Where(a => a.ClientId == clientId && a.IsBooked)
                .ToListAsync();
        }
    }
}