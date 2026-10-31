'use client'

export default function CloseButton() {
  return (
    <button
      onClick={() => window.close()}
      className="w-full bg-[#155e36] hover:bg-[#1a7a44] text-white font-semibold py-3 px-6 rounded-xl transition-colors text-sm"
    >
      ✓ Done — Close this page
    </button>
  )
}
