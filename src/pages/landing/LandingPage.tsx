import { useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowRight,
  ArrowsClockwise,
  Broadcast,
  CaretDown,
  ChartLineUp,
  Check,
  CheckCircle,
  ClipboardText,
  CloudCheck,
  EnvelopeSimple,
  FileText,
  Fingerprint,
  Gift,
  GlobeHemisphereWest,
  Heartbeat,
  IdentificationCard,
  List,
  LockKey,
  MagnifyingGlass,
  PlayCircle,
  ShieldCheck,
  Storefront,
  UserCircleGear,
  UserPlus,
  UsersThree,
  WifiSlash,
  X,
} from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { InstallMedfinetButton } from "../../components/pwa/InstallMedfinetButton";

const capabilities = [
  [Fingerprint, "Identity integrity", "Create and resolve child records, link caregivers and preserve a controlled identity history.", "blue"],
  [FileText, "Clinical continuity", "Record immunisations, growth, alerts, appointments and follow-up in one authorised timeline.", "green"],
  [CloudCheck, "Offline field work", "Queue a bounded set of encrypted field operations and synchronise when connectivity returns.", "orange"],
  [IdentificationCard, "NFC workflows", "Use dedicated scanning and provisioning surfaces for supported NFC-assisted identification.", "purple"],
  [GlobeHemisphereWest, "Response worklists", "Coordinate authorised delivery, referrals and follow-up without exposing unrelated records.", "teal"],
  [ShieldCheck, "Governed access", "Limit sensitive actions by role, organisation and purpose, with administrative review.", "gold"],
] as const;

const operationalGaps = [
  [Fingerprint, "Inconsistent identity", "Duplicate or incomplete records make continuity difficult.", "blue"],
  [MagnifyingGlass, "Missed follow-up", "Care actions can be delayed when tracking depends on paper or memory.", "green"],
  [WifiSlash, "Unreliable connectivity", "Field teams need bounded workflows when internet access drops.", "orange"],
  [LockKey, "Sensitive access", "Clinical and programme data must be limited to the right role and purpose.", "purple"],
] as const;

const roles = [
  [UsersThree, "Caregivers", "/images/landing/role-caregiver.webp", "View authorised child records, follow appointments and respond to enabled care actions.", "blue"],
  [Heartbeat, "Health workers", "/images/landing/role-health-worker.webp", "Register children, record care, review timelines and synchronise supported field activity.", "green"],
  [UserCircleGear, "Administrators", "/images/landing/role-administrator.webp", "Manage organisations, users, schedules, programme operations and reporting.", "orange"],
  [Storefront, "Approved merchants", "/images/landing/role-merchant.webp", "Handle authorised programme benefit and redemption activity under programme rules.", "purple"],
  [MagnifyingGlass, "Auditors", "/images/landing/role-auditor.webp", "Review permitted evidence and activity without unrestricted clinical access.", "gold"],
] as const;

const workflow = [
  [UserPlus, "Register", "Create or resolve a child record and connect the appropriate caregiver."],
  [Broadcast, "Verify", "Use supported identity checks and NFC-assisted workflows where configured."],
  [ClipboardText, "Record & follow up", "Capture authorised care, immunisation status, appointments and follow-up."],
  [Gift, "Coordinate support", "Record permitted services, referrals and programme benefit activity."],
  [ChartLineUp, "Review & improve", "Use controlled operational views for programme oversight and human review."],
] as const;

const resources = [
  ["/images/landing/resource-identity.webp", "Identity", "Why identity integrity matters in child-health programmes"],
  ["/images/landing/resource-continuity.webp", "Continuity", "Designing care workflows for low-connectivity settings"],
  ["/images/landing/resource-accountability.webp", "Accountability", "Using programme data responsibly across different roles"],
] as const;

