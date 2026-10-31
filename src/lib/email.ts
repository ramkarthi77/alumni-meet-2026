/**
 * Email utility using Resend (https://resend.com)
 * Free tier: 100 emails/day, 3,000/month — more than enough for this event.
 *
 * Setup:
 *  1. Sign up at resend.com (free)
 *  2. Get your API key
 *  3. Add RESEND_API_KEY and ALERT_EMAIL to your Vercel environment variables
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY
const ALERT_EMAIL = process.env.ALERT_EMAIL ?? 'admin@dvcalumni.com'
const FROM_EMAIL = process.env.FROM_EMAIL ?? 'Alumni App <alerts@dvcalumni.com>'

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY not set — skipping email')
    return false
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('[email] Resend error:', err)
      return false
    }

    console.log('[email] Sent:', subject, '→', to)
    return true
  } catch (err) {
    console.error('[email] Failed to send email:', err)
    return false
  }
}

// ─── Alert: Failed registration ───────────────────────────────────────────────
export async function sendFailedRegistrationAlert(details: {
  name?: string
  phone?: string
  error: string
}) {
  return sendEmail({
    to: ALERT_EMAIL,
    subject: '⚠️ Alumni Meet — Registration Failed',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <div style="background:#b91c1c;color:white;padding:16px 24px;border-radius:8px 8px 0 0">
          <h2 style="margin:0">⚠️ Registration Failed</h2>
        </div>
        <div style="background:#fff7f7;border:1px solid #fecaca;padding:20px 24px;border-radius:0 0 8px 8px">
          <p><strong>Name:</strong> ${details.name ?? 'Unknown'}</p>
          <p><strong>Phone:</strong> ${details.phone ?? 'Unknown'}</p>
          <p><strong>Error:</strong> ${details.error}</p>
          <p style="color:#6b7280;font-size:13px;margin-top:16px">
            Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
          </p>
        </div>
      </div>
    `,
  })
}

// ─── Alert: Daily summary ─────────────────────────────────────────────────────
export async function sendDailySummaryEmail(stats: {
  totalMembers: number
  totalAdults: number
  totalKids: number
  totalAmount: number
  newToday: number
  paidCount: number
  pendingCount: number
}) {
  return sendEmail({
    to: ALERT_EMAIL,
    subject: `📊 Alumni Meet — Daily Summary (${new Date().toLocaleDateString('en-IN')})`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <div style="background:#155e36;color:white;padding:16px 24px;border-radius:8px 8px 0 0">
          <h2 style="margin:0">📊 Daily Registration Summary</h2>
          <p style="margin:4px 0 0;opacity:0.85;font-size:14px">
            ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:20px 24px;border-radius:0 0 8px 8px">
          <table style="width:100%;border-collapse:collapse">
            <tr style="border-bottom:1px solid #d1fae5">
              <td style="padding:10px 0;color:#374151">Total Registrations</td>
              <td style="padding:10px 0;text-align:right;font-weight:700;font-size:18px">${stats.totalMembers}</td>
            </tr>
            <tr style="border-bottom:1px solid #d1fae5">
              <td style="padding:10px 0;color:#374151">New Today</td>
              <td style="padding:10px 0;text-align:right;font-weight:700;color:#155e36">${stats.newToday} 🆕</td>
            </tr>
            <tr style="border-bottom:1px solid #d1fae5">
              <td style="padding:10px 0;color:#374151">Total Adults</td>
              <td style="padding:10px 0;text-align:right;font-weight:600">${stats.totalAdults}</td>
            </tr>
            <tr style="border-bottom:1px solid #d1fae5">
              <td style="padding:10px 0;color:#374151">Total Kids</td>
              <td style="padding:10px 0;text-align:right;font-weight:600">${stats.totalKids}</td>
            </tr>
            <tr style="border-bottom:1px solid #d1fae5">
              <td style="padding:10px 0;color:#374151">Total Attending</td>
              <td style="padding:10px 0;text-align:right;font-weight:700;font-size:16px">${stats.totalAdults + stats.totalKids} 👥</td>
            </tr>
            <tr style="border-bottom:1px solid #d1fae5">
              <td style="padding:10px 0;color:#374151">Amount Collected</td>
              <td style="padding:10px 0;text-align:right;font-weight:700;color:#155e36">₹${stats.totalAmount.toLocaleString('en-IN')}</td>
            </tr>
            <tr style="border-bottom:1px solid #d1fae5">
              <td style="padding:10px 0;color:#374151">✅ Paid</td>
              <td style="padding:10px 0;text-align:right;font-weight:600;color:#065f46">${stats.paidCount}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#374151">⏳ Pending Payment</td>
              <td style="padding:10px 0;text-align:right;font-weight:600;color:#92400e">${stats.pendingCount}</td>
            </tr>
          </table>
          <p style="color:#6b7280;font-size:12px;margin-top:16px;text-align:center">
            Alumni Meet 2026 · DVC Higher Secondary School
          </p>
        </div>
      </div>
    `,
  })
}
