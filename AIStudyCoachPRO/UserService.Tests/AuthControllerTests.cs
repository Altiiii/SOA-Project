using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using UserService.Controllers;
using UserService.Data;
using UserService.DTOs;
using UserService.Models;
using UserService.Services;
using Xunit;

namespace UserService.Tests;

public class AuthControllerTests
{
    private static AppDbContext CreateContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;
        return new AppDbContext(options);
    }

    // Uses real ConfigurationBuilder — no Moq needed here
    private static TokenService CreateTokenService()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = "TestSecretKey_AtLeast32CharsForHmacSha256_Test!",
                ["Jwt:Issuer"] = "AIStudyCoachTestIssuer",
                ["Jwt:Audience"] = "AIStudyCoachTestAudience"
            })
            .Build();
        return new TokenService(config);
    }

    // Uses Moq to demonstrate mock of IConfiguration
    private static TokenService CreateTokenServiceViaMoq()
    {
        var mockConfig = new Mock<IConfiguration>();
        mockConfig.Setup(c => c["Jwt:Key"]).Returns("TestSecretKey_AtLeast32CharsForMoq_Test!!");
        mockConfig.Setup(c => c["Jwt:Issuer"]).Returns("MockIssuer");
        mockConfig.Setup(c => c["Jwt:Audience"]).Returns("MockAudience");
        return new TokenService(mockConfig.Object);
    }

    [Fact]
    public async Task Register_ReturnsOk_WhenDataIsValid()
    {
        using var context = CreateContext("Auth_Register");
        var controller = new AuthController(context, CreateTokenService());

        var dto = new RegisterDto
        {
            FullName = "Edon Meti",
            Email = "edon@studycoach.com",
            Password = "Student123!",
            Role = "Student"
        };

        var result = await controller.Register(dto);

        Assert.IsType<OkObjectResult>(result);
        Assert.Equal(1, context.Users.Count());
    }

    [Fact]
    public async Task Register_HashesPassword_NotStoredAsPlainText()
    {
        using var context = CreateContext("Auth_PasswordHash");
        var controller = new AuthController(context, CreateTokenService());

        await controller.Register(new RegisterDto
        {
            FullName = "Test User", Email = "hash@test.com",
            Password = "PlainTextPassword!", Role = "Student"
        });

        var user = context.Users.Single();
        Assert.NotEqual("PlainTextPassword!", user.PasswordHash);
        Assert.NotEmpty(user.PasswordHash);
    }

    [Fact]
    public async Task Register_ReturnsBadRequest_WhenEmailAlreadyExists()
    {
        using var context = CreateContext("Auth_DuplicateEmail");

        context.Users.Add(new ApplicationUser
        {
            FullName = "Existing User",
            Email = "taken@test.com",
            Role = "Student",
            PasswordHash = "anyhash"
        });
        await context.SaveChangesAsync();

        var controller = new AuthController(context, CreateTokenService());
        var result = await controller.Register(new RegisterDto
        {
            FullName = "New User",
            Email = "taken@test.com",
            Password = "Password123!",
            Role = "Student"
        });

        Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal(1, context.Users.Count());  // user count unchanged
    }

    [Fact]
    public async Task Register_ReturnsBadRequest_WhenRoleIsInvalid()
    {
        using var context = CreateContext("Auth_InvalidRole");
        var controller = new AuthController(context, CreateTokenService());

        var result = await controller.Register(new RegisterDto
        {
            FullName = "Test User",
            Email = "test@test.com",
            Password = "Password123!",
            Role = "SuperAdmin"  // not Admin or Student
        });

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task Login_ReturnsOkWithToken_WhenCredentialsAreValid()
    {
        using var context = CreateContext("Auth_Login");
        var tokenService = CreateTokenService();
        var controller = new AuthController(context, tokenService);

        await controller.Register(new RegisterDto
        {
            FullName = "Login User",
            Email = "login@test.com",
            Password = "Password123!",
            Role = "Student"
        });

        var result = await controller.Login(new LoginDto
        {
            Email = "login@test.com",
            Password = "Password123!"
        });

        var ok = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<AuthResponseDto>(ok.Value);
        Assert.NotEmpty(response.Token);
        Assert.Equal("login@test.com", response.Email);
        Assert.Equal("Student", response.Role);
    }

    [Fact]
    public async Task Login_ReturnsOkWithToken_WhenUsingMockedConfiguration()
    {
        using var context = CreateContext("Auth_LoginMoq");
        var tokenService = CreateTokenServiceViaMoq();  // Moq-based TokenService
        var controller = new AuthController(context, tokenService);

        await controller.Register(new RegisterDto
        {
            FullName = "Moq User",
            Email = "moq@test.com",
            Password = "Password123!",
            Role = "Student"
        });

        var result = await controller.Login(new LoginDto
        {
            Email = "moq@test.com",
            Password = "Password123!"
        });

        var ok = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<AuthResponseDto>(ok.Value);
        Assert.NotEmpty(response.Token);
    }

    [Fact]
    public async Task Login_ReturnsUnauthorized_WhenEmailNotFound()
    {
        using var context = CreateContext("Auth_LoginNotFound");
        var controller = new AuthController(context, CreateTokenService());

        var result = await controller.Login(new LoginDto
        {
            Email = "nobody@test.com",
            Password = "Password123!"
        });

        Assert.IsType<UnauthorizedObjectResult>(result);
    }

    [Fact]
    public async Task Login_ReturnsUnauthorized_WhenPasswordIsIncorrect()
    {
        using var context = CreateContext("Auth_WrongPassword");
        var controller = new AuthController(context, CreateTokenService());

        await controller.Register(new RegisterDto
        {
            FullName = "Test User",
            Email = "pass@test.com",
            Password = "CorrectPassword123!",
            Role = "Student"
        });

        var result = await controller.Login(new LoginDto
        {
            Email = "pass@test.com",
            Password = "WrongPassword!"
        });

        Assert.IsType<UnauthorizedObjectResult>(result);
    }
}
