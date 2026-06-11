import { useEffect, useState } from "react";
import api from "../api/api";

function Study() {
  const userId = Number(localStorage.getItem("userId")) || 1;

  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [progress, setProgress] = useState(null);
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState("info");

  const [sessionForm, setSessionForm] = useState({
    userId,
    subjectId: "",
    topicId: "",
    durationMinutes: "",
    notes: "",
  });

  const [quizForm, setQuizForm] = useState({
    userId,
    subjectId: "",
    topicId: "",
    score: "",
    totalQuestions: "",
  });

  const loadSubjects = async () => {
    try {
      const response = await api.get("/subjects/");
      setSubjects(response.data);
    } catch (error) {
      console.log("LOAD SUBJECTS ERROR:", error);
    }
  };

  const loadTopics = async () => {
    try {
      const response = await api.get("/topics/");
      setTopics(response.data);
    } catch (error) {
      console.log("LOAD TOPICS ERROR:", error);
    }
  };

  const loadProgress = async () => {
    try {
      const response = await api.get(`/progress/user/${userId}`);
      setProgress(response.data);
    } catch (error) {
      console.log("LOAD PROGRESS ERROR:", error);
    }
  };

  useEffect(() => {
    loadSubjects();
    loadTopics();
    loadProgress();
  }, []);

  const showMessage = (text, type = "info") => {
    setMessage(text);
    setMsgType(type);
    setTimeout(() => setMessage(""), 4000);
  };

  const handleSessionChange = (e) =>
    setSessionForm({ ...sessionForm, [e.target.name]: e.target.value });

  const handleQuizChange = (e) =>
    setQuizForm({ ...quizForm, [e.target.name]: e.target.value });

  const createStudySession = async (e) => {
    e.preventDefault();
    try {
      await api.post("/study-sessions/", {
        userId,
        subjectId: Number(sessionForm.subjectId),
        topicId: Number(sessionForm.topicId),
        durationMinutes: Number(sessionForm.durationMinutes),
        notes: sessionForm.notes,
      });
      showMessage("Sesioni i studimit u shtua me sukses.", "success");
      setSessionForm({
        userId,
        subjectId: "",
        topicId: "",
        durationMinutes: "",
        notes: "",
      });
      loadProgress();
    } catch (error) {
      showMessage(
        error.response?.data || "Dështoi shtimi i sesionit.",
        "error"
      );
    }
  };

  const createQuizResult = async (e) => {
    e.preventDefault();
    try {
      await api.post("/quiz-results/", {
        userId,
        subjectId: Number(quizForm.subjectId),
        topicId: Number(quizForm.topicId),
        score: Number(quizForm.score),
        totalQuestions: Number(quizForm.totalQuestions),
      });
      showMessage("Rezultati i quiz-it u shtua me sukses.", "success");
      setQuizForm({
        userId,
        subjectId: "",
        topicId: "",
        score: "",
        totalQuestions: "",
      });
      loadProgress();
    } catch (error) {
      showMessage(
        error.response?.data || "Dështoi shtimi i rezultatit.",
        "error"
      );
    }
  };

  const getTopicName = (topicId) =>
    topics.find((t) => t.id === topicId)?.title || `Tema #${topicId}`;

  const getSubjectName = (subjectId) =>
    subjects.find((s) => s.id === subjectId)?.name || `Lënda #${subjectId}`;

  const inputClass =
    "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";

  const msgBannerClass =
    msgType === "success"
      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
      : msgType === "error"
      ? "bg-red-50 border-red-200 text-red-700"
      : "bg-blue-50 border-blue-200 text-blue-700";

  const quizPercentage =
    quizForm.score !== "" &&
    quizForm.totalQuestions !== "" &&
    Number(quizForm.totalQuestions) > 0
      ? Math.round(
          (Number(quizForm.score) / Number(quizForm.totalQuestions)) * 100
        )
      : null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          Studimi &amp; Quiz-et
        </h1>
        <p className="text-gray-500">
          Regjistro kohën e studimit dhe rezultatet e quiz-eve.
        </p>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-6 flex items-start gap-3">
        <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-white text-xs font-bold">i</span>
        </div>
        <p className="text-sm text-blue-700">
          Këtu regjistron kohën e studimit dhe rezultatet e quiz-eve. AI Coach
          përdor këto të dhëna për të gjetur temat e dobëta dhe për të sugjeruar
          çka duhet të përmirësosh.
        </p>
      </div>

      {message && (
        <div
          className={`mb-6 rounded-xl border px-4 py-3 text-sm ${msgBannerClass}`}
        >
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Study Session Form */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            Shto Sesion Studimi
          </h2>
          <p className="text-xs text-gray-500 mb-5">
            Regjistro sa minuta ke studiuar
          </p>

          <form onSubmit={createStudySession} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Lënda
              </label>
              <select
                name="subjectId"
                value={sessionForm.subjectId}
                onChange={handleSessionChange}
                required
                className={inputClass}
              >
                <option value="">Zgjidh lëndën</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tema
              </label>
              <select
                name="topicId"
                value={sessionForm.topicId}
                onChange={handleSessionChange}
                required
                className={inputClass}
              >
                <option value="">Zgjidh temën</option>
                {topics
                  .filter(
                    (t) =>
                      !sessionForm.subjectId ||
                      t.subjectId === Number(sessionForm.subjectId)
                  )
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Kohëzgjatja (minuta)
              </label>
              <input
                type="number"
                name="durationMinutes"
                value={sessionForm.durationMinutes}
                onChange={handleSessionChange}
                required
                min="1"
                className={inputClass}
                placeholder="P.sh. 60"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Shënime (opsionale)
              </label>
              <textarea
                name="notes"
                value={sessionForm.notes}
                onChange={handleSessionChange}
                rows={2}
                className={inputClass}
                placeholder="Çfarë studiove sot..."
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-sm text-sm"
            >
              Shto Sesion Studimi
            </button>
          </form>
        </div>

        {/* Quiz Result Form */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            Shto Rezultat Quiz-i
          </h2>
          <p className="text-xs text-gray-500 mb-5">
            Regjistro rezultatin e fundit të quiz-it
          </p>

          <form onSubmit={createQuizResult} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Lënda
              </label>
              <select
                name="subjectId"
                value={quizForm.subjectId}
                onChange={handleQuizChange}
                required
                className={inputClass}
              >
                <option value="">Zgjidh lëndën</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tema
              </label>
              <select
                name="topicId"
                value={quizForm.topicId}
                onChange={handleQuizChange}
                required
                className={inputClass}
              >
                <option value="">Zgjidh temën</option>
                {topics
                  .filter(
                    (t) =>
                      !quizForm.subjectId ||
                      t.subjectId === Number(quizForm.subjectId)
                  )
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Rezultati
                </label>
                <input
                  type="number"
                  name="score"
                  value={quizForm.score}
                  onChange={handleQuizChange}
                  required
                  min="0"
                  className={inputClass}
                  placeholder="P.sh. 7"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Numri i Pyetjeve
                </label>
                <input
                  type="number"
                  name="totalQuestions"
                  value={quizForm.totalQuestions}
                  onChange={handleQuizChange}
                  required
                  min="1"
                  className={inputClass}
                  placeholder="P.sh. 10"
                />
              </div>
            </div>

            {quizPercentage !== null && (
              <div
                className={`flex items-center gap-2 rounded-xl px-4 py-3 border ${
                  quizPercentage < 50
                    ? "bg-red-50 border-red-200"
                    : "bg-emerald-50 border-emerald-200"
                }`}
              >
                <span
                  className={`text-lg font-bold ${
                    quizPercentage < 50
                      ? "text-red-600"
                      : "text-emerald-600"
                  }`}
                >
                  {quizPercentage}%
                </span>
                <span
                  className={`text-xs ${
                    quizPercentage < 50 ? "text-red-600" : "text-emerald-600"
                  }`}
                >
                  {quizPercentage < 50
                    ? "— do të shënohet si temë e dobët"
                    : "— rezultat i mirë"}
                </span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-sm text-sm"
            >
              Shto Rezultat Quiz-i
            </button>
          </form>
        </div>
      </div>

      {/* Progress Summary */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Përmbledhja e Progresit
        </h2>

        {!progress ? (
          <div className="text-center py-10">
            <div className="text-4xl mb-3">📊</div>
            <p className="text-gray-500 font-medium">
              Nuk ka ende të dhëna të progresit.
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Shto sesione studimi dhe rezultate quiz-esh për të parë progresin.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-blue-600 text-xs font-medium mb-1">
                  Minutat Totale të Studimit
                </p>
                <p className="text-3xl font-bold text-blue-700">
                  {progress.totalStudyMinutes}
                </p>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                <p className="text-indigo-600 text-xs font-medium mb-1">
                  Orët Totale të Studimit
                </p>
                <p className="text-3xl font-bold text-indigo-700">
                  {progress.totalStudyHours}
                </p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <p className="text-emerald-600 text-xs font-medium mb-1">
                  Sesionet Totale
                </p>
                <p className="text-3xl font-bold text-emerald-700">
                  {progress.totalStudySessions}
                </p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <p className="text-purple-600 text-xs font-medium mb-1">
                  Quiz-et e Kryera
                </p>
                <p className="text-3xl font-bold text-purple-700">
                  {progress.totalQuizzes}
                </p>
              </div>
            </div>

            <div
              className={`border rounded-xl p-5 mb-6 ${
                progress.averageScorePercentage >= 70
                  ? "bg-emerald-50 border-emerald-200"
                  : progress.averageScorePercentage >= 50
                  ? "bg-amber-50 border-amber-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <p className="text-gray-600 text-sm mb-1">
                Mesatarja e Rezultateve
              </p>
              <p
                className={`text-4xl font-bold ${
                  progress.averageScorePercentage >= 70
                    ? "text-emerald-700"
                    : progress.averageScorePercentage >= 50
                    ? "text-amber-700"
                    : "text-red-700"
                }`}
              >
                {progress.averageScorePercentage}%
              </p>
              <p className="text-sm mt-1 text-gray-500">
                {progress.averageScorePercentage >= 70
                  ? "Performancë e shkëlqyer — vazhdo kështu!"
                  : progress.averageScorePercentage >= 50
                  ? "Mesatare — ka hapësirë për përmirësim"
                  : "Nën mesatare — fokusohu te temat e dobëta"}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Temat e Dobëta{" "}
                <span className="text-gray-400 font-normal text-sm">
                  (rezultat quiz nën 50%)
                </span>
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Këto tema i analizon AI Coach për të dhënë rekomandime
              </p>

              {progress.weakAreas.length === 0 ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                  <span className="text-emerald-600 text-lg">✓</span>
                  <p className="text-emerald-700 text-sm font-medium">
                    Nuk ka tema të dobëta të zbuluara. Punë e shkëlqyer!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {progress.weakAreas.map((area, index) => (
                    <div
                      key={index}
                      className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-gray-900 font-semibold text-sm">
                          {getTopicName(area.topicId)}
                        </p>
                        <p className="text-gray-500 text-xs mt-0.5">
                          {getSubjectName(area.subjectId)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-red-600 font-bold text-xl">
                          {area.scorePercentage}%
                        </p>
                        <p className="text-red-400 text-xs">duhet rishikim</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Study;
