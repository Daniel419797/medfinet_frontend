import {
  ArrowRight,
  Buildings,
  CaretDown,
  CheckCircle,
  CloudArrowUp,
  DeviceMobile,
  Fingerprint,
  GlobeHemisphereWest,
  Heartbeat,
  IdentificationCard,
  LockKey,
  MagnifyingGlass,
  ShieldCheck,
  Storefront,
  UserCircle,
  UsersThree,
  WifiSlash,
} from "@phosphor-icons/react";
import { Link } from "react-router-dom";

const capabilities = [
  {
    icon: Fingerprint,
    title: "Identity integrity",
    text: "Create and resolve child records, link caregivers and preserve a controlled identity history.",
    className: "bg-sky-50 text-sky-700",
  },
  {
    icon: Heartbeat,
    title: "Clinical continuity",
    text: "Record immunizations, growth checks, alerts, allergies, appointments and follow-up in one timeline.",
    className: "bg-emerald-50 text-emerald-700",
  },
  {
    icon: WifiSlash,
    title: "Offline field work",
    text: "Queue a bounded set of encrypted field operations and synchronize them when connectivity returns.",
    className: "bg-amber-50 text-amber-700",
  },
  {
    icon: IdentificationCard,
    title: "NFC workflows",
    text: "Use dedicated scanning and provisioning surfaces for supported NFC-assisted identification workflows.",
    className: "bg-violet-50 text-violet-700",
  },
  {
    icon: GlobeHemisphereWest,
    title: "Response worklists",
    text: "Coordinate authorized programme delivery, referrals and follow-up without exposing unrelated records.",
    className: "bg-cyan-50 text-cyan-700",
  },
  {
    icon: ShieldCheck,
    title: "Governed access",
    text: "Limit sensitive actions by role, organization and purpose, with administrative and audit review.",
    className: "bg-rose-50 text-rose-700",
  },
];

const audiences = [
  {
    icon: UsersThree,
    title: "Caregivers",
    text: "View authorized child records, follow appointments, respond to care actions and manage privacy or rewards where enabled.",
  },
  {
    icon: Heartbeat,
    title: "Health workers",
    text: "Register children, record care, review timelines, work from authorized response lists and sync supported offline activity.",
  },
  {
    icon: Buildings,
    title: "Programme administrators",
    text: "Manage organizations, users, schedules, resources, programme operations, safety controls and reporting.",
  },
  {
    icon: Storefront,
    title: "Approved merchants",
    text: "Use a separate workspace for authorized programme benefit and redemption activity, subject to programme rules.",
  },
  {
    icon: MagnifyingGlass,
    title: "Auditors",
    text: "Review permitted evidence and activity in a dedicated workspace without receiving unrestricted clinical access.",
  },
];

const workflow = [
  ["01", "Establish identity", "Create or resolve the child record and connect the appropriate caregiver relationship."],
  ["02", "Record care", "Capture authorized clinical activity, appointments, immunization status and follow-up."],
  ["03", "Work through disruption", "Use connected workflows when available and queue supported operations when offline."],
  ["04", "Coordinate action", "Open role-scoped worklists, deliver programme services and create referrals where permitted."],
  ["05", "Review and govern", "Administrators and auditors review sensitive activity through controlled operational surfaces."],
];

