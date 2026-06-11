using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyService.Controllers;
using StudyService.Data;
using StudyService.DTOs;
using StudyService.Models;
using System.Security.Claims;
using Xunit;

namespace StudyService.Tests;

public class QuizResultsControllerTests
{
    private static StudyDbContext CreateContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<StudyDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;
        return new StudyDbContext(options);
    }

    private static QuizResultsController CreateController(StudyDbContext context, int userId = 1)
    {
        var controller = new QuizResultsController(context);
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
    public async Task CreateQuizResult_ReturnsOk_AndPersistsToDatabase()
    {
        using var context = CreateContext("Quiz_Create");
        var controller = CreateController(context, userId: 1);

        var dto = new CreateQuizResultDto
        {
            UserId = 1, SubjectId = 1, TopicId = 1,
            Score = 7, TotalQuestions = 10
        };

        var result = await controller.CreateQuizResult(dto);

        var ok = Assert.IsType<OkObjectResult>(result);
        var quiz = Assert.IsType<QuizResult>(ok.Value);
        Assert.Equal(7, quiz.Score);
        Assert.Equal(10, quiz.TotalQuestions);
        Assert.Equal(1, quiz.UserId);
        Assert.Equal(1, context.QuizResults.Count());
    }

    [Fact]
    public async Task CreateQuizResult_ReturnsBadRequest_WhenScoreExceedsTotalQuestions()
    {
        using var context = CreateContext("Quiz_ScoreExceedsTotal");
        var controller = CreateController(context, userId: 1);

        var dto = new CreateQuizResultDto
        {
            UserId = 1, SubjectId = 1, TopicId = 1,
            Score = 15, TotalQuestions = 10
        };

        var result = await controller.CreateQuizResult(dto);

        Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal(0, context.QuizResults.Count());
    }

    [Fact]
    public async Task CreateQuizResult_ReturnsBadRequest_WhenTotalQuestionsIsZero()
    {
        using var context = CreateContext("Quiz_ZeroTotal");
        var controller = CreateController(context, userId: 1);

        var dto = new CreateQuizResultDto
        {
            UserId = 1, SubjectId = 1, TopicId = 1,
            Score = 0, TotalQuestions = 0
        };

        var result = await controller.CreateQuizResult(dto);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task GetQuizResultsByUserId_ReturnsOnlyResultsForThatUser()
    {
        using var context = CreateContext("Quiz_GetByUser");

        context.QuizResults.AddRange(
            new QuizResult { UserId = 1, SubjectId = 1, TopicId = 1, Score = 8, TotalQuestions = 10 },
            new QuizResult { UserId = 1, SubjectId = 1, TopicId = 2, Score = 6, TotalQuestions = 10 },
            new QuizResult { UserId = 2, SubjectId = 1, TopicId = 1, Score = 9, TotalQuestions = 10 }
        );
        await context.SaveChangesAsync();

        // Request as user 1 — should only see user 1's 2 results
        var controller = CreateController(context, userId: 1);
        var result = await controller.GetQuizResultsByUserId(1);

        var ok = Assert.IsType<OkObjectResult>(result);
        var quizzes = Assert.IsAssignableFrom<IEnumerable<QuizResult>>(ok.Value);
        Assert.Equal(2, quizzes.Count());
        Assert.All(quizzes, q => Assert.Equal(1, q.UserId));
    }

    [Fact]
    public async Task DeleteQuizResult_RemovesFromDatabase()
    {
        using var context = CreateContext("Quiz_Delete");

        var quiz = new QuizResult
        {
            UserId = 1, SubjectId = 1, TopicId = 1, Score = 5, TotalQuestions = 10
        };
        context.QuizResults.Add(quiz);
        await context.SaveChangesAsync();

        var controller = CreateController(context, userId: 1);
        var result = await controller.DeleteQuizResult(quiz.Id);

        Assert.IsType<OkObjectResult>(result);
        Assert.Equal(0, context.QuizResults.Count());
    }
}
