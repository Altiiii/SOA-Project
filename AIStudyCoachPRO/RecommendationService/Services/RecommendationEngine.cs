using RecommendationService.DTOs;

namespace RecommendationService.Services
{
    public class RecommendationEngine
    {
        public RecommendationResponseDto Analyze(RecommendationRequestDto request)
        {
            var recommendations = new List<string>();
            var riskPoints = 0;

            bool hasQuizData = request.TotalQuizzes > 0;
            bool hasStudyData = request.TotalStudyMinutes > 0;

            // ---- Data availability check ----
            if (!hasQuizData && !hasStudyData)
            {
                recommendations.Add("Nuk ka ende të dhëna studimi për këtë lëndë. Fillo duke shtuar sesione studimi dhe quiz rezultate.");
                riskPoints += 4;
            }
            else if (!hasQuizData)
            {
                recommendations.Add("Ke regjistruar kohë studimi, por ende nuk ka rezultate quiz-i për këtë lëndë. Për një parashikim më të saktë, shto të paktën një quiz result.");
                riskPoints += 2;
            }
            else if (!hasStudyData)
            {
                recommendations.Add("Ke rezultate quiz-i, por nuk ke regjistruar kohë studimi. Regjistro sesionet e studimit për analizë më të saktë.");
                riskPoints += 1;
            }

            // ---- Quiz performance ----
            if (hasQuizData)
            {
                if (request.AverageScorePercentage < 50)
                {
                    riskPoints += 3;
                    recommendations.Add($"Mesatarja e quiz-eve është {request.AverageScorePercentage:F0}% — nën 50%. Fokusohu në temat ku rezultati i quiz-it është i ulët dhe rishiko materialin bazë.");
                }
                else if (request.AverageScorePercentage < 70)
                {
                    riskPoints += 2;
                    recommendations.Add($"Mesatarja e quiz-eve është {request.AverageScorePercentage:F0}%. Rishiko temat ku ke bërë gabime dhe shto ushtrime praktike.");
                }
                else if (request.AverageScorePercentage < 85)
                {
                    riskPoints += 1;
                    recommendations.Add($"Mesatarja e quiz-eve është {request.AverageScorePercentage:F0}% — e mirë. Vazhdo me përsëritje dhe quiz-e të shkurtra për të konsoliduar njohuritë.");
                }
                else
                {
                    recommendations.Add($"Mesatarja e quiz-eve është {request.AverageScorePercentage:F0}% — shkëlqyeshme! Je në drejtim shumë të mirë. Vazhdo me të njëjtin ritëm.");
                }
            }

            // ---- Weak areas ----
            if (request.WeakAreasCount > 0)
            {
                riskPoints += request.WeakAreasCount;
                if (request.WeakAreas.Count > 0)
                {
                    var areaList = string.Join(", ", request.WeakAreas);
                    recommendations.Add($"Temat e dobëta ({request.WeakAreasCount}): {areaList}. Përsërit këto tema para se të vazhdosh me tema të reja.");
                }
                else
                {
                    recommendations.Add($"Ke {request.WeakAreasCount} temë/tema me rezultat quiz nën 50%. Përsërit ato me prioritet.");
                }
            }
            else if (hasQuizData)
            {
                recommendations.Add("Nuk ka tema të dobëta të zbuluara — rezultate të mira në të gjitha temat e testuara.");
            }

            // ---- Days until exam ----
            if (request.DaysUntilExam <= 0)
            {
                riskPoints += 5;
                recommendations.Add("Afati i provimit ka kaluar ose është sot. Kontakto profesorin për informacion shtesë.");
            }
            else if (request.DaysUntilExam <= 3)
            {
                riskPoints += 3;
                recommendations.Add($"Provimi është shumë afër — vetëm {request.DaysUntilExam} ditë! Prioritizo menjëherë përsëritjen e temave kryesore dhe quiz-et praktike.");
            }
            else if (request.DaysUntilExam <= 7)
            {
                riskPoints += 2;
                recommendations.Add($"Provimi është afër ({request.DaysUntilExam} ditë). Krijo plan të fokusuar për çdo ditë dhe shto intensitetin e studimeve.");
            }
            else if (request.DaysUntilExam <= 14)
            {
                riskPoints += 1;
                recommendations.Add($"Ke {request.DaysUntilExam} ditë deri në provim. Planifiko çdo ditë dhe mbaj ritmin aktual të studimeve.");
            }
            else
            {
                recommendations.Add($"Ke {request.DaysUntilExam} ditë deri në provim — kohë e mjaftueshme. Planifiko me kujdes dhe studjo rregullisht.");
            }

            // ---- Study time ----
            if (request.TotalStudyMinutes < 60 && request.DaysUntilExam > 0)
            {
                riskPoints += 3;
                if (hasStudyData)
                    recommendations.Add($"Koha totale e studimit për këtë lëndë është vetëm {request.TotalStudyMinutes} minuta — shumë e ulët. Shto sesione studimi urgjenisht.");
            }
            else if (request.TotalStudyMinutes < 120)
            {
                riskPoints += 2;
                if (hasStudyData)
                    recommendations.Add($"Koha e studimit ({request.TotalStudyMinutes} minuta) është e ulët. Shto të paktën 1-2 orë studimi shtesë për këtë lëndë.");
            }
            else if (request.TotalStudyMinutes < 300)
            {
                riskPoints += 1;
                recommendations.Add($"Koha e studimit ({request.TotalStudyMinutes} min / {request.TotalStudyMinutes / 60.0:F1} orë) është e pranueshme. Shto sesione shtesë për rezultate më të mira.");
            }
            else
            {
                recommendations.Add($"Koha e studimit ({request.TotalStudyMinutes} min / {request.TotalStudyMinutes / 60.0:F1} orë) është e mirë. Vazhdo me të njëjtin ritëm.");
            }

            // ---- Risk classification ----
            string riskLevel;
            string prediction;
            string preparationStatus;
            string summaryMessage;

            bool urgentExam = request.DaysUntilExam is > 0 and <= 3;
            bool weakPerformance = hasQuizData && request.AverageScorePercentage < 50;
            bool manyWeakAreas = request.WeakAreasCount >= 2;

            if (riskPoints >= 7 || (urgentExam && weakPerformance) || (manyWeakAreas && urgentExam))
            {
                riskLevel = "High";
                prediction = "Low";
                preparationStatus = "Nën nivel";
                summaryMessage = string.IsNullOrEmpty(request.SubjectName)
                    ? "Niveli i përgatitjes është i ulët. Kërkohet veprim i menjëhershëm."
                    : $"Niveli i përgatitjes për lëndën '{request.SubjectName}' është i ulët. Kërkohet veprim i menjëhershëm.";
            }
            else if (riskPoints >= 4)
            {
                riskLevel = "Medium";
                prediction = "Medium";
                preparationStatus = "Mesatare";
                summaryMessage = string.IsNullOrEmpty(request.SubjectName)
                    ? "Ke progres të kënaqshëm, por ka hapësirë për përmirësim."
                    : $"Ke progres të kënaqshëm për '{request.SubjectName}', por ka hapësirë për përmirësim.";
            }
            else
            {
                riskLevel = "Low";
                prediction = "High";
                preparationStatus = "E mirë";
                summaryMessage = string.IsNullOrEmpty(request.SubjectName)
                    ? "Je mirë i/e përgatitur. Vazhdo kështu!"
                    : $"Je mirë i/e përgatitur për lëndën '{request.SubjectName}'. Vazhdo kështu!";
            }

            int readinessScore = CalculateReadinessScore(request);

            return new RecommendationResponseDto
            {
                UserId = request.UserId,
                SubjectId = request.SubjectId,
                SubjectName = request.SubjectName,
                ExamDeadline = request.ExamDeadline,
                DaysUntilExam = request.DaysUntilExam,
                RiskLevel = riskLevel,
                ExamSuccessPrediction = prediction,
                ReadinessScore = readinessScore,
                PreparationStatus = preparationStatus,
                SummaryMessage = summaryMessage,
                Recommendations = recommendations,
                WeakAreas = request.WeakAreas,
                TotalStudyMinutes = request.TotalStudyMinutes,
                TotalQuizzes = request.TotalQuizzes,
                AverageScorePercentage = request.AverageScorePercentage
            };
        }

        private static int CalculateReadinessScore(RecommendationRequestDto request)
        {
            int score = 0;

            // Quiz performance: up to 40 points
            if (request.TotalQuizzes > 0)
                score += (int)(request.AverageScorePercentage * 0.40);

            // Study time: up to 30 points
            if (request.TotalStudyMinutes >= 300)
                score += 30;
            else if (request.TotalStudyMinutes >= 120)
                score += 20;
            else if (request.TotalStudyMinutes >= 60)
                score += 12;
            else if (request.TotalStudyMinutes > 0)
                score += 5;

            // Days buffer: up to 10 bonus points
            if (request.DaysUntilExam > 14)
                score += 10;
            else if (request.DaysUntilExam > 7)
                score += 5;
            else if (request.DaysUntilExam is > 0 and <= 3)
                score -= 5;

            // Weak areas penalty
            score -= request.WeakAreasCount * 8;

            // Bonus for having both data types
            if (request.TotalQuizzes > 0 && request.TotalStudyMinutes > 0)
                score += 5;

            return Math.Max(0, Math.Min(100, score));
        }
    }
}
