'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import { CLASS_BATCH_OPTIONS, GROUP_OPTIONS } from '@/lib/validation'

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

// Label: English bold + Tamil small below
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

interface FD {
  name: string; countryCode: string; localPhone: string
  classBatch: string; group: string
  numberOfAdults: string; numberOfKids: string; contributionAmount: string
  email: string; spouseName: string; dateOfBirth: string
  marriageAnniversary: string; profession: string
}
interface FE { name?: string; phone?: string; classBatch?: string; numberOfAdults?: string; contributionAmount?: string; email?: string; general?: string }

const init: FD = {
  name: '', countryCode: '+91', localPhone: '', classBatch: '', group: '',
  numberOfAdults: '1', numberOfKids: '0', contributionAmount: '0',
  email: '', spouseName: '', dateOfBirth: '', marriageAnniversary: '', profession: '',
}

export default function RegistrationForm() {
  const router = useRouter()
  const [form, setForm]       = useState<FD>(init)
  const [errors, setErrors]   = useState<FE>({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [hasMic, setHasMic]   = useState(false)

  useEffect(() => {
    setHasMic(!!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition)
  }, [])

  const country = COUNTRIES.find(c => c.code === form.countryCode) ?? COUNTRIES[0]
  const set = (f: keyof FD) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(p => ({ ...p, [f]: e.target.value }))
    setErrors(p => ({ ...p, general: undefined }))
  }
  const voice = (f: keyof FD) => (t: string) => setForm(p => ({ ...p, [f]: t }))

  function validate(): FE {
    const e: FE = {}
    if (!form.name.trim())   e.name = 'பெயர் தேவை / Name is required'
    const digits = form.localPhone.replace(/\D/g, '')
    if (!digits || digits.length < 6) e.phone = 'சரியான எண் / Valid phone required'
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
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    const phoneNumber = `${form.countryCode}${form.localPhone.replace(/\D/g, '')}`
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
          dateOfBirth: form.dateOfBirth || null, marriageAnniversary: form.marriageAnniversary || null,
          profession: form.profession.trim() || null,
        }),
      })
      const data = await res.json()
      if (res.status === 409) { setErrors({ general: 'இந்த எண் ஏற்கனவே பதிவு / Phone already registered.' }); return }
      if (!res.ok) { setErrors({ general: data.message || data.error || 'பதிவு தோல்வி / Registration failed.' }); return }
      setSubmitted(true)
      const q = new URLSearchParams({ name: data.member.name, batch: data.member.classBatch, people: String((data.member.numberOfAdults ?? 1) + (data.member.numberOfKids ?? 0)), amount: data.member.contributionAmount })
      router.push(`/success?${q.toString()}`)
    } catch {
      setErrors({ general: 'இணையத் தொடர்பு பிழை / Network error.' })
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">

      {/* Full Name */}
      <div>
        <Label en="Full Name" ta="முழு பெயர்" required />
        <div className="relative">
          <input type="text" placeholder="உங்கள் முழு பெயர் / Your full name"
            value={form.name} onChange={set('name')} maxLength={200}
            autoComplete="name" tabIndex={1}
            className={inputCls(!!errors.name)} />
          {hasMic && <MicBtn onResult={voice('name')} />}
        </div>
        {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
      </div>

      {/* Phone */}
      <div>
        <Label en="Phone Number" ta="தொலைபேசி எண்" required />
        <div className="flex gap-2">
          <select value={form.countryCode} onChange={set('countryCode')} tabIndex={2}
            className="rounded-xl border border-gray-300 px-2 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c] bg-white w-28 shrink-0">
            {COUNTRIES.map((c, i) => (
              <option key={i} value={c.code}>{c.flag} {c.code}</option>
            ))}
          </select>
          <div className="relative flex-1">
            <input type="tel" placeholder={`${country.maxLen} digits`}
              value={form.localPhone} onChange={set('localPhone')}
              maxLength={country.maxLen + 1} tabIndex={3}
              className={inputCls(!!errors.phone)} />
            {hasMic && <MicBtn onResult={voice('localPhone')} />}
          </div>
        </div>
        {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
        <p className="text-xs text-gray-400 mt-1">உங்கள் பதிவு ID · Your registration ID</p>
      </div>

      {/* Class/Batch */}
      <div>
        <Label en="Class / Batch" ta="வகுப்பு / தொகுதி" required />
        <select value={form.classBatch} onChange={set('classBatch')} tabIndex={4}
          className={inputCls(!!errors.classBatch)}>
          <option value="">— தேர்வு செய்க / Select —</option>
          {CLASS_BATCH_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        {errors.classBatch && <p className="text-xs text-red-600 mt-1">{errors.classBatch}</p>}
      </div>

      {/* Group */}
      <div>
        <Label en="Group" ta="குழு (அடுத்த வகுப்பு)" />
        <select value={form.group} onChange={set('group')} tabIndex={5} className={inputCls()}>
          <option value="">— குழு / Group —</option>
          {GROUP_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      {/* Adults + Kids — 2 col on all screens, simple labels */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label en="Adults" ta="பெரியவர்கள் (18+)" required />
          <input type="number" min={1} max={20} value={form.numberOfAdults}
            onChange={set('numberOfAdults')} tabIndex={6}
            className={inputCls(!!errors.numberOfAdults)} />
          {errors.numberOfAdults && <p className="text-xs text-red-600 mt-1">{errors.numberOfAdults}</p>}
        </div>
        <div>
          <Label en="Kids" ta="குழந்தைகள் (12 கீழ்)" />
          <input type="number" min={0} max={20} value={form.numberOfKids}
            onChange={set('numberOfKids')} tabIndex={7} className={inputCls()} />
        </div>
      </div>

      {/* Contribution */}
      <div>
        <Label en="Contribution (₹)" ta="பங்களிப்பு தொகை" required />
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
          <input type="number" min={0} step={1}
            value={form.contributionAmount}
            onChange={e => setForm(p => ({ ...p, contributionAmount: String(Math.max(0, parseInt(e.target.value) || 0)) }))}
            tabIndex={8}
            className="w-full rounded-xl border border-gray-300 pl-8 pr-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c] bg-white" />
        </div>
        <p className="text-xs text-gray-400 mt-1">பங்களிக்கவில்லை என்றால் 0 · Enter 0 if not contributing</p>
      </div>

      {/* Payment Status — read-only, always Pending */}
      <div>
        <Label en="Payment Status" ta="கட்டண நிலை" />
        <div className="relative">
          <select
            disabled
            value="PENDING"
            className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm bg-gray-50 text-gray-400 cursor-not-allowed appearance-none"
          >
            <option value="PENDING">⏳ Pending</option>
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
            🔒
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">நிர்வாகி மட்டும் மாற்றலாம் · Updated by organizer only</p>
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
            value={form.email} onChange={set('email')} tabIndex={9}
            className={inputCls(!!errors.email)} />
          {hasMic && <MicBtn onResult={voice('email')} />}
        </div>
        {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
      </div>

      {/* Spouse */}
      <div>
        <Label en="Wife / Spouse Name" ta="மனைவி பெயர்" />
        <div className="relative">
          <input type="text" placeholder="மனைவி பெயர்"
            value={form.spouseName} onChange={set('spouseName')} maxLength={200}
            tabIndex={10} className={inputCls()} />
          {hasMic && <MicBtn onResult={voice('spouseName')} />}
        </div>
      </div>

      {/* Profession */}
      <div>
        <Label en="Profession" ta="தொழில்" />
        <div className="relative">
          <input type="text" placeholder="Doctor, Engineer, Business…"
            value={form.profession} onChange={set('profession')} maxLength={200}
            tabIndex={11} className={inputCls()} />
          {hasMic && <MicBtn onResult={voice('profession')} />}
        </div>
      </div>

      {/* DOB + Anniversary — 2 col, short labels */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label en="Date of Birth" ta="பிறந்த தேதி" />
          <input type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')}
            max={new Date().toISOString().split('T')[0]} tabIndex={12}
            className="w-full rounded-xl border border-gray-300 px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c] bg-white" />
        </div>
        <div>
          <Label en="Anniversary" ta="திருமண நாள்" />
          <input type="date" value={form.marriageAnniversary} onChange={set('marriageAnniversary')}
            max={new Date().toISOString().split('T')[0]} tabIndex={13}
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
      <Button type="submit" className="w-full mt-2" size="lg" loading={loading} disabled={submitted} tabIndex={14}>
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
