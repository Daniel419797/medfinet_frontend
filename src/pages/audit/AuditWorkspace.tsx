import { useCallback, useContext, useEffect, useState } from "react";
import {
  Activity,
  BarChart3,
  FileClock,
  LogOut,
  RefreshCw,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import UserContext from "../../contexts/UserContext";
import { OrganizationSwitcher } from "../../components/common/OrganizationSwitcher";
import { PageFeedback } from "../../components/common/PageFeedback";
import {
  medfinetAnalyticsApi,
  type LatestAnalytics,
} from "../../services/medfinetAnalyticsApi";
import { medfinetGovernanceApi } from "../../services/medfinetGovernanceApi";
import {
  medfinetIntegrationsApi,
  type IntegrationConnection,
  type IntegrationJob,
  type IntegrationReconciliation,
} from "../../services/medfinetIntegrationsApi";

type AuditEvent = Awaited<
  ReturnType<typeof medfinetGovernanceApi.listAuditEvents>
>[number];
type RetentionPolicy = Awaited<
  ReturnType<typeof medfinetGovernanceApi.listRetentionPolicies>
>[number];
type LegalHold = Awaited<
  ReturnType<typeof medfinetGovernanceApi.listLegalHolds>
>[number];

export default function AuditWorkspace() {
  const { organizationId, logout } = useContext(UserContext);
  const [tab, setTab] = useState<
    "audit" | "analytics" | "integrations" | "governance"
  >("audit");
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [analytics, setAnalytics] = useState<LatestAnalytics | null>(null);
  const [connections, setConnections] = useState<IntegrationConnection[]>([]);
  const [jobs, setJobs] = useState<IntegrationJob[]>([]);
  const [reconciliations, setReconciliations] = useState<
    IntegrationReconciliation[]
  >([]);
  const [policies, setPolicies] = useState<RetentionPolicy[]>([]);
  const [holds, setHolds] = useState<LegalHold[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setError("");
    try {
      const [
        auditRows,
        latest,
        connectionPage,
        jobPage,
        reconciliationPage,
        policyRows,
        holdRows,
      ] = await Promise.all([
        medfinetGovernanceApi.listAuditEvents(organizationId, { limit: 100 }),
        medfinetAnalyticsApi.getLatest(organizationId),
        medfinetIntegrationsApi.listConnections(organizationId),
        medfinetIntegrationsApi.listJobs(organizationId),
        medfinetIntegrationsApi.listReconciliations(organizationId),
        medfinetGovernanceApi.listRetentionPolicies(organizationId),
        medfinetGovernanceApi.listLegalHolds(organizationId),
      ]);
      setEvents(auditRows);
      setAnalytics(latest);
      setConnections(connectionPage.items);
      setJobs(jobPage.items);
      setReconciliations(reconciliationPage.items);
      setPolicies(policyRows);
      setHolds(holdRows);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to load audit evidence",
      );
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    void load();
  }, [load]);
  const tabs = [
    ["audit", "Audit trail"],
    ["analytics", "Analytics"],
    ["integrations", "Integrations"],
    ["governance", "Governance"],
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-cyan-700" />
            <div>
              <p className="font-bold">Medfinet Assurance</p>
              <p className="text-xs text-slate-500">
                Independent read-only oversight
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <OrganizationSwitcher />
            <Link
              to="/account"
              className="rounded-lg border px-3 py-2 text-sm font-semibold"
            >
              <UserRound className="mr-2 inline h-4 w-4" />
              Account
            </Link>
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-lg border px-3 py-2 text-sm font-semibold"
            >
              <LogOut className="mr-2 inline h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-cyan-700">
              Auditor workspace
            </p>
            <h1 className="text-3xl font-bold">
              Evidence and control monitoring
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              This role can inspect evidence but cannot change operational or
              governance state.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-lg border bg-white px-3 py-2 text-sm font-semibold"
          >
            <RefreshCw className="mr-2 inline h-4 w-4" />
            Refresh evidence
          </button>
        </div>
        <nav
          aria-label="Audit sections"
          className="flex gap-2 overflow-x-auto border-b"
        >
          {tabs.map(([id, label]) => (
            <button
              type="button"
              key={id}
              onClick={() => setTab(id)}
              aria-current={tab === id ? "page" : undefined}
              className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-semibold ${tab === id ? "border-cyan-700 text-cyan-800" : "border-transparent text-slate-600"}`}
            >
              {label}
            </button>
          ))}
        </nav>
        <PageFeedback
          loading={loading}
          error={error}
          empty={false}
          onRetry={() => void load()}
        >
          {tab === "audit" && (
            <section className="rounded-2xl border bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold">Latest audit events</h2>
              <div className="mt-4 divide-y">
                {events.map((event) => (
                  <article
                    key={event.id}
                    className="grid gap-2 py-4 md:grid-cols-[1fr_1fr_auto]"
                  >
                    <div>
                      <p className="font-semibold">{event.action}</p>
                      <p className="text-sm text-slate-600">
                        {event.entityType} · {event.entityId}
                      </p>
                    </div>
                    <div>
                      <p className="break-all text-sm">
                        {event.actorSubjectId}
                      </p>
                      <p className="text-xs text-slate-500">
                        Purpose: {event.purpose}
                      </p>
                    </div>
                    <time className="text-sm text-slate-500">
                      {new Date(event.createdAt).toLocaleString()}
                    </time>
                  </article>
                ))}
                {!events.length && (
                  <p className="py-8 text-sm text-slate-500">
                    No audit events were returned.
                  </p>
                )}
              </div>
            </section>
          )}
          {tab === "analytics" && (
            <div className="space-y-5">
              <section className="grid gap-4 sm:grid-cols-3">
                <article className="rounded-2xl border bg-white p-5">
                  <BarChart3 className="h-6 w-6 text-cyan-700" />
                  <p className="mt-3 text-sm text-slate-500">Latest run</p>
                  <p className="font-bold">
                    {analytics?.run?.status || "No completed run"}
                  </p>
                </article>
                <article className="rounded-2xl border bg-white p-5">
                  <p className="text-sm text-slate-500">Reporting period</p>
                  <p className="mt-3 font-bold">
                    {analytics?.run
                      ? `${new Date(analytics.run.periodStart).toLocaleDateString()} – ${new Date(analytics.run.periodEnd).toLocaleDateString()}`
                      : "Unavailable"}
                  </p>
                </article>
                <article className="rounded-2xl border bg-white p-5">
                  <p className="text-sm text-slate-500">Metrics</p>
                  <p className="mt-3 text-3xl font-bold">
                    {analytics?.metrics.length || 0}
                  </p>
                </article>
              </section>
              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {analytics?.metrics.map((metric) => (
                  <article
                    key={metric.key}
                    className="rounded-2xl border bg-white p-5"
                  >
                    <p className="text-xs font-bold uppercase text-slate-500">
                      {metric.key.replaceAll("_", " ")}
                    </p>
                    <p className="mt-2 text-2xl font-bold">
                      {metric.valueBasisPoints == null
                        ? metric.numerator.toLocaleString()
                        : `${(metric.valueBasisPoints / 100).toFixed(1)}%`}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      Cohort {metric.cohortSize.toLocaleString()} ·{" "}
                      {metric.disclosureStatus}
                    </p>
                  </article>
                ))}
              </section>
            </div>
          )}
          {tab === "integrations" && (
            <div className="grid gap-5 lg:grid-cols-3">
              <EvidenceList
                title="Connections"
                icon={<Activity className="h-5 w-5" />}
                rows={connections.map((item) => ({
                  id: item.id,
                  title: item.name,
                  detail: `${item.type} · ${item.status} · ${item.lastHealthStatus || "UNCHECKED"}`,
                }))}
              />
              <EvidenceList
                title="Jobs"
                icon={<FileClock className="h-5 w-5" />}
                rows={jobs.map((item) => ({
                  id: item.id,
                  title: `${item.direction} ${item.resourceType}`,
                  detail: `${item.status} · ${item.recordsSucceeded}/${item.recordsDiscovered} succeeded`,
                }))}
              />
              <EvidenceList
                title="Reconciliations"
                icon={<RefreshCw className="h-5 w-5" />}
                rows={reconciliations.map((item) => ({
                  id: item.id,
                  title: item.connection.name,
                  detail: `${item.status} · ${item.mismatchCount} mismatches`,
                }))}
              />
            </div>
          )}
          {tab === "governance" && (
            <div className="grid gap-5 lg:grid-cols-2">
              <EvidenceList
                title="Retention policies"
                icon={<FileClock className="h-5 w-5" />}
                rows={policies.map((item) => ({
                  id: item.id,
                  title: item.recordCategory.replaceAll("_", " "),
                  detail: `${item.retentionDays} days · ${item.disposition} · ${item.status}`,
                }))}
              />
              <EvidenceList
                title="Legal holds"
                icon={<ShieldCheck className="h-5 w-5" />}
                rows={holds.map((item) => ({
                  id: item.id,
                  title: `${item.targetType} · ${item.targetReference}`,
                  detail: `${item.status} · ${item.legalAuthority}`,
                }))}
              />
            </div>
          )}
        </PageFeedback>
      </main>
    </div>
  );
}

function EvidenceList({
  title,
  icon,
  rows,
}: {
  title: string;
  icon: React.ReactNode;
  rows: Array<{ id: string; title: string; detail: string }>;
}) {
  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-cyan-700">
        {icon}
        <h2 className="font-bold text-slate-950">{title}</h2>
      </div>
      <div className="mt-4 divide-y">
        {rows.map((row) => (
          <article key={row.id} className="py-3">
            <p className="font-semibold">{row.title}</p>
            <p className="mt-1 text-sm text-slate-600">{row.detail}</p>
          </article>
        ))}
        {!rows.length && (
          <p className="py-5 text-sm text-slate-500">No records returned.</p>
        )}
      </div>
    </section>
  );
}
