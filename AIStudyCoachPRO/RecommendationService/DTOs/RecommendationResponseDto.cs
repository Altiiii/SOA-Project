namespace RecommendationService.DTOs
{
    public class RecommendationResponseDto
    {
        public int UserId { get; set; }
        public int SubjectId { get; set; }
        public string SubjectName { get; set; } = string.Empty;
        public string ExamDeadline { get; set; } = string.Empty;
        public int DaysUntilExam { get; set; }
        public string RiskLevel { get; set; } = string.Empty;
        public string ExamSuccessPrediction { get; set; } = string.Empty;
        public int ReadinessScore { get; set; }
        public string PreparationStatus { get; set; } = string.Empty;
        public string SummaryMessage { get; set; } = string.Empty;
        public List<string> Recommendations { get; set; } = new();
        public List<string> WeakAreas { get; set; } = new();
        public int TotalStudyMinutes { get; set; }
        public int TotalQuizzes { get; set; }
        public double AverageScorePercentage { get; set; }
    }
}
