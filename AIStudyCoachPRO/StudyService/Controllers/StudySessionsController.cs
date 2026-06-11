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
    public class StudySessionsController : ControllerBase
    {
        private readonly StudyDbContext _context;

        public StudySessionsController(StudyDbContext context)
        {
            _context = context;
        }

        private int GetCurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(claim, out int id) ? id : -1;
        }

        [HttpGet]
        public async Task<IActionResult> GetMyStudySessions()
        {
            var userId = GetCurrentUserId();
            if (userId == -1) return Unauthorized();

            var sessions = await _context.StudySessions
                .Where(s => s.UserId == userId)
                .ToListAsync();

            return Ok(sessions);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetStudySessionById(int id)
        {
            var userId = GetCurrentUserId();
            if (userId == -1) return Unauthorized();

            var session = await _context.StudySessions
                .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

            if (session == null)
                return NotFound("Study session not found.");

            return Ok(session);
        }

        // Backwards-compatible route — always uses JWT userId
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetStudySessionsByUserId(int userId)
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId == -1) return Unauthorized();

            var sessions = await _context.StudySessions
                .Where(s => s.UserId == currentUserId)
                .ToListAsync();

            return Ok(sessions);
        }

        [HttpPost]
        public async Task<IActionResult> CreateStudySession(CreateStudySessionDto dto)
        {
            var userId = GetCurrentUserId();
            if (userId == -1) return Unauthorized();

            if (dto.DurationMinutes <= 0)
                return BadRequest("Duration must be greater than 0.");

            var session = new StudySession
            {
                UserId = userId,
                SubjectId = dto.SubjectId,
                TopicId = dto.TopicId,
                DurationMinutes = dto.DurationMinutes,
                Notes = dto.Notes
            };

            _context.StudySessions.Add(session);
            await _context.SaveChangesAsync();

            return Ok(session);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStudySession(int id)
        {
            var userId = GetCurrentUserId();
            if (userId == -1) return Unauthorized();

            var session = await _context.StudySessions
                .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

            if (session == null)
                return NotFound("Study session not found.");

            _context.StudySessions.Remove(session);
            await _context.SaveChangesAsync();

            return Ok("Study session deleted successfully.");
        }
    }
}
