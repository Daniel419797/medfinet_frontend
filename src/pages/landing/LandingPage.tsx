import {
  ArrowRight,
  Buildings,
  CaretRight,
  CheckCircle,
  CloudArrowUp,
  DeviceMobile,
  Fingerprint,
  GlobeHemisphereWest,
  Heartbeat,
  LockKey,
  ShieldCheck,
  UsersThree,
} from "@phosphor-icons/react";
import { Link } from "react-router-dom";

const pillars = [
  {
    icon: Fingerprint,
    label: "Verified identity",
    text: "Child records, identifiers and caregiver relationships managed through governed workflows.",
  },
  {
    icon: Heartbeat,
    label: "Clinical continuity",
    text: "Immunizations, growth checks, alerts, allergies and appointments in one longitudinal record.",
  },
  {
    icon: DeviceMobile,
    label: "Offline operations",
    text: "A bounded set of field actions can be encrypted locally and synchronized later.",
  },
  {
    icon: LockKey,
    label: "Scoped access",
    text: "Role, organization and purpose context shape what each workspace can access.",
  },
];

const workflow = [
  {
    number: "01",
    title: "Establish identity",
    text: "Register or resolve a child record, connect the right caregiver and retain a clear identity history.",
  },
  {
    number: "02",
    title: "Deliver care",
    text: "Record clinical activity, schedule follow-up and coordinate authorized programme services.",
  },
  {
    number: "03",
    title: "Work through disruption",
    text: "Use connected workflows when available and queue supported field operations when connectivity drops.",
  },
  {
    number: "04",
    title: "Review and govern",
    text: "Use role-scoped workspaces, audit evidence and administrative controls to review sensitive actions.",
  },
];

const surfaces = [
  {
    eyebrow: "Identity and access",
    title: "One trusted child record across fragmented care journeys.",
    body: "Medfinet brings child identity, caregiver relationships and organization-scoped access together so teams can work from the same operational record without exposing every detail to every user.",
    points: [
      "Child registration and controlled lookup",
      "Caregiver linking and consent authority",
      "Identity amendments and identifier verification",
    ],
    icon: Fingerprint,
  },
  {
    eyebrow: "Clinical operations",
    title: "Everyday care workflows, not a decorative dashboard.",
    body: "Authorized health workers can record immunizations, growth measurements, alerts, allergies and appointments, while schedule evaluation helps surface overdue and upcoming care.",
    points: [
      "Longitudinal clinical timeline",
      "Vaccination schedule evaluation",
      "Appointments and caregiver responses",
    ],
    icon: Heartbeat,
  },
  {
    eyebrow: "Climate response",
    title: "Turn prioritized worklists into accountable field action.",
    body: "Response teams can open authorized worklists, record service delivery and create referrals without navigating unrelated clinical records or exposing unnecessary data.",
    points: [
      "Authorized programme worklists",
      "Delivery and referral recording",
      "Operational follow-up and evidence",
    ],
    icon: GlobeHemisphereWest,
  },
  {
    eyebrow: "Low-connectivity work",
    title: "Support the field without pretending the internet is always available.",
    body: "The frontend includes encrypted offline queues for a bounded set of operations and dedicated NFC surfaces. Hardware, provider and field performance still require controlled pilot validation.",
    points: [
      "Encrypted browser queue",
      "Idempotent batch submission",
      "Dedicated NFC scanner and provisioning flows",
    ],
    icon: CloudArrowUp,
  },
];

const validationItems = [
  "Physical NFC cards, supported readers and real tap-time performance",
  "USSD and SMS provider behaviour, delivery rates and production short codes",
  "Low-bandwidth usability, accessibility and frontline workflow testing",
  "FHIR or DHIS2 exchange with named partner systems",
  "Security review, recovery exercises and operational monitoring",
  "Clinical and language review of configured content",
];

