/**
 * Format a number as Indian Rupees.
 */
export function formatINR(amount: number | string | null | undefined): string {
  const n = Number(amount ?? 0)
  if (isNaN(n)) return '₹0'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n)
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  })
}
