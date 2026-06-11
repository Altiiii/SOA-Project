namespace RecommendationService.DTOs
{
    public class RecommendationResponseDto
    {
        public int UserId { get; set; }

        public string RiskLevel { get; set; } = string.Empty;

        public string ExamSuccessPrediction { get; set; } = string.Empty;

        public List<string> Recommendations { get; set; } = new List<string>();
    }
}