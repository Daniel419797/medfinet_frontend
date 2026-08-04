import {
  ArrowRight,
  Baby,
  CalendarBlank,
  CheckCircle,
  CloudSun,
  CreditCard,
  Heartbeat,
  IdentificationCard,
  ArrowClockwise,
  UsersThree,
  type Icon,
} from "@phosphor-icons/react";
import { useCallback, useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageFeedback } from "../../components/common/PageFeedback";
import UserContext from "../../contexts/UserContext";
import { medfinetIdentityApi } from "../../services/medfinetIdentityApi";
import { medfinetOperationsApi } from "../../services/medfinetOperationsApi";

type AppointmentRows = Awaited<ReturnType<typeof medfinetOperationsApi.appointments>>;

export default function OperationalOverview() {
  const { organizationId } = useContext(UserContext);
  const [data, setData] = useState({ children: 0, caregivers: 0, appointments: 0, climate: 0, devices: 0 });
  const [appointments, setAppointments] = useState<AppointmentRows>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setError(null);
    try {
      const [children, caregivers, scheduled, climate, devices] = await Promise.all([
        medfinetIdentityApi.listChildren(organizationId, { limit: 100 }),
        medfinetOperationsApi.caregivers(organizationId),
        medfinetOperationsApi.appointments(organizationId, "SCHEDULED"),
        medfinetOperationsApi.climateEvents(organizationId, "ACTIVE"),
        medfinetOperationsApi.devices(organizationId),
      ]);
      setData({ children: children.items.length, caregivers: caregivers.length, appointments: scheduled.length, climate: climate.length, devices: devices.length });
      setAppointments(scheduled.slice(0, 6));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load operational overview");
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => { void load(); }, [load]);

  const signals = [
    {
      area: "Appointments",
      detail: data.appointments ? `${data.appointments} scheduled visits require delivery tracking` : "No scheduled visits are waiting",
      impact: data.appointments ? "Active" : "Clear",
      status: data.appointments ? "monitor" : "clear",
      icon: CalendarBlank,
      to: "/admin/clinical",
    },
    {
      area: "Climate response",
      detail: data.climate ? `${data.climate} active response event${data.climate === 1 ? "" : "s"}` : "No active climate events",
      impact: data.climate ? "Attention" : "Clear",
      status: data.climate ? "attention" : "clear",
      icon: CloudSun,
      to: "/admin/climate",
    },
    {
      area: "Identity coverage",
      detail: `${data.children} child record${data.children === 1 ? "" : "s"} and ${data.caregivers} caregiver${data.caregivers === 1 ? "" : "s"}`,
      impact: "Current",
      status: "neutral",
      icon: IdentificationCard,
      to: "/admin/identity-integrity",
    },
    {
      area: "Trusted devices",
      detail: `${data.devices} registered device${data.devices === 1 ? "" : "s"}`,
      impact: data.devices ? "Available" : "Not configured",
      status: data.devices ? "clear" : "neutral",
      icon: CreditCard,
      to: "/admin/devices",
    },
  ] as const;

  return (
    <div className="mf-page">
      <header className="mf-page-header">
        <div>
          <p className="mf-eyebrow">Live organization signals</p>
          <h1 className="mt-1">Operational overview</h1>
          <p className="mf-description">Review current service activity and move directly into the workflows that need attention.</p>
        </div>
        <div className="flex flex-wrap gap-2 lg:shrink-0 lg:flex-nowrap">
          <button type="button" className="mf-button-secondary" onClick={() => void load()}><ArrowClockwise size={18} />Refresh</button>
          <Link className="mf-button-primary" to="/admin/clinical"><Heartbeat size={18} />Review care operations</Link>
        </div>
      </header>

      <PageFeedback loading={loading} error={error} onRetry={() => void load()}>
        <section aria-label="Organization totals" className="mf-stat-strip">
          <Stat icon={Baby} value={data.children} label="Child records" />
          <Stat icon={UsersThree} value={data.caregivers} label="Caregivers" />
          <Stat icon={CalendarBlank} value={data.appointments} label="Scheduled visits" />
          <Stat icon={CreditCard} value={data.devices} label="Registered devices" />
        </section>

        <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,.75fr)]">
          <section className="mf-surface min-w-0">
            <div className="mf-surface-header">
              <div><h2 className="text-lg">Service health</h2><p className="mt-1 text-xs text-slate-500">Signals reflect the latest records returned by the backend.</p></div>
              <span className="mf-status bg-primary-50 text-primary-800"><CheckCircle size={15} />Live data</span>
            </div>
            <div>
              {signals.map((signal) => <SignalRow key={signal.area} {...signal} />)}
            </div>
          </section>

          <section className="mf-surface min-w-0">
            <div className="mf-surface-header"><div><h2 className="text-lg">Upcoming appointments</h2><p className="mt-1 text-xs text-slate-500">Next scheduled visits</p></div><Link to="/admin/clinical" className="text-xs font-bold text-primary-700">View all</Link></div>
            {appointments.length ? (
              <div>
                {appointments.map((item) => (
                  <article key={item.id} className="mf-row flex items-start gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-50 text-primary-700"><CalendarBlank size={18} /></span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{item.child.firstName} {item.child.lastName}</p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">{item.kind.replaceAll("_", " ")} · {item.facility?.name || "Facility pending"}</p>
                      <time className="mt-1 block text-xs font-bold text-primary-700">{new Date(item.scheduledFor).toLocaleString()}</time>
                    </div>
                  </article>
                ))}
              </div>
            ) : <p className="px-5 py-10 text-center text-sm text-slate-500">No scheduled appointments.</p>}
          </section>
        </div>
      </PageFeedback>
    </div>
  );
}

function Stat({ icon: IconComponent, value, label }: { icon: Icon; value: number; label: string }) {
  return <div className="mf-stat"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary-50 text-primary-700 dark:bg-primary-950"><IconComponent size={21} /></span><div className="min-w-0"><p className="text-xl font-extrabold tabular-nums text-slate-950 dark:text-white">{value}</p><p className="truncate text-xs font-semibold text-slate-500">{label}</p></div></div>;
}

function SignalRow({ area, detail, impact, status, icon: IconComponent, to }: { area: string; detail: string; impact: string; status: "monitor" | "attention" | "clear" | "neutral"; icon: Icon; to: string }) {
  const tone = { monitor: "bg-cyan-50 text-cyan-800", attention: "bg-amber-50 text-amber-900", clear: "bg-emerald-50 text-emerald-800", neutral: "bg-slate-100 text-slate-700" }[status];
  return <Link to={to} className="mf-row grid items-center gap-3 transition hover:bg-slate-50 sm:grid-cols-[42px_minmax(0,1fr)_110px_24px] dark:hover:bg-slate-800/60"><span className={`grid h-10 w-10 place-items-center rounded-lg ${tone}`}><IconComponent size={21} /></span><div className="min-w-0"><p className="font-bold text-slate-900 dark:text-white">{area}</p><p className="mt-0.5 text-sm text-slate-500">{detail}</p></div><span className={`mf-status w-fit ${tone}`}>{impact}</span><ArrowRight size={17} className="hidden text-slate-400 sm:block" /></Link>;
}
