using API.Models;

namespace API.Interfaces
{
    public interface IAppointmentService
    {
        Task<IEnumerable<Appointment>> GetCalendarAppointments(DateTime startDay, DateTime endDay);
        Task<Appointment> BookAppointment(int appointmentId, int clientId);
        Task<IEnumerable<Appointment>> GetAppointmentsByStylist(int stylistId);
        Task<Appointment> CreateAppointment(Appointment appointment);
    }
}