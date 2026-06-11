namespace SubjectService.DTOs
{
    public class CreateTopicDto
    {
        public int SubjectId { get; set; }

        public string Title { get; set; } = string.Empty;

        public string Difficulty { get; set; } = "Medium";

        public string Status { get; set; } = "Not Started";
    }
}