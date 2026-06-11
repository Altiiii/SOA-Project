using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyService.Data;
using StudyService.DTOs;
using StudyService.Models;

namespace StudyService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QuizResultsController : ControllerBase
    {
        private readonly StudyDbContext _context;

        public QuizResultsController(StudyDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllQuizResults()
        {
            var results = await _context.QuizResults.ToListAsync();

            return Ok(results);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetQuizResultById(int id)
        {
            var result = await _context.QuizResults.FindAsync(id);

            if (result == null)
            {
                return NotFound("Quiz result not found.");
            }

            return Ok(result);
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetQuizResultsByUserId(int userId)
        {
            var results = await _context.QuizResults
                .Where(q => q.UserId == userId)
                .ToListAsync();

            return Ok(results);
        }

        [HttpPost]
        public async Task<IActionResult> CreateQuizResult(CreateQuizResultDto dto)
        {
            if (dto.TotalQuestions <= 0)
            {
                return BadRequest("Total questions must be greater than 0.");
            }

            if (dto.Score < 0 || dto.Score > dto.TotalQuestions)
            {
                return BadRequest("Score must be between 0 and total questions.");
            }

            var result = new QuizResult
            {
                UserId = dto.UserId,
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
            var result = await _context.QuizResults.FindAsync(id);

            if (result == null)
            {
                return NotFound("Quiz result not found.");
            }

            _context.QuizResults.Remove(result);
            await _context.SaveChangesAsync();

            return Ok("Quiz result deleted successfully.");
        }
    }
}