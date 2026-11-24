import { NavLink } from 'react-router'
import { MODULES } from '../constants/modules'

const NAV_SECTIONS = [
  { title: 'Operações', paths: ['/tickets', '/agenda'] },
  { title: 'Gestão', paths: ['/dashboard', '/clients', '/team', '/services', '/inventory'] },
  { title: 'Registos & Sistema', paths: ['/reports'] },
]

const ICON_PATHS = {
  '/dashboard': <><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></>,
  '/tickets': <><path d="M6 3h9l4 4v14H6z" /><path d="M14 3v5h5M9 12h7M9 16h7" /></>,
  '/agenda': <><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 10h16M8 14h.01M12 14h.01M16 14h.01" /></>,
  '/clients': <><circle cx="9" cy="8" r="3" /><path d="M3.5 19a5.5 5.5 0 0 1 11 0M16 5.5a3 3 0 0 1 0 5.8M17 14a5 5 0 0 1 3.5 4.8" /></>,
  '/team': <><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0M16 5a3 3 0 0 1 2.5 4.7M18 14a5 5 0 0 1 3 4.5" /></>,
  '/services': <><path d="M9 3h6M10 3v6.5l-4.5 7A2 2 0 0 0 7.2 20h9.6a2 2 0 0 0 1.7-3.5l-4.5-7V3M8 15h8" /></>,
  '/inventory': <><path d="M4 7h16v14H4zM3 3h18v4H3zM9 11h6" /></>,
  '/reports': <><path d="M4 19V5M4 19h17M7 15l4-4 3 2 5-6" /><path d="M16 7h3v3" /></>,
}

function BrandLogo() {
  return (
    <div className="flex items-center gap-2.5 px-5 py-4">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[#00577b] text-white">
        <svg viewBox="0 0 32 32" fill="none" className="h-6 w-6" aria-hidden="true"><path d="M5 10c3.5-3 6.5 3 10 0s6.5-3 12 0M5 16c3.5-3 6.5 3 10 0s6.5-3 12 0M5 22c3.5-3 6.5 3 10 0s6.5-3 12 0" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" /></svg>
      </span>
      <span className="min-w-0 leading-tight"><span className="block text-[13px] font-bold tracking-tight text-[#073c5b]">GUIMÁGUA</span><span className="block text-[8px] font-semibold tracking-[.18em] text-[#0876a5]">SMART POOL OPS</span></span>
    </div>
  )
}

export default function Sidebar({ open, onNavigate }) {
  const moduleByPath = new Map(MODULES.map((module) => [module.path, module]))

  return (
    <aside className={`${open ? 'flex' : 'hidden'} w-56 shrink-0 flex-col border-r border-slate-100 bg-white text-slate-700 md:flex`}>
      <BrandLogo />
      <nav aria-label="Navegação principal" className="flex-1 px-3 pb-3">
        {NAV_SECTIONS.map((section) => <section key={section.title} className="mb-3">
          <h2 className="px-2 pb-1.5 pt-2 text-[9px] font-semibold uppercase tracking-[.08em] text-slate-500">{section.title}</h2>
          <div className="space-y-0.5">{section.paths.map((path) => {
            const item = moduleByPath.get(path)
            if (!item) return null
            return <NavLink key={item.path} to={item.path} onClick={onNavigate} className={({ isActive }) => `flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[11px] transition-colors ${isActive ? 'bg-blue-50 font-semibold text-primary' : 'text-slate-700 hover:bg-slate-50 hover:text-primary'}`}>
              {({ isActive }) => <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary' : 'text-slate-600'}`}>{ICON_PATHS[item.path]}</svg><span className="min-w-0 flex-1 truncate">{item.label}</span></>}
            </NavLink>
          })}</div>
        </section>)}
      </nav>
    </aside>
  )
}
