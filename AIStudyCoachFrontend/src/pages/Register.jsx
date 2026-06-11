import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "Student",
  });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      await api.post("/auth/register", formData);
      setMessage({
        text: "Llogaria u krijua me sukses! Po ridrejtoheni te kyçja...",
        type: "success",
      });
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setMessage({
        text:
          err.response?.data ||
          "Regjistrimi dështoi. Ju lutemi provoni përsëri.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-8">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-xl tracking-tight">AI</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Krijo llogari studenti
          </h1>
          <p className="text-gray-500 text-sm mt-1.5">
            Regjistrohu si student dhe fillo të studion me inteligjencë
            artificiale
          </p>
        </div>

        {/* Info badge */}
        <div className="mb-6 flex items-center gap-2.5 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
          <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">i</span>
          </div>
          <p className="text-sm text-blue-700">
            Regjistrimi është vetëm për studentë. Admini krijohet nga sistemi
            dhe nuk mund të regjistrohet nga kjo faqe.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          {message.text && (
            <div
              className={`mb-6 flex items-start gap-3 rounded-xl px-4 py-3.5 border ${
                message.type === "success"
                  ? "bg-emerald-50 border-emerald-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full shrink-0 mt-0.5 ${
                  message.type === "success" ? "bg-emerald-500" : "bg-red-500"
                }`}
              />
              <p
                className={`text-sm ${
                  message.type === "success"
                    ? "text-emerald-700"
                    : "text-red-700"
                }`}
              >
                {message.text}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Emri i plotë
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder="Emri Mbiemri"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Adresa e email-it
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="student@shembull.com"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Fjalëkalimi
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Zgjidhni një fjalëkalim të fortë"
                className={inputClass}
              />
            </div>

            {/* Role indicator — read-only, always Student */}
            <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
              <span className="text-sm text-gray-600">
                Roli:{" "}
                <span className="font-semibold text-blue-700">Student</span>
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-xl transition-colors shadow-sm text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
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
                  Po krijohet llogaria...
                </span>
              ) : (
                "Regjistrohu si Student"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          Keni tashmë llogari?{" "}
          <Link
            to="/login"
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            Kyçuni
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
