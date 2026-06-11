namespace StudyService.DTOs
{
    public class CreateStudySessionDto
    {
        public int UserId { get; set; }

        public int SubjectId { get; set; }

        public int TopicId { get; set; }

        public int DurationMinutes { get; set; }

        public string Notes { get; set; } = string.Empty;
    }
}