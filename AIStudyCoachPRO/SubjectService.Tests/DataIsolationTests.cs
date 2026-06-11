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

public class DataIsolationTests
{
    private static SubjectDbContext CreateContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<SubjectDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;
        return new SubjectDbContext(options);
    }

    private static SubjectsController CreateSubjectsController(SubjectDbContext context, int userId)
    {
        var controller = new SubjectsController(context);
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

    private static TopicsController CreateTopicsController(SubjectDbContext context, int userId)
    {
        var controller = new TopicsController(context);
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
    public async Task StudentA_CannotSeeStudentB_Subjects()
    {
        using var context = CreateContext("Isolation_Subjects");

        // Student B creates a subject
        var studentBController = CreateSubjectsController(context, userId: 2);
        await studentBController.CreateSubject(new CreateSubjectDto
        {
            UserId = 2, Name = "Student B Subject",
            Description = "", ExamDeadline = DateTime.UtcNow.AddDays(10), Priority = "High"
        });

        // Student A requests subjects — should see empty list
        var studentAController = CreateSubjectsController(context, userId: 1);
        var result = await studentAController.GetMySubjects();

        var ok = Assert.IsType<OkObjectResult>(result);
        var subjects = Assert.IsAssignableFrom<IEnumerable<Subject>>(ok.Value);
        Assert.Empty(subjects);
    }

    [Fact]
    public async Task StudentA_CannotSeeStudentB_SubjectById()
    {
        using var context = CreateContext("Isolation_SubjectById");

        // Student B creates a subject
        var studentBCtrl = CreateSubjectsController(context, userId: 2);
        var createResult = await studentBCtrl.CreateSubject(new CreateSubjectDto
        {
            UserId = 2, Name = "Confidential Subject",
            Description = "", ExamDeadline = DateTime.UtcNow.AddDays(5), Priority = "High"
        });
        var createdSubject = ((OkObjectResult)createResult).Value as Subject;

        // Student A tries to get Student B's subject by ID
        var studentACtrl = CreateSubjectsController(context, userId: 1);
        var result = await studentACtrl.GetSubjectById(createdSubject!.Id);

        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task StudentA_CannotDeleteStudentB_Subject()
    {
        using var context = CreateContext("Isolation_DeleteSubject");

        // Student B creates a subject
        var studentBCtrl = CreateSubjectsController(context, userId: 2);
        var createResult = await studentBCtrl.CreateSubject(new CreateSubjectDto
        {
            UserId = 2, Name = "Student B Subject",
            Description = "", ExamDeadline = DateTime.UtcNow.AddDays(5), Priority = "Medium"
        });
        var createdSubject = ((OkObjectResult)createResult).Value as Subject;

        // Student A attempts to delete Student B's subject
        var studentACtrl = CreateSubjectsController(context, userId: 1);
        var deleteResult = await studentACtrl.DeleteSubject(createdSubject!.Id);

        // Must be NotFound — Student A cannot access Student B's subject
        Assert.IsType<NotFoundObjectResult>(deleteResult);

        // Student B's subject must still exist
        Assert.Equal(1, context.Subjects.Count());
    }

    [Fact]
    public async Task StudentA_CannotSeeStudentB_Topics()
    {
        using var context = CreateContext("Isolation_Topics");

        // Student B creates subject and topic
        var studentBSubjCtrl = CreateSubjectsController(context, userId: 2);
        var subjResult = await studentBSubjCtrl.CreateSubject(new CreateSubjectDto
        {
            UserId = 2, Name = "Student B Subject",
            Description = "", ExamDeadline = DateTime.UtcNow.AddDays(10), Priority = "Medium"
        });
        var subject = ((OkObjectResult)subjResult).Value as Subject;

        var studentBTopicCtrl = CreateTopicsController(context, userId: 2);
        await studentBTopicCtrl.CreateTopic(new CreateTopicDto
        {
            SubjectId = subject!.Id, Title = "Student B Topic",
            Difficulty = "Medium", Status = "Not Started"
        });

        // Student A requests all topics — should see empty list
        var studentATopicCtrl = CreateTopicsController(context, userId: 1);
        var result = await studentATopicCtrl.GetMyTopics();

        var ok = Assert.IsType<OkObjectResult>(result);
        var topics = Assert.IsAssignableFrom<IEnumerable<Topic>>(ok.Value);
        Assert.Empty(topics);
    }

    [Fact]
    public async Task StudentA_CannotCreateTopic_InStudentB_Subject()
    {
        using var context = CreateContext("Isolation_CreateTopic");

        // Student B creates a subject
        var studentBCtrl = CreateSubjectsController(context, userId: 2);
        var subjResult = await studentBCtrl.CreateSubject(new CreateSubjectDto
        {
            UserId = 2, Name = "Student B Subject",
            Description = "", ExamDeadline = DateTime.UtcNow.AddDays(10), Priority = "Medium"
        });
        var subject = ((OkObjectResult)subjResult).Value as Subject;

        // Student A tries to add a topic to Student B's subject
        var studentACtrl = CreateTopicsController(context, userId: 1);
        var result = await studentACtrl.CreateTopic(new CreateTopicDto
        {
            SubjectId = subject!.Id, Title = "Injected Topic",
            Difficulty = "Easy", Status = "Not Started"
        });

        // Must fail — Student A does not own that subject
        Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal(0, context.Topics.Count());
    }

    [Fact]
    public async Task EachStudentSeesOnlyTheirOwnSubjects_WhenBothHaveData()
    {
        using var context = CreateContext("Isolation_BothUsers");

        var studentACtrl = CreateSubjectsController(context, userId: 1);
        var studentBCtrl = CreateSubjectsController(context, userId: 2);

        await studentACtrl.CreateSubject(new CreateSubjectDto
        {
            UserId = 1, Name = "Math", Description = "",
            ExamDeadline = DateTime.UtcNow.AddDays(5), Priority = "High"
        });
        await studentACtrl.CreateSubject(new CreateSubjectDto
        {
            UserId = 1, Name = "Physics", Description = "",
            ExamDeadline = DateTime.UtcNow.AddDays(7), Priority = "Medium"
        });
        await studentBCtrl.CreateSubject(new CreateSubjectDto
        {
            UserId = 2, Name = "Chemistry", Description = "",
            ExamDeadline = DateTime.UtcNow.AddDays(3), Priority = "Low"
        });

        var resultA = await studentACtrl.GetMySubjects();
        var resultB = await studentBCtrl.GetMySubjects();

        var subjectsA = Assert.IsAssignableFrom<IEnumerable<Subject>>(((OkObjectResult)resultA).Value);
        var subjectsB = Assert.IsAssignableFrom<IEnumerable<Subject>>(((OkObjectResult)resultB).Value);

        Assert.Equal(2, subjectsA.Count());
        Assert.Equal(1, subjectsB.Count());
        Assert.All(subjectsA, s => Assert.Equal(1, s.UserId));
        Assert.All(subjectsB, s => Assert.Equal(2, s.UserId));
    }
}
