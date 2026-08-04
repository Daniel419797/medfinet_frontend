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
  Scales,
  Database,
  ArrowsClockwise,
  Certificate,
  UsersThree,
  WifiHigh,
  ArrowUpRight,
} from "@phosphor-icons/react";
import { Link } from "react-router-dom";

/* ─── Intersection reveal hook ─── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

/* ─── Animated counter ─── */
function useCounter(target: number, duration = 2000) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      obs.disconnect();
      let start: number | null = null;
      const step = (ts: number) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setValue(Math.round(eased * target));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);
  return { value, ref };
}

/* ─── Data ─── */
const stats = [
  { value: 40, suffix: "+", label: "API endpoints" },
  { value: 18, suffix: "", label: "Route modules" },
  { value: 6, suffix: "", label: "On-chain anchors" },
  { value: 99, suffix: "%", label: "Test pass rate" },
];

const features = [
  {
    icon: FirstAidKit,
    tag: "Clinical continuity",
    headline: "Every child's full history, wherever care happens.",
    body: "Immunization records, growth measurements, clinical alerts, appointments, and allergy data are tied to one persistent child identity — accessible to authorized workers across any facility in the network.",
    bullets: ["FHIR R4 and DHIS2 export ready", "Consent-scoped disclosure at read time", "Amendment requests with audit trail"],
  },
  {
    icon: Fingerprint,
    tag: "NFC identity",
    headline: "Wristband tap. Under two seconds.",
    body: "NTAG215 wristbands bind to a child credential. Clinicians tap with an attested device to resolve a full clinical summary — no data on the card, no cloud dependency for the read.",
    bullets: ["Hardware-attested originality checks", "Counter replay protection", "PWA NDEF and native scanner modes"],
  },
  {
    icon: Broadcast,
    tag: "USSD gateway",
    headline: "Full programme access on any phone.",
    body: "Health workers query records, raise consent requests, and receive appointment reminders over USSD — no smartphone or mobile data required. Africa's Talking handles delivery.",
    bullets: ["OTP-secured USSD sessions", "Consent request queue management", "High-risk child worklists on demand"],
  },
  {
    icon: CloudSun,
    tag: "Climate response",
    headline: "Coordinated action when it matters most.",
    body: "Emergency coordinators create climate events, draw affected polygons, generate prioritized field worklists, and track service delivery and referrals — all audited.",
    bullets: ["Geo-scoped worklist generation", "Field delivery confirmation trail", "Cross-facility referral chain"],
  },
  {
    icon: CreditCard,
    tag: "Rewards & settlement",
    headline: "Health-compliance incentives on-chain.",
    body: "Caregivers earn tokens for vaccination compliance and verified visits. The Algorand outbox worker anchors certificate hashes and settles reward transfers asynchronously.",
    bullets: ["Algorand TEAL escrow contracts", "SHA-256 certificate hash anchoring", "Micro-incentive accounting ledger"],
  },
  {
    icon: Scales,
    tag: "Governance",
    headline: "Data rights built in, not bolted on.",
    body: "Erasure and export workflows, retention and legal holds, localization approval gating, and privacy-preserving analytics are first-class API surfaces.",
    bullets: ["GDPR / NDPR aligned workflows", "Aggregate-only analytics queries", "Translation lifecycle governance"],
  },
];

const steps = [
  { n: "01", title: "Organization registers", body: "An owner creates a verified organization. Facilities, programmes, and membership roles are provisioned before any clinical data is touched." },
  { n: "02", title: "Child identity enrolled", body: "A health worker creates a child record, links caregivers, issues a credential, and optionally binds an NTAG215 NFC wristband." },
  { n: "03", title: "Consent governed", body: "The caregiver grants scoped consent per data category and access level. Every disclosure is evaluated against live consent state at query time." },
  { n: "04", title: "Care delivered", body: "Vaccinations, growth records, appointments, and alerts are recorded and audited. NFC and USSD reach workers without smartphones or mobile data." },
  { n: "05", title: "Records travel with the child", body: "Clinical timeline, FHIR export, and DHIS2 sync ensure continuity across facilities and programme boundaries — governed by the same consent token." },
];

