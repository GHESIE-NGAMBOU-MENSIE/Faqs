
using System.Collections.Generic;

namespace task.Models
{
    public class Faq
    {
        public required int id { get; set; }               // Unique identifier for each FAQ
        public required string question { get; set; }     // The question text
        public required string answer { get; set; }       // The answer text
        public IEnumerable<string>? tags { get; set; } // Optional tags for categorization
    }
}
