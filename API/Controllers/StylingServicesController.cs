using API.Interfaces;
using API.Models;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("[controller]")]
    public class StylingServicesController : ControllerBase
    {
        private readonly IStylingService _stylingService;
        public StylingServicesController(IStylingService stylingService)
        {
            _stylingService = stylingService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<StylingServices>>> GetAll()
        {
            var services = await _stylingService.GetAllServices();
            return Ok(services);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<StylingServices>> GetById(int id)
        {
            var service = await _stylingService.GetServiceById(id);
            if (service == null) return NotFound();
            return Ok(service);
        }
        [HttpPost]
        public async Task<ActionResult<StylingServices>> Create(StylingServices service)
        {
            var created = await _stylingService.CreateService(service);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        [HttpPut("{id}")]
        public async Task<ActionResult<StylingServices>> Update(int id, StylingServices service)
        {
            var updated = await _stylingService.UpdateService(id, service);
            if (updated == null) return NotFound();
            return Ok(updated);
        }
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var result = await _stylingService.DeleteService(id);
            if (!result) return NotFound();
            return NoContent();
        }

    }
}