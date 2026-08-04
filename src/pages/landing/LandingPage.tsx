import {
  ArrowRight,
  Broadcast,
  CheckCircle,
  CloudSun,
  CreditCard,
  FirstAidKit,
  GlobeHemisphereWest,
  LockKey,
  ShieldCheck,
} from "@phosphor-icons/react";
import { Link } from "react-router-dom";

const capabilities = [
  { icon: FirstAidKit, title: "Longitudinal care", text: "Clinical records, immunization, growth, appointments and care alerts stay connected to one child identity." },
  { icon: CreditCard, title: "Protected NFC access", text: "Trusted devices and controlled card lifecycles support fast identification without exposing clinical data on the card." },
  { icon: Broadcast, title: "Low-connectivity services", text: "USSD supports safe reminders, callbacks, card support and programme access where mobile data is unreliable." },
  { icon: CloudSun, title: "Response operations", text: "Teams coordinate climate and outbreak worklists, referrals and accountable service delivery." },
];

const assurances = [
  "Organization-scoped authorization",
  "Purpose and consent controls",
  "Maker-checker review for critical changes",
  "Minimum-necessary disclosure",
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#071d38] text-primary-300"><ShieldCheck size={24} /></span>
            <div><p className="font-extrabold text-slate-950">Medfinet</p><p className="hidden text-[11px] font-semibold text-slate-500 sm:block">Connected child health operations</p></div>
          </Link>
          <nav aria-label="Public navigation" className="flex items-center gap-1 sm:gap-3">
            <a href="#capabilities" className="hidden rounded-lg px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 sm:inline-flex">Capabilities</a>
            <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">Sign in</Link>
            <Link to="/register" className="mf-button-primary !min-h-9 px-3 sm:px-4">Create account</Link>
          </nav>
        </div>
      </header>

      <section className="border-b border-slate-200 bg-[#f7f9fb]">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[1.08fr_.92fr] lg:items-center lg:py-24">
          <div>
            <p className="mf-eyebrow">Care continuity in every setting</p>
            <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-[1.08] text-slate-950 sm:text-5xl lg:text-[3.5rem]">One trusted operational system for connected child health.</h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">Medfinet connects authorized caregivers, health workers and programme teams across clinical care, NFC, USSD, climate response and governance—without compromising privacy.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/login" className="mf-button-primary !min-h-12 px-5">Open secure workspace <ArrowRight size={18} /></Link>
              <a href="#capabilities" className="mf-button-secondary !min-h-12 px-5">Explore the platform</a>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs font-bold text-slate-500">
              <span className="flex items-center gap-2"><LockKey size={17} className="text-primary-700" />Role and scope controlled</span>
              <span className="flex items-center gap-2"><GlobeHemisphereWest size={17} className="text-primary-700" />Built for low connectivity</span>
            </div>
          </div>

          <aside className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <div className="border-b border-slate-200 bg-[#071d38] px-6 py-5 text-white">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary-300">Operational assurance</p>
              <h2 className="mt-2 text-2xl font-extrabold text-white">High-trust workflows by design</h2>
              <p className="mt-2 text-sm text-slate-300">Sensitive actions are explicit, bounded and reviewable.</p>
            </div>
            <div className="divide-y divide-slate-100">
              {assurances.map((item) => <div key={item} className="flex items-center gap-3 px-6 py-4"><span className="grid h-9 w-9 place-items-center rounded-lg bg-primary-50 text-primary-700"><CheckCircle size={20} /></span><p className="text-sm font-bold text-slate-800">{item}</p></div>)}
            </div>
            <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 text-xs font-semibold text-slate-500">Backend-driven records · Audited changes · Safe empty and recovery states</div>
          </aside>
        </div>
      </section>

      <section id="capabilities" className="mx-auto max-w-7xl px-5 py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr]">
          <div><p className="mf-eyebrow">Core capabilities</p><h2 className="mt-3 text-3xl font-extrabold text-slate-950">Designed around real care workflows.</h2><p className="mt-4 text-sm leading-7 text-slate-600">Every module uses authenticated backend records with clear loading, empty, error and recovery states.</p></div>
          <div className="divide-y divide-slate-200 border-y border-slate-200">
            {capabilities.map(({ icon: Icon, title, text }) => <article key={title} className="grid gap-3 py-5 sm:grid-cols-[48px_180px_minmax(0,1fr)] sm:items-center"><span className="grid h-11 w-11 place-items-center rounded-lg bg-primary-50 text-primary-700"><Icon size={23} /></span><h3 className="text-base font-extrabold">{title}</h3><p className="text-sm text-slate-600">{text}</p></article>)}
          </div>
        </div>
      </section>

      <section className="bg-[#071d38] text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-5 py-12 sm:flex-row sm:items-center">
          <div><h2 className="text-2xl font-extrabold text-white">Enter your verified organization workspace.</h2><p className="mt-2 text-sm text-slate-300">Your membership determines the tools and records available to you.</p></div>
          <Link to="/login" className="mf-button !min-h-12 bg-white px-5 text-[#071d38] hover:bg-slate-100">Continue securely <ArrowRight size={18} /></Link>
        </div>
      </section>
      <footer className="border-t border-slate-200 px-5 py-6 text-center text-xs font-semibold text-slate-500">© {new Date().getFullYear()} Medfinet. Clinical access is role-, scope-, purpose- and consent-controlled.</footer>
    </main>
  );
}