const faqs = [
  {
    q: "Is Medfinet a hospital-management system?",
    a: "No. Medfinet is a child-health continuity platform. It focuses on child identity, caregiver relationships, longitudinal care records, programme operations, low-connectivity workflows and governed access across participating organizations.",
  },
  {
    q: "Does Medfinet automatically deny care or benefits?",
    a: "No. Signals and worklists are intended to support human review. The platform should not automatically reject a child, caregiver or merchant based only on an automated flag.",
  },
  {
    q: "Can it work without reliable internet?",
    a: "The frontend includes an encrypted offline queue for a bounded set of operations. Real field performance, device compatibility and recovery behaviour still require controlled pilot validation.",
  },
  {
    q: "Are NFC, USSD, SMS and external integrations production-proven?",
    a: "Dedicated product surfaces exist, but physical hardware, provider behaviour, production short codes and partner-system exchange must be validated with named providers and real deployments.",
  },
  {
    q: "What stage is the platform at?",
    a: "Medfinet is a pre-production platform. Pilot validation, clinical review, security review, accessibility testing and operational monitoring are still required before production-scale claims can be made.",
  },
];

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-3" aria-label="Medfinet home">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-700 text-white shadow-sm">
        <ShieldCheck size={23} weight="fill" />
      </span>
      <span>
        <span className="block text-[17px] font-extrabold tracking-tight text-slate-950">Medfinet</span>
        <span className="block text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">
          Child health continuity
        </span>
      </span>
    </Link>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  center = false,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-emerald-700">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.035em] text-slate-950 sm:text-4xl lg:text-[2.8rem] lg:leading-[1.08]">
        {title}
      </h2>
      {description ? (
        <p className="mt-5 text-base leading-7 text-slate-600">{description}</p>
      ) : null}
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-950">
      <div className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-2 text-xs font-semibold text-slate-600 sm:px-6 lg:px-8">
          <span>Pre-production platform · pilot validation required</span>
          <span className="hidden sm:inline">Built for fragmented and low-connectivity child-health programmes</span>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
          <Brand />
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">
            <a href="#why" className="text-sm font-semibold text-slate-600 transition hover:text-emerald-700">Why Medfinet</a>
            <a href="#capabilities" className="text-sm font-semibold text-slate-600 transition hover:text-emerald-700">Capabilities</a>
            <a href="#users" className="text-sm font-semibold text-slate-600 transition hover:text-emerald-700">Who it is for</a>
            <a href="#workflow" className="text-sm font-semibold text-slate-600 transition hover:text-emerald-700">How it works</a>
            <a href="#faq" className="text-sm font-semibold text-slate-600 transition hover:text-emerald-700">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="hidden px-3 py-2 text-sm font-bold text-slate-700 sm:inline-flex">Sign in</Link>
            <Link to="/register" className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-emerald-800">
              Request access <ArrowRight size={16} weight="bold" />
            </Link>
          </div>
        </div>
      </header>

      <section className="relative border-b border-slate-200 bg-[linear-gradient(135deg,#f7fffb_0%,#eff9ff_55%,#ffffff_100%)]">
        <div className="pointer-events-none absolute -right-24 top-16 h-80 w-80 rounded-full bg-cyan-200/30 blur-3xl" />
        <div className="pointer-events-none absolute left-[48%] top-20 h-64 w-64 rounded-full bg-emerald-200/25 blur-3xl" />
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-14 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:px-8 lg:py-20">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.16em] text-emerald-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Child-health continuity platform
            </span>
            <h1 className="mt-6 text-4xl font-extrabold tracking-[-0.05em] text-slate-950 sm:text-5xl lg:text-[4.35rem] lg:leading-[1.01]">
              One child identity.
              <span className="block">One care record.</span>
              <span className="block text-emerald-700">Continuity through disruption.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
              Medfinet helps participating child-health programmes connect verified identity,
              caregiver relationships, clinical activity, follow-up and authorized field operations
              in one governed platform.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-emerald-900/10 transition hover:bg-emerald-800">
                Request pilot access <ArrowRight size={17} weight="bold" />
              </Link>
              <a href="#workflow" className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-extrabold text-slate-800 transition hover:border-emerald-500 hover:text-emerald-700">
                See how it works <CaretDown size={16} weight="bold" />
              </a>
            </div>
            <div className="mt-9 grid gap-3 sm:grid-cols-3">
              {[
                [WifiSlash, "Offline-aware", "Bounded encrypted queue"],
                [LockKey, "Role-scoped", "Organization and purpose context"],
                [UserCircle, "Human-reviewed", "No automatic denial"],
              ].map(([Icon, title, note]) => {
                const ItemIcon = Icon as typeof WifiSlash;
                return (
                  <div key={String(title)} className="rounded-xl border border-slate-200 bg-white/85 p-4 shadow-sm">
                    <ItemIcon size={20} className="text-emerald-700" />
                    <p className="mt-3 text-sm font-extrabold">{String(title)}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{String(note)}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-8 top-16 hidden h-44 w-44 rounded-full bg-emerald-500 lg:block" />
            <div className="relative overflow-hidden rounded-[2.25rem] border-[10px] border-white bg-white shadow-[0_35px_90px_rgba(15,23,42,.18)]">
              <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=85" alt="Caregiver and child in a health facility" className="h-[430px] w-full object-cover" />
              <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/80 bg-white/95 p-4 shadow-xl backdrop-blur">
                <div className="flex items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                    <ShieldCheck size={23} weight="fill" />
                  </span>
                  <div>
                    <p className="text-sm font-extrabold">Built for real-world programme operations</p>
                    <p className="mt-1 text-xs leading-5 text-slate-600">
                      Identity, care continuity, low-connectivity work and governed review in one platform.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-5 hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:block">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-emerald-700">Current stage</p>
              <p className="mt-1 text-sm font-extrabold">Pre-production · pilot validation next</p>
            </div>
          </div>
        </div>
      </section>

      <section id="capabilities" className="relative py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Core platform surfaces"
            title="The operational capabilities already represented in the product."
            description="These are not future marketing promises. They reflect the existing Medfinet workspaces and workflows, with production readiness still dependent on controlled validation."
            center
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map(({ icon: Icon, title, text, className }) => (
              <article key={title} className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_14px_45px_rgba(15,23,42,.06)] transition hover:-translate-y-1 hover:shadow-[0_20px_55px_rgba(15,23,42,.10)]">
                <span className={`grid h-12 w-12 place-items-center rounded-xl ${className}`}>
                  <Icon size={24} weight="duotone" />
                </span>
                <h3 className="mt-5 text-lg font-extrabold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="why" className="relative overflow-hidden bg-slate-950 py-16 text-white sm:py-20">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:44px_44px]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 sm:px-6 lg:grid-cols-[.9fr_1.1fr] lg:items-start lg:px-8">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-cyan-300">Why Medfinet</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl lg:text-[2.8rem] lg:leading-[1.08]">
              Child health records can fragment across people, facilities, programmes and connectivity gaps.
            </h2>
            <p className="mt-6 text-base leading-8 text-slate-300">
              Medfinet is designed to give authorized teams a shared operational record while limiting
              unnecessary access. The aim is continuity: knowing who the child is, what care has been recorded,
              what action is due and who is permitted to act.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Duplicate or inconsistent identity", "Fragmented records can create ambiguity, missed history and difficult follow-up."],
              ["Missed care and appointments", "Teams need clearer visibility into upcoming, overdue and completed care actions."],
              ["Unreliable connectivity", "Frontline work cannot assume that every facility or field location is always online."],
              ["Sensitive information", "Clinical and programme data must not be visible to every user in the same way."],
            ].map(([title, text], index) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur">
                <span className="text-xs font-extrabold text-cyan-300">0{index + 1}</span>
                <h3 className="mt-3 text-base font-extrabold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="users" className="bg-[linear-gradient(180deg,#f7fbff_0%,#ffffff_100%)] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Who uses Medfinet"
            title="Different roles. Separate responsibilities. One continuity platform."
            description="Each workspace is intended for a defined operational role. Access should remain tied to organization membership, role and purpose."
            center
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-5">
            {audiences.map(({ icon: Icon, title, text }) => (
              <article key={title} className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-50 text-emerald-700">
                  <Icon size={23} weight="duotone" />
                </span>
                <h3 className="mt-4 text-base font-extrabold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="workflow" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
            <div className="relative">
              <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 p-3 shadow-[0_35px_80px_rgba(15,23,42,.18)]">
                <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=85" alt="Illustrative Medfinet product interface" className="w-full rounded-[1.25rem]" />
              </div>
              <div className="absolute -bottom-7 -right-3 max-w-xs rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
                <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-emerald-700">Important</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Product screenshots are illustrative. Deployment data and measured outcomes must come from validated pilots.
                </p>
              </div>
            </div>
            <div>
              <SectionHeading
                eyebrow="How it is used"
                title="From identity establishment to accountable follow-up."
                description="Medfinet connects a sequence of governed actions rather than presenting a passive dashboard."
              />
              <div className="mt-8 space-y-5">
                {workflow.map(([number, title, text]) => (
                  <div key={number} className="grid grid-cols-[48px_1fr] gap-4">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-emerald-700 text-xs font-extrabold text-white">{number}</span>
                    <div className="border-b border-slate-200 pb-5">
                      <h3 className="text-base font-extrabold">{title}</h3>
                      <p className="mt-1.5 text-sm leading-6 text-slate-600">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-emerald-50 py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-6 lg:grid-cols-[.8fr_1.2fr] lg:items-center lg:px-8">
          <div className="overflow-hidden rounded-[2rem] bg-white p-3 shadow-xl">
            <img src="https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=900&q=85" alt="Health worker using a digital device" className="h-[340px] w-full rounded-[1.4rem] object-cover" />
          </div>
          <div>
            <SectionHeading
              eyebrow="Pilot and implementation"
              title="Medfinet still needs real-world validation before production-scale claims."
              description="A responsible pilot should test frontline usability, connectivity recovery, hardware and provider integrations, clinical and language content, accessibility, security controls and operational monitoring."
            />
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {[
                "Physical NFC cards and supported readers",
                "USSD and SMS provider behaviour",
                "Low-bandwidth and offline recovery",
                "Clinical and language review",
                "Security and recovery exercises",
                "FHIR or DHIS2 exchange with named partners",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm">
                  <CheckCircle size={19} weight="fill" className="mt-0.5 shrink-0 text-emerald-600" />
                  <span className="text-sm font-semibold leading-6 text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="relative overflow-hidden py-16 sm:py-20">
        <div className="pointer-events-none absolute -right-36 top-16 h-[460px] w-[460px] rounded-full bg-cyan-100" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 sm:px-6 lg:grid-cols-[.75fr_1.25fr] lg:px-8">
          <div>
            <SectionHeading
              eyebrow="Clear answers"
              title="What Medfinet is—and what it is not."
              description="The landing page should make the platform understandable without pretending that unvalidated capabilities or outcomes are already proven."
            />
            <Link to="/register" className="mt-7 inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-5 py-3 text-sm font-extrabold text-white">
              Request access <ArrowRight size={16} weight="bold" />
            </Link>
          </div>
          <div className="space-y-3">
            {faqs.map(({ q, a }, index) => (
              <details key={q} open={index === 0} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-extrabold">
                  {q}
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-600 transition group-open:rotate-180">
                    <CaretDown size={15} weight="bold" />
                  </span>
                </summary>
                <p className="mt-4 border-t border-slate-200 pt-4 text-sm leading-7 text-slate-600">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <p className="text-2xl font-extrabold tracking-tight">Planning a controlled Medfinet pilot?</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Request access to review the platform and discuss the validation requirements for your programme.
            </p>
          </div>
          <Link to="/register" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-cyan-300 px-5 py-3 text-sm font-extrabold text-slate-950">
            Request pilot access <ArrowRight size={17} weight="bold" />
          </Link>
        </div>
      </section>

      <footer className="bg-[#071b2c] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.3fr_.7fr_.8fr_1fr] lg:px-8">
          <div>
            <Brand />
            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-300">
              An open-source browser application for Medfinet’s child-health continuity platform.
              Pre-production software requiring controlled technical, clinical and field validation.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-extrabold">Platform</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <a href="#capabilities" className="block hover:text-white">Capabilities</a>
              <a href="#users" className="block hover:text-white">Who it is for</a>
              <a href="#workflow" className="block hover:text-white">How it works</a>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-extrabold">Access</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <Link to="/login" className="block hover:text-white">Sign in</Link>
              <Link to="/register" className="block hover:text-white">Request access</Link>
              <a href="#faq" className="block hover:text-white">FAQ</a>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-extrabold">Transparency</h3>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              No deployment counts, accuracy rates, partner endorsements or outcome statistics are claimed on this page without validated evidence.
            </p>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-slate-400 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
            <span>Medfinet · Child health continuity infrastructure</span>
            <span>Apache-2.0 open-source frontend</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