function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link to="/" className={`mfl-brand${inverse ? " mfl-brand-inverse" : ""}`} aria-label="Medfinet home">
      <span className="mfl-brand-mark"><ShieldCheck weight="duotone" /></span>
      <span className="mfl-brand-copy"><strong>MedFinet</strong><small>Child health. Connected. Protected.</small></span>
    </Link>
  );
}

function NavGroup({ label, children }: { label: string; children: ReactNode }) {
  return <details className="mfl-nav-group"><summary>{label}<CaretDown weight="bold" /></summary><div className="mfl-nav-popover">{children}</div></details>;
}

function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="mfl-header">
      <div className="mfl-shell mfl-header-inner">
        <Brand />
        <button className="mfl-menu-toggle" type="button" aria-label="Toggle navigation" aria-expanded={open} onClick={() => setOpen(v => !v)}>{open ? <X /> : <List />}</button>
        <nav className={`mfl-nav${open ? " is-open" : ""}`} aria-label="Main navigation">
          <a className="is-active" href="#top">Home</a>
          <NavGroup label="Product"><a href="#product">Platform overview</a><a href="#workflow">How it works</a></NavGroup>
          <NavGroup label="Solutions"><a href="#capabilities">Identity integrity</a><a href="#capabilities">Clinical continuity</a><a href="#product">Programme oversight</a></NavGroup>
          <NavGroup label="Who it’s for"><a href="#users">Caregivers</a><a href="#users">Health workers</a><a href="#users">Programme teams</a></NavGroup>
          <NavGroup label="Resources"><a href="#resources">Product guidance</a><a href="#responsible-use">Responsible use</a></NavGroup>
          <a href="#about">About</a>
        </nav>
        <div className="mfl-header-actions"><Link className="mfl-sign-in" to="/login">Sign in</Link><a className="mfl-button mfl-button-small" href="#pilot">Request pilot access <ArrowRight weight="bold" /></a></div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="mfl-hero" id="top"><div className="mfl-shell mfl-hero-grid">
      <div className="mfl-hero-copy">
        <span className="mfl-eyebrow">PRE-PRODUCTION CHILD-HEALTH CONTINUITY PLATFORM</span>
        <h1>Protect children.<br />Connect care.<br />Keep programme action<br /><em>accountable.</em></h1>
        <p>Medfinet connects child identity, caregiver relationships, clinical records and authorised programme operations in one governed platform designed for fragmented and low-connectivity environments.</p>
        <div className="mfl-hero-actions"><a className="mfl-button" href="#pilot">Request pilot access <ArrowRight weight="bold" /></a><a className="mfl-button mfl-button-outline" href="#product">Explore the platform <PlayCircle weight="fill" /></a><InstallMedfinetButton className="mfl-button mfl-button-outline" /></div>
        <ul className="mfl-hero-facts"><li><WifiSlash /> Offline-aware workflows</li><li><IdentificationCard /> NFC-assisted identification</li><li><ArrowsClockwise /> Controlled synchronisation</li><li><LockKey /> Role-scoped access</li></ul>
      </div>
      <div className="mfl-hero-visual"><img src="/images/landing/hero-mother-child.webp" alt="A mother holding her child during a clinic visit" /><div className="mfl-hero-status"><ShieldCheck weight="duotone" /><div><strong>Medfinet in context</strong><span>Identity. Care continuity.<br />Governed programme action.</span></div></div></div>
    </div></section>
  );
}

function Capabilities() {
  return <section className="mfl-capabilities" id="capabilities"><div className="mfl-shell mfl-capability-grid">{capabilities.map(([Icon,title,text,tone]) => <article className="mfl-capability-card" key={title}><span className={`mfl-icon-disc ${tone}`}><Icon weight="duotone" /></span><h2>{title}</h2><p>{text}</p></article>)}</div></section>;
}

