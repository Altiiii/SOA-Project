import { Link } from "react-router-dom";

const steps = [
  {
    num: 1,
    title: "Regjistro lëndët dhe temat",
    desc: "Shto lëndët dhe temat specifike që duhet të studiosh për provim.",
  },
  {
    num: 2,
    title: "Shto sesionet e studimit",
    desc: "Regjistro sa minuta ke studiuar për çdo temë dhe lëndë.",
  },
  {
    num: 3,
    title: "Shto rezultatet e quiz-eve",
    desc: "Hyr rezultatet e testeve për të matur njohuritë sipas temës.",
  },
  {
    num: 4,
    title: "AI Coach analizon progresin",
    desc: "Sistemi vlerëson rrezikun dhe identifikon temat e dobëta automatikisht.",
  },
  {
    num: 5,
    title: "Merr rekomandime personale",
    desc: "Merr plan studimi të personalizuar para provimit bazuar në të dhënat tua.",
  },
];

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: "Analiza e Progresit",
    desc: "Shiko minutat e studimit, sesionet dhe mesataret në kohë reale.",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
    ),
    title: "Temat e Dobëta",
    desc: "Identifikon automatikisht temat ku ke nevojë për rishikim.",
    color: "text-red-600",
    bg: "bg-red-50",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
    title: "AI Rekomandime",
    desc: "Merr plan studimi të personalizuar bazuar në analizën e të dhënave tua.",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: "Parashikimi i Suksesit",
    desc: "Vlerëson shanset e kalimit të provimit dhe nivelin e rrezikut në kohë reale.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
];


function Landing() {
  return (
    <div className="bg-white">
      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/60 to-indigo-100/80">
        {/* decorative blobs */}
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-indigo-200 rounded-full opacity-25 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-200 rounded-full opacity-20 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-white/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-6 pt-20 pb-24 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur border border-indigo-200 text-indigo-700 text-xs font-semibold px-4 py-2 rounded-full mb-8 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            Platforma Inteligjente e Studimit
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight mb-6">
            Mirë se erdhe në{" "}
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
              }}
            >
              AI Study Coach PRO
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Platforma inteligjente që të ndihmon të studiosh më mençur, të
            zbulosh temat e dobëta dhe të përgatitesh më mirë për provime.
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-blue-200 text-sm"
            >
              Regjistrohu falas
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-800 font-semibold px-8 py-3.5 rounded-xl border border-gray-300 transition-all text-sm shadow-sm"
            >
              Kyçu
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">
            Funksionalitetet
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Çfarë ofron platforma?
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">
            Mjetet e nevojshme për të studiuar me eficencë dhe arritur
            rezultate më të mira në provime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <div
              key={i}
              className="group bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:border-blue-200 hover:-translate-y-0.5"
            >
              <div className={`w-12 h-12 rounded-xl ${f.bg} ${f.color} flex items-center justify-center mb-5`}>
                {f.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-base">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-slate-50 to-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-24">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">
              Procesi
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Si funksionon?
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Pesë hapa të thjeshtë për të filluar të studiosh me
              inteligjencë artificiale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="relative flex flex-col items-center text-center">
                {/* connector */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-7 left-[calc(50%+2rem)] right-[calc(-50%+2rem)] h-px bg-gradient-to-r from-blue-300 to-blue-100" />
                )}
                <div className="relative z-10 w-14 h-14 rounded-2xl bg-blue-600 text-white font-extrabold text-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-100">
                  {step.num}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-2 leading-snug">
                  {step.title}
                </h3>
                <p className="text-gray-400 text-xs leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why section ────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <div
          className="rounded-3xl p-10 md:p-16 text-white relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #1d4ed8 0%, #4338ca 50%, #3730a3 100%)",
          }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

          <div className="relative max-w-3xl mx-auto text-center">
            <p className="text-blue-200 text-sm font-semibold uppercase tracking-widest mb-4">
              Pse AI Study Coach PRO?
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
              Pse përdoret ky aplikacion?
            </h2>
            <p className="text-blue-100 text-base leading-relaxed mb-10 max-w-2xl mx-auto">
              AI Study Coach PRO ndihmon studentët të mos studiojnë pa plan.
              Sistemi mbledh të dhëna për kohën e studimit, rezultatet e
              quiz-eve dhe temat e dobëta, pastaj i kthen ato në analizë,
              parashikim dhe rekomandime konkrete.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                to="/register"
                className="bg-white text-blue-700 hover:bg-blue-50 font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-blue-900/30 text-sm"
              >
                Fillo tani — është falas
              </Link>
              <Link
                to="/login"
                className="border border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-3.5 rounded-xl transition-all text-sm"
              >
                Kyçu
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Student benefits ───────────────────────────────────────── */}
      <section className="border-t border-gray-100 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-2">
              Për studentët
            </p>
            <h3 className="text-2xl font-bold text-gray-900">
              Studimi i organizuar fillon këtu
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Organizo lëndët dhe temat</h4>
              <p className="text-gray-500 text-sm leading-relaxed">
                Regjistro çdo lëndë me afatin e provimit dhe shto temat specifike
                që duhet të përgatitësh. Gjithçka e organizuar në një vend.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Regjistro kohën dhe quiz-et</h4>
              <p className="text-gray-500 text-sm leading-relaxed">
                Shëno minutat e studimit dhe rezultatet e quiz-eve për çdo temë.
                Sistemi ndjek progresin tënd automatikisht dhe zbulon temat e dobëta.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">AI Coach jep rekomandime</h4>
              <p className="text-gray-500 text-sm leading-relaxed">
                AI Coach analizon progresin tënd dhe të jep plan konkret studimi.
                Di çfarë të përqendrohesh, sa kohë të shpenzosh dhe sa gati je.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">AI</span>
            </div>
            <span className="font-bold text-gray-900 text-sm">AI Study Coach PRO</span>
          </div>
          <p className="text-gray-400 text-xs text-center">
            © 2025 AI Study Coach PRO — Platforma e Studimit Inteligjent
          </p>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Kyçu
            </Link>
            <Link to="/register" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              Regjistrohu
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
