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
    public class TopicsController : ControllerBase
    {
        private readonly SubjectDbContext _context;

        public TopicsController(SubjectDbContext context)
        {
            _context = context;
        }

        private int GetCurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(claim, out int id) ? id : -1;
        }

        // Returns only topics whose parent subject belongs to the current user
        [HttpGet]
        public async Task<IActionResult> GetMyTopics()
        {
            var userId = GetCurrentUserId();
            if (userId == -1) return Unauthorized();

            var userSubjectIds = await _context.Subjects
                .Where(s => s.UserId == userId)
                .Select(s => s.Id)
                .ToListAsync();

            var topics = await _context.Topics
                .Where(t => userSubjectIds.Contains(t.SubjectId))
                .ToListAsync();

            return Ok(topics);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetTopicById(int id)
        {
            var userId = GetCurrentUserId();
            if (userId == -1) return Unauthorized();

            var userSubjectIds = await _context.Subjects
                .Where(s => s.UserId == userId)
                .Select(s => s.Id)
                .ToListAsync();

            var topic = await _context.Topics
                .FirstOrDefaultAsync(t => t.Id == id && userSubjectIds.Contains(t.SubjectId));

            if (topic == null)
                return NotFound("Topic not found.");

            return Ok(topic);
        }

        [HttpGet("subject/{subjectId}")]
        public async Task<IActionResult> GetTopicsBySubjectId(int subjectId)
        {
            var userId = GetCurrentUserId();
            if (userId == -1) return Unauthorized();

            var subjectBelongsToUser = await _context.Subjects
                .AnyAsync(s => s.Id == subjectId && s.UserId == userId);

            if (!subjectBelongsToUser)
                return NotFound("Subject not found.");

            var topics = await _context.Topics
                .Where(t => t.SubjectId == subjectId)
                .ToListAsync();

            return Ok(topics);
        }

        [HttpPost]
        public async Task<IActionResult> CreateTopic(CreateTopicDto dto)
        {
            var userId = GetCurrentUserId();
            if (userId == -1) return Unauthorized();

            var subjectBelongsToUser = await _context.Subjects
                .AnyAsync(s => s.Id == dto.SubjectId && s.UserId == userId);

            if (!subjectBelongsToUser)
                return BadRequest("Subject does not exist.");

            var topic = new Topic
            {
                SubjectId = dto.SubjectId,
                Title = dto.Title,
                Difficulty = dto.Difficulty,
                Status = dto.Status
            };

            _context.Topics.Add(topic);
            await _context.SaveChangesAsync();

            return Ok(topic);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTopic(int id, CreateTopicDto dto)
        {
            var userId = GetCurrentUserId();
            if (userId == -1) return Unauthorized();

            var userSubjectIds = await _context.Subjects
                .Where(s => s.UserId == userId)
                .Select(s => s.Id)
                .ToListAsync();

            var topic = await _context.Topics
                .FirstOrDefaultAsync(t => t.Id == id && userSubjectIds.Contains(t.SubjectId));

            if (topic == null)
                return NotFound("Topic not found.");

            var targetSubjectBelongsToUser = await _context.Subjects
                .AnyAsync(s => s.Id == dto.SubjectId && s.UserId == userId);

            if (!targetSubjectBelongsToUser)
                return BadRequest("Subject does not exist.");

            topic.SubjectId = dto.SubjectId;
            topic.Title = dto.Title;
            topic.Difficulty = dto.Difficulty;
            topic.Status = dto.Status;

            await _context.SaveChangesAsync();

            return Ok(topic);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTopic(int id)
        {
            var userId = GetCurrentUserId();
            if (userId == -1) return Unauthorized();

            var userSubjectIds = await _context.Subjects
                .Where(s => s.UserId == userId)
                .Select(s => s.Id)
                .ToListAsync();

            var topic = await _context.Topics
                .FirstOrDefaultAsync(t => t.Id == id && userSubjectIds.Contains(t.SubjectId));

            if (topic == null)
                return NotFound("Topic not found.");

            _context.Topics.Remove(topic);
            await _context.SaveChangesAsync();

            return Ok("Topic deleted successfully.");
        }
    }
}