function About() {
  return <section className="mfl-about" id="about"><div className="mfl-shell mfl-about-grid">
    <div className="mfl-about-copy"><span className="mfl-eyebrow">WHY MEDFINET</span><h2>Closing the gaps in child-health continuity</h2><p>Children can move between facilities, programmes and emergency responses while their records remain fragmented. Medfinet connects identity, caregivers, care activity and authorised action without giving every user access to everything.</p><ul className="mfl-check-list"><li><CheckCircle weight="fill" /> Reduce duplicate or inconsistent records</li><li><CheckCircle weight="fill" /> Keep immunisation and follow-up visible</li><li><CheckCircle weight="fill" /> Support bounded offline field operations</li><li><CheckCircle weight="fill" /> Preserve role, organisation and purpose controls</li></ul><a className="mfl-text-button" href="#product">Learn more about the platform <ArrowRight weight="bold" /></a></div>
    <div className="mfl-reality"><h3>The operational reality</h3><div className="mfl-problem-grid">{operationalGaps.map(([Icon,title,text,tone]) => <article key={title}><span className={`mfl-mini-icon ${tone}`}><Icon weight="duotone" /></span><div><h4>{title}</h4><p>{text}</p></div></article>)}</div></div>
  </div></section>;
}

function Roles() {
  return <section className="mfl-roles" id="users"><div className="mfl-shell"><div className="mfl-section-heading"><span className="mfl-eyebrow">WHO IT’S FOR</span><h2>One platform. <span>Different responsibilities.</span> One mission.</h2></div><div className="mfl-role-grid">{roles.map(([Icon,title,image,text,tone]) => <article className="mfl-role-card" key={title}><img src={image} alt="" /><div><h3><span className={`mfl-mini-icon ${tone}`}><Icon weight="duotone" /></span>{title}</h3><p>{text}</p><Link to="/register">Request access <ArrowRight weight="bold" /></Link></div></article>)}</div></div></section>;
}

function Workflow() {
  return <section className="mfl-workflow" id="workflow"><div className="mfl-shell"><div className="mfl-section-heading compact"><span className="mfl-eyebrow">HOW IT WORKS</span><h2>A controlled path from identity to follow-up</h2></div><ol className="mfl-steps">{workflow.map(([Icon,title,text],i) => <li key={title}><span className="mfl-step-number">{i+1}</span><span className="mfl-step-icon"><Icon weight="duotone" /></span><h3>{title}</h3><p>{text}</p></li>)}</ol></div></section>;
}

function Product() {
  return <section className="mfl-product" id="product"><div className="mfl-shell mfl-product-grid"><div className="mfl-product-visual"><img src="/images/landing/platform-dashboard.webp" alt="An illustrative Medfinet operations dashboard and mobile record view" /></div><div className="mfl-product-copy"><span className="mfl-eyebrow">BUILT AROUND CURRENT PRODUCT SURFACES</span><h2>Designed for child-health continuity—not generic hospital administration.</h2><p>The current application includes caregiver, health-worker, administrator, merchant and auditor workspaces, plus clinical operations, immunisation history, NFC flows, offline synchronisation and governed programme worklists.</p><ul className="mfl-check-list"><li><CheckCircle weight="fill" /> Longitudinal child and caregiver context</li><li><CheckCircle weight="fill" /> Separate role-specific workspaces</li><li><CheckCircle weight="fill" /> Human review for sensitive flags</li><li><CheckCircle weight="fill" /> Pilot validation before production claims</li></ul><a className="mfl-button" href="#pilot">Explore pilot access <ArrowRight weight="bold" /></a></div></div></section>;
}

