using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyService.Data;
using System.Security.Claims;

namespace StudyService.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ProgressController : ControllerBase
    {
        private readonly StudyDbContext _context;

        public ProgressController(StudyDbContext context)
        {
            _context = context;
        }

        private int GetCurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(claim, out int id) ? id : -1;
        }

        // URL userId is ignored — always uses JWT userId for security
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserProgress(int userId)
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId == -1) return Unauthorized();

            var sessions = await _context.StudySessions
                .Where(s => s.UserId == currentUserId)
                .ToListAsync();

            var quizResults = await _context.QuizResults
                .Where(q => q.UserId == currentUserId)
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
                UserId = currentUserId,
                TotalStudyMinutes = totalStudyMinutes,
                TotalStudyHours = Math.Round(totalStudyMinutes / 60.0, 2),
                TotalStudySessions = sessions.Count,
                TotalQuizzes = totalQuizzes,
                AverageScorePercentage = Math.Round(averageScorePercentage, 2),
                WeakAreas = weakAreas
            });
        }

        // URL userId is ignored — always uses JWT userId for security
        [HttpGet("user/{userId}/subject/{subjectId}")]
        public async Task<IActionResult> GetUserProgressBySubject(int userId, int subjectId)
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId == -1) return Unauthorized();

            var sessions = await _context.StudySessions
                .Where(s => s.UserId == currentUserId && s.SubjectId == subjectId)
                .ToListAsync();

            var quizResults = await _context.QuizResults
                .Where(q => q.UserId == currentUserId && q.SubjectId == subjectId)
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
                UserId = currentUserId,
                SubjectId = subjectId,
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
