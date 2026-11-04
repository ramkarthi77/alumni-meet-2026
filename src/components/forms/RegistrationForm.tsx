'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
// useRef kept for MicBtn internal use
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import { CLASS_BATCH_OPTIONS, GROUP_OPTIONS } from '@/lib/validation'

// ─── Country list ─────────────────────────────────────────────────────────────
const COUNTRIES = [
  { code: '+91',  flag: '🇮🇳', name: 'India',        maxLen: 10 },
  { code: '+971', flag: '🇦🇪', name: 'UAE',          maxLen: 9  },
  { code: '+1',   flag: '🇺🇸', name: 'USA',          maxLen: 10 },
  { code: '+44',  flag: '🇬🇧', name: 'UK',           maxLen: 10 },
  { code: '+61',  flag: '🇦🇺', name: 'Australia',    maxLen: 9  },
  { code: '+65',  flag: '🇸🇬', name: 'Singapore',    maxLen: 8  },
  { code: '+60',  flag: '🇲🇾', name: 'Malaysia',     maxLen: 9  },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia', maxLen: 9  },
  { code: '+974', flag: '🇶🇦', name: 'Qatar',        maxLen: 8  },
  { code: '+94',  flag: '🇱🇰', name: 'Sri Lanka',    maxLen: 9  },
  { code: '+49',  flag: '🇩🇪', name: 'Germany',      maxLen: 11 },
  { code: '+33',  flag: '🇫🇷', name: 'France',       maxLen: 9  },
  { code: '+81',  flag: '🇯🇵', name: 'Japan',        maxLen: 10 },
]

