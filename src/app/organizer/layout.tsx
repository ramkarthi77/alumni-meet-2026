import OrganizerGuard from '@/components/layout/OrganizerGuard'

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  return <OrganizerGuard>{children}</OrganizerGuard>
}