function ProductCanvas() {
  return (
    <div className="relative border border-white/15 bg-white text-slate-950 shadow-[0_35px_90px_rgba(2,8,23,0.38)]">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Medfinet operations
          </p>
          <p className="mt-1 text-sm font-bold">Child continuity workspace</p>
        </div>
        <span className="inline-flex items-center gap-2 border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">
          <span className="h-2 w-2 bg-emerald-500" />
          Connected
        </span>
      </div>

      <div className="grid lg:grid-cols-[1.15fr_.85fr]">
        <section className="border-b border-slate-200 p-5 lg:border-b-0 lg:border-r">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary-700">
                Identity summary
              </p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight">
                Protected child record
              </h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                A single operational view for verified identity, care status and
                authorized follow-up.
              </p>
            </div>
            <span className="grid h-11 w-11 shrink-0 place-items-center bg-primary-50 text-primary-700">
              <Fingerprint size={22} />
            </span>
          </div>

          <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-5 border-y border-slate-200 py-5">
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                Medfinet ID
              </dt>
              <dd className="mt-1 text-sm font-bold">MDF-CH-20491</dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                Caregiver
              </dt>
              <dd className="mt-1 text-sm font-bold">Linked and authorized</dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                Next care action
              </dt>
              <dd className="mt-1 text-sm font-bold">Vaccination follow-up</dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                Access scope
              </dt>
              <dd className="mt-1 text-sm font-bold">Organization controlled</dd>
            </div>
          </dl>

          <div className="mt-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                Recent activity
              </p>
              <span className="text-xs font-semibold text-slate-500">Today</span>
            </div>
            <div className="mt-4 space-y-4">
              {[
                ["09:12", "Immunization recorded", "Clinical timeline updated"],
                ["10:40", "Appointment confirmed", "Caregiver response received"],
                ["12:05", "Worklist reviewed", "Programme access verified"],
              ].map(([time, title, note]) => (
                <div key={title} className="grid grid-cols-[52px_1fr] gap-3">
                  <span className="pt-0.5 text-xs font-bold text-slate-400">{time}</span>
                  <div className="border-l-2 border-primary-200 pl-3">
                    <p className="text-sm font-bold text-slate-900">{title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="bg-slate-50 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
            Active surfaces
          </p>
          <div className="mt-4 divide-y divide-slate-200 border-y border-slate-200">
            {[
              [Heartbeat, "Clinical operations", "Records and follow-up"],
              [DeviceMobile, "Offline sync", "Queued field work"],
              [GlobeHemisphereWest, "Response worklists", "Authorized delivery"],
            ].map(([Icon, title, note]) => {
              const SurfaceIcon = Icon as typeof Heartbeat;
              return (
                <div key={String(title)} className="flex items-center gap-3 py-4">
                  <span className="grid h-9 w-9 place-items-center bg-white text-primary-700 shadow-sm">
                    <SurfaceIcon size={18} />
                  </span>
                  <div>
                    <p className="text-sm font-bold">{String(title)}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{String(note)}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 bg-slate-950 p-5 text-white">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-300">
              Access context
            </p>
            <p className="mt-2 text-sm font-bold">Health worker · scoped facility</p>
            <p className="mt-2 text-xs leading-5 text-slate-300">
              Sensitive operations remain tied to role, organization and purpose.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-primary-700">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
        {title}
      </h2>
      {description ? (
        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center bg-primary-700 text-white">
              <ShieldCheck size={21} weight="fill" />
            </span>
            <span>
              <span className="block text-base font-extrabold tracking-tight">Medfinet</span>
              <span className="block text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Child health infrastructure
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
            <a className="text-sm font-semibold text-slate-600 hover:text-slate-950" href="#capabilities">
              Capabilities
            </a>
            <a className="text-sm font-semibold text-slate-600 hover:text-slate-950" href="#workflow">
              Workflow
            </a>
            <a className="text-sm font-semibold text-slate-600 hover:text-slate-950" href="#governance">
              Governance
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/login" className="px-2 py-2 text-sm font-bold text-slate-700 hover:text-slate-950 sm:px-3">
              Sign in
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-primary-700 px-3 py-2.5 text-sm font-bold text-white transition hover:bg-primary-800 sm:px-4"
            >
              <span className="hidden sm:inline">Request access</span>
              <span className="sm:hidden">Access</span>
              <ArrowRight size={16} weight="bold" />
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-slate-800 bg-slate-950 text-white">
        <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:44px_44px]" />
        <div className="pointer-events-none absolute -right-20 top-0 h-[520px] w-[520px] bg-[radial-gradient(circle,rgba(14,165,233,.22),transparent_68%)]" />

        <div className="relative mx-auto grid max-w-7xl gap-14 px-5 py-16 sm:px-6 lg:grid-cols-[.95fr_1.05fr] lg:items-center lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 border border-cyan-300/25 bg-cyan-300/5 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">
              <span className="h-1.5 w-1.5 bg-cyan-300" />
              Pre-production platform · pilot validation next
            </div>

            <h1 className="mt-6 text-4xl font-extrabold tracking-[-0.04em] sm:text-5xl lg:text-[4.2rem] lg:leading-[1.02]">
              Care continuity for every child,
              <span className="block text-cyan-300">even through disruption.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
              Medfinet connects verified child identity, clinical operations,
              offline field work and accountable access in one secure platform
              designed for fragmented and low-connectivity care environments.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-cyan-300 px-5 py-3 text-sm font-extrabold text-slate-950 transition hover:bg-cyan-200"
              >
                Request pilot access
                <ArrowRight size={17} weight="bold" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 border border-white/25 px-5 py-3 text-sm font-bold text-white transition hover:border-white/50 hover:bg-white/5"
              >
                Open secure workspace
              </Link>
            </div>

            <div className="mt-9 grid gap-4 border-t border-white/15 pt-6 sm:grid-cols-3">
              {[
                "Backend-connected workflows",
                "Encrypted offline queue",
                "Role-scoped workspaces",
              ].map((item) => (
                <div key={item} className="flex gap-3">
                  <CheckCircle size={18} className="mt-0.5 shrink-0 text-cyan-300" weight="fill" />
                  <p className="text-sm leading-5 text-slate-300">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <ProductCanvas />
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="grid divide-y divide-slate-200 border-x border-slate-200 md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-4">
            {pillars.map(({ icon: Icon, label, text }) => (
              <article key={label} className="p-6 lg:p-7">
                <Icon size={22} className="text-primary-700" />
                <h2 className="mt-5 text-lg font-extrabold tracking-tight">{label}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="workflow" className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
          <SectionHeading
            eyebrow="Operational workflow"
            title="A clear path from identity to accountable service delivery."
            description="The product story follows the way care teams actually work: identify the child, deliver care, continue through connectivity disruption and preserve a reviewable history."
          />

          <div className="mt-12 grid border-y border-slate-300 lg:grid-cols-4 lg:divide-x lg:divide-slate-300">
            {workflow.map((item) => (
              <article key={item.number} className="border-b border-slate-300 py-7 last:border-b-0 lg:border-b-0 lg:px-6 lg:first:pl-0 lg:last:pr-0">
                <p className="text-sm font-black tracking-[0.2em] text-primary-700">{item.number}</p>
                <h3 className="mt-4 text-xl font-extrabold tracking-tight">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="capabilities" className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
          <SectionHeading
            eyebrow="Core surfaces"
            title="Designed around real operations, not a wall of feature cards."
            description="Each major area is presented as a focused workflow with clear responsibilities, evidence boundaries and a direct relationship to the backend implementation."
          />

          <div className="mt-14 divide-y divide-slate-200 border-y border-slate-200">
            {surfaces.map(({ eyebrow, title, body, points, icon: Icon }, index) => (
              <article key={title} className="grid gap-10 py-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:gap-16">
                <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center bg-primary-50 text-primary-700">
                      <Icon size={21} />
                    </span>
                    <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary-700">{eyebrow}</p>
                  </div>
                  <h3 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-950">{title}</h3>
                  <p className="mt-5 text-base leading-7 text-slate-600">{body}</p>
                  <ul className="mt-7 space-y-3">
                    {points.map((point) => (
                      <li key={point} className="flex items-start gap-3 text-sm font-semibold text-slate-700">
                        <CaretRight size={16} className="mt-0.5 shrink-0 text-primary-700" weight="bold" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                  <div className="border border-slate-200 bg-slate-50 p-5 sm:p-7">
                    <div className="border border-slate-200 bg-white">
                      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Workspace preview</p>
                          <p className="mt-1 text-sm font-extrabold">{eyebrow}</p>
                        </div>
                        <span className="text-xs font-bold text-primary-700">Active</span>
                      </div>
                      <div className="grid gap-px bg-slate-200 sm:grid-cols-3">
                        {points.map((point, pointIndex) => (
                          <div key={point} className="bg-white p-5">
                            <p className="text-xs font-black text-slate-400">0{pointIndex + 1}</p>
                            <p className="mt-3 text-sm font-bold leading-5 text-slate-900">{point}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-4 text-xs text-slate-500">
                        <span>Organization-scoped access</span>
                        <span className="font-bold text-slate-700">Audit-aware workflow</span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="governance" className="border-y border-slate-800 bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-6 lg:grid-cols-[.85fr_1.15fr] lg:px-8 lg:py-20">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-cyan-300">Governance and trust</p>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Health software must be useful,
              <span className="block text-slate-400">and it must be accountable.</span>
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
              Medfinet is presented as a substantial pre-production implementation,
              not a finished national deployment. The interface communicates what
              works today while keeping validation boundaries visible.
            </p>
          </div>

          <div className="grid border border-white/15 sm:grid-cols-2">
            {[
              [LockKey, "Consent-aware access", "Sensitive work is shaped by role, organization and purpose context."],
              [ShieldCheck, "Operational auditability", "Key administrative and clinical actions remain reviewable."],
              [DeviceMobile, "Offline queue integrity", "Supported operations are encrypted locally and submitted as bounded batches."],
              [Buildings, "Multi-role workspaces", "Caregivers, workers, administrators, merchants and auditors receive distinct routes."],
            ].map(([Icon, title, text], index) => {
              const GovernanceIcon = Icon as typeof LockKey;
              return (
                <article
                  key={String(title)}
                  className={`p-6 ${index % 2 === 0 ? "sm:border-r sm:border-white/15" : ""} ${index < 2 ? "border-b border-white/15" : ""}`}
                >
                  <GovernanceIcon size={22} className="text-cyan-300" />
                  <h3 className="mt-5 text-lg font-extrabold">{String(title)}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{String(text)}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="status" className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
            <SectionHeading
              eyebrow="Validation roadmap"
              title="What still has to be proven in the real world."
              description="Implementation is not the same as deployment readiness. These areas remain part of controlled pilot, security and partner validation."
            />

            <div className="divide-y divide-slate-200 border-y border-slate-200">
              {validationItems.map((item, index) => (
                <div key={item} className="grid grid-cols-[42px_1fr] gap-4 py-4">
                  <span className="text-xs font-black tracking-[0.12em] text-amber-600">0{index + 1}</span>
                  <p className="text-sm font-semibold leading-6 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 border border-slate-300 bg-white p-7 sm:p-9 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-primary-700">Next step</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight">Explore the platform through a controlled workspace.</h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                Open an account to review the implementation or continue into an
                existing organization workspace.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-primary-700 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-primary-800"
              >
                Request access
                <ArrowRight size={17} weight="bold" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center border border-slate-300 px-5 py-3 text-sm font-extrabold text-slate-900 transition hover:bg-slate-50"
              >
                Sign in securely
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p className="font-bold text-slate-700">Medfinet · child health infrastructure</p>
          <p>Version 0.1.0 · pre-production implementation</p>
        </div>
      </footer>
    </main>
  );
}
