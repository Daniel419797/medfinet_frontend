import {
  ArrowRight,
  CheckCircle,
  CloudArrowUp,
  DeviceMobile,
  Fingerprint,
  Heartbeat,
  ShieldCheck,
  UsersThree,
} from "@phosphor-icons/react";
import { Link } from "react-router-dom";

const capabilities = [
  {
    icon: Heartbeat,
    title: "Longitudinal child records",
    text: "Authorized teams can manage child identities, immunizations, growth checks, alerts, allergies and appointments through the Medfinet backend.",
  },
  {
    icon: Fingerprint,
    title: "NFC and QR-assisted access",
    text: "The web scanner and provisioning flows support Medfinet credentials. Physical NTAG215 performance and reader compatibility still require pilot validation.",
  },
  {
    icon: CloudArrowUp,
    title: "Intermittent-connectivity workflows",
    text: "Selected field operations can be encrypted in a browser queue and submitted idempotently when connectivity returns.",
  },
  {
    icon: UsersThree,
    title: "Role-scoped workspaces",
    text: "Caregivers, health workers, administrators, merchants and auditors receive separate routes and organization-scoped permissions.",
  },
];

const statusItems = [
  "Core identity, clinical, climate-response and organization workflows are connected to the backend API.",
  "Supabase manages browser authentication and session refresh.",
  "The frontend includes encrypted offline batches for a bounded set of operations.",
  "USSD/SMS providers, physical NFC hardware, interoperability partners and pilot performance remain validation work.",
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3 font-extrabold">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary-600 text-white">
              <ShieldCheck size={22} weight="bold" />
            </span>
            Medfinet
            <span className="rounded bg-slate-100 px-2 py-1 text-[10px] uppercase tracking-wider text-slate-600">
              Pre-production
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" className="px-3 py-2 text-sm font-bold text-slate-700">
              Sign in
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-bold text-white"
            >
              Create account <ArrowRight size={16} weight="bold" />
            </Link>
          </div>
        </div>
      </header>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.1fr_.9fr] lg:px-8 lg:py-28">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary-700">
              Consent-governed child health infrastructure
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Care records designed to remain useful across facilities and disrupted connectivity.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Medfinet is a pre-production web platform for child identity, clinical continuity, caregiver access, emergency response and auditable programme operations. It is being prepared for controlled pilot validation; it is not presented as a finished national deployment.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-3 font-bold text-white"
              >
                Open a workspace <ArrowRight size={18} />
              </Link>
              <a
                href="#status"
                className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-bold text-slate-800"
              >
                Review implementation status
              </a>
            </div>
          </div>

          <aside className="rounded-3xl border border-slate-200 bg-slate-950 p-7 text-slate-100 shadow-xl">
            <DeviceMobile size={34} className="text-cyan-300" />
            <h2 className="mt-5 text-2xl font-bold">What the current frontend does</h2>
            <div className="mt-6 space-y-4">
              {statusItems.map((item) => (
                <div key={item} className="flex gap-3 text-sm leading-6 text-slate-300">
                  <CheckCircle size={20} className="mt-0.5 shrink-0 text-emerald-300" weight="fill" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary-700">Implemented surfaces</p>
          <h2 className="mt-3 text-3xl font-extrabold">Built around real backend workflows</h2>
          <p className="mt-4 text-slate-600">
            These capabilities are implemented in the repository. Operational claims still depend on environment configuration, security review and field validation.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {capabilities.map(({ icon: Icon, title, text }) => (
            <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-50 text-primary-700">
                <Icon size={24} />
              </span>
              <h3 className="mt-5 text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="status" className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <h2 className="text-3xl font-extrabold">Validation still required</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[
              "Physical NFC cards, supported readers and end-to-end tap timing",
              "USSD and SMS provider sandbox behaviour and production short codes",
              "Low-bandwidth, accessibility and field-worker usability testing",
              "FHIR/DHIS2 exchange with named partner systems",
              "Security review, recovery exercises and pilot monitoring",
              "Clinical and language review of configured content",
            ].map((item) => (
              <div key={item} className="flex gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-slate-950 px-6 py-10 text-center text-sm text-slate-400">
        Medfinet frontend · version 0.1.0 · pre-production implementation
      </footer>
    </main>
  );
}
