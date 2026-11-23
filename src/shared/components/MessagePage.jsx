import { Link } from 'react-router'

export default function MessagePage({ code, title, message, linkTo, linkLabel = 'Voltar ao início', action }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg">
        {code && <p className="text-5xl font-bold text-primary">{code}</p>}
        <h1 className="mt-2 text-2xl font-bold text-slate-800">{title}</h1>
        {message && <p className="mt-2 text-slate-600">{message}</p>}
        {action && <div className="mt-6">{action}</div>}
        {linkTo && (
          <Link to={linkTo} className="mt-4 inline-block text-primary hover:underline">
            {linkLabel}
          </Link>
        )}
      </div>
    </div>
  )
}
