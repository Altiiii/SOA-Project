using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyService.Controllers;
using StudyService.Data;
using StudyService.Models;
using System.Security.Claims;
using System.Text.Json;
using Xunit;

namespace StudyService.Tests;

public class ProgressControllerTests
{
    private static StudyDbContext CreateContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<StudyDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;
        return new StudyDbContext(options);
    }

    private static ProgressController CreateController(StudyDbContext context, int userId = 1)
    {
        var controller = new ProgressController(context);
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString())
        };
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(new ClaimsIdentity(claims, "Test"))
            }
        };
        return controller;
    }

    [Fact]
    public async Task GetUserProgress_Returns105Minutes_175Hours_55Avg_WithOneWeakArea()
    {
        // 105 study min; quiz 4/10=40% (weak) and 7/10=70% → average 55%
        using var context = CreateContext("Progress_Scenario1");

        context.StudySessions.Add(new StudySession
        {
            UserId = 1, SubjectId = 1, TopicId = 1,
            DurationMinutes = 105, Notes = "SQL Joins session"
        });
        context.QuizResults.Add(new QuizResult
        {
            UserId = 1, SubjectId = 1, TopicId = 1,
            Score = 4, TotalQuestions = 10
        });
        context.QuizResults.Add(new QuizResult
        {
            UserId = 1, SubjectId = 1, TopicId = 2,
            Score = 7, TotalQuestions = 10
        });
        await context.SaveChangesAsync();

        var controller = CreateController(context, userId: 1);
        var result = await controller.GetUserProgress(1);

        var ok = Assert.IsType<OkObjectResult>(result);
        var json = JsonSerializer.Serialize(ok.Value);
        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;

        Assert.Equal(105, root.GetProperty("TotalStudyMinutes").GetInt32());
        Assert.Equal(1.75, root.GetProperty("TotalStudyHours").GetDouble());
        Assert.Equal(55.0, root.GetProperty("AverageScorePercentage").GetDouble());
        Assert.Equal(1, root.GetProperty("WeakAreas").GetArrayLength());
    }

    [Fact]
    public async Task GetUserProgress_DetectsWeakArea_WhenQuizScoreBelow50Percent()
    {
        using var context = CreateContext("Progress_WeakArea");

        context.QuizResults.Add(new QuizResult
        {
            UserId = 1, SubjectId = 1, TopicId = 1,
            Score = 3, TotalQuestions = 10  // 30% — weak
        });
        await context.SaveChangesAsync();

        var controller = CreateController(context, userId: 1);
        var result = await controller.GetUserProgress(1);

        var ok = Assert.IsType<OkObjectResult>(result);
        var json = JsonSerializer.Serialize(ok.Value);
        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;

        Assert.Equal(1, root.GetProperty("WeakAreas").GetArrayLength());
    }

    [Fact]
    public async Task GetUserProgressBySubject_FiltersToSelectedSubjectOnly()
    {
        using var context = CreateContext("Progress_SubjectFilter");

        context.StudySessions.Add(new StudySession
        {
            UserId = 1, SubjectId = 1, TopicId = 1, DurationMinutes = 60, Notes = ""
        });
        context.QuizResults.Add(new QuizResult
        {
            UserId = 1, SubjectId = 1, TopicId = 1, Score = 8, TotalQuestions = 10
        });
        // Subject 2 data — must NOT appear in Subject 1 results
        context.StudySessions.Add(new StudySession
        {
            UserId = 1, SubjectId = 2, TopicId = 3, DurationMinutes = 90, Notes = ""
        });
        context.QuizResults.Add(new QuizResult
        {
            UserId = 1, SubjectId = 2, TopicId = 3, Score = 3, TotalQuestions = 10
        });
        await context.SaveChangesAsync();

        var controller = CreateController(context, userId: 1);
        var result = await controller.GetUserProgressBySubject(1, 1);

        var ok = Assert.IsType<OkObjectResult>(result);
        var json = JsonSerializer.Serialize(ok.Value);
        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;

        Assert.Equal(60, root.GetProperty("TotalStudyMinutes").GetInt32());
        Assert.Equal(1, root.GetProperty("TotalQuizzes").GetInt32());
        Assert.Equal(80.0, root.GetProperty("AverageScorePercentage").GetDouble());
        Assert.Equal(0, root.GetProperty("WeakAreas").GetArrayLength());
    }

    [Fact]
    public async Task GetUserProgressBySubject_ReturnsZeros_WhenNoDataExistsForSubject()
    {
        using var context = CreateContext("Progress_EmptySubject");
        var controller = CreateController(context, userId: 1);

        var result = await controller.GetUserProgressBySubject(1, 99);

        var ok = Assert.IsType<OkObjectResult>(result);
        var json = JsonSerializer.Serialize(ok.Value);
        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;

        Assert.Equal(0, root.GetProperty("TotalStudyMinutes").GetInt32());
        Assert.Equal(0, root.GetProperty("TotalQuizzes").GetInt32());
        Assert.Equal(0.0, root.GetProperty("AverageScorePercentage").GetDouble());
        Assert.Equal(0, root.GetProperty("WeakAreas").GetArrayLength());
    }

    [Fact]
    public async Task GetUserProgress_DoesNotMixDataFromDifferentUsers()
    {
        using var context = CreateContext("Progress_UserIsolation");

        context.StudySessions.Add(new StudySession
        {
            UserId = 1, SubjectId = 1, TopicId = 1, DurationMinutes = 60, Notes = ""
        });
        context.StudySessions.Add(new StudySession
        {
            UserId = 2, SubjectId = 1, TopicId = 1, DurationMinutes = 200, Notes = ""
        });
        await context.SaveChangesAsync();

        var controller = CreateController(context, userId: 1);
        var result = await controller.GetUserProgress(1);

        var ok = Assert.IsType<OkObjectResult>(result);
        var json = JsonSerializer.Serialize(ok.Value);
        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;

        Assert.Equal(60, root.GetProperty("TotalStudyMinutes").GetInt32());
        Assert.Equal(1, root.GetProperty("TotalStudySessions").GetInt32());
    }
}
