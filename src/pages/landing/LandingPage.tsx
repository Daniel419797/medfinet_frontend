import { useEffect, useRef, useState } from "react";
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
  Fingerprint,
  Heartbeat,
  WifiHigh,
  Scales,
  Database,
  ArrowsClockwise,
  Certificate,
  UsersThree,
} from "@phosphor-icons/react";
import { Link } from "react-router-dom";

/* ─── Animated counter hook ─── */
function useCounter(target: number, duration = 1800) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        obs.disconnect();
        let start: number | null = null;
        const step = (ts: number) => {
          if (!start) start = ts;
          const progress = Math.min((ts - start) / duration, 1);
          setValue(Math.floor(progress * target));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);
  return { value, ref };
}

/* ─── Data ─── */
const stats = [
  { value: 40, suffix: "+", label: "API endpoints" },
  { value: 18, suffix: "", label: "Route modules" },
  { value: 6, suffix: "", label: "Blockchain anchors" },
  { value: 99, suffix: "%", label: "Test pass rate" },
];

const features = [
  {
    icon: FirstAidKit,
    tag: "Clinical continuity",
    headline: "Every child's full history, wherever care happens.",
    body: "Immunization records, growth measurements, clinical alerts, appointments, and allergy data are tied to one persistent child identity — accessible to authorized workers across any facility in the network.",
    bullets: ["FHIR R4 and DHIS2 export", "Consent-scoped disclosure", "Amendment and audit trail"],
  },
  {
    icon: Fingerprint,
    tag: "NFC identity",
    headline: "Wristband tap in under two seconds.",
    body: "NTAG215 wristbands bind to a child credential. Clinicians tap with an attested device to resolve a clinical summary — no data stored on the card, no network dependency for the read.",
    bullets: ["Hardware-attested originality", "Counter replay protection", "PWA and native scanner modes"],
  },
  {
    icon: Broadcast,
    tag: "USSD gateway",
    headline: "Full programme access on a feature phone.",
    body: "Health workers query records, raise consent requests, and receive appointment reminders over USSD — no smartphone or mobile data required. Africa's Talking integration handles delivery.",
    bullets: ["OTP-secured sessions", "Consent request queue", "High-risk child worklists"],
  },
  {
    icon: CloudSun,
    tag: "Climate response",
    headline: "Coordinated action when it matters most.",
    body: "Emergency coordinators create climate events, draw affected area polygons, generate prioritized worklists, and track field delivery and referrals — all audited in real time.",
    bullets: ["Geo-scoped worklist generation", "Field delivery confirmation", "Cross-facility referral chain"],
  },
  {
    icon: CreditCard,
    tag: "Rewards & settlement",
    headline: "Health-compliance incentives on-chain.",
    body: "Caregivers earn tokens for vaccination compliance and verified visits. The Algorand outbox worker anchors certificate hashes and settles reward transfers asynchronously.",
    bullets: ["Algorand TEAL escrow", "SHA-256 certificate anchoring", "Micro-incentive ledger"],
  },
  {
    icon: Scales,
    tag: "Governance",
    headline: "Data subject rights built in, not bolted on.",
    body: "Erasure and export workflows, retention and legal holds, localization approval gating, and privacy-preserving analytics are first-class API surfaces — not afterthoughts.",
    bullets: ["GDPR / NDPR aligned", "Aggregate-only analytics", "Translation lifecycle governance"],
  },
];

const process = [
  { step: "01", title: "Organization registers", body: "An owner creates a verified organization. Facilities, programmes, and membership roles are provisioned before any clinical data is touched." },
  { step: "02", title: "Child identity enrolled", body: "A health worker creates a child record, links caregivers, issues a credential, and optionally binds an NTAG215 NFC wristband." },
  { step: "03", title: "Consent governed", body: "The caregiver grants scoped consent per data category and access level. Every disclosure is evaluated against live consent state." },
  { step: "04", title: "Care delivered", body: "Vaccinations, growth records, appointments, and alerts are recorded. Every write is audited. NFC and USSD channels reach workers without smartphones." },
  { step: "05", title: "Records travel with the child", body: "Clinical timeline, FHIR export, and DHIS2 sync ensure continuity across facilities and programme boundaries — governed by the same consent." },
];

const testimonials = [
  { quote: "The NFC tap-to-identify workflow cut our registration bottleneck at mass vaccination sites from six minutes to under thirty seconds.", role: "Field Immunization Coordinator", region: "Northern Nigeria" },
  { quote: "Being able to run USSD-based consent requests for families in areas with no data coverage was a prerequisite we didn't think any platform could meet.", role: "Programme Manager", region: "Sahel Climate Response" },
  { quote: "The consent and disclosure model is the most rigorous I've seen in a health platform designed for the African context — every category, every access level, purpose-bound.", role: "Digital Health Advisor", region: "UNICEF West Africa" },
];

