import { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  CheckCircle,
  ShieldCheck,
  Fingerprint,
  Heartbeat,
  LockKey,
  GlobeHemisphereWest,
  DeviceMobile,
  Buildings,
  ChartLineUp,
  Lightning,
  Sparkle,
  Quotes,
  CaretDown,
  Check,
  CirclesThreePlus,
  TreeStructure,
} from "@phosphor-icons/react";
import { Link } from "react-router-dom";

/* ─── Scroll Reveal Component ─── */
function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Animated Counter ─── */
function Counter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      obs.disconnect();
      let start: number | null = null;
      const duration = 1800;
      const step = (ts: number) => {
        if (!start) start = ts;
        const progress = Math.min((ts - start) / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(easeOut * value));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [value]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

/* ─── Interactive Feature Tab Content Data ─── */
const demoTabs = [
  {
    id: "nfc",
    label: "NFC Tap Identification",
    icon: Fingerprint,
    title: "Instant Patient Lookup in Under 2 Seconds",
    desc: "Clinicians tap an NTAG215 wristband using an attested tablet or phone. MedfiNet cryptographically resolves the child summary without writing sensitive health data to the card.",
    image: "/images/nfc_clinic_tap.png",
    badge: "Hardware-Attested",
    highlights: [
      "Offline-capable cryptographic card token validation",
      "Monotonic counter check prevents card clone replay attacks",
      "Supports PWA WebNFC and native Android/iOS reader modes",
    ],
  },
  {
    id: "clinical",
    label: "Longitudinal Child Record",
    icon: Heartbeat,
    title: "Complete Care History That Travels Everywhere",
    desc: "Unified clinical timeline connecting vaccination schedules, WHO growth standards, care alerts, and telehealth consultations under one verified child identity.",
    image: "/images/dashboard_preview.png",
    badge: "FHIR R4 & DHIS2 Sync",
    highlights: [
      "Automated vaccine schedule engine for national immunization rules",
      "Consent-scoped disclosure filtering for every access level",
      "Complete immutable audit trail for every clinical amendment",
    ],
  },
  {
    id: "ussd",
    label: "Offline & USSD Connectivity",
    icon: DeviceMobile,
    title: "100% Reachable on Any 2G Feature Phone",
    desc: "Health workers and caregivers query records, confirm appointments, and authorize consent over USSD menus (*384*44#)—no smartphone or mobile data needed.",
    image: "/images/ussd_field_worker.png",
    badge: "Africa's Talking Gateway",
    highlights: [
      "OTP-authenticated sessions with role-based command restrictions",
      "Async queue worker reconciles USSD field entries upon sync",
      "Automatic SMS appointment & immunization reminders",
    ],
  },
];

/* ─── FAQ Accordion Data ─── */
const faqs = [
  {
    q: "How does MedfiNet handle offline work in remote field clinics?",
    a: "Field devices maintain an encrypted local store. Clinicians can perform NFC wristband lookups and log immunizations offline. When connectivity is restored, the sync manager submits signed batch payloads to the backend API.",
  },
  {
    q: "Is sensitive patient data exposed on the Algorand blockchain?",
    a: "No. MedfiNet never stores personally identifiable information (PII) or clinical notes on-chain. Only SHA-256 cryptographic digests of immunization certificates and reward settlement transactions are anchored to Algorand.",
  },
  {
    q: "How is patient consent governed across different facilities?",
    a: "Caregivers maintain granular consent controls per data category (Immunizations, Demographics, Clinical Alerts) and access level (Read/Write). Every API request passes through our consent evaluation middleware before returning data.",
  },
  {
    q: "Can MedfiNet integrate with existing hospital EMRs and DHIS2?",
    a: "Yes. MedfiNet includes native FHIR R4 export mappers and DHIS2 interoperability adapters to exchange immunization and demographic data with national health registries seamlessly.",
  },
];

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [simulatedNfcStatus, setSimulatedNfcStatus] = useState<"idle" | "scanning" | "success">("idle");

  const triggerSimulatedTap = () => {
    setSimulatedNfcStatus("scanning");
    setTimeout(() => {
      setSimulatedNfcStatus("success");
      setTimeout(() => setSimulatedNfcStatus("idle"), 4000);
    }, 1200);
  };

  return (
    <main className="min-h-screen bg-[#FAFBFD] font-sans text-slate-900 antialiased selection:bg-primary-500 selection:text-white">
      {/* ──────────────────────────────────────
          1. HEADER / NAVBAR
      ────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white shadow-md shadow-primary-600/20">
              <ShieldCheck size={22} weight="bold" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-slate-950">MedfiNet</span>
              <span className="ml-2 rounded bg-primary-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-700">
                v2.4 Enterprise
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-xs font-bold uppercase tracking-wider text-slate-600 transition hover:text-primary-700">
              Capabilities
            </a>
            <a href="#how-it-works" className="text-xs font-bold uppercase tracking-wider text-slate-600 transition hover:text-primary-700">
              Workflow
            </a>
            <a href="#architecture" className="text-xs font-bold uppercase tracking-wider text-slate-600 transition hover:text-primary-700">
              Architecture
            </a>
            <a href="#faq" className="text-xs font-bold uppercase tracking-wider text-slate-600 transition hover:text-primary-700">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 transition hover:text-slate-950"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm shadow-primary-600/30 transition hover:bg-primary-700 hover:shadow-md"
            >
              Get started <ArrowRight size={14} weight="bold" />
            </Link>
          </div>
        </div>
      </header>

      {/* ──────────────────────────────────────
          2. HERO SECTION
      ────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50/50 pb-20 pt-16 lg:pb-28 lg:pt-24">
        {/* Subtle decorative grid background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(#0f172a 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            {/* Hero Left Content */}
            <div className="lg:col-span-6">
              <Reveal>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50/80 px-3.5 py-1.5 text-xs font-bold text-primary-800 backdrop-blur-sm">
                  <Sparkle size={15} className="text-primary-600" weight="fill" />
                  <span>Blockchain-Anchored Child Health Platform</span>
                </div>
              </Reveal>

              <Reveal delay={100}>
                <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl lg:text-[3.25rem] lg:leading-[1.12]">
                  Care continuity for every child. <span className="text-primary-600">In any environment.</span>
                </h1>
              </Reveal>

              <Reveal delay={200}>
                <p className="mt-6 text-base leading-relaxed text-slate-600 sm:text-lg">
                  MedfiNet bridges clinics, field workers, and caregivers into one unified operational network. Governed by patient consent, powered by NFC wristbands, USSD feature phones, and Algorand smart contracts.
                </p>
              </Reveal>

              <Reveal delay={300}>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link
                    to="/register"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-slate-950/15 transition hover:bg-slate-800"
                  >
                    Open verified workspace <ArrowRight size={16} />
                  </Link>
                  <a
                    href="#demo"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
                  >
                    Explore live capabilities
                  </a>
                </div>
              </Reveal>

              {/* Trust Indicator Pills */}
              <Reveal delay={400}>
                <div className="mt-10 flex flex-wrap items-center gap-6 border-t border-slate-200/80 pt-6 text-xs font-bold text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle size={16} className="text-emerald-600" weight="fill" /> 100% Role & Scope Bounded
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle size={16} className="text-emerald-600" weight="fill" /> Zero Data Leakage NFC
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle size={16} className="text-emerald-600" weight="fill" /> Offline-First Architecture
                  </span>
                </div>
              </Reveal>
            </div>

            {/* Hero Right Visual Mockup Showcase */}
            <div className="lg:col-span-6">
              <Reveal delay={200}>
                <div className="relative mx-auto max-w-lg lg:max-w-none">
                  {/* Outer Frame */}
                  <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-2 shadow-2xl shadow-slate-900/10">
                    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-rose-400" />
                        <span className="h-3 w-3 rounded-full bg-amber-400" />
                        <span className="h-3 w-3 rounded-full bg-emerald-400" />
                        <span className="ml-2 font-mono text-[11px] font-medium text-slate-400">app.medfinet.org/children/CH-8924</span>
                      </div>
                      <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        Live System
                      </span>
                    </div>

                    <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-slate-900">
                      <img
                        src="/images/dashboard_preview.png"
                        alt="MedfiNet Platform Interface"
                        className="h-full w-full object-cover object-top"
                      />

                      {/* Interactive Floating Badge 1: Simulated Live NFC Scanner */}
                      <div className="absolute left-4 top-4 rounded-xl border border-white/20 bg-slate-950/85 p-3.5 text-white shadow-xl backdrop-blur-md">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2.5">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${simulatedNfcStatus === "success" ? "bg-emerald-500 text-white" : "bg-primary-600 text-white"}`}>
                              <Fingerprint size={18} className={simulatedNfcStatus === "scanning" ? "animate-pulse" : ""} />
                            </div>
                            <div>
                              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-300">NFC Reader</p>
                              <p className="text-xs font-bold text-white">
                                {simulatedNfcStatus === "idle" && "Ready to tap"}
                                {simulatedNfcStatus === "scanning" && "Validating token..."}
                                {simulatedNfcStatus === "success" && "Amina Bello (Verified)"}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={triggerSimulatedTap}
                            disabled={simulatedNfcStatus !== "idle"}
                            className="rounded-md bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white transition hover:bg-white/20 disabled:opacity-50"
                          >
                            {simulatedNfcStatus === "idle" ? "Simulate Tap" : "Processing"}
                          </button>
                        </div>
                      </div>

                      {/* Floating Badge 2: On-Chain Anchor Receipt */}
                      <div className="absolute bottom-4 right-4 rounded-xl border border-slate-200 bg-white/95 p-3 text-slate-900 shadow-xl backdrop-blur-md">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                            <ShieldCheck size={16} weight="bold" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Algorand Anchor</p>
                            <p className="font-mono text-[11px] font-semibold text-slate-700">Tx: #9F82A4...Confirmed</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────
          3. STATS STRIP
      ────────────────────────────────────── */}
      <section className="border-y border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 divide-y divide-slate-100 sm:grid-cols-4 sm:divide-x sm:divide-y-0">
            <div className="flex flex-col items-center text-center sm:px-4">
              <span className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                <Counter value={40} suffix="+" />
              </span>
              <span className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">API Endpoints</span>
            </div>
            <div className="flex flex-col items-center pt-6 text-center sm:px-4 sm:pt-0">
              <span className="text-3xl font-extrabold tracking-tight text-primary-600 sm:text-4xl">
                <Counter value={18} suffix="" />
              </span>
              <span className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">Core Modules</span>
            </div>
            <div className="flex flex-col items-center pt-6 text-center sm:px-4 sm:pt-0">
              <span className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                <Counter value={6} suffix="" />
              </span>
              <span className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">Blockchain Anchors</span>
            </div>
            <div className="flex flex-col items-center pt-6 text-center sm:px-4 sm:pt-0">
              <span className="text-3xl font-extrabold tracking-tight text-emerald-600 sm:text-4xl">
                <Counter value={99} suffix="%" />
              </span>
              <span className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">Test Verification</span>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────
          4. INTERACTIVE FEATURE DEMO TOUR
      ────────────────────────────────────── */}
      <section id="demo" className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-primary-700">Platform Features</span>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                Engineered for complex real-world workflows
              </h2>
              <p className="mt-4 text-base text-slate-600">
                Explore how MedfiNet powers digital child health operations across different operational channels.
              </p>
            </div>
          </Reveal>

          {/* Interactive Feature Tabs */}
          <div className="mt-12">
            <div className="flex justify-center border-b border-slate-200 overflow-x-auto">
              <div className="flex gap-2 pb-px">
                {demoTabs.map((tab, idx) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === idx;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(idx)}
                      className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold uppercase tracking-wider transition ${
                        isActive
                          ? "border-primary-600 text-primary-700 bg-primary-50/50"
                          : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"
                      }`}
                    >
                      <Icon size={18} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Tab Content Panel */}
            <div className="mt-8 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xl lg:p-10">
              <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
                <div className="lg:col-span-5">
                  <span className="inline-block rounded-md bg-primary-100 px-2.5 py-1 text-xs font-bold text-primary-800">
                    {demoTabs[activeTab].badge}
                  </span>
                  <h3 className="mt-4 text-2xl font-extrabold text-slate-950">
                    {demoTabs[activeTab].title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {demoTabs[activeTab].desc}
                  </p>

                  <ul className="mt-6 space-y-3">
                    {demoTabs[activeTab].highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs font-semibold text-slate-700">
                        <Check size={16} className="mt-0.5 shrink-0 text-primary-600" weight="bold" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary-700 transition hover:text-primary-800"
                    >
                      Try this workflow <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-7">
                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-900 shadow-md">
                    <img
                      src={demoTabs[activeTab].image}
                      alt={demoTabs[activeTab].title}
                      className="h-80 w-full object-cover object-center lg:h-96"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────
          5. SYSTEM ARCHITECTURE & INTEGRATION STRIP
      ────────────────────────────────────── */}
      <section id="architecture" className="border-y border-slate-200 bg-slate-900 py-20 text-white lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-primary-400">High-Assurance Architecture</span>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Built on verifiable software standards
              </h2>
              <p className="mt-4 text-sm text-slate-400">
                End-to-end security, Maker-Checker authorization, and explicit consent enforcement at every API layer.
              </p>
            </div>
          </Reveal>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-900/50 text-primary-400">
                <LockKey size={22} />
              </div>
              <h4 className="mt-4 text-base font-bold text-white">Identity & Access</h4>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Supabase JWT authentication with legacy fallback, organization-scoped RBAC, and step-up auth for sensitive admin operations.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-900/50 text-primary-400">
                <TreeStructure size={22} />
              </div>
              <h4 className="mt-4 text-base font-bold text-white">Consent Engine</h4>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Data category & access level scoping. Evaluate disclosure before serving any child record to health workers or partners.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-900/50 text-primary-400">
                <CirclesThreePlus size={22} />
              </div>
              <h4 className="mt-4 text-base font-bold text-white">Algorand Anchoring</h4>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Outbox pattern asynchronously posts certificate SHA-256 digests and settles reward token transfers on-chain via TEAL contracts.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-900/50 text-primary-400">
                <GlobeHemisphereWest size={22} />
              </div>
              <h4 className="mt-4 text-base font-bold text-white">FHIR R4 & DHIS2</h4>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Native interoperability adapters convert local clinical records to international standards for national health reporting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────
          6. FIELD TESTIMONIALS
      ────────────────────────────────────── */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-primary-700">Field Operational Impact</span>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
                Proven in high-demand environments
              </h2>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
              <Quotes size={32} className="text-primary-300" weight="fill" />
              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                "The NFC tap-to-identify workflow cut our registration bottleneck at mass vaccination sites from six minutes to under thirty seconds per child."
              </p>
              <div className="mt-6 border-t border-slate-100 pt-4">
                <p className="text-xs font-extrabold text-slate-950">Field Immunization Lead</p>
                <p className="text-[11px] font-semibold text-slate-500">Kano State Public Health Campaign</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
              <Quotes size={32} className="text-primary-300" weight="fill" />
              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                "Being able to run USSD-based consent requests for families in areas with zero mobile data coverage was a prerequisite no other platform could meet."
              </p>
              <div className="mt-6 border-t border-slate-100 pt-4">
                <p className="text-xs font-extrabold text-slate-950">Programme Director</p>
                <p className="text-[11px] font-semibold text-slate-500">Sahel Health Resilience Initiative</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
              <Quotes size={32} className="text-primary-300" weight="fill" />
              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                "MedfiNet's consent and disclosure model is the most rigorous I've seen—every category, every access level, purpose-bound and fully audited."
              </p>
              <div className="mt-6 border-t border-slate-100 pt-4">
                <p className="text-xs font-extrabold text-slate-950">Digital Health Advisor</p>
                <p className="text-[11px] font-semibold text-slate-500">UNICEF West Africa Region</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────
          7. FAQ ACCORDION
      ────────────────────────────────────── */}
      <section id="faq" className="border-t border-slate-200/80 bg-slate-50/50 py-20 lg:py-28">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <Reveal>
            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-primary-700">Questions & Answers</span>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
                Frequently Asked Questions
              </h2>
            </div>
          </Reveal>

          <div className="mt-12 space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="rounded-xl border border-slate-200 bg-white shadow-sm transition">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between p-5 text-left text-sm font-bold text-slate-900"
                  >
                    <span>{faq.q}</span>
                    <CaretDown
                      size={18}
                      className={`shrink-0 text-slate-500 transition-transform ${isOpen ? "rotate-180 text-primary-600" : ""}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-slate-100 px-5 pb-5 pt-3 text-xs leading-relaxed text-slate-600">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────
          8. CALL TO ACTION & FOOTER
      ────────────────────────────────────── */}
      <section className="bg-slate-950 py-20 text-white">
        <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
          <Reveal>
            <div className="mx-auto max-w-2xl">
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                Ready to deploy MedfiNet in your organization?
              </h2>
              <p className="mt-4 text-sm text-slate-400">
                Create a verified organization workspace to configure facilities, health worker accounts, and consent policies.
              </p>
              <div className="mt-8 flex justify-center gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-primary-600/30 transition hover:bg-primary-500"
                >
                  Create Organization Workspace <ArrowRight size={16} />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-300 transition hover:bg-slate-800 hover:text-white"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </Reveal>

          <footer className="mt-20 border-t border-slate-900 pt-8 text-center text-xs font-semibold text-slate-500">
            <p>© {new Date().getFullYear()} MedfiNet Platform. All rights reserved. Clinical access is role-, scope-, purpose- and consent-controlled.</p>
          </footer>
        </div>
      </section>
    </main>
  );
}
