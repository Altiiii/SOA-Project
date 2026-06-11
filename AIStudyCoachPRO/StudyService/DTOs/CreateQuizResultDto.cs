namespace StudyService.DTOs
{
    public class CreateQuizResultDto
    {
        public int UserId { get; set; }

        public int SubjectId { get; set; }

        public int TopicId { get; set; }

        public int Score { get; set; }

        public int TotalQuestions { get; set; }
    }
}