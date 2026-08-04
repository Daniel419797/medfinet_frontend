import { useCallback, useContext, useEffect, useState } from "react";
import {
  Activity,
  CalendarClock,
  CloudSun,
  CreditCard,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { PageFeedback } from "../../components/common/PageFeedback";
import UserContext from "../../contexts/UserContext";
import { medfinetIdentityApi } from "../../services/medfinetIdentityApi";
import { medfinetOperationsApi } from "../../services/medfinetOperationsApi";

export default function HealthWorkerDashboard() {
  const { user, organizationId } = useContext(UserContext);
  const [counts, setCounts] = useState({
    children: 0,
    appointments: 0,
    worklists: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setError(null);
    try {
      const [children, appointments, worklists] = await Promise.all([
        medfinetIdentityApi.listChildren(organizationId, { limit: 100 }),
        medfinetOperationsApi.appointments(organizationId, "SCHEDULED"),
        medfinetOperationsApi.worklists(organizationId, "ACTIVE"),
      ]);
      setCounts({
        children: children.items.length,
        appointments: appointments.length,
        worklists: worklists.length,
      });
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to load worker operations",
      );
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <main className="space-y-7">
      <header>
        <p className="text-sm font-semibold text-cyan-700">
          Authorized care workspace
        </p>
        <h1 className="mt-1 text-3xl font-bold text-slate-950">
          Welcome{user?.name ? `, ${user.name}` : ""}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Choose a live operational workflow. Counts come from the selected
          organization.
        </p>
      </header>
      <PageFeedback loading={loading} error={error} onRetry={() => void load()}>
        <div className="grid gap-4 md:grid-cols-3">
          <Metric
            icon={Users}
            label="Accessible children"
            value={counts.children}
          />
          <Metric
            icon={CalendarClock}
            label="Scheduled appointments"
            value={counts.appointments}
          />
          <Metric
            icon={CloudSun}
            label="Active response worklists"
            value={counts.worklists}
          />
        </div>
        <div className="mt-7 grid gap-5 lg:grid-cols-3">
          <Workflow
            icon={Activity}
            title="Clinical records"
            text="Search children, record care, manage alerts and review vaccine schedules."
            to="/health-worker/clinical"
          />
          <Workflow
            icon={CreditCard}
            title="NFC scan and cards"
            text="Scan protected Medfinet cards and enter purpose-bound child workflows."
            to="/health-worker/nfc"
          />
          <Workflow
            icon={CloudSun}
            title="Climate response"
            text="Open authorized worklists and record deliveries or referrals."
            to="/health-worker/climate"
          />
        </div>
      </PageFeedback>
    </main>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: number;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <Icon className="h-6 w-6 text-cyan-700" />
      <p className="mt-4 text-sm text-slate-600">{label}</p>
      <p className="mt-1 text-3xl font-bold text-slate-950">{value}</p>
    </article>
  );
}

function Workflow({
  icon: Icon,
  title,
  text,
  to,
}: {
  icon: typeof Users;
  title: string;
  text: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300"
    >
      <Icon className="h-7 w-7 text-cyan-700" />
      <h2 className="mt-5 text-lg font-bold text-slate-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
      <span className="mt-5 inline-block text-sm font-semibold text-cyan-700">
        Open workflow
      </span>
    </Link>
  );
}
