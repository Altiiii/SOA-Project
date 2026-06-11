using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SubjectService.Data;
using SubjectService.DTOs;
using SubjectService.Models;

namespace SubjectService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SubjectsController : ControllerBase
    {
        private readonly SubjectDbContext _context;

        public SubjectsController(SubjectDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllSubjects()
        {
            var subjects = await _context.Subjects
                .Include(s => s.Topics)
                .ToListAsync();

            return Ok(subjects);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetSubjectById(int id)
        {
            var subject = await _context.Subjects
                .Include(s => s.Topics)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (subject == null)
            {
                return NotFound("Subject not found.");
            }

            return Ok(subject);
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetSubjectsByUserId(int userId)
        {
            var subjects = await _context.Subjects
                .Include(s => s.Topics)
                .Where(s => s.UserId == userId)
                .ToListAsync();

            return Ok(subjects);
        }

        [HttpPost]
        public async Task<IActionResult> CreateSubject(CreateSubjectDto dto)
        {
            var subject = new Subject
            {
                UserId = dto.UserId,
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
            var subject = await _context.Subjects.FindAsync(id);

            if (subject == null)
            {
                return NotFound("Subject not found.");
            }

            subject.UserId = dto.UserId;
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
            var subject = await _context.Subjects.FindAsync(id);

            if (subject == null)
            {
                return NotFound("Subject not found.");
            }

            _context.Subjects.Remove(subject);
            await _context.SaveChangesAsync();

            return Ok("Subject deleted successfully.");
        }
    }
}