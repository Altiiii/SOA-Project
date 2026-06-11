using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyService.Data;
using StudyService.DTOs;
using StudyService.Models;
using System.Security.Claims;

namespace StudyService.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class QuizResultsController : ControllerBase
    {
        private readonly StudyDbContext _context;

        public QuizResultsController(StudyDbContext context)
        {
            _context = context;
        }

        private int GetCurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(claim, out int id) ? id : -1;
        }

        [HttpGet]
        public async Task<IActionResult> GetMyQuizResults()
        {
            var userId = GetCurrentUserId();
            if (userId == -1) return Unauthorized();

            var results = await _context.QuizResults
                .Where(q => q.UserId == userId)
                .ToListAsync();

            return Ok(results);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetQuizResultById(int id)
        {
            var userId = GetCurrentUserId();
            if (userId == -1) return Unauthorized();

            var result = await _context.QuizResults
                .FirstOrDefaultAsync(q => q.Id == id && q.UserId == userId);

            if (result == null)
                return NotFound("Quiz result not found.");

            return Ok(result);
        }

        // Backwards-compatible route — always uses JWT userId
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetQuizResultsByUserId(int userId)
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId == -1) return Unauthorized();

            var results = await _context.QuizResults
                .Where(q => q.UserId == currentUserId)
                .ToListAsync();

            return Ok(results);
        }

        [HttpPost]
        public async Task<IActionResult> CreateQuizResult(CreateQuizResultDto dto)
        {
            var userId = GetCurrentUserId();
            if (userId == -1) return Unauthorized();

            if (dto.TotalQuestions <= 0)
                return BadRequest("Total questions must be greater than 0.");

            if (dto.Score < 0 || dto.Score > dto.TotalQuestions)
                return BadRequest("Score must be between 0 and total questions.");

            var result = new QuizResult
            {
                UserId = userId,
                SubjectId = dto.SubjectId,
                TopicId = dto.TopicId,
                Score = dto.Score,
                TotalQuestions = dto.TotalQuestions
            };

            _context.QuizResults.Add(result);
            await _context.SaveChangesAsync();

            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteQuizResult(int id)
        {
            var userId = GetCurrentUserId();
            if (userId == -1) return Unauthorized();

            var result = await _context.QuizResults
                .FirstOrDefaultAsync(q => q.Id == id && q.UserId == userId);

            if (result == null)
                return NotFound("Quiz result not found.");

            _context.QuizResults.Remove(result);
            await _context.SaveChangesAsync();

            return Ok("Quiz result deleted successfully.");
        }
    }
}
