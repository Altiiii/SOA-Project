import { useEffect, useState } from "react";
import api from "../api/api";

function getDaysUntil(deadline) {
  if (!deadline) return null;
  const diff = new Date(deadline) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatDeadline(deadline) {
  if (!deadline) return "—";
  return new Date(deadline).toLocaleDateString("sq-AL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function UrgencyBadge({ days }) {
  if (days === null) return null;
  if (days <= 0)
    return (
      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
        Skaduar
      </span>
    );
  if (days <= 3)
    return (
      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
        Urgjente
      </span>
    );
  if (days <= 7)
    return (
      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
        Afër
      </span>
    );
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
      Në rregull
    </span>
  );
}

function RiskBadge({ level }) {
  if (level === "High")
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 border border-red-200 text-red-700 text-sm font-semibold">
        <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>I Lartë
      </span>
    );
  if (level === "Medium")
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-200 text-amber-700 text-sm font-semibold">
        <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>Mesatar
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 text-sm font-semibold">
      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>I Ulët
    </span>
  );
}

function PredictionBadge({ level }) {
  if (level === "Low")
    return (
      <span className="text-2xl font-bold text-red-600">E Ulët</span>
    );
  if (level === "Medium")
    return (
      <span className="text-2xl font-bold text-amber-600">Mesatare</span>
    );
  return (
    <span className="text-2xl font-bold text-emerald-600">E Lartë</span>
  );
}

