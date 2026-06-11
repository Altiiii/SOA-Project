using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyService.Data;
using StudyService.DTOs;
using StudyService.Models;

namespace StudyService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StudySessionsController : ControllerBase
    {
        private readonly StudyDbContext _context;

        public StudySessionsController(StudyDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllStudySessions()
        {
            var sessions = await _context.StudySessions.ToListAsync();

            return Ok(sessions);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetStudySessionById(int id)
        {
            var session = await _context.StudySessions.FindAsync(id);

            if (session == null)
            {
                return NotFound("Study session not found.");
            }

            return Ok(session);
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetStudySessionsByUserId(int userId)
        {
            var sessions = await _context.StudySessions
                .Where(s => s.UserId == userId)
                .ToListAsync();

            return Ok(sessions);
        }

        [HttpPost]
        public async Task<IActionResult> CreateStudySession(CreateStudySessionDto dto)
        {
            if (dto.DurationMinutes <= 0)
            {
                return BadRequest("Duration must be greater than 0.");
            }

            var session = new StudySession
            {
                UserId = dto.UserId,
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
            var session = await _context.StudySessions.FindAsync(id);

            if (session == null)
            {
                return NotFound("Study session not found.");
            }

            _context.StudySessions.Remove(session);
            await _context.SaveChangesAsync();

            return Ok("Study session deleted successfully.");
        }
    }
}