using API.Models;

namespace API.Interfaces
{
    public interface IStylingService
    {
        Task<IEnumerable<StylingServices>> GetAllServices();
        Task<StylingServices> GetServiceById(int id);
        Task<StylingServices> CreateService(StylingServices service);
        Task<StylingServices> UpdateService(int id, StylingServices service);
        Task<bool> DeleteService(int id);
    }
}