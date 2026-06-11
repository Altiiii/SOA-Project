namespace RecommendationService.DTOs
{
    public class RecommendationRequestDto
    {
        public int UserId { get; set; }
        public int SubjectId { get; set; }
        public string SubjectName { get; set; } = string.Empty;
        public string ExamDeadline { get; set; } = string.Empty;
        public int TotalStudyMinutes { get; set; }
        public double AverageScorePercentage { get; set; }
        public int DaysUntilExam { get; set; }
        public int WeakAreasCount { get; set; }
        public int TotalQuizzes { get; set; }
        public List<string> WeakAreas { get; set; } = new();
    }
}
