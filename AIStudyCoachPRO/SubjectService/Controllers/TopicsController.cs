using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SubjectService.Data;
using SubjectService.DTOs;
using SubjectService.Models;

namespace SubjectService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TopicsController : ControllerBase
    {
        private readonly SubjectDbContext _context;

        public TopicsController(SubjectDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllTopics()
        {
            var topics = await _context.Topics.ToListAsync();

            return Ok(topics);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetTopicById(int id)
        {
            var topic = await _context.Topics.FindAsync(id);

            if (topic == null)
            {
                return NotFound("Topic not found.");
            }

            return Ok(topic);
        }

        [HttpGet("subject/{subjectId}")]
        public async Task<IActionResult> GetTopicsBySubjectId(int subjectId)
        {
            var topics = await _context.Topics
                .Where(t => t.SubjectId == subjectId)
                .ToListAsync();

            return Ok(topics);
        }

        [HttpPost]
        public async Task<IActionResult> CreateTopic(CreateTopicDto dto)
        {
            var subjectExists = await _context.Subjects.AnyAsync(s => s.Id == dto.SubjectId);

            if (!subjectExists)
            {
                return BadRequest("Subject does not exist.");
            }

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
            var topic = await _context.Topics.FindAsync(id);

            if (topic == null)
            {
                return NotFound("Topic not found.");
            }

            var subjectExists = await _context.Subjects.AnyAsync(s => s.Id == dto.SubjectId);

            if (!subjectExists)
            {
                return BadRequest("Subject does not exist.");
            }

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
            var topic = await _context.Topics.FindAsync(id);

            if (topic == null)
            {
                return NotFound("Topic not found.");
            }

            _context.Topics.Remove(topic);
            await _context.SaveChangesAsync();

            return Ok("Topic deleted successfully.");
        }
    }
}