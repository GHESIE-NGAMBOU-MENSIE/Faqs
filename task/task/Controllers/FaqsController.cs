using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using task.Models;

namespace task.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FaqsController : ControllerBase
    {
        private readonly string _filePath = Path.Combine("wwwroot", "faqs.json");

        // Action: GetAll
        [HttpGet]
        public IActionResult GetAll()
        {
            var faqs = LoadFaqs();  // Lädt die Liste der FAQs.
            return Ok(faqs);        // Gibt die Liste der FAQs mit dem Statuscode 200 OK zurück.
        }

        // Action: GetById
        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var faqs = LoadFaqs(); // Lädt die Liste der FAQs.
            var faq = faqs.FirstOrDefault(f => f.id == id);  // Sucht nach der FAQ mit der angegebenen ID.
            return faq == null ? NotFound() : Ok(faq);
        }

        // Action: Create
        [HttpPost]
        public IActionResult Create([FromBody] Faq newFaq)
        {
            var faqs = LoadFaqs();
            if (faqs.Any(f => f.id == newFaq.id)) //Überpruft , ob id bereits existiert
                return BadRequest("ID already exists.");

            newFaq.id = faqs.Any() ? faqs.Max(f => f.id) + 1 : 1;  // Weist der neuen FAQ eine ID zu.
            faqs.Add(newFaq); // Fügt die neue FAQ zur Liste hinzu
            SaveFaqs(faqs);    // Speichert die aktualisierte FAQ-Liste.


            return CreatedAtAction(nameof(GetById), new { id = newFaq.id }, newFaq);
        }

        // Action: DeleteById
        [HttpDelete("{id}")]
        public IActionResult DeleteById(int id)
        {
            var faqs = LoadFaqs();
            var faq = faqs.FirstOrDefault(f => f.id == id);
            if (faq == null)
                return NotFound();

            faqs.Remove(faq);
            SaveFaqs(faqs);

            return NoContent();
        }

        // Helper Methods
        private List<Faq> LoadFaqs()
        {
            if (!System.IO.File.Exists(_filePath))
                return new List<Faq>();

            var json = System.IO.File.ReadAllText(_filePath);
            var result = JsonSerializer.Deserialize<List<Faq>>(json) ?? new List<Faq>();
            return result;
        }

        private void SaveFaqs(List<Faq> faqs)
        {
            var json = JsonSerializer.Serialize(faqs);
            System.IO.File.WriteAllText(_filePath, json);
        }
    }
}