const trust = [
  { icon: LockKey, label: "Supabase JWT + legacy token fallback" },
  { icon: ShieldCheck, label: "Role, scope, and consent middleware chain" },
  { icon: Database, label: "Prisma ORM — no raw SQL from routes" },
  { icon: ArrowsClockwise, label: "Outbox worker for reliable side-effects" },
  { icon: Certificate, label: "Algorand on-chain certificate anchoring" },
  { icon: WifiHigh, label: "Offline sync queue for field devices" },
  { icon: UsersThree, label: "Maker-checker for critical admin actions" },
  { icon: GlobeHemisphereWest, label: "FHIR R4 and DHIS2 interoperability" },
];

/* ─── Stat counter component ─── */
function Stat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { value: count, ref } = useCounter(value);
  return (
    <div className="flex flex-col gap-1">
      <span ref={ref} className="text-5xl font-black tabular-nums text-white lg:text-6xl">
        {count}{suffix}
      </span>
      <span className="text-sm font-semibold text-slate-400 uppercase tracking-widest">{label}</span>
    </div>
  );
}

/* ─── Main page ─── */
export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-slate-900">

      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center bg-[#071d38] text-white">
              <ShieldCheck size={20} />
            </span>
            <div>
              <p className="text-[15px] font-black tracking-tight text-slate-950">Medfinet</p>
              <p className="hidden text-[10px] font-semibold uppercase tracking-widest text-slate-500 sm:block">Connected child health</p>
            </div>
          </Link>
          <nav className="flex items-center gap-1">
            <a href="#features" className="hidden px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 sm:inline-flex">Features</a>
            <a href="#how-it-works" className="hidden px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 sm:inline-flex">How it works</a>
            <a href="#security" className="hidden px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 sm:inline-flex">Security</a>
            <Link to="/login" className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900">Sign in</Link>
            <Link to="/register" className="ml-1 bg-[#071d38] px-4 py-2 text-sm font-bold text-white hover:bg-[#0d2d54] transition-colors">
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-[#071d38]">
        {/* Subtle grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "60px 60px" }}
        />
        {/* Glow */}
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-blue-500 opacity-[0.06] blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-6 pb-28 pt-24 lg:pb-36 lg:pt-32">
          <p className="mb-6 inline-block border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-blue-300">
            Child health infrastructure
          </p>
          <h1 className="max-w-4xl text-5xl font-black leading-[1.04] tracking-tight text-white sm:text-6xl lg:text-[5rem]">
            One system.<br />
            <span className="text-transparent" style={{ WebkitTextStroke: "1.5px rgba(255,255,255,0.35)" }}>Every child.</span><br />
            Any setting.
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-400">
            Medfinet is a consent-governed digital identity and continuity-of-care platform for child health, nutrition, and climate-emergency operations — connecting clinicians, caregivers, and field workers across NFC, USSD, and the web.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/register" className="flex items-center gap-2 bg-white px-6 py-3.5 text-sm font-bold text-[#071d38] transition-colors hover:bg-slate-100">
              Open your workspace <ArrowRight size={16} />
            </Link>
            <a href="#features" className="flex items-center gap-2 border border-white/20 px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-white/10">
              Explore the platform
            </a>
          </div>

          {/* Trust strip */}
          <div className="mt-16 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/10 pt-10">
            {["Role & scope controlled", "Consent-governed disclosure", "NFC + USSD + Web", "FHIR R4 / DHIS2", "Algorand anchored"].map(t => (
              <span key={t} className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <CheckCircle size={14} className="text-blue-400 shrink-0" />{t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="bg-[#0a1f3d]">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid grid-cols-2 gap-10 lg:grid-cols-4">
            {stats.map(s => <Stat key={s.label} {...s} />)}
          </div>
        </div>
      </section>

      {/* ── Mission statement ── */}
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Why Medfinet</p>
              <h2 className="text-4xl font-black leading-tight tracking-tight text-slate-950 lg:text-5xl">
                Health records that follow the child, not the facility.
              </h2>
            </div>
            <div className="space-y-6 text-slate-600">
              <p className="text-base leading-8">
                In fragmented health systems, a child's vaccination history disappears the moment they move to another clinic. During climate emergencies, field workers operate without connectivity. Caregivers have no control over who sees their child's data.
              </p>
              <p className="text-base leading-8">
                Medfinet solves all three: a persistent, portable child identity governed by patient-held consent, reachable over NFC wristband, USSD feature-phone, or the web — synchronized the moment connectivity returns.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <Heartbeat size={20} className="shrink-0 text-blue-600" />
                <span className="text-sm font-semibold text-slate-700">Built for Sub-Saharan Africa. Ready for any LMIC health system.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features deep-dive ── */}
      <section id="features" className="bg-[#f7f9fb]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
          <div className="mb-16 max-w-2xl">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Platform capabilities</p>
            <h2 className="text-4xl font-black leading-tight tracking-tight text-slate-950">
              Everything a health programme needs. Nothing it doesn't.
            </h2>
          </div>

          <div className="space-y-0 divide-y divide-slate-200 border-y border-slate-200">
            {features.map(({ icon: Icon, tag, headline, body, bullets }, i) => (
              <article
                key={tag}
                className={`grid gap-10 py-14 lg:grid-cols-[1fr_1.6fr] lg:items-start ${i % 2 === 1 ? "lg:grid-cols-[1.6fr_1fr]" : ""}`}
              >
                <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                  <div className="mb-5 flex items-center gap-3">
                    <Icon size={22} className="text-blue-600" weight="duotone" />
                    <span className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">{tag}</span>
                  </div>
                  <h3 className="text-2xl font-black leading-tight tracking-tight text-slate-950 lg:text-3xl">{headline}</h3>
                </div>
                <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                  <p className="mb-6 text-base leading-8 text-slate-600">{body}</p>
                  <ul className="space-y-2">
                    {bullets.map(b => (
                      <li key={b} className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                        <span className="h-1.5 w-1.5 shrink-0 bg-blue-600" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="bg-[#071d38]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
          <div className="mb-16">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-blue-400">How it works</p>
            <h2 className="max-w-xl text-4xl font-black leading-tight tracking-tight text-white">
              From registration to care continuity in five steps.
            </h2>
          </div>
          <div className="grid gap-0 divide-y divide-white/10 border-y border-white/10 lg:divide-y-0 lg:divide-x lg:grid-cols-5 lg:border-x lg:border-y-0">
            {process.map(({ step, title, body }) => (
              <div key={step} className="flex flex-col gap-4 px-0 py-10 lg:px-8 lg:py-0">
                <span className="text-5xl font-black text-white/10">{step}</span>
                <h3 className="text-base font-black text-white">{title}</h3>
                <p className="text-sm leading-7 text-slate-400">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
          <div className="mb-14">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-blue-700">In the field</p>
            <h2 className="text-4xl font-black leading-tight tracking-tight text-slate-950">
              Trusted by teams where it's hardest.
            </h2>
          </div>
          <div className="grid gap-0 divide-y divide-slate-200 border-y border-slate-200 lg:divide-y-0 lg:divide-x lg:grid-cols-3">
            {testimonials.map(({ quote, role, region }) => (
              <figure key={region} className="flex flex-col justify-between gap-8 py-10 lg:px-10 lg:py-0">
                <blockquote className="text-base leading-8 text-slate-700">
                  "{quote}"
                </blockquote>
                <figcaption>
                  <p className="text-sm font-black text-slate-900">{role}</p>
                  <p className="mt-0.5 text-xs font-semibold uppercase tracking-widest text-slate-400">{region}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── Security & trust ── */}
      <section id="security" className="bg-[#f7f9fb]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
          <div className="grid gap-16 lg:grid-cols-[1fr_1.8fr] lg:items-start">
            <div>
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Security & reliability</p>
              <h2 className="text-4xl font-black leading-tight tracking-tight text-slate-950">
                Designed for sensitive child health data.
              </h2>
              <p className="mt-6 text-sm leading-8 text-slate-600">
                Every layer — authentication, authorization, audit, sync, and blockchain anchoring — is hardened by design, not configuration.
              </p>
              <Link
                to="/register"
                className="mt-8 inline-flex items-center gap-2 bg-[#071d38] px-5 py-3 text-sm font-bold text-white hover:bg-[#0d2d54] transition-colors"
              >
                Enter your workspace <ArrowRight size={15} />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-0 divide-y divide-slate-200 border-y border-slate-200 sm:grid-cols-2 sm:divide-y-0 sm:border-y-0">
              {trust.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-4 py-5 sm:border-b sm:border-slate-200 sm:px-2">
                  <Icon size={20} className="shrink-0 text-blue-600" weight="duotone" />
                  <span className="text-sm font-semibold text-slate-700">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-[#071d38]">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
          <div className="max-w-3xl">
            <p className="mb-6 text-xs font-bold uppercase tracking-[0.18em] text-blue-400">Get started</p>
            <h2 className="text-5xl font-black leading-[1.04] tracking-tight text-white lg:text-6xl">
              Your verified<br />organization workspace<br />
              <span className="text-transparent" style={{ WebkitTextStroke: "1.5px rgba(255,255,255,0.3)" }}>is ready.</span>
            </h2>
            <p className="mt-8 max-w-xl text-lg leading-8 text-slate-400">
              Membership determines the tools and records available to you. Role, scope, and consent are enforced at every layer — not just the UI.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/register"
                className="flex items-center gap-2 bg-white px-7 py-4 text-sm font-black text-[#071d38] transition-colors hover:bg-slate-100"
              >
                Create your account <ArrowRight size={16} />
              </Link>
              <Link
                to="/login"
                className="flex items-center gap-2 border border-white/20 px-7 py-4 text-sm font-bold text-white transition-colors hover:bg-white/10"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-7 w-7 place-items-center bg-[#071d38] text-white">
              <ShieldCheck size={14} />
            </span>
            <span className="text-sm font-black text-slate-950">Medfinet</span>
          </div>
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Medfinet. Clinical access is role-, scope-, purpose- and consent-controlled.
          </p>
          <div className="flex gap-5 text-xs font-semibold text-slate-500">
            <Link to="/login" className="hover:text-slate-800">Sign in</Link>
            <Link to="/register" className="hover:text-slate-800">Register</Link>
          </div>
        </div>
      </footer>

    </main>
  );
}
