using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SubjectService.Controllers;
using SubjectService.Data;
using SubjectService.DTOs;
using SubjectService.Models;
using Xunit;

namespace SubjectService.Tests;

public class TopicsControllerTests
{
    private static SubjectDbContext CreateContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<SubjectDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;
        return new SubjectDbContext(options);
    }

    [Fact]
    public async Task CreateTopic_ReturnsOk_WhenSubjectExists()
    {
        using var context = CreateContext("Topic_Create");

        var subject = new Subject
        {
            UserId = 1, Name = "Database Systems",
            Description = "", ExamDeadline = DateTime.UtcNow.AddDays(10)
        };
        context.Subjects.Add(subject);
        await context.SaveChangesAsync();

        var controller = new TopicsController(context);
        var dto = new CreateTopicDto
        {
            SubjectId = subject.Id,
            Title = "SQL Joins",
            Difficulty = "Hard",
            Status = "Not Started"
        };

        var result = await controller.CreateTopic(dto);

        var ok = Assert.IsType<OkObjectResult>(result);
        var topic = Assert.IsType<Topic>(ok.Value);
        Assert.Equal("SQL Joins", topic.Title);
        Assert.Equal("Hard", topic.Difficulty);
        Assert.Equal(subject.Id, topic.SubjectId);
        Assert.Equal(1, context.Topics.Count());
    }

    [Fact]
    public async Task CreateTopic_ReturnsBadRequest_WhenSubjectDoesNotExist()
    {
        using var context = CreateContext("Topic_NoSubject");
        var controller = new TopicsController(context);

        var dto = new CreateTopicDto
        {
            SubjectId = 999,  // does not exist
            Title = "SQL Joins",
            Difficulty = "Medium",
            Status = "Not Started"
        };

        var result = await controller.CreateTopic(dto);

        Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal(0, context.Topics.Count());
    }

    [Fact]
    public async Task GetTopicsBySubjectId_ReturnsTopicsForCorrectSubject()
    {
        using var context = CreateContext("Topic_BySubject");

        var subject = new Subject
        {
            UserId = 1, Name = "Database Systems",
            Description = "", ExamDeadline = DateTime.UtcNow.AddDays(5)
        };
        context.Subjects.Add(subject);
        await context.SaveChangesAsync();

        context.Topics.AddRange(
            new Topic { SubjectId = subject.Id, Title = "SQL Joins", Difficulty = "Hard", Status = "Not Started" },
            new Topic { SubjectId = subject.Id, Title = "Normalization", Difficulty = "Medium", Status = "In Progress" }
        );
        await context.SaveChangesAsync();

        var controller = new TopicsController(context);
        var result = await controller.GetTopicsBySubjectId(subject.Id);

        var ok = Assert.IsType<OkObjectResult>(result);
        var topics = Assert.IsAssignableFrom<IEnumerable<Topic>>(ok.Value);
        Assert.Equal(2, topics.Count());
        Assert.All(topics, t => Assert.Equal(subject.Id, t.SubjectId));
    }

    [Fact]
    public async Task GetTopicById_ReturnsOk_WhenTopicExists()
    {
        using var context = CreateContext("Topic_GetById");

        var subject = new Subject
        {
            UserId = 1, Name = "DB", Description = "",
            ExamDeadline = DateTime.UtcNow.AddDays(5)
        };
        context.Subjects.Add(subject);
        await context.SaveChangesAsync();

        var topic = new Topic
        {
            SubjectId = subject.Id, Title = "SQL Joins",
            Difficulty = "Hard", Status = "Not Started"
        };
        context.Topics.Add(topic);
        await context.SaveChangesAsync();

        var controller = new TopicsController(context);
        var result = await controller.GetTopicById(topic.Id);

        var ok = Assert.IsType<OkObjectResult>(result);
        var found = Assert.IsType<Topic>(ok.Value);
        Assert.Equal("SQL Joins", found.Title);
    }

    [Fact]
    public async Task GetTopicById_ReturnsNotFound_WhenTopicDoesNotExist()
    {
        using var context = CreateContext("Topic_NotFound");
        var controller = new TopicsController(context);

        var result = await controller.GetTopicById(9999);

        Assert.IsType<NotFoundObjectResult>(result);
    }
}
