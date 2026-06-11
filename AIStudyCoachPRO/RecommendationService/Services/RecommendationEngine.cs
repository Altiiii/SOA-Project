using RecommendationService.DTOs;

namespace RecommendationService.Services
{
    public class RecommendationEngine
    {
        public RecommendationResponseDto Analyze(RecommendationRequestDto request)
        {
            var recommendations = new List<string>();
            var riskPoints = 0;

            if (request.AverageScorePercentage < 50)
            {
                riskPoints += 3;
                recommendations.Add("Your quiz performance is below 50%. Focus on weak topics and repeat practice quizzes.");
            }
            else if (request.AverageScorePercentage < 70)
            {
                riskPoints += 2;
                recommendations.Add("Your quiz performance is moderate. Review the topics where you made mistakes.");
            }
            else
            {
                recommendations.Add("Your quiz performance is good. Continue practicing to maintain progress.");
            }

            if (request.WeakAreasCount > 0)
            {
                riskPoints += request.WeakAreasCount;
                recommendations.Add($"You have {request.WeakAreasCount} weak area(s). Prioritize these topics in your study plan.");
            }

            if (request.DaysUntilExam <= 3)
            {
                riskPoints += 3;
                recommendations.Add("Your exam deadline is very close. Increase your study priority immediately.");
            }
            else if (request.DaysUntilExam <= 7)
            {
                riskPoints += 2;
                recommendations.Add("Your exam is approaching soon. Create a focused revision plan.");
            }
            else
            {
                recommendations.Add("You still have enough time before the exam. Keep a consistent study routine.");
            }

            if (request.TotalStudyMinutes < 120)
            {
                riskPoints += 2;
                recommendations.Add("Your total study time is low. Add more study sessions to improve preparation.");
            }
            else if (request.TotalStudyMinutes < 300)
            {
                riskPoints += 1;
                recommendations.Add("Your study time is acceptable, but increasing it can improve your exam readiness.");
            }
            else
            {
                recommendations.Add("Your study time is strong. Keep the same rhythm until the exam.");
            }

            string riskLevel;
            string prediction;

            if (riskPoints >= 7)
            {
                riskLevel = "High";
                prediction = "Low";
            }
            else if (riskPoints >= 4)
            {
                riskLevel = "Medium";
                prediction = "Medium";
            }
            else
            {
                riskLevel = "Low";
                prediction = "High";
            }

            return new RecommendationResponseDto
            {
                UserId = request.UserId,
                RiskLevel = riskLevel,
                ExamSuccessPrediction = prediction,
                Recommendations = recommendations
            };
        }
    }
}