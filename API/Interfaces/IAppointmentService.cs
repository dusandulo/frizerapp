using API.Models;

namespace API.Interfaces
{
    public interface IAppointmentService
    {
        Task<List<Appointment>> GetCalendarAppointments(DateTime start, DateTime end);
        Task<Appointment> BookAppointment(int appointmentId, int clientId, int? stylingServiceId = null);
        Task<List<Appointment>> GetAppointmentsByStylist(int stylistId);
        Task<List<object>> GetStylists();
        Task<Appointment> CreateAppointment(Appointment appointment);
        Task<List<Appointment>> GetAppointmentsByClient(int clientId);
    }
}