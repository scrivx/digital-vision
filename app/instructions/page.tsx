import Link from 'next/link';

const steps = [
  {
    number: '01',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
    title: 'Distancia al monitor',
    description: 'Siéntate a exactamente 3 metros (10 pies) de tu pantalla. Usa una cinta o pasos para medir.',
    detail: '3 metros / 10 pies',
    color: 'bg-blue-50 text-blue-600 border-blue-100',
  },
  {
    number: '02',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
      </svg>
    ),
    title: 'Activar micrófono',
    description: 'El test usa reconocimiento de voz. Habla con voz clara y normal al decir cada letra.',
    detail: 'Requiere permiso de micrófono',
    color: 'bg-violet-50 text-violet-600 border-violet-100',
  },
  {
    number: '03',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <circle cx="12" cy="12" r="4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m-9-9h1m16 0h1" />
      </svg>
    ),
    title: 'Cubre un ojo',
    description: 'Usa la palma de tu mano sin presionar el ojo. Haz el test dos veces: ojo derecho e izquierdo.',
    detail: 'Un ojo a la vez',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  },
  {
    number: '04',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
    title: 'Di las letras en voz alta',
    description: 'Lee cada letra que veas, de izquierda a derecha. Si no puedes, dí "no sé" o presiona omitir.',
    detail: 'Habla claro y despacio',
    color: 'bg-amber-50 text-amber-600 border-amber-100',
  },
];

export default function InstructionsPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#E2E8F0]">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[#475569] hover:text-[#0F172A] transition-colors text-sm font-medium">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Inicio
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#94A3B8]">Paso 1 de 3</span>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all ${i === 0 ? 'w-6 bg-[#2563EB]' : 'w-3 bg-[#E2E8F0]'}`} />
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
        {/* Title */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary shadow-lg shadow-blue-500/30 mb-6">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-[#0F172A] mb-3">Antes de comenzar</h1>
          <p className="text-[#475569] max-w-md mx-auto">
            Sigue estos pasos para obtener la estimación más precisa posible.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className={`bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all animate-slide-up`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl border flex items-center justify-center ${step.color}`}>
                  {step.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-[#94A3B8] tracking-widest">{step.number}</span>
                  </div>
                  <h3 className="font-semibold text-[#0F172A] mb-1">{step.title}</h3>
                  <p className="text-sm text-[#475569] leading-relaxed mb-2">{step.description}</p>
                  <span className="inline-block text-xs font-medium text-[#94A3B8] bg-[#F8FAFC] border border-[#E2E8F0] px-2 py-0.5 rounded-full">
                    {step.detail}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl p-5 mb-10 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-[#D97706] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-[#92400E] mb-1">Aviso importante</p>
              <p className="text-sm text-[#78350F] leading-relaxed">
                Esta herramienta ofrece solo una <strong>estimación</strong> de tu agudeza visual. No reemplaza la evaluación de un oftalmólogo u optómetra certificado. Si experimentas cambios visuales, consulta a un profesional.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center animate-slide-up" style={{ animationDelay: '500ms' }}>
          <Link
            href="/calibration"
            className="inline-flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-base px-8 py-4 rounded-2xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            Entendido, continuar
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
          <p className="text-xs text-[#94A3B8] mt-3">Siguiente: calibración de pantalla</p>
        </div>
      </main>
    </div>
  );
}
