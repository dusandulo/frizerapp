namespace API.Models
{
    public class Appointment
    {
        public int Id { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public int? ClientId { get; set; }
        public int StylistId { get; set; }
        public bool IsBooked { get; set; }
    }
}