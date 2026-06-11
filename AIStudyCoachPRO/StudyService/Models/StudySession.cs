namespace StudyService.Models
{
    public class StudySession
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        public int SubjectId { get; set; }

        public int TopicId { get; set; }

        public int DurationMinutes { get; set; }

        public DateTime StudyDate { get; set; } = DateTime.UtcNow;

        public string Notes { get; set; } = string.Empty;
    }
}