// ─── Mic button ───────────────────────────────────────────────────────────────
function MicBtn({ onResult }: { onResult: (t: string) => void }) {
  const [on, setOn] = useState(false)
  const ref = useRef<any>(null)
  const start = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return
    const r = new SR()
    r.lang = 'ta-IN'
    r.onresult = (e: any) => { onResult(e.results[0][0].transcript); setOn(false) }
    r.onerror = r.onend = () => setOn(false)
    r.start(); ref.current = r; setOn(true)
  }
  const stop = () => { ref.current?.stop(); setOn(false) }
  return (
    <button type="button" onClick={on ? stop : start}
      className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full transition-all
        ${on ? 'text-red-500 animate-pulse' : 'text-gray-300 hover:text-[#155e36]'}`}>
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
      </svg>
    </button>
  )
}

// ─── Label ────────────────────────────────────────────────────────────────────
function Label({ en, ta, required }: { en: string; ta: string; required?: boolean }) {
  return (
    <div className="mb-1">
      <span className="text-sm font-semibold text-gray-800">{en}</span>
      {required && <span className="text-red-500 text-xs ml-1">*</span>}
      <div className="text-xs text-[#155e36] font-medium leading-tight">{ta}</div>
    </div>
  )
}

const inputCls = (err?: boolean) =>
  `w-full rounded-xl border px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c] bg-white
   ${err ? 'border-red-400 bg-red-50' : 'border-gray-300'}`

// ─── Types ────────────────────────────────────────────────────────────────────
type Step = 'phone' | 'otp' | 'form'

interface FD {
  name: string; countryCode: string; localPhone: string
  classBatch: string; group: string
  numberOfAdults: string; numberOfKids: string; contributionAmount: string
  email: string; spouseName: string; dateOfBirth: string
  marriageAnniversary: string; profession: string
}
interface FE {
  name?: string; phone?: string; otp?: string; classBatch?: string
  numberOfAdults?: string; contributionAmount?: string; email?: string; general?: string
}

const initForm: FD = {
  name: '', countryCode: '+91', localPhone: '', classBatch: '', group: '',
  numberOfAdults: '1', numberOfKids: '0', contributionAmount: '0',
  email: '', spouseName: '', dateOfBirth: '', marriageAnniversary: '', profession: '',
}

// ─── Close / Reset button ─────────────────────────────────────────────────────
function CloseBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Reset / Close"
      className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full
                 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
      </svg>
    </button>
  )
}


// ─── Main Component ──────────────────────────────────────────────────────────
export default function RegistrationForm() {
  const router = useRouter()

  const [step, setStep]         = useState<Step>('phone')
  const [form, setForm]         = useState<FD>(initForm)
  const [errors, setErrors]     = useState<FE>({})
  const [loading, setLoading]   = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [hasMic, setHasMic]     = useState(false)

  // OTP step state
  const [otpValue, setOtpValue]       = useState('')
  const [otpError, setOtpError]       = useState('')
  const [resendTimer, setResendTimer] = useState(0)
  const [devOtp, setDevOtp]           = useState<string | null>(null)

  useEffect(() => {
    setHasMic(!!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition)
    // Reset form on every fresh page load (handles browser back button from success page)
    reset()
    // Skip OTP step entirely when NEXT_PUBLIC_REQUIRE_OTP is not 'true'
    if (process.env.NEXT_PUBLIC_REQUIRE_OTP !== 'true') {
      setStep('form')
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer <= 0) return
    const t = setTimeout(() => setResendTimer(r => r - 1), 1000)
    return () => clearTimeout(t)
  }, [resendTimer])

  const country      = COUNTRIES.find(c => c.code === form.countryCode) ?? COUNTRIES[0]
  const phoneNumber  = `${form.countryCode}${form.localPhone.replace(/\D/g, '')}`
  const maskedPhone  = `${form.countryCode} ${'*'.repeat(Math.max(0, form.localPhone.length - 3))}${form.localPhone.slice(-3)}`

  const set = (f: keyof FD) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(p => ({ ...p, [f]: e.target.value }))
    setErrors(p => ({ ...p, general: undefined }))
  }
  const voice = (f: keyof FD) => (t: string) => setForm(p => ({ ...p, [f]: t }))

  // ── Reset everything ───────────────────────────────────────────────────────
  const reset = useCallback(() => {
    setStep('phone')
    setForm(initForm)
    setErrors({})
    setOtpValue('')
    setOtpError('')
    setResendTimer(0)
    setDevOtp(null)
    setSubmitted(false)
  }, [])

  // ── Step 1: Send OTP (or skip directly to form) ────────────────────────────
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    const digits = form.localPhone.replace(/\D/g, '')
    if (!digits || digits.length !== country.maxLen) {
      setErrors({ phone: `Phone number must be exactly ${country.maxLen} digits · ${country.maxLen} இலக்கம் தேவை` })
      return
    }

    // Skip OTP — go directly to form when NEXT_PUBLIC_REQUIRE_OTP is not 'true'
    if (process.env.NEXT_PUBLIC_REQUIRE_OTP !== 'true') {
      setStep('form')
      return
    }

    setLoading(true)
    setErrors({})
    try {
      const res  = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrors({ general: data.error ?? 'Failed to send OTP.' })
        return
      }
      if (data.devOtp) setDevOtp(data.devOtp)
      setResendTimer(60)
      setStep('otp')
    } catch {
      setErrors({ general: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  // ── Step 2: Verify OTP ─────────────────────────────────────────────────────
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    if (otpValue.length < 6) {
      setOtpError('Please enter the full 6-digit OTP.')
      return
    }
    setLoading(true)
    setOtpError('')
    try {
      const res  = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, otp: otpValue }),
      })
      const data = await res.json()
      if (!res.ok) {
        setOtpError(data.error ?? 'Verification failed.')
        if (res.status === 429) {
          // Block further tries; reset after a moment
          setOtpValue('')
        }
        return
      }
      setStep('form')
    } catch {
      setOtpError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Step 2: Resend OTP ─────────────────────────────────────────────────────
  async function handleResend() {
    setOtpValue('')
    setOtpError('')
    setLoading(true)
    try {
      const res  = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      })
      const data = await res.json()
      if (!res.ok) { setOtpError(data.error ?? 'Failed to resend OTP.'); return }
      if (data.devOtp) setDevOtp(data.devOtp)
      setResendTimer(60)
    } catch {
      setOtpError('Network error.')
    } finally {
      setLoading(false)
    }
  }

  // ── Step 3: Submit registration ────────────────────────────────────────────
  function validateForm(): FE {
    const e: FE = {}
    if (!form.name.trim())   e.name = 'பெயர் தேவை / Name is required'
    if (!form.classBatch)    e.classBatch = 'வகுப்பு தேர்வு / Select class'
    const na = parseInt(form.numberOfAdults)
    if (isNaN(na) || na < 1) e.numberOfAdults = 'குறைந்தது 1 / Min 1 adult'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'சரியான மின்னஞ்சல் / Valid email'
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitted) return
    const errs = validateForm()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(), phoneNumber,
          classBatch: form.classBatch, group: form.group || null,
          numberOfAdults: parseInt(form.numberOfAdults) || 1,
          numberOfKids: parseInt(form.numberOfKids) || 0,
          contributionAmount: Math.max(0, parseFloat(form.contributionAmount) || 0),
          email: form.email.trim() || null, spouseName: form.spouseName.trim() || null,
          dateOfBirth: form.dateOfBirth || null,
          marriageAnniversary: form.marriageAnniversary || null,
          profession: form.profession.trim() || null,
        }),
      })
      const data = await res.json()
      if (res.status === 409) { setErrors({ general: 'இந்த எண் ஏற்கனவே பதிவு / Phone already registered.' }); return }
      if (!res.ok) { setErrors({ general: data.message || data.error || 'பதிவு தோல்வி / Registration failed.' }); return }
      setSubmitted(true)
      const q = new URLSearchParams({
        name: data.member.name, batch: data.member.classBatch,
        people: String((data.member.numberOfAdults ?? 1) + (data.member.numberOfKids ?? 0)),
        amount: data.member.contributionAmount,
      })
      router.push(`/success?${q.toString()}`)
    } catch {
      setErrors({ general: 'இணையத் தொடர்பு பிழை / Network error.' })
    } finally { setLoading(false) }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ── STEP 1: Phone number ──────────────────────────────────────────────────
  // ════════════════════════════════════════════════════════════════════════════
  if (step === 'phone') {
    return (
      <form onSubmit={handleSendOtp} noValidate className="space-y-5 relative">
        <CloseBtn onClick={reset} />

        {/* Header */}
        <div className="text-center pb-1">
          <div className="w-14 h-14 rounded-full bg-[#f0fdf4] border-2 border-[#155e36]/20 flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-[#155e36]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
            </svg>
          </div>
          <h2 className="text-base font-bold text-gray-800">Enter your mobile number</h2>
          <p className="text-xs text-gray-500 mt-0.5">உங்கள் கைபேசி எண்ணை உள்ளிடவும்</p>
        </div>

        {/* Phone field */}
        <div>
          <Label en="Mobile Number" ta="கைபேசி எண்" required />
          <div className="flex gap-2">
            <select value={form.countryCode} onChange={set('countryCode')}
              className="rounded-xl border border-gray-300 px-2 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c] bg-white w-28 shrink-0">
              {COUNTRIES.map((c, i) => (
                <option key={i} value={c.code}>{c.flag} {c.code}</option>
              ))}
            </select>
            <input type="tel" placeholder={`${country.maxLen} digits`}
              value={form.localPhone} onChange={set('localPhone')}
              maxLength={country.maxLen} autoFocus
              className={inputCls(!!errors.phone)} />
          </div>
          {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
          <p className="text-xs text-gray-400 mt-1">
            📱 OTP will be sent as SMS to this number
          </p>
        </div>

        {errors.general && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700 flex items-start gap-2">
            <span className="text-base leading-none mt-0.5">⚠️</span>
            <span>{errors.general}</span>
          </div>
        )}

        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Send OTP via SMS →
        </Button>

        <p className="text-center text-xs text-gray-400">
          🔐 SMS OTP வழியாக மட்டுமே பதிவு சாத்தியம்
        </p>
      </form>
    )
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ── STEP 2: OTP verification ──────────────────────────────────────────────
  // ════════════════════════════════════════════════════════════════════════════
  if (step === 'otp') {
    return (
      <form onSubmit={handleVerifyOtp} noValidate className="space-y-5 relative">
        <CloseBtn onClick={reset} />

        {/* Header */}
        <div className="text-center pb-1">
          <div className="w-14 h-14 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mx-auto mb-3 text-2xl">
            📩
          </div>
          <h2 className="text-base font-bold text-gray-800">Check your SMS</h2>
          <p className="text-sm text-gray-600 mt-1">
            OTP sent to <span className="font-semibold text-[#155e36]">{maskedPhone}</span>
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            உங்கள் கைபேசிக்கு SMS OTP அனுப்பப்பட்டது
          </p>
        </div>

        {/* Dev mode OTP hint */}
        {devOtp && (
          <div className="rounded-xl bg-amber-50 border border-amber-300 p-3 text-sm text-amber-800 text-center">
            🛠 <strong>Dev mode OTP:</strong> {devOtp}
          </div>
        )}

        {/* OTP input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Enter OTP · OTP உள்ளிடவும்
          </label>
          <input
            type="tel"
            inputMode="numeric"
            maxLength={6}
            placeholder="Enter 6-digit OTP"
            value={otpValue}
            onChange={e => {
              const v = e.target.value.replace(/\D/g, '').slice(0, 6)
              setOtpValue(v)
              setOtpError('')
            }}
            autoFocus
            className="w-full rounded-xl border-2 border-gray-300 px-4 py-4 text-2xl font-bold tracking-widest text-center focus:outline-none focus:border-[#155e36] focus:ring-2 focus:ring-[#155e36]/20 bg-white"
          />
          {otpError && (
            <p className="text-sm text-red-600 mt-2 text-center">{otpError}</p>
          )}
        </div>

        <Button type="submit" className="w-full" size="lg"
          loading={loading} disabled={otpValue.length < 6}>
          Verify OTP · சரிபார்க்கவும் ✓
        </Button>

        {/* Resend + change number */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
          <button type="button" onClick={() => setStep('phone')}
            className="text-[#155e36] hover:underline font-medium">
            ← Change number
          </button>
          {resendTimer > 0 ? (
            <span>Resend in {resendTimer}s</span>
          ) : (
            <button type="button" onClick={handleResend}
              className="text-[#155e36] hover:underline font-medium" disabled={loading}>
              Resend OTP
            </button>
          )}
        </div>
      </form>
    )
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ── STEP 3: Full registration form ────────────────────────────────────────
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5 relative">
      <CloseBtn onClick={reset} />

      {/* Verified phone banner */}
      <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-2.5">
        <span className="text-green-600 text-lg">✅</span>
        <div>
          <p className="text-xs font-semibold text-green-800">WhatsApp Verified</p>
          <p className="text-xs text-green-700 font-mono">{phoneNumber}</p>
        </div>
        <button type="button" onClick={() => setStep('phone')}
          className="ml-auto text-xs text-green-600 hover:underline shrink-0">
          Change
        </button>
      </div>

      {/* Full Name */}
      <div>
        <Label en="Full Name" ta="முழு பெயர்" required />
        <div className="relative">
          <input type="text" placeholder="உங்கள் முழு பெயர் / Your full name"
            value={form.name} onChange={set('name')} maxLength={75}
            autoComplete="name" tabIndex={1} autoFocus
            className={inputCls(!!errors.name)} />
          {hasMic && <MicBtn onResult={voice('name')} />}
        </div>
        {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
      </div>

      {/* Class/Batch + Group */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label en="Class / Batch" ta="வகுப்பு / தொகுதி" required />
          <select value={form.classBatch} onChange={set('classBatch')} tabIndex={2}
            className={inputCls(!!errors.classBatch)}>
            <option value="">— Select —</option>
            {CLASS_BATCH_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          {errors.classBatch && <p className="text-xs text-red-600 mt-1">{errors.classBatch}</p>}
        </div>
        <div>
          <Label en="Group" ta="குழு" />
          <select value={form.group} onChange={set('group')} tabIndex={3} className={inputCls()}>
            <option value="">— Group —</option>
            {GROUP_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>

      {/* Adults + Kids */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label en="Adults" ta="பெரியவர்கள் (18+)" required />
          <input type="number" min={1} max={20} value={form.numberOfAdults}
            onChange={set('numberOfAdults')} tabIndex={4}
            className={inputCls(!!errors.numberOfAdults)} />
          {errors.numberOfAdults && <p className="text-xs text-red-600 mt-1">{errors.numberOfAdults}</p>}
        </div>
        <div>
          <Label en="Kids" ta="குழந்தைகள் (12 கீழ்)" />
          <input type="number" min={0} max={20} value={form.numberOfKids}
            onChange={set('numberOfKids')} tabIndex={5} className={inputCls()} />
        </div>
      </div>

      {/* Contribution + Payment Status */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label en="Contribution (₹)" ta="பங்களிப்பு தொகை" required />
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
            <input type="number" min={0} step={1}
              value={form.contributionAmount}
              onChange={e => setForm(p => ({ ...p, contributionAmount: String(Math.max(0, parseInt(e.target.value) || 0)) }))}
              tabIndex={6}
              className="w-full rounded-xl border border-gray-300 pl-8 pr-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c] bg-white" />
          </div>
          <p className="text-xs text-gray-400 mt-1">0 if not contributing</p>
        </div>
        <div>
          <Label en="Payment Status" ta="கட்டண நிலை" />
          <div className="relative">
            <select disabled value="PENDING"
              className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm bg-gray-50 text-gray-400 cursor-not-allowed appearance-none">
              <option value="PENDING">⏳ Pending</option>
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">🔒</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Organizer only</p>
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 font-medium">Optional · விரும்பினால்</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Email */}
      <div>
        <Label en="Email ID" ta="மின்னஞ்சல்" />
        <div className="relative">
          <input type="email" placeholder="example@gmail.com"
            value={form.email} onChange={set('email')} tabIndex={7}
            className={inputCls(!!errors.email)} />
          {hasMic && <MicBtn onResult={voice('email')} />}
        </div>
        {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
      </div>

      {/* Spouse Name — changed from "Wife / Spouse Name" */}
      <div>
        <Label en="Spouse Name" ta="மனைவி / கணவர் பெயர்" />
        <div className="relative">
          <input type="text" placeholder="மனைவி / கணவர் பெயர்"
            value={form.spouseName} onChange={set('spouseName')} maxLength={200}
            tabIndex={8} className={inputCls()} />
          {hasMic && <MicBtn onResult={voice('spouseName')} />}
        </div>
      </div>

      {/* Profession */}
      <div>
        <Label en="Profession" ta="தொழில்" />
        <div className="relative">
          <input type="text" placeholder="Doctor, Engineer, Business…"
            value={form.profession} onChange={set('profession')} maxLength={200}
            tabIndex={9} className={inputCls()} />
          {hasMic && <MicBtn onResult={voice('profession')} />}
        </div>
      </div>

      {/* DOB + Anniversary */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label en="Date of Birth" ta="பிறந்த தேதி" />
          <input type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')}
            max={new Date().toISOString().split('T')[0]} tabIndex={10}
            className="w-full rounded-xl border border-gray-300 px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c] bg-white" />
        </div>
        <div>
          <Label en="Anniversary" ta="திருமண நாள்" />
          <input type="date" value={form.marriageAnniversary} onChange={set('marriageAnniversary')}
            max={new Date().toISOString().split('T')[0]} tabIndex={11}
            className="w-full rounded-xl border border-gray-300 px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c] bg-white" />
        </div>
      </div>

      {/* Error */}
      {errors.general && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {errors.general}
        </div>
      )}

      {/* Submit */}
      <Button type="submit" className="w-full mt-2" size="lg" loading={loading} disabled={submitted} tabIndex={12}>
        {submitted ? 'பதிவு செய்யப்பட்டது! ✓' : 'Submit Registration · பதிவு செய்க'}
      </Button>

      {hasMic && (
        <p className="text-center text-xs text-gray-400">
          🎙 மைக் ஐகானை தொடவும் · Tap mic for voice input
        </p>
      )}
    </form>
  )
}
