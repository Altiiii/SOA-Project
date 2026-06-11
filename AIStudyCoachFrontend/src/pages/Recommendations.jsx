import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";

function Recommendations() {
  const userId = Number(localStorage.getItem("userId")) || 2;

  const [daysUntilExam, setDaysUntilExam] = useState(5);
  const [progress, setProgress] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  const generateRecommendation = async () => {
    setLoading(true);
    setMessage({ text: "", type: "" });
    setRecommendation(null);

    try {
      const progressResponse = await api.get(`/progress/user/${userId}`);
      const progressData = progressResponse.data;
      setProgress(progressData);

      const requestData = {
        userId,
        totalStudyMinutes: progressData.totalStudyMinutes,
        averageScorePercentage: progressData.averageScorePercentage,
        daysUntilExam: Number(daysUntilExam),
        weakAreasCount: progressData.weakAreas.length,
      };

      const recommendationResponse = await api.post(
        "/recommendations/analyze",
        requestData
      );
      setRecommendation(recommendationResponse.data);
      setMessage({ text: "Rekomandimi u gjenerua me sukses.", type: "success" });
    } catch (error) {
      console.log("RECOMMENDATION ERROR:", error);
      setMessage({
        text:
          error.response?.data ||
          error.message ||
          "Dështoi gjenerimi i rekomandimit.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRiskConfig = (riskLevel) => {
    if (riskLevel === "High")
      return {
        color: "text-red-700",
        bg: "bg-red-50 border-red-200",
        dot: "bg-red-500",
        label: "I Lartë",
      };
    if (riskLevel === "Medium")
      return {
        color: "text-amber-700",
        bg: "bg-amber-50 border-amber-200",
        dot: "bg-amber-500",
        label: "Mesatar",
      };
    return {
      color: "text-emerald-700",
      bg: "bg-emerald-50 border-emerald-200",
      dot: "bg-emerald-500",
      label: "I Ulët",
    };
  };

  const riskConfig = recommendation
    ? getRiskConfig(recommendation.riskLevel)
    : null;

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
          Analiza inteligjente e studimit dhe rekomandime personale.
        </p>
      </div>

      {/* Explanation banner */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
            <span className="text-white text-sm font-bold">AI</span>
          </div>
          <div>
            <h3 className="font-bold text-indigo-900 mb-1">
              Si funksionon AI Coach?
            </h3>
            <p className="text-indigo-700 text-sm leading-relaxed">
              AI Coach analizon kohën e studimit, rezultatet e quiz-eve, temat e
              dobëta dhe afatin e provimit për të vlerësuar rrezikun dhe për të
              dhënë rekomandime personale.
            </p>
          </div>
        </div>
      </div>

      {message.text && (
        <div
          className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Settings panel */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            Parametrat e Provimit
          </h2>
          <p className="text-xs text-gray-500 mb-5">
            Vendos sa ditë ke deri në provim
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Ditët deri në Provim
              </label>
              <input
                type="number"
                value={daysUntilExam}
                onChange={(e) => setDaysUntilExam(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="5"
                min="1"
              />
            </div>

            <button
              onClick={generateRecommendation}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 rounded-xl transition-colors shadow-sm text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
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
                  Po analizohet...
                </>
              ) : (
                "Gjenero Rekomandime"
              )}
            </button>
          </div>

          {!progress && !loading && (
            <div className="mt-5 pt-4 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">
                Kliko butonin për të ngarkuar të dhënat e progresit
              </p>
            </div>
          )}
        </div>

        {/* Progress Input */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            Të Dhënat e Progresit
          </h2>
          <p className="text-xs text-gray-500 mb-5">
            Inputet që analizon AI Coach
          </p>

          {!progress ? (
            <div className="text-center py-6">
              <div className="text-3xl mb-2">📊</div>
              <p className="text-gray-400 text-sm">
                Kliko &ldquo;Gjenero Rekomandime&rdquo; për të ngarkuar të
                dhënat.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                <span className="text-sm text-gray-600">
                  Minutat e Studimit
                </span>
                <span className="text-blue-700 font-bold">
                  {progress.totalStudyMinutes}
                </span>
              </div>
              <div className="flex justify-between items-center bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3">
                <span className="text-sm text-gray-600">Orët e Studimit</span>
                <span className="text-indigo-700 font-bold">
                  {progress.totalStudyHours}
                </span>
              </div>
              <div className="flex justify-between items-center bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <span className="text-sm text-gray-600">
                  Mesatarja e Rezultateve
                </span>
                <span className="text-amber-700 font-bold">
                  {progress.averageScorePercentage}%
                </span>
              </div>
              <div className="flex justify-between items-center bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <span className="text-sm text-gray-600">Temat e Dobëta</span>
                <span className="text-red-700 font-bold">
                  {progress.weakAreas.length}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Prediction Panel */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Parashikimi</h2>
          <p className="text-xs text-gray-500 mb-5">Rezultati i analizës AI</p>

          {!recommendation ? (
            <div className="text-center py-6">
              <div className="text-3xl mb-2">🤖</div>
              <p className="text-gray-400 text-sm">
                Nuk ka parashikim ende. Kliko butonin për të gjeneruar.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className={`border rounded-xl p-4 ${riskConfig.bg}`}>
                <p className="text-gray-500 text-xs mb-2">Niveli i Rrezikut</p>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-full shrink-0 ${riskConfig.dot}`}
                  ></span>
                  <p className={`text-2xl font-bold ${riskConfig.color}`}>
                    {riskConfig.label}
                  </p>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-gray-500 text-xs mb-2">
                  Parashikimi i Suksesit në Provim
                </p>
                <p className="text-2xl font-bold text-blue-700">
                  {recommendation.examSuccessPrediction}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Personalized Recommendations */}
      {recommendation && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
              <span className="text-indigo-700 text-sm font-bold">AI</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Rekomandimet Personale
              </h2>
              <p className="text-xs text-gray-500">
                Hapat që duhet të ndjekësh sipas analizës AI
              </p>
            </div>
          </div>

          {progress && progress.weakAreas && progress.weakAreas.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
              <p className="text-sm font-semibold text-red-700 mb-2">
                Temat e Dobëta ({progress.weakAreas.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {progress.weakAreas.map((area, i) => (
                  <span
                    key={i}
                    className="text-xs bg-white border border-red-200 text-red-700 px-3 py-1 rounded-full font-medium"
                  >
                    Tema #{area.topicId} — {area.scorePercentage}%
                  </span>
                ))}
              </div>
            </div>
          )}

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
      )}

      {/* Empty state */}
      {!recommendation && !loading && (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
          <div className="text-5xl mb-3">🤖</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Nuk ka ende të dhëna për AI Coach
          </h3>
          <p className="text-gray-500 text-sm mb-5">
            Shto study sessions dhe quiz results fillimisht, pastaj kliko
            &ldquo;Gjenero Rekomandime&rdquo;.
          </p>
          <Link
            to="/study"
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors inline-block"
          >
            Shko te Studimi &amp; Quiz-et
          </Link>
        </div>
      )}
    </div>
  );
}

export default Recommendations;
