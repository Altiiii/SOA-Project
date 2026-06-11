using System.Text.Json.Serialization;

namespace SubjectService.Models
{
    public class Topic
    {
        public int Id { get; set; }

        public int SubjectId { get; set; }

        public string Title { get; set; } = string.Empty;

        public string Difficulty { get; set; } = "Medium";

        public string Status { get; set; } = "Not Started";

        [JsonIgnore]
        public Subject? Subject { get; set; }
    }
}