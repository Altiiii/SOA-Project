using RecommendationService.DTOs;
using RecommendationService.Services;
using Xunit;

namespace RecommendationService.Tests;

public class RecommendationEngineTests
{
    private readonly RecommendationEngine _engine = new();

    private static RecommendationRequestDto BuildRequest(
        double avgScore,
        int studyMinutes,
        int daysUntilExam,
        int weakAreasCount,
        int totalQuizzes,
        List<string>? weakAreas = null,
        string subjectName = "Test Subject",
        int subjectId = 1,
        int userId = 1)
    {
        return new RecommendationRequestDto
        {
            UserId = userId,
            SubjectId = subjectId,
            SubjectName = subjectName,
            ExamDeadline = DateTime.UtcNow.AddDays(daysUntilExam).ToString("O"),
            TotalStudyMinutes = studyMinutes,
            AverageScorePercentage = avgScore,
            DaysUntilExam = daysUntilExam,
            WeakAreasCount = weakAreasCount,
            TotalQuizzes = totalQuizzes,
            WeakAreas = weakAreas ?? new List<string>()
        };
    }

    [Fact]
    public void Analyze_ReturnsHighRiskAndLowPrediction_WhenLowScoreCloseExamMultipleWeakAreas()
    {
        // avg < 50%, exam <= 3 days, weak areas >= 2 → High Risk, Low Prediction
        var request = BuildRequest(
            avgScore: 40.0,
            studyMinutes: 30,
            daysUntilExam: 2,
            weakAreasCount: 2,
            totalQuizzes: 2,
            weakAreas: new List<string> { "SQL Joins", "Normalization" },
            subjectName: "Database Systems");

        var result = _engine.Analyze(request);

        Assert.Equal("High", result.RiskLevel);
        Assert.Equal("Low", result.ExamSuccessPrediction);
        Assert.NotEmpty(result.Recommendations);
    }

    [Fact]
    public void Analyze_ReturnsLowRiskAndHighPrediction_WhenHighScoreGoodStudyNoWeakAreas()
    {
        // avg >= 85%, study >= 300 min, 20 days, 0 weak areas → Low Risk, High Prediction
        var request = BuildRequest(
            avgScore: 88.0,
            studyMinutes: 400,
            daysUntilExam: 20,
            weakAreasCount: 0,
            totalQuizzes: 5,
            subjectName: "Mathematics");

        var result = _engine.Analyze(request);

        Assert.Equal("Low", result.RiskLevel);
        Assert.Equal("High", result.ExamSuccessPrediction);
        Assert.NotEmpty(result.Recommendations);
    }

    [Fact]
    public void Analyze_ReturnsMediumRisk_WhenModerateScoreAndOneWeakArea()
    {
        // score=60%(+2), weakAreas=1(+1), days=6(+2), study=150min <300(+1) → total=6 → Medium
        var request = BuildRequest(
            avgScore: 60.0,
            studyMinutes: 150,
            daysUntilExam: 6,
            weakAreasCount: 1,
            totalQuizzes: 2,
            weakAreas: new List<string> { "Thermodynamics" },
            subjectName: "Physics");

        var result = _engine.Analyze(request);

        Assert.Equal("Medium", result.RiskLevel);
        Assert.Equal("Medium", result.ExamSuccessPrediction);
    }

    [Fact]
    public void Analyze_ReadinessScore_IsAlwaysBetween0And100()
    {
        // Worst case: no data, imminent exam, many weak areas
        var worstCase = BuildRequest(
            avgScore: 0, studyMinutes: 0, daysUntilExam: 1,
            weakAreasCount: 5, totalQuizzes: 0);
        Assert.InRange(_engine.Analyze(worstCase).ReadinessScore, 0, 100);

        // Best case: perfect score, lots of study, many days
        var bestCase = BuildRequest(
            avgScore: 100, studyMinutes: 600, daysUntilExam: 30,
            weakAreasCount: 0, totalQuizzes: 10);
        Assert.InRange(_engine.Analyze(bestCase).ReadinessScore, 0, 100);
    }

    [Fact]
    public void Analyze_ReadinessScore_IsHigherForBetterPerformance()
    {
        var good = BuildRequest(avgScore: 90, studyMinutes: 400, daysUntilExam: 20,
            weakAreasCount: 0, totalQuizzes: 5);
        var bad = BuildRequest(avgScore: 30, studyMinutes: 20, daysUntilExam: 1,
            weakAreasCount: 3, totalQuizzes: 1);

        Assert.True(_engine.Analyze(good).ReadinessScore > _engine.Analyze(bad).ReadinessScore);
    }

    [Fact]
    public void Analyze_ReturnsWeakAreaNames_PassedThroughToResponse()
    {
        var weakAreas = new List<string> { "SQL Joins", "Normalization" };
        var request = BuildRequest(
            avgScore: 40.0, studyMinutes: 60, daysUntilExam: 5,
            weakAreasCount: 2, totalQuizzes: 2,
            weakAreas: weakAreas);

        var result = _engine.Analyze(request);

        Assert.Equal(2, result.WeakAreas.Count);
        Assert.Contains("SQL Joins", result.WeakAreas);
        Assert.Contains("Normalization", result.WeakAreas);
    }

    [Fact]
    public void Analyze_SummaryMessage_ContainsSubjectName()
    {
        var request = BuildRequest(
            avgScore: 40.0, studyMinutes: 50, daysUntilExam: 3,
            weakAreasCount: 1, totalQuizzes: 1,
            weakAreas: new List<string> { "SQL Joins" },
            subjectName: "Database Systems");

        var result = _engine.Analyze(request);

        Assert.Contains("Database Systems", result.SummaryMessage);
    }

    [Fact]
    public void Analyze_WhenNoQuizData_ReturnsRecommendationMentioningQuiz()
    {
        var request = BuildRequest(
            avgScore: 0, studyMinutes: 100, daysUntilExam: 10,
            weakAreasCount: 0, totalQuizzes: 0);

        var result = _engine.Analyze(request);

        Assert.True(
            result.Recommendations.Any(r => r.Contains("quiz") || r.Contains("Quiz")),
            "Expected a recommendation mentioning quiz results when TotalQuizzes is 0");
    }

    [Fact]
    public void Analyze_ResponsePreservesSubjectIdAndUserId()
    {
        var request = BuildRequest(
            avgScore: 80.0, studyMinutes: 200, daysUntilExam: 15,
            weakAreasCount: 0, totalQuizzes: 3,
            subjectName: "Algorithms", subjectId: 5, userId: 7);

        var result = _engine.Analyze(request);

        Assert.Equal(7, result.UserId);
        Assert.Equal(5, result.SubjectId);
        Assert.Equal("Algorithms", result.SubjectName);
        Assert.Equal(15, result.DaysUntilExam);
    }

    [Fact]
    public void Analyze_WhenExamVeryClose_RecommendationsAreUrgent()
    {
        var request = BuildRequest(
            avgScore: 50.0, studyMinutes: 60, daysUntilExam: 1,
            weakAreasCount: 0, totalQuizzes: 2);

        var result = _engine.Analyze(request);

        // With 1 day left, risk should not be Low
        Assert.NotEqual("Low", result.RiskLevel);
    }
}
