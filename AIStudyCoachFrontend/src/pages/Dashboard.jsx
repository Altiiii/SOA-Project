import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";

function Dashboard() {
  const fullName = localStorage.getItem("fullName");
  const email = localStorage.getItem("email");
  const role = localStorage.getItem("role");
  const userId = Number(localStorage.getItem("userId")) || 1;

  const [progress, setProgress] = useState(null);
  const [subjectCount, setSubjectCount] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoadingProgress(true);
      try {
        const [progressRes, subjectsRes] = await Promise.all([
          api.get(`/progress/user/${userId}`),
          api.get(`/subjects/user/${userId}`),
        ]);
        setProgress(progressRes.data);
        setSubjectCount(subjectsRes.data.length);
      } catch (err) {
        console.log("Dashboard data load error:", err);
      } finally {
        setLoadingProgress(false);
      }
    };

    if (userId) {
      fetchDashboardData();
    }
  }, [userId]);

  const getScoreColor = (score) => {
    if (score >= 70) return "text-emerald-700";
    if (score >= 50) return "text-amber-700";
    return "text-red-700";
  };

  const getScoreBg = (score) => {
    if (score >= 70) return "bg-emerald-50 border-emerald-200";
    if (score >= 50) return "bg-amber-50 border-amber-200";
    return "bg-red-50 border-red-200";
  };

  const steps = [
    {
      num: "1",
      title: "Shto lëndët",
      desc: "Regjistro lëndët për provim",
      icon: "📚",
      to: "/subjects",
    },
    {
      num: "2",
      title: "Shto temat",
      desc: "Nëndo temat e secilës lëndë",
      icon: "📝",
      to: "/subjects",
    },
    {
      num: "3",
      title: "Regjistro studimin",
      desc: "Shëno minutat e studimit",
      icon: "⏱",
      to: "/study",
    },
    {
      num: "4",
      title: "Shto quiz-et",
      desc: "Regjistro rezultatet e testeve",
      icon: "✅",
      to: "/study",
    },
    {
      num: "5",
      title: "Analizo progresin",
      desc: "Shiko statistikat dhe temat e dobëta",
      icon: "📊",
      to: "/study",
    },
    {
      num: "6",
      title: "Merr rekomandime",
      desc: "AI Coach të udhëzon hap pas hapi",
      icon: "🤖",
      to: "/recommendations",
    },
  ];


  return (
    <div>
      {/* Hero card */}
      <div className="bg-linear-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 mb-8 text-white shadow-lg">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                <span className="text-white text-xs font-bold">AI</span>
              </div>
              <span className="text-blue-100 text-sm font-medium">
                AI Study Coach PRO
              </span>
            </div>
            <h1 className="text-3xl font-bold mb-2">
              Mirë se erdhe{fullName ? `, ${fullName}` : ""}!
            </h1>
            <p className="text-blue-100 text-base leading-relaxed max-w-xl">
              Platforma që të ndihmon të studiosh më mençur, të zbulosh temat e
              dobëta dhe të përgatitesh më mirë për provime.
            </p>
            <div className="flex gap-3 mt-5 flex-wrap">
              <Link
                to="/subjects"
                className="bg-white text-blue-700 hover:bg-blue-50 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
              >
                Shto Lëndë
              </Link>
              <Link
                to="/study"
                className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors border border-white/30"
              >
                Regjistro Studim
              </Link>
              <Link
                to="/recommendations"
                className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors border border-white/30"
              >
                Hap AI Coach
              </Link>
            </div>
          </div>
          <div className="hidden lg:flex w-28 h-28 rounded-2xl bg-white/10 border border-white/20 items-center justify-center shrink-0">
            <span className="text-5xl">🎓</span>
          </div>
        </div>
      </div>

      {/* Progress stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {loadingProgress ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-2xl p-5 animate-pulse"
            >
              <div className="h-3 bg-gray-200 rounded w-2/3 mb-3"></div>
              <div className="h-8 bg-gray-100 rounded w-1/2"></div>
            </div>
          ))
        ) : progress ? (
          <>
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <p className="text-gray-500 text-xs font-medium mb-1">
                Minutat e Studimit
              </p>
              <p className="text-3xl font-bold text-blue-600">
                {progress.totalStudyMinutes}
              </p>
              <p className="text-xs text-gray-400 mt-1">minuta totale</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <p className="text-gray-500 text-xs font-medium mb-1">
                Orët e Studimit
              </p>
              <p className="text-3xl font-bold text-indigo-600">
                {progress.totalStudyHours}
              </p>
              <p className="text-xs text-gray-400 mt-1">orë totale</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <p className="text-gray-500 text-xs font-medium mb-1">
                Sesionet e Studimit
              </p>
              <p className="text-3xl font-bold text-emerald-600">
                {progress.totalStudySessions}
              </p>
              <p className="text-xs text-gray-400 mt-1">sesione totale</p>
            </div>
            <div
              className={`border rounded-2xl p-5 shadow-sm ${getScoreBg(
                progress.averageScorePercentage
              )}`}
            >
              <p className="text-gray-500 text-xs font-medium mb-1">
                Mesatarja e Quiz-eve
              </p>
              <p
                className={`text-3xl font-bold ${getScoreColor(
                  progress.averageScorePercentage
                )}`}
              >
                {progress.averageScorePercentage}%
              </p>
              <p className="text-xs text-gray-400 mt-1">rezultat mesatar</p>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <p className="text-gray-500 text-xs font-medium mb-1">
                Minutat e Studimit
              </p>
              <p className="text-3xl font-bold text-gray-300">—</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <p className="text-gray-500 text-xs font-medium mb-1">
                Orët e Studimit
              </p>
              <p className="text-3xl font-bold text-gray-300">—</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <p className="text-gray-500 text-xs font-medium mb-1">Lëndët</p>
              <p className="text-3xl font-bold text-blue-400">{subjectCount}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <p className="text-gray-500 text-xs font-medium mb-1">
                Mesatarja e Quiz-eve
              </p>
              <p className="text-3xl font-bold text-gray-300">—</p>
            </div>
          </>
        )}
      </div>

      {/* Weak areas alert */}
      {progress && progress.weakAreas && progress.weakAreas.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-red-500 text-lg">⚠</span>
            <h3 className="font-semibold text-red-700">
              {progress.weakAreas.length} Temë e Dobët e Zbuluar
            </h3>
            <span className="text-xs text-red-400 ml-1">(nën 50%)</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {progress.weakAreas.map((area, i) => (
              <span
                key={i}
                className="text-xs bg-white border border-red-200 text-red-700 px-3 py-1 rounded-full font-medium"
              >
                Temë #{area.topicId} — {area.scorePercentage}%
              </span>
            ))}
          </div>
          <Link
            to="/recommendations"
            className="text-sm text-red-700 font-semibold hover:underline"
          >
            Shko te AI Coach për rekomandime →
          </Link>
        </div>
      )}

      {/* Empty state call-to-action */}
      {!loadingProgress && !progress && (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-8 text-center shadow-sm">
          <div className="text-5xl mb-3">📖</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Nuk ka ende të dhëna studimi
          </h3>
          <p className="text-gray-500 text-sm mb-5">
            Shto lëndë dhe sesione studimi për të filluar analizën e progresit
            tënd.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link
              to="/subjects"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              Shto Lëndë
            </Link>
            <Link
              to="/study"
              className="bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold px-5 py-2.5 rounded-xl border border-gray-300 transition-colors"
            >
              Regjistro Studim
            </Link>
          </div>
        </div>
      )}

      {/* Workflow steps */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-1">
          Si funksionon platforma?
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          Ndiq këta hapa për të maksimizuar progresin tënd
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {steps.map((step) => (
            <Link
              key={step.num}
              to={step.to}
              className="group bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-xl p-4 text-center transition-all"
            >
              <div className="text-2xl mb-2">{step.icon}</div>
              <div className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center mx-auto mb-2">
                {step.num}
              </div>
              <p className="text-xs font-semibold text-gray-800 group-hover:text-blue-700 mb-1">
                {step.title}
              </p>
              <p className="text-xs text-gray-400 leading-tight hidden md:block">
                {step.desc}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* AI Coach tip card */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
            <span className="text-white text-sm font-bold">AI</span>
          </div>
          <div>
            <h3 className="font-bold text-indigo-900 mb-1">Keshilla nga AI Coach</h3>
            <p className="text-indigo-700 text-sm leading-relaxed">
              Shto lëndë, regjistro sesione studimi dhe rezultate quiz-esh çdo ditë.
              Sa më shumë të dhëna, aq më të sakta bëhen rekomandimet e AI Coach.
              Kliko <strong>AI Coach</strong> për të marrë analizë dhe plan studimi të personalizuar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
