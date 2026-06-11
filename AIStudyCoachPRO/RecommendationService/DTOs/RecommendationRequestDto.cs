namespace RecommendationService.DTOs
{
    public class RecommendationRequestDto
    {
        public int UserId { get; set; }

        public int TotalStudyMinutes { get; set; }

        public double AverageScorePercentage { get; set; }

        public int DaysUntilExam { get; set; }

        public int WeakAreasCount { get; set; }
    }
}