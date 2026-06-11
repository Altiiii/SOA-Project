using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyService.Controllers;
using StudyService.Data;
using StudyService.DTOs;
using StudyService.Models;
using System.Security.Claims;
using System.Text.Json;
using Xunit;

namespace StudyService.Tests;

public class DataIsolationTests
{
    private static StudyDbContext CreateContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<StudyDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;
        return new StudyDbContext(options);
    }

    private static StudySessionsController CreateSessionController(StudyDbContext context, int userId)
    {
        var controller = new StudySessionsController(context);
        var claims = new List<Claim> { new Claim(ClaimTypes.NameIdentifier, userId.ToString()) };
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(new ClaimsIdentity(claims, "Test"))
            }
        };
        return controller;
    }

    private static QuizResultsController CreateQuizController(StudyDbContext context, int userId)
    {
        var controller = new QuizResultsController(context);
        var claims = new List<Claim> { new Claim(ClaimTypes.NameIdentifier, userId.ToString()) };
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(new ClaimsIdentity(claims, "Test"))
            }
        };
        return controller;
    }

    private static ProgressController CreateProgressController(StudyDbContext context, int userId)
    {
        var controller = new ProgressController(context);
        var claims = new List<Claim> { new Claim(ClaimTypes.NameIdentifier, userId.ToString()) };
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
    public async Task StudentA_CannotSeeStudentB_StudySessions()
    {
        using var context = CreateContext("Isolation_Sessions");

        // Student B adds a session
        var studentBCtrl = CreateSessionController(context, userId: 2);
        await studentBCtrl.CreateStudySession(new CreateStudySessionDto
        {
            UserId = 2, SubjectId = 1, TopicId = 1, DurationMinutes = 90, Notes = "Student B"
        });

        // Student A requests sessions — should see empty list
        var studentACtrl = CreateSessionController(context, userId: 1);
        var result = await studentACtrl.GetStudySessionsByUserId(1);

        var ok = Assert.IsType<OkObjectResult>(result);
        var sessions = Assert.IsAssignableFrom<IEnumerable<StudySession>>(ok.Value);
        Assert.Empty(sessions);
    }

    [Fact]
    public async Task StudentA_CannotDeleteStudentB_StudySession()
    {
        using var context = CreateContext("Isolation_DeleteSession");

        // Student B adds session
        var studentBCtrl = CreateSessionController(context, userId: 2);
        var createResult = await studentBCtrl.CreateStudySession(new CreateStudySessionDto
        {
            UserId = 2, SubjectId = 1, TopicId = 1, DurationMinutes = 60, Notes = ""
        });
        var createdSession = ((OkObjectResult)createResult).Value as StudySession;

        // Student A tries to delete Student B's session
        var studentACtrl = CreateSessionController(context, userId: 1);
        var deleteResult = await studentACtrl.DeleteStudySession(createdSession!.Id);

        Assert.IsType<NotFoundObjectResult>(deleteResult);
        Assert.Equal(1, context.StudySessions.Count());
    }

    [Fact]
    public async Task StudentA_CannotSeeStudentB_QuizResults()
    {
        using var context = CreateContext("Isolation_QuizResults");

        // Student B adds a quiz result
        var studentBCtrl = CreateQuizController(context, userId: 2);
        await studentBCtrl.CreateQuizResult(new CreateQuizResultDto
        {
            UserId = 2, SubjectId = 1, TopicId = 1, Score = 9, TotalQuestions = 10
        });

        // Student A requests quiz results — should see empty list
        var studentACtrl = CreateQuizController(context, userId: 1);
        var result = await studentACtrl.GetQuizResultsByUserId(1);

        var ok = Assert.IsType<OkObjectResult>(result);
        var quizzes = Assert.IsAssignableFrom<IEnumerable<QuizResult>>(ok.Value);
        Assert.Empty(quizzes);
    }

    [Fact]
    public async Task StudentA_CannotDeleteStudentB_QuizResult()
    {
        using var context = CreateContext("Isolation_DeleteQuiz");

        var studentBCtrl = CreateQuizController(context, userId: 2);
        var createResult = await studentBCtrl.CreateQuizResult(new CreateQuizResultDto
        {
            UserId = 2, SubjectId = 1, TopicId = 1, Score = 7, TotalQuestions = 10
        });
        var createdQuiz = ((OkObjectResult)createResult).Value as QuizResult;

        var studentACtrl = CreateQuizController(context, userId: 1);
        var deleteResult = await studentACtrl.DeleteQuizResult(createdQuiz!.Id);

        Assert.IsType<NotFoundObjectResult>(deleteResult);
        Assert.Equal(1, context.QuizResults.Count());
    }

    [Fact]
    public async Task Progress_OnlyShowsCurrentUser_StudyMinutes()
    {
        using var context = CreateContext("Isolation_ProgressMinutes");

        // Student A: 60 minutes
        context.StudySessions.Add(new StudySession { UserId = 1, SubjectId = 1, TopicId = 1, DurationMinutes = 60, Notes = "" });
        // Student B: 500 minutes
        context.StudySessions.Add(new StudySession { UserId = 2, SubjectId = 1, TopicId = 1, DurationMinutes = 500, Notes = "" });
        await context.SaveChangesAsync();

        var studentACtrl = CreateProgressController(context, userId: 1);
        var result = await studentACtrl.GetUserProgress(1);

        var ok = Assert.IsType<OkObjectResult>(result);
        var json = JsonSerializer.Serialize(ok.Value);
        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;

        Assert.Equal(60, root.GetProperty("TotalStudyMinutes").GetInt32());
    }

    [Fact]
    public async Task Progress_WeakAreas_OnlyFromCurrentUser_QuizResults()
    {
        using var context = CreateContext("Isolation_WeakAreas");

        // Student A: perfect score (no weak areas)
        context.QuizResults.Add(new QuizResult { UserId = 1, SubjectId = 1, TopicId = 1, Score = 10, TotalQuestions = 10 });

        // Student B: very weak (should NOT appear in Student A's weak areas)
        context.QuizResults.Add(new QuizResult { UserId = 2, SubjectId = 1, TopicId = 2, Score = 1, TotalQuestions = 10 });
        context.QuizResults.Add(new QuizResult { UserId = 2, SubjectId = 1, TopicId = 3, Score = 2, TotalQuestions = 10 });

        await context.SaveChangesAsync();

        var studentACtrl = CreateProgressController(context, userId: 1);
        var result = await studentACtrl.GetUserProgress(1);

        var ok = Assert.IsType<OkObjectResult>(result);
        var json = JsonSerializer.Serialize(ok.Value);
        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;

        // Student A has perfect score — no weak areas
        Assert.Equal(0, root.GetProperty("WeakAreas").GetArrayLength());
        Assert.Equal(100.0, root.GetProperty("AverageScorePercentage").GetDouble());
    }

    [Fact]
    public async Task CreatedSession_UsesJwtUserId_NotDtoUserId()
    {
        using var context = CreateContext("Isolation_JwtOverridesDto");

        // Logged in as user 5, but DTO claims userId=1 (attempting to spoof)
        var controller = CreateSessionController(context, userId: 5);
        await controller.CreateStudySession(new CreateStudySessionDto
        {
            UserId = 1,  // spoofed userId in body
            SubjectId = 1, TopicId = 1, DurationMinutes = 60, Notes = ""
        });

        // The saved session must have userId=5 (from JWT), not 1 (from DTO)
        var savedSession = context.StudySessions.Single();
        Assert.Equal(5, savedSession.UserId);
    }

    [Fact]
    public async Task CreatedQuizResult_UsesJwtUserId_NotDtoUserId()
    {
        using var context = CreateContext("Isolation_QuizJwt");

        var controller = CreateQuizController(context, userId: 7);
        await controller.CreateQuizResult(new CreateQuizResultDto
        {
            UserId = 1,  // spoofed userId in body
            SubjectId = 1, TopicId = 1, Score = 8, TotalQuestions = 10
        });

        var savedQuiz = context.QuizResults.Single();
        Assert.Equal(7, savedQuiz.UserId);
    }
}
