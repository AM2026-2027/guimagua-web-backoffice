const YEAR = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white px-6 py-3 text-center text-xs text-slate-500">
      © {YEAR} Guimágua Smart Pool · Backoffice
    </footer>
  )
}
