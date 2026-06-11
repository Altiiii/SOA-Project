import { useEffect, useState } from "react";
import api from "../api/api";

function AdminDashboard() {
  const fullName = localStorage.getItem("fullName");
  const [users, setUsers] = useState([]);
  const [subjectCount, setSubjectCount] = useState(null);
  const [sessionCount, setSessionCount] = useState(null);
  const [quizCount, setQuizCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const usersRes = await api.get("/users/");
        setUsers(usersRes.data);
      } catch {
        setError("Nuk u arrit të merreshin të dhënat e përdoruesve.");
      } finally {
        setLoading(false);
      }

      try {
        const subjectsRes = await api.get("/subjects/");
        setSubjectCount(subjectsRes.data.length);
      } catch {
        /* optional — leave null */
      }

      try {
        const sessionsRes = await api.get("/study-sessions/");
        setSessionCount(sessionsRes.data.length);
      } catch {
        /* optional */
      }

      try {
        const quizRes = await api.get("/quiz-results/");
        setQuizCount(quizRes.data.length);
      } catch {
        /* optional */
      }
    };

    fetchAll();
  }, []);

  const students = users.filter((u) => u.role === "Student");
  const admins = users.filter((u) => u.role === "Admin");

  const statCards = [
    {
      label: "Përdorues Gjithsej",
      value: loading ? "…" : users.length,
      color: "text-blue-700",
      bg: "bg-blue-50 border-blue-200",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
    },
    {
      label: "Studentë të Regjistruar",
      value: loading ? "…" : students.length,
      color: "text-indigo-700",
      bg: "bg-indigo-50 border-indigo-200",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
        </svg>
      ),
    },
    {
      label: "Lëndë të Regjistruara",
      value: subjectCount === null ? "—" : subjectCount,
      color: "text-emerald-700",
      bg: "bg-emerald-50 border-emerald-200",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      ),
    },
    {
      label: "Sesione Studimi",
      value: sessionCount === null ? "—" : sessionCount,
      color: "text-purple-700",
      bg: "bg-purple-50 border-purple-200",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Rezultate Quiz-esh",
      value: quizCount === null ? "—" : quizCount,
      color: "text-rose-700",
      bg: "bg-rose-50 border-rose-200",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 mb-8 text-white shadow-lg">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-amber-400/20 border border-amber-400/30 flex items-center justify-center">
                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <span className="text-slate-300 text-sm font-medium">Paneli i Adminit</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">
              Mirë se erdhe{fullName ? `, ${fullName}` : ""}!
            </h1>
            <p className="text-slate-300 text-base">
              Statistikat e sistemit dhe menaxhimi i përdoruesve të platformës.
            </p>
          </div>
          <div className="hidden lg:flex w-20 h-20 rounded-2xl bg-white/10 border border-white/10 items-center justify-center shrink-0">
            <svg className="w-10 h-10 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
            </svg>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map((card, i) => (
          <div key={i} className={`border rounded-2xl p-6 shadow-sm ${card.bg}`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-600 text-sm font-medium">{card.label}</p>
              <div className={`${card.color} opacity-70`}>{card.icon}</div>
            </div>
            <p className={`text-4xl font-extrabold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Users table */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Lista e Përdoruesve
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Të gjithë përdoruesit e regjistruar në sistem
            </p>
          </div>
          {!loading && (
            <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium">
              {users.length} gjithsej
            </span>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
            <svg className="w-4 h-4 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : users.length === 0 && !error ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <p className="text-gray-400 font-medium">Nuk ka përdorues ende.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Header row */}
            <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <span className="col-span-1">#</span>
              <span className="col-span-4">Emri</span>
              <span className="col-span-5">Email</span>
              <span className="col-span-2 text-right">Roli</span>
            </div>
            {users.map((user, idx) => (
              <div
                key={user.id}
                className="grid grid-cols-12 gap-4 items-center bg-gray-50 hover:bg-blue-50/50 border border-gray-100 hover:border-blue-200 rounded-xl px-4 py-3.5 transition-colors"
              >
                <span className="col-span-1 text-xs text-gray-400 font-medium">{idx + 1}</span>
                <div className="col-span-4 flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      user.role === "Admin"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {user.fullName?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {user.fullName}
                  </p>
                </div>
                <p className="col-span-5 text-gray-500 text-sm truncate">{user.email}</p>
                <div className="col-span-2 flex justify-end">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                      user.role === "Admin"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                    }`}
                  >
                    {user.role === "Admin" ? "Admin" : "Student"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default AdminDashboard;
