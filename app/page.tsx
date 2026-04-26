import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen gradient-hero">
      {/* Nav */}
      <nav className="w-full border-b border-[#E2E8F0] bg-white/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center shadow-md">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <circle cx="12" cy="12" r="4" />
                <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" />
              </svg>
            </div>
            <span className="font-bold text-[#0F172A] tracking-tight">Digital Vision Test</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-xs font-medium bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A] px-2.5 py-1 rounded-full">
              ⚠ Solo estimación — no diagnóstico médico
            </span>
            <Link href="/instructions" className="text-sm font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors">
              Comenzar →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="animate-fade-in inline-flex items-center gap-2 bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] px-4 py-1.5 rounded-full text-sm font-semibold mb-8">
            <span className="w-1.5 h-1.5 bg-[#2563EB] rounded-full animate-pulse" />
            Test visual interactivo con voz
          </div>

          {/* Headline */}
          <h1 className="animate-slide-up delay-100 text-5xl sm:text-6xl lg:text-7xl font-bold text-[#0F172A] leading-tight tracking-tight mb-6">
            Conoce tu visión{' '}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #2563EB, #3B82F6)' }}>
              desde casa
            </span>
          </h1>

          {/* Subheadline */}
          <p className="animate-slide-up delay-200 text-xl text-[#475569] max-w-2xl mx-auto leading-relaxed mb-12">
            Una estimación interactiva de tu agudeza visual usando letras tipo Snellen y reconocimiento de voz.
            Rápido, claro y orientado a que sepas cuándo consultar a un especialista.
          </p>

          {/* CTA */}
          <div className="animate-slide-up delay-300 flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link
              href="/instructions"
              className="inline-flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-lg px-8 py-4 rounded-2xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Comenzar prueba
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <span className="text-[#94A3B8] text-sm">~3 minutos · Sin registro</span>
          </div>

          {/* Feature grid */}
          <div className="animate-slide-up delay-400 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {[
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                  </svg>
                ),
                title: 'Reconocimiento de voz',
                desc: 'Di las letras que ves. Sin teclear.',
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-9v9m3-6.75v6.75" />
                  </svg>
                ),
                title: 'Estimación Snellen',
                desc: 'Resultados en formato 20/X estándar.',
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 12c0 6.627 5.373 12 12 12s12-5.373 12-12c0-2.196-.589-4.255-1.617-6.027" />
                  </svg>
                ),
                title: 'Calibración personalizada',
                desc: 'Se adapta a tu pantalla exacta.',
              },
            ].map((f) => (
              <div key={f.title} className="bg-white border border-[#E2E8F0] rounded-2xl p-5 text-left shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-[#EFF6FF] rounded-xl flex items-center justify-center text-[#2563EB] mb-3">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-[#0F172A] text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-[#475569] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Disclaimer + Footer */}
      <footer className="border-t border-[#E2E8F0] bg-white/60 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#94A3B8] text-center sm:text-left max-w-lg">
            <strong className="text-[#475569]">Aviso legal:</strong> Digital Vision Test es una herramienta de estimación, no un
            instrumento médico. Los resultados no reemplazan la evaluación de un profesional de la salud visual.
          </p>
          <span className="text-xs text-[#CBD5E1]">© {new Date().getFullYear()} Digital Vision Test</span>
        </div>
      </footer>
    </div>
  );
}
