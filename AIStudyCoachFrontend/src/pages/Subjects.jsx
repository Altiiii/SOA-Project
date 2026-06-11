import { useEffect, useState } from "react";
import api from "../api/api";

const priorityStyles = {
  High: "text-red-700 bg-red-50 border-red-200",
  Medium: "text-amber-700 bg-amber-50 border-amber-200",
  Low: "text-emerald-700 bg-emerald-50 border-emerald-200",
};

const statusStyles = {
  Completed: "text-emerald-700 bg-emerald-50 border-emerald-200",
  "In Progress": "text-amber-700 bg-amber-50 border-amber-200",
  "Not Started": "text-gray-600 bg-gray-50 border-gray-200",
};

const difficultyStyles = {
  Hard: "text-red-700 bg-red-50 border-red-200",
  Medium: "text-amber-700 bg-amber-50 border-amber-200",
  Easy: "text-emerald-700 bg-emerald-50 border-emerald-200",
};

function Subjects() {
  const userId = Number(localStorage.getItem("userId")) || 1;

  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState("info");

  const [subjectForm, setSubjectForm] = useState({
    userId,
    name: "",
    description: "",
    examDeadline: "",
    priority: "Medium",
  });

  const [topicForm, setTopicForm] = useState({
    subjectId: "",
    title: "",
    difficulty: "Medium",
    status: "Not Started",
  });

  const loadSubjects = async () => {
    try {
      const response = await api.get(`/subjects/user/${userId}`);
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

  useEffect(() => {
    loadSubjects();
    loadTopics();
  }, []);

  const showMessage = (text, type = "info") => {
    setMessage(text);
    setMsgType(type);
    setTimeout(() => setMessage(""), 4000);
  };

  const handleSubjectChange = (e) =>
    setSubjectForm({ ...subjectForm, [e.target.name]: e.target.value });

  const handleTopicChange = (e) =>
    setTopicForm({ ...topicForm, [e.target.name]: e.target.value });

  const createSubject = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/subjects/", {
        ...subjectForm,
        userId: Number(userId),
      });
      setSubjects((prev) => [...prev, response.data]);
      showMessage("Lënda u krijua me sukses.", "success");
      setSubjectForm({
        userId,
        name: "",
        description: "",
        examDeadline: "",
        priority: "Medium",
      });
    } catch (error) {
      showMessage(
        error.response?.data || "Dështoi krijimi i lëndës.",
        "error"
      );
    }
  };

  const createTopic = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/topics/", {
        ...topicForm,
        subjectId: Number(topicForm.subjectId),
      });
      setTopics((prev) => [...prev, response.data]);
      showMessage("Tema u krijua me sukses.", "success");
      setTopicForm({
        subjectId: "",
        title: "",
        difficulty: "Medium",
        status: "Not Started",
      });
    } catch (error) {
      showMessage(
        error.response?.data || "Dështoi krijimi i temës.",
        "error"
      );
    }
  };

  const deleteSubject = async (id) => {
    try {
      await api.delete(`/subjects/${id}`);
      setSubjects((prev) => prev.filter((s) => s.id !== id));
      setTopics((prev) => prev.filter((t) => t.subjectId !== id));
      showMessage("Lënda u fshi.", "info");
    } catch (error) {
      showMessage("Dështoi fshirja e lëndës.", "error");
    }
  };

  const getSubjectName = (subjectId) =>
    subjects.find((s) => s.id === subjectId)?.name || `Lënda #${subjectId}`;

  const getDaysUntil = (deadline) => {
    const diff = new Date(deadline) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const inputClass =
    "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";

  const msgBannerClass =
    msgType === "success"
      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
      : msgType === "error"
      ? "bg-red-50 border-red-200 text-red-700"
      : "bg-blue-50 border-blue-200 text-blue-700";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          Lëndët &amp; Temat
        </h1>
        <p className="text-gray-500">
          Menaxho lëndët dhe temat për të cilat po përgatitesh.
        </p>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-6 flex items-start gap-3">
        <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-white text-xs font-bold">i</span>
        </div>
        <p className="text-sm text-blue-700">
          Këtu regjistron lëndët dhe temat për të cilat po përgatitesh. Këto të
          dhëna përdoren nga sistemi për të analizuar progresin dhe për të
          krijuar rekomandime nga AI Coach.
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
        {/* Create Subject Form */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Shto Lëndë</h2>
          <p className="text-xs text-gray-500 mb-5">
            Regjistro lëndën dhe afatin e provimit
          </p>

          <form onSubmit={createSubject} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Emri i Lëndës
              </label>
              <input
                type="text"
                name="name"
                value={subjectForm.name}
                onChange={handleSubjectChange}
                required
                className={inputClass}
                placeholder="P.sh. Bazat e të Dhënave"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Përshkrimi
              </label>
              <textarea
                name="description"
                value={subjectForm.description}
                onChange={handleSubjectChange}
                required
                rows={2}
                className={inputClass}
                placeholder="Çfarë mbulon kjo lëndë..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Afati i Provimit
              </label>
              <input
                type="datetime-local"
                name="examDeadline"
                value={subjectForm.examDeadline}
                onChange={handleSubjectChange}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Prioriteti
              </label>
              <select
                name="priority"
                value={subjectForm.priority}
                onChange={handleSubjectChange}
                className={inputClass}
              >
                <option value="Low">E Ulët</option>
                <option value="Medium">Mesatare</option>
                <option value="High">E Lartë</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-sm text-sm"
            >
              Shto Lëndë
            </button>
          </form>
        </div>

        {/* Create Topic Form */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Shto Temë</h2>
          <p className="text-xs text-gray-500 mb-5">
            Shto një temë brenda një lënde
          </p>

          <form onSubmit={createTopic} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Lënda
              </label>
              <select
                name="subjectId"
                value={topicForm.subjectId}
                onChange={handleTopicChange}
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
                Titulli i Temës
              </label>
              <input
                type="text"
                name="title"
                value={topicForm.title}
                onChange={handleTopicChange}
                required
                className={inputClass}
                placeholder="P.sh. SQL Joins"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Vështirësia
              </label>
              <select
                name="difficulty"
                value={topicForm.difficulty}
                onChange={handleTopicChange}
                className={inputClass}
              >
                <option value="Easy">E Lehtë</option>
                <option value="Medium">Mesatare</option>
                <option value="Hard">E Vështirë</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Statusi
              </label>
              <select
                name="status"
                value={topicForm.status}
                onChange={handleTopicChange}
                className={inputClass}
              >
                <option value="Not Started">Nuk ka filluar</option>
                <option value="In Progress">Në Progres</option>
                <option value="Completed">Përfunduar</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-sm text-sm"
            >
              Shto Temë
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subjects list */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Lëndët</h2>
            <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
              {subjects.length} gjithsej
            </span>
          </div>

          <div className="space-y-3">
            {subjects.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">📚</div>
                <p className="text-gray-500 text-sm font-medium">
                  Nuk ka ende lëndë të regjistruara.
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Shto një lëndë për të filluar analizën e progresit.
                </p>
              </div>
            ) : (
              subjects.map((subject) => {
                const daysLeft = getDaysUntil(subject.examDeadline);
                return (
                  <div
                    key={subject.id}
                    className="bg-gray-50 border border-gray-200 rounded-xl p-4"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {subject.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                          {subject.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="text-xs text-gray-500">
                            Provimi:{" "}
                            <span
                              className={
                                daysLeft <= 3
                                  ? "text-red-600 font-semibold"
                                  : daysLeft <= 7
                                  ? "text-amber-600 font-semibold"
                                  : "text-gray-600"
                              }
                            >
                              {daysLeft > 0
                                ? `${daysLeft} ditë`
                                : "Ka skaduar"}
                            </span>
                          </span>
                          <span
                            className={`text-xs border px-2 py-0.5 rounded-full font-medium ${
                              priorityStyles[subject.priority] ||
                              "text-gray-600 bg-gray-50 border-gray-200"
                            }`}
                          >
                            {subject.priority === "High"
                              ? "E Lartë"
                              : subject.priority === "Medium"
                              ? "Mesatare"
                              : "E Ulët"}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteSubject(subject.id)}
                        className="text-gray-400 hover:text-red-500 transition text-sm shrink-0 hover:bg-red-50 w-7 h-7 rounded-lg flex items-center justify-center"
                        title="Fshi lëndën"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Topics list */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Temat</h2>
            <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
              {topics.length} gjithsej
            </span>
          </div>

          <div className="space-y-3">
            {topics.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">📝</div>
                <p className="text-gray-500 text-sm font-medium">
                  Nuk ka ende tema të regjistruara.
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Shto tema pasi të kesh krijuar një lëndë.
                </p>
              </div>
            ) : (
              topics.map((topic) => (
                <div
                  key={topic.id}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-4"
                >
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {topic.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {getSubjectName(topic.subjectId)}
                  </p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <span
                      className={`text-xs border px-2 py-0.5 rounded-full font-medium ${
                        difficultyStyles[topic.difficulty] ||
                        "text-gray-600 bg-gray-50 border-gray-200"
                      }`}
                    >
                      {topic.difficulty === "Hard"
                        ? "E Vështirë"
                        : topic.difficulty === "Medium"
                        ? "Mesatare"
                        : "E Lehtë"}
                    </span>
                    <span
                      className={`text-xs border px-2 py-0.5 rounded-full font-medium ${
                        statusStyles[topic.status] ||
                        "text-gray-600 bg-gray-50 border-gray-200"
                      }`}
                    >
                      {topic.status === "Completed"
                        ? "Përfunduar"
                        : topic.status === "In Progress"
                        ? "Në Progres"
                        : "Nuk ka filluar"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Subjects;
