using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyService.Controllers;
using StudyService.Data;
using StudyService.DTOs;
using StudyService.Models;
using Xunit;

namespace StudyService.Tests;

public class StudySessionsControllerTests
{
    private static StudyDbContext CreateContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<StudyDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;
        return new StudyDbContext(options);
    }

    [Fact]
    public async Task CreateStudySession_ReturnsOk_AndPersistsDuration()
    {
        using var context = CreateContext("Session_Create");
        var controller = new StudySessionsController(context);

        var dto = new CreateStudySessionDto
        {
            UserId = 1, SubjectId = 1, TopicId = 1,
            DurationMinutes = 60, Notes = "Studied SQL Joins"
        };

        var result = await controller.CreateStudySession(dto);

        var ok = Assert.IsType<OkObjectResult>(result);
        var session = Assert.IsType<StudySession>(ok.Value);
        Assert.Equal(60, session.DurationMinutes);
        Assert.Equal("Studied SQL Joins", session.Notes);
        Assert.Equal(1, context.StudySessions.Count());
    }

    [Fact]
    public async Task CreateStudySession_ReturnsBadRequest_WhenDurationIsZero()
    {
        using var context = CreateContext("Session_ZeroDuration");
        var controller = new StudySessionsController(context);

        var dto = new CreateStudySessionDto
        {
            UserId = 1, SubjectId = 1, TopicId = 1,
            DurationMinutes = 0, Notes = ""
        };

        var result = await controller.CreateStudySession(dto);

        Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal(0, context.StudySessions.Count());
    }

    [Fact]
    public async Task CreateStudySession_ReturnsBadRequest_WhenDurationIsNegative()
    {
        using var context = CreateContext("Session_NegDuration");
        var controller = new StudySessionsController(context);

        var dto = new CreateStudySessionDto
        {
            UserId = 1, SubjectId = 1, TopicId = 1,
            DurationMinutes = -30, Notes = ""
        };

        var result = await controller.CreateStudySession(dto);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task GetStudySessionsByUserId_ReturnsOnlyThatUsersData()
    {
        using var context = CreateContext("Session_GetByUser");

        context.StudySessions.AddRange(
            new StudySession { UserId = 1, SubjectId = 1, TopicId = 1, DurationMinutes = 60, Notes = "" },
            new StudySession { UserId = 1, SubjectId = 2, TopicId = 2, DurationMinutes = 45, Notes = "" },
            new StudySession { UserId = 2, SubjectId = 1, TopicId = 1, DurationMinutes = 90, Notes = "" }
        );
        await context.SaveChangesAsync();

        var controller = new StudySessionsController(context);
        var result = await controller.GetStudySessionsByUserId(1);

        var ok = Assert.IsType<OkObjectResult>(result);
        var sessions = Assert.IsAssignableFrom<IEnumerable<StudySession>>(ok.Value);
        Assert.Equal(2, sessions.Count());
        Assert.All(sessions, s => Assert.Equal(1, s.UserId));
    }
}
