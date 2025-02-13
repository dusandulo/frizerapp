using API.Data;
using API.Interfaces;
using API.Models;
using API.Enums;
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

        public async Task<IEnumerable<Appointment>> GetCalendarAppointments(DateTime startDay, DateTime endDay)
        {
            return await _context.Appointments.Where(a => a.StartTime >= startDay && a.EndTime <= endDay).ToListAsync();
        }

        public async Task<Appointment> BookAppointment(int appointmentId, int clientId)
        {
            var appointment = await _context.Appointments.FindAsync(appointmentId);
            if (appointment == null || appointment.IsBooked) return null;

            appointment.IsBooked = true;
            appointment.ClientId = clientId;
            await _context.SaveChangesAsync();
            return appointment;
        }

        public async Task<IEnumerable<Appointment>> GetAppointmentsByStylist(int stylistId)
        {
            return await _context.Appointments.Where(a => a.StylistId == stylistId).ToListAsync();
        }

        public async Task<Appointment> CreateAppointment(Appointment appointment)
        {
            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();
            return appointment;
        }

        public async Task<IEnumerable<object>> GetStylists()
        {
            return await _context.Users
                .Where(u => u.Role == RoleEnum.Stylist)
                .Select(u => new { id = u.Id.ToString(), name = u.Name })
                .ToListAsync();
        }
    }
}