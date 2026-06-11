using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SubjectService.Data;
using SubjectService.DTOs;
using SubjectService.Models;
using System.Security.Claims;

namespace SubjectService.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class SubjectsController : ControllerBase
    {
        private readonly SubjectDbContext _context;

        public SubjectsController(SubjectDbContext context)
        {
            _context = context;
        }

        private int GetCurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(claim, out int id) ? id : -1;
        }

        [HttpGet]
        public async Task<IActionResult> GetMySubjects()
        {
            var userId = GetCurrentUserId();
            if (userId == -1) return Unauthorized();

            var subjects = await _context.Subjects
                .Include(s => s.Topics)
                .Where(s => s.UserId == userId)
                .ToListAsync();

            return Ok(subjects);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetSubjectById(int id)
        {
            var userId = GetCurrentUserId();
            if (userId == -1) return Unauthorized();

            var subject = await _context.Subjects
                .Include(s => s.Topics)
                .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

            if (subject == null)
                return NotFound("Subject not found.");

            return Ok(subject);
        }

        // Backwards-compatible route — always uses JWT userId regardless of URL param
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetSubjectsByUserId(int userId)
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId == -1) return Unauthorized();

            var subjects = await _context.Subjects
                .Include(s => s.Topics)
                .Where(s => s.UserId == currentUserId)
                .ToListAsync();

            return Ok(subjects);
        }

        [HttpPost]
        public async Task<IActionResult> CreateSubject(CreateSubjectDto dto)
        {
            var userId = GetCurrentUserId();
            if (userId == -1) return Unauthorized();

            var subject = new Subject
            {
                UserId = userId,
                Name = dto.Name,
                Description = dto.Description,
                ExamDeadline = dto.ExamDeadline,
                Priority = dto.Priority
            };

            _context.Subjects.Add(subject);
            await _context.SaveChangesAsync();

            return Ok(subject);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSubject(int id, CreateSubjectDto dto)
        {
            var userId = GetCurrentUserId();
            if (userId == -1) return Unauthorized();

            var subject = await _context.Subjects
                .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

            if (subject == null)
                return NotFound("Subject not found.");

            subject.Name = dto.Name;
            subject.Description = dto.Description;
            subject.ExamDeadline = dto.ExamDeadline;
            subject.Priority = dto.Priority;

            await _context.SaveChangesAsync();

            return Ok(subject);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSubject(int id)
        {
            var userId = GetCurrentUserId();
            if (userId == -1) return Unauthorized();

            var subject = await _context.Subjects
                .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

            if (subject == null)
                return NotFound("Subject not found.");

            _context.Subjects.Remove(subject);
            await _context.SaveChangesAsync();

            return Ok("Subject deleted successfully.");
        }
    }
}
