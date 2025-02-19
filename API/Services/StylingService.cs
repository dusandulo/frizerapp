using API.Data;
using API.Interfaces;
using API.Models;
using Microsoft.EntityFrameworkCore;

namespace API.Services
{
    public class StylingService : IStylingService
    {
        private readonly DataContext _context;
        public StylingService(DataContext context)
        {
            _context = context;
        }
        public async Task<StylingServices> CreateService(StylingServices service)
        {
            _context.Services.Add(service);
            await _context.SaveChangesAsync();
            return service;
        }

        public async Task<bool> DeleteService(int id)
        {
            var service = await _context.Services.FindAsync(id);
            if (service == null) return false;

            _context.Services.Remove(service);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<StylingServices>> GetAllServices()
        {
            return await _context.Services.ToListAsync();
        }

        public async Task<StylingServices> GetServiceById(int id)
        {
            return await _context.Services.FindAsync(id);
        }

        public async Task<StylingServices> UpdateService(int id, StylingServices updatedService)
        {
            var service = await _context.Services.FindAsync(id);
            if (service == null) return null;

            service.Type = updatedService.Type;
            service.Price = updatedService.Price;
            service.Duration = updatedService.Duration;

            await _context.SaveChangesAsync();
            return service;
        }
    }
}