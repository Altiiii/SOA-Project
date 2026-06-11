import { Link, NavLink, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Subjects from "./pages/Subjects";
import Study from "./pages/Study";
import Recommendations from "./pages/Recommendations";

function App() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const fullName = localStorage.getItem("fullName");
  const role = localStorage.getItem("role");
  const isAdmin = role === "Admin";
  const isStudent = !!token && !isAdmin;

  const logout = () => {
    ["token", "userId", "fullName", "email", "role"].forEach((k) =>
      localStorage.removeItem(k)
    );
    navigate("/");
  };

  const navLinkClass = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? "bg-blue-50 text-blue-700 font-semibold"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    }`;

  const adminNavLinkClass = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? "bg-amber-50 text-amber-700 font-semibold"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    }`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Navbar ──────────────────────────────────────────────── */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
                <span className="text-white text-xs font-bold tracking-tight">AI</span>
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-gray-900 text-sm leading-tight block">
                  AI Study Coach PRO
                </span>
                <span className="text-xs text-gray-400 leading-tight block">
                  Platforma e Studimit Inteligjent
                </span>
              </div>
            </Link>

            {/* Student nav */}
            {isStudent && (
              <div className="hidden md:flex items-center gap-0.5">
                <NavLink to="/" end className={navLinkClass}>
                  Përmbledhje
                </NavLink>
                <NavLink to="/subjects" className={navLinkClass}>
                  Lëndët &amp; Temat
                </NavLink>
                <NavLink to="/study" className={navLinkClass}>
                  Studimi &amp; Quiz-et
                </NavLink>
                <NavLink to="/recommendations" className={navLinkClass}>
                  AI Coach
                </NavLink>
              </div>
            )}

            {/* Admin nav */}
            {isAdmin && (
              <div className="hidden md:flex items-center gap-0.5">
                <NavLink to="/" end className={adminNavLinkClass}>
                  Paneli i Adminit
                </NavLink>
              </div>
            )}

            {/* Right side */}
            <div className="flex items-center gap-3">
              {token ? (
                <>
                  <div className="hidden md:flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        isAdmin ? "bg-amber-100" : "bg-blue-100"
                      }`}
                    >
                      <span
                        className={`text-xs font-bold ${
                          isAdmin ? "text-amber-700" : "text-blue-700"
                        }`}
                      >
                        {fullName ? fullName.charAt(0).toUpperCase() : "?"}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 leading-tight">
                        {fullName}
                      </p>
                      <span
                        className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                          isAdmin
                            ? "bg-amber-50 text-amber-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {isAdmin ? "Admin" : "Student"}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    className="text-sm font-medium text-gray-600 hover:text-red-600 border border-gray-200 hover:border-red-300 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors"
                  >
                    Dil
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Kyçu
                  </Link>
                  <Link
                    to="/register"
                    className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors shadow-sm"
                  >
                    Regjistrohu
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ── Main content ─────────────────────────────────────────── */}
      {/* Landing is full-width; authenticated pages use the standard container */}
      <main className={token ? "max-w-7xl mx-auto px-6 py-8" : ""}>
        <Routes>
          {/* Home: landing for guests, role dashboard for logged-in users */}
          <Route
            path="/"
            element={
              !token ? (
                <Landing />
              ) : isAdmin ? (
                <AdminDashboard />
              ) : (
                <Dashboard />
              )
            }
          />

          {/* Public auth routes — redirect to home if already logged in */}
          <Route
            path="/login"
            element={token ? <Navigate to="/" replace /> : <Login />}
          />
          <Route
            path="/register"
            element={token ? <Navigate to="/" replace /> : <Register />}
          />

          {/* Student-only routes */}
          <Route
            path="/subjects"
            element={isStudent ? <Subjects /> : <Navigate to="/" replace />}
          />
          <Route
            path="/study"
            element={isStudent ? <Study /> : <Navigate to="/" replace />}
          />
          <Route
            path="/recommendations"
            element={
              isStudent ? <Recommendations /> : <Navigate to="/" replace />
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
