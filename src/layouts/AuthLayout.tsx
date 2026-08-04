import { CheckCircle, LockKey, ShieldCheck } from "@phosphor-icons/react";
import { Link, Outlet } from "react-router-dom";
import ThemeToggle from "../components/common/ThemeToggle";

const trustPoints = [
  "Organization-scoped access",
  "Purpose and consent controls",
  "Audited high-risk actions",
];

export default function AuthLayout() {
  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-[minmax(360px,0.85fr)_minmax(520px,1.15fr)] dark:bg-slate-950">
      <aside className="relative hidden overflow-hidden bg-[#071d38] px-10 py-10 text-white lg:flex lg:flex-col">
        <Link to="/" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl border border-primary-400/40 bg-primary-500/15 text-primary-200"><ShieldCheck size={26} /></span>
          <div><p className="text-xl font-extrabold">Medfinet</p><p className="text-xs font-semibold text-slate-400">Connected child health operations</p></div>
        </Link>
        <div className="my-auto max-w-md py-16">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-300">Secure workspace</p>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight text-white">Trusted access for every care setting.</h1>
          <p className="mt-5 text-base leading-7 text-slate-300">Continue into a role-specific workspace built for clinical continuity, field operations and accountable programme delivery.</p>
          <ul className="mt-8 space-y-4">
            {trustPoints.map((point) => <li key={point} className="flex items-center gap-3 text-sm font-semibold text-slate-200"><CheckCircle size={20} className="text-primary-300" />{point}</li>)}
          </ul>
        </div>
        <div className="flex items-center gap-3 border-t border-white/10 pt-6 text-xs text-slate-400"><LockKey size={18} />Sensitive records remain protected by role, scope and purpose.</div>
      </aside>

      <section className="flex min-w-0 flex-col bg-[#f7f9fb] dark:bg-slate-950">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8 dark:border-slate-800 dark:bg-slate-950">
          <Link to="/" className="flex items-center gap-2 font-extrabold text-slate-950 lg:hidden dark:text-white"><ShieldCheck size={25} className="text-primary-700" />Medfinet</Link>
          <Link to="/" className="hidden text-sm font-bold text-slate-600 transition hover:text-primary-700 lg:block dark:text-slate-300">Back to Medfinet</Link>
          <ThemeToggle />
        </header>
        <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
          <div className="w-full max-w-[480px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-900"><Outlet /></div>
        </main>
        <footer className="px-4 pb-6 text-center text-xs text-slate-500">© {new Date().getFullYear()} Medfinet · Secure child health operations</footer>
      </section>
    </div>
  );
}
