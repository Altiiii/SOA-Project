using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SubjectService.Controllers;
using SubjectService.Data;
using SubjectService.DTOs;
using SubjectService.Models;
using System.Security.Claims;
using Xunit;

namespace SubjectService.Tests;

public class SubjectsControllerTests
{
    private static SubjectDbContext CreateContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<SubjectDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;
        return new SubjectDbContext(options);
    }

    private static SubjectsController CreateController(SubjectDbContext context, int userId = 1)
    {
        var controller = new SubjectsController(context);
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
    public async Task CreateSubject_ReturnsOk_WithCorrectData()
    {
        using var context = CreateContext("Subject_Create");
        var controller = CreateController(context, userId: 1);

        var dto = new CreateSubjectDto
        {
            UserId = 1,
            Name = "Database Systems",
            Description = "SQL and relational databases",
            ExamDeadline = DateTime.UtcNow.AddDays(10),
            Priority = "High"
        };

        var result = await controller.CreateSubject(dto);

        var ok = Assert.IsType<OkObjectResult>(result);
        var subject = Assert.IsType<Subject>(ok.Value);
        Assert.Equal("Database Systems", subject.Name);
        Assert.Equal("High", subject.Priority);
        Assert.Equal(1, subject.UserId);
        Assert.Equal(1, context.Subjects.Count());
    }

    [Fact]
    public async Task GetSubjectById_ReturnsOk_WhenSubjectExists()
    {
        using var context = CreateContext("Subject_GetById");

        var subject = new Subject
        {
            UserId = 1,
            Name = "Mathematics",
            Description = "Calculus and algebra",
            ExamDeadline = DateTime.UtcNow.AddDays(5),
            Priority = "Medium"
        };
        context.Subjects.Add(subject);
        await context.SaveChangesAsync();

        var controller = CreateController(context, userId: 1);
        var result = await controller.GetSubjectById(subject.Id);

        var ok = Assert.IsType<OkObjectResult>(result);
        var found = Assert.IsType<Subject>(ok.Value);
        Assert.Equal("Mathematics", found.Name);
        Assert.Equal(subject.Id, found.Id);
    }

    [Fact]
    public async Task GetSubjectById_ReturnsNotFound_WhenSubjectDoesNotExist()
    {
        using var context = CreateContext("Subject_NotFound");
        var controller = CreateController(context, userId: 1);

        var result = await controller.GetSubjectById(999);

        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task GetSubjectsByUserId_ReturnsOnlySubjectsForThatUser()
    {
        using var context = CreateContext("Subject_ByUser");

        context.Subjects.AddRange(
            new Subject { UserId = 1, Name = "Math", Description = "", ExamDeadline = DateTime.UtcNow.AddDays(5), Priority = "High" },
            new Subject { UserId = 1, Name = "Physics", Description = "", ExamDeadline = DateTime.UtcNow.AddDays(7), Priority = "Medium" },
            new Subject { UserId = 2, Name = "Chemistry", Description = "", ExamDeadline = DateTime.UtcNow.AddDays(3), Priority = "Low" }
        );
        await context.SaveChangesAsync();

        var controller = CreateController(context, userId: 1);
        var result = await controller.GetSubjectsByUserId(1);

        var ok = Assert.IsType<OkObjectResult>(result);
        var subjects = Assert.IsAssignableFrom<IEnumerable<Subject>>(ok.Value);
        Assert.Equal(2, subjects.Count());
        Assert.All(subjects, s => Assert.Equal(1, s.UserId));
    }

    [Fact]
    public async Task DeleteSubject_ReturnsOk_AndRemovesFromDatabase()
    {
        using var context = CreateContext("Subject_Delete");

        var subject = new Subject
        {
            UserId = 1,
            Name = "Temp Subject",
            Description = "To be deleted",
            ExamDeadline = DateTime.UtcNow.AddDays(5),
            Priority = "Low"
        };
        context.Subjects.Add(subject);
        await context.SaveChangesAsync();

        var controller = CreateController(context, userId: 1);
        var result = await controller.DeleteSubject(subject.Id);

        Assert.IsType<OkObjectResult>(result);
        Assert.Equal(0, context.Subjects.Count());
    }

    [Fact]
    public async Task DeleteSubject_ReturnsNotFound_WhenSubjectDoesNotExist()
    {
        using var context = CreateContext("Subject_DeleteNotFound");
        var controller = CreateController(context, userId: 1);

        var result = await controller.DeleteSubject(999);

        Assert.IsType<NotFoundObjectResult>(result);
    }
}
