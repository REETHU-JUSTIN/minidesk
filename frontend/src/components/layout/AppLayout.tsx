import { useState } from 'react'
import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { TopNav } from './TopNav'

interface AppLayoutProps {
  title: string
  currentPage: string
  children: ReactNode
}

// The shell around every signed-in page. "children" is whichever page is showing.
export function AppLayout({ title, currentPage, children }: AppLayoutProps) {
  // Only the layout cares whether the mobile menu is open, so local state is enough.
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      <Sidebar currentPage={currentPage} isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      {/* min-w-0 lets wide tables scroll inside their card instead of stretching the page */}
      <div className="flex min-w-0 flex-1 flex-col">
        <TopNav title={title} onOpenMenu={() => setIsMenuOpen(true)} />
        <main className="flex-1 space-y-6 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
