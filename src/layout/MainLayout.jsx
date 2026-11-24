import { useState } from 'react'
import { Outlet } from 'react-router'
import Sidebar from './Sidebar'
import Header from './Header'
import Footer from './Footer'

export default function MainLayout() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f8fc] md:flex-row">
      <Sidebar open={menuOpen} onNavigate={() => setMenuOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header menuOpen={menuOpen} onToggleMenu={() => setMenuOpen((open) => !open)} />
        <main className="w-full flex-1 p-3 sm:p-4 lg:p-5">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  )
}
