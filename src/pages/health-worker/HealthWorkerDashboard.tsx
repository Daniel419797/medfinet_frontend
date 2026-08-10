import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarClock,
  CloudSun,
  CreditCard,
  RefreshCw,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { PageFeedback } from "../../components/common/PageFeedback";
import UserContext from "../../contexts/UserContext";
import { medfinetIdentityApi } from "../../services/medfinetIdentityApi";
import { medfinetOperationsApi } from "../../services/medfinetOperationsApi";

export default function HealthWorkerDashboard() {
  const { user, organizationId, currentMembership } = useContext(UserContext);
  const role = currentMembership?.role;
  const [counts, setCounts] = useState({ children: 0, appointments: 0, worklists: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setError(null);
    try {
      const children = await medfinetIdentityApi.listChildren(organizationId, { limit: 100 });
      if (role === "EMERGENCY_COORDINATOR") {
        const worklists = await medfinetOperationsApi.worklists(organizationId, "ACTIVE");
        setCounts({ children: children.items.length, appointments: 0, worklists: worklists.length });
      } else if (role === "HEALTH_WORKER") {
        const appointments = await medfinetOperationsApi.appointments(organizationId, "SCHEDULED");
        setCounts({ children: children.items.length, appointments: appointments.length, worklists: 0 });
      } else {
        setCounts({ children: children.items.length, appointments: 0, worklists: 0 });
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load worker operations");
    } finally {
      setLoading(false);
    }
  }, [organizationId, role]);

  useEffect(() => {
    void load();
  }, [load]);

  const workspace = useMemo(() => {
    if (role === "NUTRITION_WORKER") {
      return {
        eyebrow: "Authorized nutrition workspace",
        description: "Review only the child identity, growth and nutrition information needed for nutrition care.",
        metrics: [
          { icon: Users, label: "Accessible children", value: counts.children },
        ],
        workflows: [
          {
            icon: Activity,
            title: "Growth & nutrition",
            text: "Review growth history and record weight, height, MUAC, Vitamin A and oedema findings.",
            to: "/health-worker/clinical",
          },
          {
            icon: RefreshCw,
            title: "Offline sync",
            text: "Prepare and synchronize authorized field work when connectivity is limited.",
            to: "/health-worker/offline",
          },
        ],
      };
    }

    if (role === "EMERGENCY_COORDINATOR") {
      return {
        eyebrow: "Authorized emergency response workspace",
        description: "Coordinate response worklists and purpose-bound emergency access without opening routine clinical workflows.",
        metrics: [
          { icon: Users, label: "Accessible children", value: counts.children },
          { icon: CloudSun, label: "Active response worklists", value: counts.worklists },
        ],
        workflows: [
          {
            icon: CloudSun,
            title: "Climate response",
            text: "Open authorized response worklists and coordinate deliveries, referrals and follow-up.",
            to: "/health-worker/climate",
          },
          {
            icon: CreditCard,
            title: "NFC emergency scan",
            text: "Use NFC to enter the emergency workflow and activate time-limited emergency access when justified.",
            to: "/health-worker/nfc",
          },
          {
            icon: RefreshCw,
            title: "Offline sync",
            text: "Synchronize authorized emergency field operations after connectivity returns.",
            to: "/health-worker/offline",
          },
        ],
      };
    }

    return {
      eyebrow: "Authorized care workspace",
      description: "Deliver routine clinical care using the records, vaccination and NFC workflows assigned to health workers.",
      metrics: [
        { icon: Users, label: "Accessible children", value: counts.children },
        { icon: CalendarClock, label: "Scheduled appointments", value: counts.appointments },
      ],
      workflows: [
        {
          icon: Activity,
          title: "Clinical records",
          text: "Search children, record care, manage alerts and review vaccine schedules.",
          to: "/health-worker/clinical",
        },
        {
          icon: CreditCard,
          title: "NFC scan and cards",
          text: "Scan protected Medfinet cards and enter purpose-bound clinical or vaccination workflows.",
          to: "/health-worker/nfc",
        },
        {
          icon: RefreshCw,
          title: "Offline sync",
          text: "Synchronize authorized care recorded while connectivity was limited.",
          to: "/health-worker/offline",
        },
      ],
    };
  }, [counts, role]);

  return (
    <main className="space-y-7">
      <header>
        <p className="text-sm font-semibold text-cyan-700">{workspace.eyebrow}</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-950">
          Welcome{user?.name ? `, ${user.name}` : ""}
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">{workspace.description}</p>
      </header>
      <PageFeedback loading={loading} error={error} onRetry={() => void load()}>
        <div className="grid gap-4 md:grid-cols-3">
          {workspace.metrics.map((metric) => (
            <Metric key={metric.label} {...metric} />
          ))}
        </div>
        <div className="mt-7 grid gap-5 lg:grid-cols-3">
          {workspace.workflows.map((workflow) => (
            <Workflow key={workflow.to} {...workflow} />
          ))}
        </div>
      </PageFeedback>
    </main>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <Icon className="h-6 w-6 text-cyan-700" />
      <p className="mt-4 text-sm text-slate-600">{label}</p>
      <p className="mt-1 text-3xl font-bold text-slate-950">{value}</p>
    </article>
  );
}

function Workflow({ icon: Icon, title, text, to }: { icon: typeof Users; title: string; text: string; to: string }) {
  return (
    <Link
      to={to}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300"
    >
      <Icon className="h-7 w-7 text-cyan-700" />
      <h2 className="mt-5 text-lg font-bold text-slate-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
      <span className="mt-5 inline-block text-sm font-semibold text-cyan-700">Open workflow</span>
    </Link>
  );
}
