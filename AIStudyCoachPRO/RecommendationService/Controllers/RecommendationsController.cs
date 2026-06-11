using Microsoft.AspNetCore.Mvc;
using RecommendationService.DTOs;
using RecommendationService.Services;

namespace RecommendationService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RecommendationsController : ControllerBase
    {
        private readonly RecommendationEngine _recommendationEngine;

        public RecommendationsController(RecommendationEngine recommendationEngine)
        {
            _recommendationEngine = recommendationEngine;
        }

        [HttpPost("analyze")]
        public IActionResult Analyze(RecommendationRequestDto request)
        {
            if (request.TotalStudyMinutes < 0)
                return BadRequest("Total study minutes cannot be negative.");

            if (request.AverageScorePercentage < 0 || request.AverageScorePercentage > 100)
                return BadRequest("Average score percentage must be between 0 and 100.");

            if (request.DaysUntilExam < 0)
                return BadRequest("Days until exam cannot be negative.");

            if (request.WeakAreasCount < 0)
                return BadRequest("Weak areas count cannot be negative.");

            if (request.TotalQuizzes < 0)
                return BadRequest("Total quizzes cannot be negative.");

            var result = _recommendationEngine.Analyze(request);
            return Ok(result);
        }
    }
}