function Pilot() {
  const [sent,setSent] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSent(true); };
  return <section className="mfl-pilot" id="pilot"><div className="mfl-shell mfl-pilot-panel"><div className="mfl-pilot-intro"><img src="/images/landing/nurse-cta.webp" alt="A community health worker holding a tablet" /><div><h2>Explore whether Medfinet fits your programme</h2><p>For government programmes, NGOs, participating facilities and implementation teams assessing child-health continuity workflows.</p></div></div><form className="mfl-pilot-form" onSubmit={submit}>{sent ? <div className="mfl-form-success"><CheckCircle weight="fill" /><div><strong>Details captured in this preview</strong><span>This form is not connected to a live endpoint yet. Use the access flow to continue.</span><Link to="/register">Continue to request access <ArrowRight /></Link></div></div> : <><label>Full name<input name="name" placeholder="Your name" required /></label><label>Work email<input name="email" type="email" placeholder="you@organisation.org" required /></label><label>Organisation<input name="organisation" placeholder="Organisation name" required /></label><label>Interest<select defaultValue="" required><option value="" disabled>Select an area</option><option>Pilot assessment</option><option>Technical review</option><option>Programme workflow review</option></select></label><button className="mfl-button" type="submit">Review request <ArrowRight weight="bold" /></button><small>No data leaves this preview form.</small></>}</form></div></section>;
}

function Resources() {
  return <section className="mfl-resources" id="resources"><div className="mfl-shell"><div className="mfl-resource-heading"><div><span className="mfl-eyebrow">RESOURCES</span><h2>Product guidance</h2></div><a className="mfl-text-button" href="#responsible-use">Responsible-use note <ArrowRight weight="bold" /></a></div><div className="mfl-resource-grid">{resources.map(([image,label,title]) => <article className="mfl-resource-card" key={title}><img src={image} alt="" /><div><span>{label}</span><h3>{title}</h3><a href="#responsible-use">Read overview <ArrowRight weight="bold" /></a></div></article>)}</div><aside className="mfl-responsible" id="responsible-use"><ShieldCheck weight="duotone" /><p><strong>Responsible use:</strong> Medfinet is pre-production software. Its risk and duplicate-record signals support investigation; they do not automatically deny care, enrolment or programme benefits. Authorised people make final decisions.</p></aside></div></section>;
}

function Footer() {
  const [subscribed,setSubscribed] = useState(false);
  return <footer className="mfl-footer"><div className="mfl-newsletter"><div className="mfl-shell mfl-newsletter-inner"><div className="mfl-newsletter-copy"><EnvelopeSimple weight="duotone" /><span><strong>Stay informed</strong><small>Receive Medfinet product and programme updates.</small></span></div>{subscribed ? <p className="mfl-subscribe-success"><Check /> Added in this preview.</p> : <form onSubmit={e => { e.preventDefault(); setSubscribed(true); }}><label className="mfl-sr-only" htmlFor="mfl-email">Email address</label><input id="mfl-email" type="email" placeholder="Enter your email" required /><button type="submit">Subscribe</button></form>}</div></div><div className="mfl-footer-main"><div className="mfl-shell mfl-footer-grid"><div className="mfl-footer-brand"><Brand inverse /><p>A pre-production child-health continuity platform for participating programmes operating across fragmented and low-connectivity settings.</p></div><div><h3>Product</h3><a href="#product">Overview</a><a href="#capabilities">Capabilities</a><a href="#workflow">How it works</a><a href="#responsible-use">Responsible use</a></div><div><h3>Users</h3><a href="#users">Caregivers</a><a href="#users">Health workers</a><a href="#users">Programme teams</a><a href="#users">Auditors</a></div><div><h3>Governance</h3><p>Role-scoped access</p><p>Human review</p><p>Pilot validation</p></div><div><h3>Access</h3><Link to="/login">Sign in</Link><Link to="/register">Request access</Link><p>Pre-production</p><p>Nigeria</p></div></div><div className="mfl-shell mfl-footer-bottom"><span>© 2026 Medfinet contributors.</span><span>Production readiness requires controlled technical, clinical and field validation.</span></div></div></footer>;
}

export default function LandingPage() {
  return <main className="medfinet-landing"><Header /><Hero /><Capabilities /><About /><Roles /><Workflow /><Product /><Pilot /><Resources /><Footer /></main>;
}
