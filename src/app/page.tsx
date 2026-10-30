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

      {/* ── Header ── */}
      <header className="text-center pt-4 pb-6 px-4">

        {/* School emblem */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-full mb-5 border-2 border-[#c9a84c]/50">
          <svg className="w-10 h-10 text-[#c9a84c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
          </svg>
        </div>

        {/* School name — English */}
        <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight tracking-tight">
          DVC Higher Secondary School
        </h1>

        {/* School name — Tamil */}
        <p className="text-[#c9a84c] text-lg sm:text-xl font-semibold mt-1">
          டிவிசி மேல்நிலைப் பள்ளி
        </p>

        {/* Location */}
        <p className="text-white/60 text-sm mt-1 tracking-wide">
          Srimushnam · ஸ்ரீமுஷ்ணம்
        </p>

        {/* Divider */}
        <div className="mt-4 mb-4 flex justify-center gap-2">
          <div className="w-16 h-0.5 bg-[#c9a84c]/60 rounded" />
          <div className="w-3  h-0.5 bg-[#c9a84c]/30 rounded" />
          <div className="w-3  h-0.5 bg-[#c9a84c]/30 rounded" />
        </div>

        {/* Event title */}
        <h2 className="text-3xl sm:text-4xl font-bold text-white font-serif">
          Alumni Meet 2026
        </h2>
        <p className="text-[#c9a84c]/90 text-base sm:text-lg font-medium mt-2">
          Reconnect. Celebrate. Cherish Our Memories.
        </p>
        <p className="text-white/50 text-sm mt-1">
          மீண்டும் சந்திப்போம். கொண்டாடுவோம். நினைவுகளை நெஞ்சில் தாங்குவோம்.
        </p>

        {/* Batch tag */}
        <div className="mt-4 inline-flex items-center gap-2 bg-[#c9a84c]/20 border border-[#c9a84c]/40 rounded-full px-5 py-1.5">
          <span className="text-[#c9a84c] text-sm font-semibold">
            6th – 12th Standard · Batch of 2000
          </span>
        </div>
      </header>

      {/* ── School Photo ── */}
      <div className="max-w-lg mx-auto px-4 mb-6">
        <div className="rounded-2xl overflow-hidden border-2 border-[#c9a84c]/40 shadow-xl">
          <img
            src="/school.png"
            alt="DVC Higher Secondary School, Srimushnam"
            className="w-full h-48 sm:h-64 object-cover object-center"
          />
          <div className="bg-black/60 text-center py-2">
            <p className="text-[#c9a84c] text-xs font-medium tracking-wide">
              க.வி.சே. மேல்நிலைப்பள்ளி · Srimushnam
            </p>
          </div>
        </div>
      </div>

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