const quotes = [
  { q: "The NFC tap-to-identify workflow cut our registration bottleneck at mass vaccination sites from six minutes to under thirty seconds.", role: "Field Immunization Coordinator", region: "Northern Nigeria" },
  { q: "Being able to run USSD-based consent requests for families with no data coverage was a prerequisite we didn't think any platform could meet.", role: "Programme Manager", region: "Sahel Climate Response" },
  { q: "The consent and disclosure model is the most rigorous I've seen in a health platform designed for the African context — every category, every access level, purpose-bound.", role: "Digital Health Advisor", region: "UNICEF West Africa" },
];

const trust = [
  { icon: LockKey, label: "Supabase JWT + legacy token auth" },
  { icon: ShieldCheck, label: "Role, scope & consent middleware chain" },
  { icon: Database, label: "Prisma ORM — no raw SQL from routes" },
  { icon: ArrowsClockwise, label: "Outbox worker for reliable side-effects" },
  { icon: Certificate, label: "Algorand certificate hash anchoring" },
  { icon: WifiHigh, label: "Offline sync queue for field devices" },
  { icon: UsersThree, label: "Maker-checker for critical admin actions" },
  { icon: GlobeHemisphereWest, label: "FHIR R4 and DHIS2 interoperability" },
];

/* ─── Reusable reveal wrapper ─── */
function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function StatCounter({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { value: count, ref } = useCounter(value);
  return (
    <div className="flex flex-col gap-2">
      <span
        ref={ref as React.RefObject<HTMLDivElement>}
        className="text-6xl font-black tabular-nums text-white lg:text-7xl"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {count}<span className="text-primary-400">{suffix}</span>
      </span>
      <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">{label}</span>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-white font-sans text-slate-900 antialiased">

      {/* ══════════════════════════════════════
          NAV
      ══════════════════════════════════════ */}
      <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-[#050e1d]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[62px] max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-3 group">
            <span className="flex h-8 w-8 items-center justify-center bg-primary-500 transition-colors group-hover:bg-primary-400">
              <ShieldCheck size={17} color="white" weight="bold" />
            </span>
            <span className="text-[15px] font-black tracking-tight text-white">Medfinet</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {["#features", "#how-it-works", "#trust"].map((href) => (
              <a key={href} href={href} className="px-4 py-2 text-[13px] font-semibold text-slate-400 transition-colors hover:text-white">
                {href.replace("#", "").replace("-", " ").replace(/\b\w/g, c => c.toUpperCase())}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/login" className="px-4 py-2 text-[13px] font-semibold text-slate-400 hover:text-white transition-colors">
              Sign in
            </Link>
            <Link
              to="/register"
              className="flex items-center gap-1.5 bg-primary-500 px-4 py-2 text-[13px] font-bold text-white transition-all hover:bg-primary-400"
            >
              Get started <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section className="relative flex min-h-screen items-center overflow-hidden bg-[#050e1d]">
        {/* Background mesh */}
        <div className="pointer-events-none absolute inset-0">
          {/* Radial gradients */}
          <div className="absolute left-1/2 top-1/3 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-500/10 blur-[140px]" />
          <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-blue-600/8 blur-[120px]" />
          <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-primary-600/8 blur-[100px]" />
          {/* Dot grid */}
          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{ backgroundImage: "radial-gradient(circle, #7bd8c8 1px, transparent 1px)", backgroundSize: "40px 40px" }}
          />
          {/* Horizontal lines */}
          <div className="absolute inset-x-0 top-1/2 h-px -translate-y-32 bg-gradient-to-r from-transparent via-primary-500/20 to-transparent" />
          <div className="absolute inset-x-0 top-1/2 h-px translate-y-32 bg-gradient-to-r from-transparent via-primary-500/10 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-36">
          {/* Label pill */}
          <div className="mb-8 inline-flex items-center gap-2.5 border border-primary-500/25 bg-primary-500/10 px-4 py-2">
            <span className="h-1.5 w-1.5 animate-pulse bg-primary-400" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary-300">Child health infrastructure · Africa-ready</span>
          </div>

          {/* Headline */}
          <h1 className="max-w-5xl text-6xl font-black leading-[1.0] tracking-[-0.03em] text-white sm:text-7xl lg:text-[6.5rem]">
            One system.<br />
            <span className="bg-gradient-to-r from-primary-300 via-primary-400 to-teal-300 bg-clip-text text-transparent">
              Every child.
            </span><br />
            Any setting.
          </h1>

          {/* Sub */}
          <p className="mt-8 max-w-[580px] text-[17px] leading-[1.8] text-slate-400">
            A consent-governed digital identity and continuity-of-care platform connecting clinicians, caregivers, and field workers — over NFC, USSD, and the web.
          </p>

          {/* CTAs */}
          <div className="mt-12 flex flex-wrap items-center gap-4">
            <Link
              to="/register"
              className="group flex items-center gap-2 bg-primary-500 px-7 py-4 text-[14px] font-black text-white transition-all hover:bg-primary-400 hover:gap-3"
            >
              Open your workspace
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#features"
              className="flex items-center gap-2 border border-white/15 px-7 py-4 text-[14px] font-semibold text-slate-300 transition-all hover:border-white/30 hover:text-white"
            >
              Explore the platform
            </a>
          </div>

          {/* Trust micro-badges */}
          <div className="mt-16 flex flex-wrap gap-6 border-t border-white/8 pt-10">
            {[
              { icon: LockKey, text: "Role & scope controlled" },
              { icon: ShieldCheck, text: "Consent-governed" },
              { icon: GlobeHemisphereWest, text: "NFC · USSD · Web" },
              { icon: Certificate, text: "Algorand anchored" },
            ].map(({ icon: Icon, text }) => (
              <span key={text} className="flex items-center gap-2 text-[12px] font-semibold text-slate-500">
                <Icon size={13} className="text-primary-400" />
                {text}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#050e1d] to-transparent" />
      </section>

      {/* ══════════════════════════════════════
          STATS
      ══════════════════════════════════════ */}
      <section className="bg-[#080f1d] py-24">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <p className="mb-16 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-600">Platform by the numbers</p>
          </Reveal>
          <div className="grid grid-cols-2 gap-12 lg:grid-cols-4">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 80}>
                <StatCounter {...s} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          MISSION
      ══════════════════════════════════════ */}
      <section className="bg-white py-28 lg:py-36">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-20 lg:grid-cols-2">
            <Reveal>
              <p className="mb-6 text-[11px] font-bold uppercase tracking-[0.2em] text-primary-600">Why Medfinet</p>
              <h2 className="text-5xl font-black leading-[1.05] tracking-tight text-slate-950">
                Health records that follow<br />the child,<br />
                <em className="not-italic text-primary-600">not the facility.</em>
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <div className="space-y-6 text-[15px] leading-[1.9] text-slate-500">
                <p>
                  In fragmented health systems, a child's vaccination history disappears the moment they cross to another clinic. During climate emergencies, field workers operate without connectivity. Caregivers have zero control over who reads their child's data.
                </p>
                <p>
                  Medfinet solves all three. One persistent identity, governed by patient-held consent — reachable over NFC wristband, USSD feature-phone, or the web — synchronized the moment connectivity returns.
                </p>
                <div className="mt-8 flex items-start gap-4 border-l-2 border-primary-500 pl-5">
                  <Heartbeat size={20} className="mt-0.5 shrink-0 text-primary-500" />
                  <span className="text-[13px] font-semibold text-slate-700">
                    Built for Sub-Saharan Africa and any LMIC health system where continuity of care can't be taken for granted.
                  </span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FEATURES
      ══════════════════════════════════════ */}
      <section id="features" className="bg-[#f5f7fa] py-28 lg:py-36">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-primary-600">Platform capabilities</p>
            <div className="flex items-end justify-between gap-8 border-b border-slate-200 pb-16">
              <h2 className="max-w-xl text-5xl font-black leading-[1.05] tracking-tight text-slate-950">
                Everything a health<br />programme needs.
              </h2>
              <p className="hidden max-w-xs text-[14px] leading-8 text-slate-500 lg:block">
                Every module is backed by authenticated API records with clear loading, empty, error, and recovery states.
              </p>
            </div>
          </Reveal>

          <div className="mt-0">
            {features.map(({ icon: Icon, tag, headline, body, bullets }, i) => (
              <Reveal key={tag} delay={i * 60}>
                <article className="grid items-center gap-12 border-b border-slate-200 py-16 lg:grid-cols-[2fr_3fr]">
                  <div>
                    <div className="mb-5 flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center bg-primary-50">
                        <Icon size={18} className="text-primary-600" weight="duotone" />
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary-600">{tag}</span>
                    </div>
                    <h3 className="text-3xl font-black leading-[1.1] tracking-tight text-slate-950">{headline}</h3>
                  </div>
                  <div>
                    <p className="mb-7 text-[15px] leading-[1.85] text-slate-500">{body}</p>
                    <ul className="flex flex-wrap gap-x-8 gap-y-3">
                      {bullets.map(b => (
                        <li key={b} className="flex items-center gap-2.5 text-[13px] font-semibold text-slate-700">
                          <span className="h-1 w-4 shrink-0 bg-primary-400" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════ */}
      <section id="how-it-works" className="overflow-hidden bg-[#050e1d] py-28 lg:py-36">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-primary-400">How it works</p>
            <h2 className="mb-20 max-w-lg text-5xl font-black leading-[1.05] tracking-tight text-white">
              From registration<br />to care continuity.
            </h2>
          </Reveal>

          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-[18px] top-6 hidden h-full w-px bg-gradient-to-b from-primary-500/60 via-primary-500/20 to-transparent lg:block" />

            <div className="space-y-0">
              {steps.map(({ n, title, body }, i) => (
                <Reveal key={n} delay={i * 100}>
                  <div className="grid items-start gap-8 border-b border-white/8 py-10 lg:grid-cols-[280px_1fr] lg:gap-16">
                    <div className="flex items-center gap-5">
                      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center bg-primary-500 text-[12px] font-black text-white">
                        {n}
                      </span>
                      <h3 className="text-[17px] font-black text-white">{title}</h3>
                    </div>
                    <p className="text-[14px] leading-[1.9] text-slate-400">{body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════ */}
      <section className="bg-white py-28 lg:py-36">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-primary-600">In the field</p>
            <h2 className="mb-16 text-5xl font-black leading-[1.05] tracking-tight text-slate-950">
              Trusted where it's hardest.
            </h2>
          </Reveal>

          <div className="grid gap-0 lg:grid-cols-3">
            {quotes.map(({ q, role, region }, i) => (
              <Reveal key={region} delay={i * 100}>
                <figure className={`flex h-full flex-col justify-between gap-12 py-10 ${i > 0 ? "lg:border-l lg:border-slate-100 lg:pl-10" : ""} ${i < quotes.length - 1 ? "border-b border-slate-100 lg:border-b-0 lg:pr-10" : ""}`}>
                  <blockquote className="text-[16px] leading-[1.85] text-slate-700">
                    <span className="mr-1 text-3xl leading-none text-primary-300">"</span>
                    {q}
                    <span className="ml-1 text-3xl leading-none text-primary-300">"</span>
                  </blockquote>
                  <figcaption>
                    <p className="text-[13px] font-black text-slate-900">{role}</p>
                    <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">{region}</p>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          TRUST / SECURITY
      ══════════════════════════════════════ */}
      <section id="trust" className="bg-[#f5f7fa] py-28 lg:py-36">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-start gap-20 lg:grid-cols-[2fr_3fr]">
            <Reveal>
              <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.2em] text-primary-600">Security & reliability</p>
              <h2 className="text-5xl font-black leading-[1.05] tracking-tight text-slate-950">
                Designed for sensitive<br />child health data.
              </h2>
              <p className="mt-7 text-[14px] leading-[1.9] text-slate-500">
                Every layer — authentication, authorization, audit, sync, and blockchain anchoring — is hardened by design, not configuration.
              </p>
              <div className="mt-10 flex flex-col gap-3">
                <Link
                  to="/register"
                  className="group inline-flex w-fit items-center gap-2 bg-[#050e1d] px-6 py-3.5 text-[13px] font-black text-white transition-all hover:bg-primary-600"
                >
                  Enter your workspace
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex w-fit items-center gap-1.5 text-[13px] font-semibold text-primary-600 hover:text-primary-500"
                >
                  Sign in <ArrowUpRight size={13} />
                </Link>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="grid grid-cols-1 gap-0 divide-y divide-slate-200 border-y border-slate-200 sm:grid-cols-2 sm:divide-y-0 sm:border-x sm:border-y-0">
                {trust.map(({ icon: Icon, label }, i) => (
                  <div
                    key={label}
                    className={`group flex items-center gap-4 px-6 py-5 transition-colors hover:bg-white ${
                      i % 2 === 0 ? "sm:border-r" : ""
                    } sm:border-b border-slate-200`}
                  >
                    <Icon
                      size={19}
                      className="shrink-0 text-slate-400 transition-colors group-hover:text-primary-500"
                      weight="duotone"
                    />
                    <span className="text-[13px] font-semibold text-slate-600 group-hover:text-slate-900">{label}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CTA
      ══════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#050e1d] py-36 lg:py-48">
        {/* Background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-500/8 blur-[160px]" />
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{ backgroundImage: "radial-gradient(circle, #7bd8c8 1px, transparent 1px)", backgroundSize: "40px 40px" }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-6">
          <Reveal>
            <p className="mb-8 text-[11px] font-bold uppercase tracking-[0.2em] text-primary-400">Get started</p>
            <h2 className="mb-6 max-w-3xl text-6xl font-black leading-[1.0] tracking-[-0.03em] text-white lg:text-7xl">
              Your verified<br />organization<br />
              <span className="bg-gradient-to-r from-primary-300 to-teal-300 bg-clip-text text-transparent">
                workspace is ready.
              </span>
            </h2>
            <p className="mb-12 max-w-lg text-[16px] leading-[1.85] text-slate-400">
              Membership determines what tools and records are available. Role, scope, and consent are enforced at every layer — not just the UI.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/register"
                className="group flex items-center gap-2.5 bg-primary-500 px-8 py-4 text-[15px] font-black text-white transition-all hover:bg-primary-400"
              >
                Create your account
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/login"
                className="flex items-center gap-2 border border-white/15 px-8 py-4 text-[15px] font-semibold text-slate-300 transition-all hover:border-white/30 hover:text-white"
              >
                Sign in
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FOOTER
      ══════════════════════════════════════ */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center bg-primary-500">
              <ShieldCheck size={14} color="white" weight="bold" />
            </span>
            <span className="text-[14px] font-black tracking-tight text-slate-950">Medfinet</span>
          </div>

          <p className="text-[12px] text-slate-400">
            © {new Date().getFullYear()} Medfinet. Clinical access is role-, scope-, purpose- and consent-controlled.
          </p>

          <div className="flex gap-6">
            <Link to="/login" className="text-[12px] font-semibold text-slate-500 hover:text-slate-900 transition-colors">Sign in</Link>
            <Link to="/register" className="text-[12px] font-semibold text-slate-500 hover:text-slate-900 transition-colors">Register</Link>
          </div>
        </div>
      </footer>

    </main>
  );
}