function ReadinessBar({ score }) {
  const color =
    score >= 70
      ? "bg-emerald-500"
      : score >= 45
      ? "bg-amber-500"
      : "bg-red-500";
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm text-gray-600 font-medium">Rezultati i Përgatitjes</span>
        <span className="text-sm font-bold text-gray-900">{score}/100</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-3">
        <div
          className={`${color} h-3 rounded-full transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export default function Recommendations() {
  const userId = Number(localStorage.getItem("userId")) || 1;

  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [subjectProgress, setSubjectProgress] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    setLoadingSubjects(true);
    try {
      const resp = await api.get(`/subjects/user/${userId}`);
      const sorted = (resp.data || []).sort(
        (a, b) => new Date(a.examDeadline) - new Date(b.examDeadline)
      );
      setSubjects(sorted);
    } catch (err) {
      console.error("Load subjects error:", err);
    } finally {
      setLoadingSubjects(false);
    }
  };

  const analyzeSubject = async (subject) => {
    setSelectedSubjectId(subject.id);
    setRecommendation(null);
    setSubjectProgress(null);
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      // 1. Fetch per-subject progress
      const progressResp = await api.get(
        `/progress/user/${userId}/subject/${subject.id}`
      );
      const prog = progressResp.data;
      setSubjectProgress(prog);

      // 2. Resolve topic names from subject.topics for weak areas
      const weakAreaNames = (prog.weakAreas || []).map((area) => {
        const topic = (subject.topics || []).find((t) => t.id === area.topicId);
        return topic ? topic.title : `Tema #${area.topicId}`;
      });

      // 3. Calculate days until exam
      const daysUntilExam = Math.max(0, getDaysUntil(subject.examDeadline) ?? 0);

      // 4. Build request
      const requestData = {
        userId,
        subjectId: subject.id,
        subjectName: subject.name,
        examDeadline: subject.examDeadline,
        totalStudyMinutes: prog.totalStudyMinutes,
        averageScorePercentage: prog.averageScorePercentage,
        daysUntilExam,
        weakAreasCount: (prog.weakAreas || []).length,
        totalQuizzes: prog.totalQuizzes,
        weakAreas: weakAreaNames,
      };

      // 5. Get AI recommendation
      const recResp = await api.post("/recommendations/analyze", requestData);
      setRecommendation(recResp.data);
    } catch (err) {
      console.error("Analyze error:", err);
      setMessage({
        text:
          err.response?.data ||
          err.message ||
          "Dështoi analiza. Provo përsëri.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const upcomingSubjects = subjects.filter((s) => {
    const d = getDaysUntil(s.examDeadline);
    return d !== null && d > 0;
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">AI</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">AI Coach</h1>
        </div>
        <p className="text-gray-500">
          Analiza inteligjente e studimit dhe rekomandime personale për çdo lëndë.
        </p>
      </div>

      {/* Explanation banner */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
            <span className="text-white text-sm font-bold">AI</span>
          </div>
          <div>
            <h3 className="font-bold text-indigo-900 mb-1">Si funksionon AI Coach?</h3>
            <p className="text-indigo-700 text-sm leading-relaxed">
              AI Coach analizon lëndët, datën e provimit, kohën e studimit dhe
              rezultatet e quiz-eve për të treguar sa i përgatitur je për provim.
              Zgjidh një lëndë për të parë analizën e detajuar.
            </p>
          </div>
        </div>
      </div>

      {message.text && (
        <div
          className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
            message.type === "error"
              ? "bg-red-50 border-red-200 text-red-700"
              : "bg-emerald-50 border-emerald-200 text-emerald-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Upcoming Exams Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Provimet që po afrohen</h2>
          <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
            {upcomingSubjects.length} lëndë
          </span>
        </div>

        {loadingSubjects ? (
          <div className="text-center py-8 text-gray-400 text-sm">Duke ngarkuar lëndët...</div>
        ) : upcomingSubjects.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-3">📚</div>
            <p className="text-gray-500 font-medium text-sm">
              Nuk ka lëndë me provim të ardhshëm.
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Shko te &ldquo;Lëndët&rdquo; dhe shto lëndë me afat provimi.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingSubjects.map((subject) => {
              const days = getDaysUntil(subject.examDeadline);
              const isSelected = selectedSubjectId === subject.id;
              const urgencyColor =
                days <= 3
                  ? "border-red-300 bg-red-50"
                  : days <= 7
                  ? "border-amber-300 bg-amber-50"
                  : "border-gray-200 bg-white";

              return (
                <button
                  key={subject.id}
                  onClick={() => analyzeSubject(subject)}
                  disabled={loading}
                  className={`text-left w-full rounded-2xl border-2 p-4 transition-all shadow-sm hover:shadow-md ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-300"
                      : urgencyColor + " hover:border-indigo-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="font-bold text-gray-900 text-sm leading-tight">
                      {subject.name}
                    </h3>
                    <UrgencyBadge days={days} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">
                      <span className="font-medium text-gray-700">Provimi:</span>{" "}
                      {formatDeadline(subject.examDeadline)}
                    </p>
                    <p className="text-xs">
                      <span className="font-medium text-gray-700">Ditë mbetur:</span>{" "}
                      <span
                        className={`font-bold ${
                          days <= 3
                            ? "text-red-600"
                            : days <= 7
                            ? "text-amber-600"
                            : "text-emerald-600"
                        }`}
                      >
                        {days}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500">
                      <span className="font-medium text-gray-700">Prioriteti:</span>{" "}
                      {subject.priority === "High"
                        ? "E Lartë"
                        : subject.priority === "Low"
                        ? "E Ulët"
                        : "Mesatare"}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="mt-3 pt-2 border-t border-indigo-200">
                      <span className="text-xs font-semibold text-indigo-600">
                        ✓ Duke u analizuar...
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Subject Selection Prompt */}
      {!selectedSubjectId && !loading && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-8 text-center mb-8">
          <div className="text-5xl mb-3">🎯</div>
          <h3 className="text-lg font-semibold text-indigo-900 mb-2">
            Zgjedh lëndën për analizë
          </h3>
          <p className="text-indigo-700 text-sm">
            Kliko mbi një lëndë nga lista e mësipërme për të parë analizën e
            detajuar nga AI Coach.
          </p>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center mb-8 shadow-sm">
          <div className="flex items-center justify-center gap-3 text-indigo-600">
            <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24" fill="none">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            <span className="text-lg font-semibold">Po analizohet...</span>
          </div>
          <p className="text-gray-400 text-sm mt-3">
            AI Coach po analizon të dhënat e studimit dhe quiz-eve për lëndën e
            zgjedhur.
          </p>
        </div>
      )}

      {/* Analysis Result */}
      {recommendation && !loading && (
        <>
          {/* Summary banner */}
          <div
            className={`rounded-2xl border-2 p-5 mb-6 ${
              recommendation.riskLevel === "High"
                ? "bg-red-50 border-red-300"
                : recommendation.riskLevel === "Medium"
                ? "bg-amber-50 border-amber-300"
                : "bg-emerald-50 border-emerald-300"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Analiza AI Coach
                </p>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {recommendation.subjectName}
                </h3>
                <p className="text-sm text-gray-700">{recommendation.summaryMessage}</p>
              </div>
              <RiskBadge level={recommendation.riskLevel} />
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
              <p className="text-xs text-gray-500 mb-1">Ditë deri</p>
              <p
                className={`text-2xl font-bold ${
                  recommendation.daysUntilExam <= 3
                    ? "text-red-600"
                    : recommendation.daysUntilExam <= 7
                    ? "text-amber-600"
                    : "text-gray-900"
                }`}
              >
                {recommendation.daysUntilExam}
              </p>
              <p className="text-xs text-gray-400">në provim</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center shadow-sm">
              <p className="text-xs text-blue-600 mb-1">Min. Studimi</p>
              <p className="text-2xl font-bold text-blue-700">
                {recommendation.totalStudyMinutes}
              </p>
              <p className="text-xs text-blue-400">minuta</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center shadow-sm">
              <p className="text-xs text-purple-600 mb-1">Quiz-e</p>
              <p className="text-2xl font-bold text-purple-700">
                {recommendation.totalQuizzes}
              </p>
              <p className="text-xs text-purple-400">gjithsej</p>
            </div>
            <div
              className={`border rounded-xl p-4 text-center shadow-sm ${
                recommendation.averageScorePercentage >= 70
                  ? "bg-emerald-50 border-emerald-200"
                  : recommendation.averageScorePercentage >= 50
                  ? "bg-amber-50 border-amber-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <p
                className={`text-xs mb-1 ${
                  recommendation.averageScorePercentage >= 70
                    ? "text-emerald-600"
                    : recommendation.averageScorePercentage >= 50
                    ? "text-amber-600"
                    : "text-red-600"
                }`}
              >
                Mesatarja
              </p>
              <p
                className={`text-2xl font-bold ${
                  recommendation.averageScorePercentage >= 70
                    ? "text-emerald-700"
                    : recommendation.averageScorePercentage >= 50
                    ? "text-amber-700"
                    : "text-red-700"
                }`}
              >
                {recommendation.averageScorePercentage.toFixed(0)}%
              </p>
              <p className="text-xs text-gray-400">quiz</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
              <p className="text-xs text-gray-500 mb-1">Parashikimi</p>
              <PredictionBadge level={recommendation.examSuccessPrediction} />
              <p className="text-xs text-gray-400 mt-1">kalimi</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
              <p className="text-xs text-gray-500 mb-1">Përgatitja</p>
              <p className="text-2xl font-bold text-gray-900">
                {recommendation.readinessScore}
              </p>
              <p className="text-xs text-gray-400">/ 100</p>
            </div>
          </div>

          {/* Readiness bar + Risk + Prediction */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Niveli i Përgatitjes</h3>
              <ReadinessBar score={recommendation.readinessScore} />
              <div className="grid grid-cols-3 gap-3 mt-5">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Niveli i Rrezikut</p>
                  <RiskBadge level={recommendation.riskLevel} />
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Mundësia Kalimit</p>
                  <PredictionBadge level={recommendation.examSuccessPrediction} />
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Statusi</p>
                  <span className="text-sm font-semibold text-gray-800">
                    {recommendation.preparationStatus}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Data e Provimit</h3>
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-xl px-4 py-3">
                  <p className="text-xs text-gray-500">Lënda</p>
                  <p className="font-semibold text-gray-900 text-sm">
                    {recommendation.subjectName}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl px-4 py-3">
                  <p className="text-xs text-gray-500">Data e Provimit</p>
                  <p className="font-semibold text-gray-900 text-sm">
                    {formatDeadline(recommendation.examDeadline)}
                  </p>
                </div>
                <div
                  className={`rounded-xl px-4 py-3 ${
                    recommendation.daysUntilExam <= 3
                      ? "bg-red-50 border border-red-200"
                      : recommendation.daysUntilExam <= 7
                      ? "bg-amber-50 border border-amber-200"
                      : "bg-emerald-50 border border-emerald-200"
                  }`}
                >
                  <p className="text-xs text-gray-500">Ditë deri në Provim</p>
                  <p
                    className={`text-2xl font-bold ${
                      recommendation.daysUntilExam <= 3
                        ? "text-red-600"
                        : recommendation.daysUntilExam <= 7
                        ? "text-amber-600"
                        : "text-emerald-600"
                    }`}
                  >
                    {recommendation.daysUntilExam}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Weak Areas */}
          {recommendation.weakAreas && recommendation.weakAreas.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                  <span className="text-red-600 font-bold text-sm">!</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Temat e Dobëta</h3>
                  <p className="text-xs text-gray-500">
                    Tema me rezultat quiz nën 50% — kërkon rishikim
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {recommendation.weakAreas.map((area, i) => (
                  <span
                    key={i}
                    className="text-sm bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl font-medium"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* No weak areas message */}
          {subjectProgress &&
            subjectProgress.totalQuizzes > 0 &&
            recommendation.weakAreas.length === 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
                <span className="text-emerald-600 text-xl font-bold">✓</span>
                <p className="text-emerald-700 text-sm font-medium">
                  Nuk ka tema të dobëta të zbuluara. Rezultate të mira në të
                  gjitha temat!
                </p>
              </div>
            )}

          {/* Recommendations */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                <span className="text-indigo-700 text-sm font-bold">AI</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Rekomandimet Personale</h3>
                <p className="text-xs text-gray-500">
                  Hapat që duhet të ndjekësh sipas analizës AI
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {recommendation.recommendations.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4"
                >
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-gray-800 text-sm leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Re-analyze button */}
          <div className="text-center">
            <button
              onClick={() => {
                const subject = subjects.find((s) => s.id === selectedSubjectId);
                if (subject) analyzeSubject(subject);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors shadow-sm"
            >
              Rifresko Analizën
            </button>
          </div>
        </>
      )}
    </div>
  );
}
