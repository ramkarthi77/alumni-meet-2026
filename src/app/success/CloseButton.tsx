'use client'

export default function CloseButton() {
  const handleClose = () => {
    // Try window.close() first
    window.close()
    // If that didn't work (browser blocked it), show a message after 300ms
    setTimeout(() => {
      const btn = document.getElementById('close-btn')
      if (btn) {
        btn.textContent = '✓ Registration complete! You can close this tab.'
        btn.style.backgroundColor = '#6b7280'
        btn.style.cursor = 'default'
      }
    }, 300)
  }

  return (
    <button
      id="close-btn"
      onClick={handleClose}
      className="w-full bg-[#155e36] hover:bg-[#1a7a44] text-white font-semibold py-3 px-6 rounded-xl transition-colors text-sm"
    >
      ✓ Done — Close this page
    </button>
  )
}
