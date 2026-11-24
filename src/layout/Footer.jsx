const YEAR = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white/70 px-6 py-2 text-center text-[10px] text-slate-500">
      © {YEAR} Guimágua Smart Pool · Backoffice
    </footer>
  )
}
