import { NavLink } from 'react-router'
import { MODULES } from '../constants/modules'

export default function Sidebar({ open, onNavigate }) {
  return (
    <aside
      className={`${open ? 'flex' : 'hidden'} md:flex w-60 shrink-0 flex-col bg-primary text-white`}
    >
      <div className="px-6 py-5 text-lg font-bold">Guimágua Smart Pool</div>
      <nav className="flex-1 space-y-1 px-3 pb-4">
        {MODULES.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onNavigate}
            className={({ isActive }) =>
              `block rounded-lg px-3 py-2 text-sm ${
                isActive ? 'bg-white/20 font-semibold' : 'hover:bg-white/10'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
