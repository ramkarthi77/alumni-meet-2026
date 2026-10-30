import RegistrationForm from '@/components/forms/RegistrationForm'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0d3321] via-[#155e36] to-[#0d3321]">

      {/* ── Organizer login link — top right ── */}
      <div className="flex justify-end px-4 pt-4">
        <a href="/organizer/login"
          className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 hover:text-white rounded-full px-4 py-1.5 text-xs font-medium transition-all">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          </svg>
          Organizer Login
        </a>
      </div>

      {/* ── Hero — school photo with title overlay ── */}
      <header className="relative h-52 sm:h-64 overflow-hidden">
        <img
          src="/school.png"
          alt="DVC Higher Secondary School, Srimushnam"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 flex flex-col items-center justify-end pb-5 px-4 text-center">
          <h1 className="text-white text-xl sm:text-2xl font-bold leading-tight">
            DVC Higher Secondary School · Alumni Meet 2026
          </h1>
          <p className="text-[#c9a84c] text-sm mt-1">6th – 12th Standard · Batch of 2000</p>
        </div>
      </header>

      {/* ── Form card ── */}
      <section className="max-w-lg mx-auto px-4 pb-16">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

          {/* Card header */}
          <div className="bg-gradient-to-r from-[#155e36] to-[#1a7a44] px-8 py-5">
            <h3 className="text-white text-lg font-semibold">Registration Form · பதிவு படிவம்</h3>
            <p className="text-white/70 text-sm mt-0.5">
              Fill in your details to confirm your attendance
            </p>
            <p className="text-white/50 text-xs mt-0.5">
              உங்கள் விவரங்களை நிரப்பி பதிவு செய்யுங்கள்
            </p>
          </div>

          <div className="p-6 sm:p-8">
            <RegistrationForm />
          </div>
        </div>

      </section>
    </main>
  )
}
