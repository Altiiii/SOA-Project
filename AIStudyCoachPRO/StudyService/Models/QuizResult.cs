namespace StudyService.Models
{
    public class QuizResult
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        public int SubjectId { get; set; }

        public int TopicId { get; set; }

        public int Score { get; set; }

        public int TotalQuestions { get; set; }

        public DateTime CompletedAt { get; set; } = DateTime.UtcNow;
    }
}