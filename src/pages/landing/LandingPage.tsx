import {
  ArrowRight,
  Buildings,
  ChartLineUp,
  CheckCircle,
  Fingerprint,
  GlobeHemisphereWest,
  Heartbeat,
  IdentificationCard,
  LockKey,
  MagnifyingGlass,
  ShieldCheck,
  Storefront,
  UsersThree,
  WifiSlash,
} from "@phosphor-icons/react";
import { Link } from "react-router-dom";

const capabilities = [
  [Fingerprint, "Identity integrity", "Create and resolve child records, link caregivers and preserve a controlled identity history.", "bg-sky-50 text-sky-700"],
  [Heartbeat, "Clinical continuity", "Record immunizations, growth checks, alerts, allergies, appointments and follow-up in one timeline.", "bg-emerald-50 text-emerald-700"],
  [WifiSlash, "Offline field work", "Queue a bounded set of encrypted field operations and synchronize when connectivity returns.", "bg-amber-50 text-amber-700"],
  [IdentificationCard, "NFC workflows", "Use dedicated scanning and provisioning surfaces for supported NFC-assisted identification.", "bg-violet-50 text-violet-700"],
  [GlobeHemisphereWest, "Response worklists", "Coordinate authorized programme delivery, referrals and follow-up without exposing unrelated records.", "bg-cyan-50 text-cyan-700"],
  [ShieldCheck, "Governed access", "Limit sensitive actions by role, organization and purpose, with administrative and audit review.", "bg-rose-50 text-rose-700"],
] as const;

const roles = [
  {
    icon: UsersThree,
    title: "Caregivers",
    image: "https://images.unsplash.com/photo-1543342386-1f1350e27861?auto=format&fit=crop&w=700&q=85",
    text: "View authorized child records, follow appointments and respond to care actions where enabled.",
  },
  {
    icon: Heartbeat,
    title: "Health workers",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=700&q=85",
    text: "Register children, record care, review timelines and synchronize supported field activity.",
  },
  {
    icon: Buildings,
    title: "Administrators",
    image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=700&q=85",
    text: "Manage organizations, users, schedules, resources, programme operations and reporting.",
  },
  {
    icon: Storefront,
    title: "Approved merchants",
    image: "https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=700&q=85",
    text: "Handle authorized programme benefit and redemption activity under programme rules.",
  },
  {
    icon: MagnifyingGlass,
    title: "Auditors",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=700&q=85",
    text: "Review permitted evidence and activity without receiving unrestricted clinical access.",
  },
];

const workflow = [
  [UsersThree, "Register", "Create or resolve a child record and connect the appropriate caregiver."],
  [IdentificationCard, "Verify", "Use supported identity checks and NFC-assisted workflows where configured."],
  [Heartbeat, "Record & follow up", "Capture authorized care, immunization status, appointments and follow-up."],
  [Storefront, "Deliver programme support", "Coordinate permitted services, referrals and benefit activity."],
  [ChartLineUp, "Review & improve", "Use controlled operational views for programme oversight and human review."],
] as const;

