using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyService.Data;

namespace StudyService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProgressController : ControllerBase
    {
        private readonly StudyDbContext _context;

        public ProgressController(StudyDbContext context)
        {
            _context = context;
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserProgress(int userId)
        {
            var sessions = await _context.StudySessions
                .Where(s => s.UserId == userId)
                .ToListAsync();

            var quizResults = await _context.QuizResults
                .Where(q => q.UserId == userId)
                .ToListAsync();

            var totalStudyMinutes = sessions.Sum(s => s.DurationMinutes);

            var totalQuizzes = quizResults.Count;

            double averageScorePercentage = 0;

            if (quizResults.Any())
            {
                averageScorePercentage = quizResults
                    .Average(q => (double)q.Score / q.TotalQuestions * 100);
            }

            var weakAreas = quizResults
                .Where(q => ((double)q.Score / q.TotalQuestions * 100) < 50)
                .Select(q => new
                {
                    q.SubjectId,
                    q.TopicId,
                    ScorePercentage = Math.Round((double)q.Score / q.TotalQuestions * 100, 2)
                })
                .ToList();

            return Ok(new
            {
                UserId = userId,
                TotalStudyMinutes = totalStudyMinutes,
                TotalStudyHours = Math.Round(totalStudyMinutes / 60.0, 2),
                TotalStudySessions = sessions.Count,
                TotalQuizzes = totalQuizzes,
                AverageScorePercentage = Math.Round(averageScorePercentage, 2),
                WeakAreas = weakAreas
            });
        }
    }
}