function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="Medfinet home">
      <span className={`grid h-9 w-9 place-items-center rounded-lg ${inverse ? "bg-white text-emerald-800" : "bg-emerald-700 text-white"}`}>
        <ShieldCheck size={21} weight="fill" />
      </span>
      <span>
        <span className={`block text-base font-extrabold leading-none ${inverse ? "text-white" : "text-slate-950"}`}>Medfinet</span>
        <span className={`mt-1 block text-[8px] font-bold uppercase tracking-[0.14em] ${inverse ? "text-slate-300" : "text-slate-500"}`}>
          Child health continuity
        </span>
      </span>
    </Link>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between px-4 sm:px-6">
          <Brand />
          <nav className="hidden items-center gap-6 md:flex" aria-label="Main navigation">
            <a href="#product" className="text-xs font-bold text-slate-700 hover:text-emerald-700">Product</a>
            <a href="#capabilities" className="text-xs font-bold text-slate-700 hover:text-emerald-700">Solutions</a>
            <a href="#users" className="text-xs font-bold text-slate-700 hover:text-emerald-700">Who it is for</a>
            <a href="#workflow" className="text-xs font-bold text-slate-700 hover:text-emerald-700">How it works</a>
            <a href="#about" className="text-xs font-bold text-slate-700 hover:text-emerald-700">About</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="hidden px-3 py-2 text-xs font-bold text-slate-700 sm:inline-flex">Sign in</Link>
            <Link to="/register" className="inline-flex items-center gap-2 rounded-md bg-emerald-700 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-emerald-800">
              Request access <ArrowRight size={14} weight="bold" />
            </Link>
          </div>
        </div>
      </header>

      <section className="relative bg-[linear-gradient(135deg,#ffffff_0%,#f7fffb_46%,#edf8ff_100%)]">
        <div className="mx-auto grid max-w-[1180px] gap-8 px-4 pb-10 pt-10 sm:px-6 md:grid-cols-[.86fr_1.14fr] md:items-center md:pb-14 md:pt-14">
          <div className="relative z-10">
            <span className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.14em] text-sky-700">
              Child-health continuity platform
            </span>
            <h1 className="mt-5 max-w-[520px] text-[42px] font-extrabold leading-[1.02] tracking-[-.045em] sm:text-[52px] md:text-[48px] lg:text-[58px]">
              One identity.<br />Every record.<br /><span className="text-emerald-700">A healthier future.</span>
            </h1>
            <p className="mt-5 max-w-[510px] text-sm leading-7 text-slate-600 md:text-[15px]">
              Medfinet connects child identity, caregiver relationships, clinical records, immunization activity and authorized programme operations in one governed platform built for fragmented and low-connectivity environments.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/register" className="inline-flex items-center gap-2 rounded-md bg-emerald-700 px-5 py-3 text-xs font-extrabold text-white shadow-lg shadow-emerald-900/10 hover:bg-emerald-800">
                Request pilot access <ArrowRight size={15} weight="bold" />
              </Link>
              <a href="#workflow" className="inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-white px-5 py-3 text-xs font-extrabold text-emerald-800">
                See how it works
              </a>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3 text-[11px] font-semibold text-slate-600">
              <span className="inline-flex items-center gap-2"><WifiSlash className="text-emerald-700" /> Offline-aware</span>
              <span className="inline-flex items-center gap-2"><IdentificationCard className="text-emerald-700" /> NFC workflows</span>
              <span className="inline-flex items-center gap-2"><LockKey className="text-emerald-700" /> Role-scoped access</span>
            </div>
          </div>

          <div className="relative min-w-0 md:-mr-8 lg:-mr-16">
            <div className="absolute -left-6 top-1/2 hidden h-44 w-44 -translate-y-1/2 rounded-full bg-emerald-500 md:block" />
            <div className="relative overflow-hidden rounded-[34%_8%_28%_10%/20%_10%_28%_12%] bg-sky-50 shadow-[0_28px_80px_rgba(15,23,42,.14)]">
              <img
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1400&q=88"
                alt="Health worker supporting a caregiver"
                className="h-[360px] w-full object-cover sm:h-[430px] md:h-[420px] lg:h-[490px]"
              />
            </div>
            <div className="absolute bottom-5 left-4 right-4 rounded-xl border border-white/80 bg-white/95 p-4 shadow-xl sm:left-auto sm:right-7 sm:w-[300px]">
              <div className="flex gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700"><ShieldCheck size={21} weight="fill" /></span>
                <div>
                  <p className="text-xs font-extrabold">Built for real-world care programmes</p>
                  <p className="mt-1 text-[11px] leading-5 text-slate-600">Identity, continuity, low-connectivity operations and governed review.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="capabilities" className="relative -mt-1 pb-14 pt-7">
        <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
            {capabilities.map(([Icon, title, text, tone]) => (
              <article key={title} className="min-h-[175px] rounded-xl border border-slate-100 bg-white p-4 shadow-[0_12px_35px_rgba(15,23,42,.06)]">
                <span className={`grid h-10 w-10 place-items-center rounded-full ${tone}`}><Icon size={20} weight="duotone" /></span>
                <h2 className="mt-4 text-sm font-extrabold leading-tight">{title}</h2>
                <p className="mt-2 text-[11px] leading-5 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="relative overflow-hidden bg-[linear-gradient(180deg,#f6fbff_0%,#ffffff_100%)] py-14">
        <div className="mx-auto grid max-w-[1180px] gap-8 px-4 sm:px-6 md:grid-cols-[.78fr_1.22fr] md:items-center">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-emerald-700">Why Medfinet</p>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-[-.035em]">Closing the gaps in child-health continuity.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Children can move between facilities, programmes and emergency responses while their records remain fragmented. Medfinet is designed to connect identity, caregivers, care activity and authorized programme action without giving every user access to everything.
            </p>
            <div className="mt-5 space-y-2.5">
              {["Reduce duplicate or inconsistent records", "Keep immunization and follow-up visible", "Support bounded offline field operations", "Preserve role, organization and purpose controls"].map((item) => (
                <p key={item} className="flex items-center gap-2 text-xs font-semibold text-slate-700"><CheckCircle size={17} weight="fill" className="text-emerald-600" />{item}</p>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-white p-7 shadow-[0_18px_55px_rgba(15,23,42,.07)]">
            <h3 className="text-xl font-extrabold">The operational reality</h3>
            <div className="mt-6 grid gap-0 sm:grid-cols-2">
              {[
                [Fingerprint, "Inconsistent identity", "Duplicate or incomplete records make continuity difficult."],
                [Heartbeat, "Missed follow-up", "Care actions can be delayed when tracking depends on paper or memory."],
                [WifiSlash, "Unreliable connectivity", "Field teams need carefully bounded workflows when internet access drops."],
                [LockKey, "Sensitive access", "Clinical and programme data must be limited to the right role and purpose."],
              ].map(([Icon, title, text], index) => {
                const ItemIcon = Icon as typeof Fingerprint;
                return (
                  <div key={String(title)} className={`p-5 ${index < 2 ? "border-b" : ""} ${index % 2 === 0 ? "sm:border-r" : ""} border-slate-200`}>
                    <ItemIcon size={21} className="text-emerald-700" />
                    <p className="mt-3 text-sm font-extrabold">{String(title)}</p>
                    <p className="mt-1 text-[11px] leading-5 text-slate-600">{String(text)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="users" className="py-14">
        <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
          <div className="text-center">
            <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-emerald-700">Who uses Medfinet</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-[-.035em]">One platform. Different responsibilities.</h2>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-5">
            {roles.map(({ icon: Icon, title, image, text }) => (
              <article key={title} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,.06)]">
                <img src={image} alt="" className="h-28 w-full object-cover" />
                <div className="p-4">
                  <div className="flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-50 text-emerald-700"><Icon size={15} /></span><h3 className="text-xs font-extrabold">{title}</h3></div>
                  <p className="mt-3 text-[10px] leading-[1.65] text-slate-600">{text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="workflow" className="bg-[linear-gradient(180deg,#ffffff_0%,#f5fbff_100%)] py-14">
        <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
          <div className="text-center">
            <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-sky-700">How it works</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-[-.035em]">A controlled path from identity to follow-up.</h2>
          </div>
          <div className="relative mt-9 grid grid-cols-2 gap-6 md:grid-cols-5">
            <div className="absolute left-[10%] right-[10%] top-10 hidden border-t border-dashed border-sky-300 md:block" />
            {workflow.map(([Icon, title, text], index) => (
              <article key={title} className="relative text-center">
                <span className="relative z-10 mx-auto grid h-20 w-20 place-items-center rounded-full border border-sky-100 bg-white text-sky-700 shadow-lg"><Icon size={31} weight="duotone" /></span>
                <span className="absolute left-[calc(50%-42px)] top-1 z-20 grid h-5 w-5 place-items-center rounded-full bg-sky-700 text-[9px] font-extrabold text-white">{index + 1}</span>
                <h3 className="mt-4 text-sm font-extrabold">{title}</h3>
                <p className="mx-auto mt-2 max-w-[180px] text-[10px] leading-5 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="product" className="py-14">
        <div className="mx-auto grid max-w-[1180px] gap-9 px-4 sm:px-6 md:grid-cols-[1.12fr_.88fr] md:items-center">
          <div className="relative rounded-2xl border border-slate-200 bg-slate-100 p-3 shadow-[0_25px_70px_rgba(15,23,42,.14)]">
            <div className="rounded-xl bg-white p-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3"><p className="text-xs font-extrabold">Medfinet operations</p><span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-700">Illustrative interface</span></div>
              <div className="mt-4 grid grid-cols-4 gap-2">
                {["Child records", "Care actions", "Worklists", "Audit review"].map((label) => <div key={label} className="rounded-lg bg-slate-50 p-3"><p className="text-[9px] font-bold text-slate-500">{label}</p><div className="mt-3 h-2 rounded bg-emerald-100" /><div className="mt-2 h-2 w-2/3 rounded bg-slate-200" /></div>)}
              </div>
              <div className="mt-3 grid grid-cols-[1.35fr_.65fr] gap-3">
                <div className="rounded-lg bg-slate-50 p-4"><p className="text-[10px] font-bold text-slate-600">Longitudinal activity</p><div className="mt-7 flex h-28 items-end gap-3">{[32,58,44,78,61,92,72,105].map((h, i) => <span key={i} className="flex-1 rounded-t bg-emerald-200" style={{ height: h }} />)}</div></div>
                <div className="rounded-lg bg-slate-950 p-4 text-white"><ShieldCheck size={26} className="text-emerald-300" /><p className="mt-4 text-xs font-extrabold">Role-scoped workspace</p><p className="mt-2 text-[10px] leading-5 text-slate-300">What a person can see depends on their role, organization and permitted purpose.</p></div>
              </div>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-emerald-700">Built around actual product surfaces</p>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-[-.035em]">Designed for child-health continuity, not generic hospital administration.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">The current application includes distinct caregiver, health-worker, administrator, merchant and auditor workspaces, plus clinical operations, immunization history, NFC flows, offline synchronization and governed programme worklists.</p>
            <div className="mt-5 space-y-2.5">{["Longitudinal child and caregiver context", "Separate role-specific workspaces", "Human review for sensitive flags", "Pilot validation before production claims"].map((item) => <p key={item} className="flex items-center gap-2 text-xs font-semibold text-slate-700"><CheckCircle size={17} weight="fill" className="text-emerald-600" />{item}</p>)}</div>
            <Link to="/register" className="mt-7 inline-flex items-center gap-2 rounded-md bg-emerald-700 px-5 py-3 text-xs font-extrabold text-white">Request pilot access <ArrowRight size={15} /></Link>
          </div>
        </div>
      </section>

      <section className="pb-14">
        <div className="mx-auto grid max-w-[1180px] overflow-hidden rounded-3xl bg-[linear-gradient(100deg,#eef9ff,#f8fffb)] md:grid-cols-[.8fr_1.2fr]">
          <div className="relative min-h-[300px]">
            <img src="https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=900&q=85" alt="Health worker using a tablet" className="absolute inset-0 h-full w-full object-cover" />
          </div>
          <div className="p-7 sm:p-9">
            <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-emerald-700">Pilot and implementation discussion</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-[-.035em]">Explore whether Medfinet fits your programme.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">For government programmes, NGOs, participating facilities and implementation teams assessing child-health continuity workflows.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <input className="rounded-md border border-slate-200 bg-white px-4 py-3 text-xs outline-none focus:border-emerald-600" placeholder="Full name" />
              <input className="rounded-md border border-slate-200 bg-white px-4 py-3 text-xs outline-none focus:border-emerald-600" placeholder="Work email" type="email" />
              <input className="rounded-md border border-slate-200 bg-white px-4 py-3 text-xs outline-none focus:border-emerald-600" placeholder="Organization" />
              <select className="rounded-md border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500 outline-none focus:border-emerald-600"><option>What are you interested in?</option><option>Pilot assessment</option><option>Technical review</option><option>Programme workflow review</option></select>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4"><Link to="/register" className="inline-flex items-center gap-2 rounded-md bg-emerald-700 px-5 py-3 text-xs font-extrabold text-white">Request access <ArrowRight size={15} /></Link><p className="text-[10px] leading-5 text-slate-500">Submitting this visual form does not yet send data. Use the access flow to continue.</p></div>
          </div>
        </div>
      </section>

      <footer className="bg-slate-950 text-white">
        <div className="mx-auto grid max-w-[1180px] gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.3fr_repeat(4,1fr)]">
          <div><Brand inverse /><p className="mt-5 max-w-[260px] text-xs leading-6 text-slate-400">A pre-production child-health continuity platform for participating programmes operating across fragmented and low-connectivity environments.</p></div>
          <div><p className="text-xs font-extrabold">Product</p><div className="mt-4 space-y-3 text-[11px] text-slate-400"><a href="#product" className="block">Overview</a><a href="#capabilities" className="block">Capabilities</a><a href="#workflow" className="block">How it works</a></div></div>
          <div><p className="text-xs font-extrabold">Users</p><div className="mt-4 space-y-3 text-[11px] text-slate-400"><a href="#users" className="block">Caregivers</a><a href="#users" className="block">Health workers</a><a href="#users" className="block">Administrators</a></div></div>
          <div><p className="text-xs font-extrabold">Governance</p><div className="mt-4 space-y-3 text-[11px] text-slate-400"><p>Role-scoped access</p><p>Human review</p><p>Pilot validation</p></div></div>
          <div><p className="text-xs font-extrabold">Access</p><div className="mt-4 space-y-3 text-[11px] text-slate-400"><Link to="/login" className="block">Sign in</Link><Link to="/register" className="block">Request access</Link><p>Pre-production</p></div></div>
        </div>
        <div className="border-t border-white/10 py-5"><p className="mx-auto max-w-[1180px] px-4 text-[10px] text-slate-500 sm:px-6">Medfinet · Pre-production platform. Production readiness and outcomes require controlled technical, clinical and field validation.</p></div>
      </footer>
    </main>
  );
}
