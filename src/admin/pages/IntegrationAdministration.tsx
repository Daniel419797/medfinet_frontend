import {
  FormEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  CheckCircle2,
  DatabaseZap,
  Plus,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import UserContext from "../../contexts/UserContext";
import { Modal } from "../../components/common/Modal";
import { ActionReasonModal } from "../../components/common/ActionReasonModal";
import { PageFeedback } from "../../components/common/PageFeedback";
import {
  IntegrationConnection,
  IntegrationImport,
  IntegrationJob,
  IntegrationMapping,
  IntegrationReconciliation,
  medfinetIntegrationsApi,
} from "../../services/medfinetIntegrationsApi";

type Tab = "connections" | "mappings" | "imports" | "jobs" | "reconciliations";
const categories = [
  "IDENTITY",
  "DEMOGRAPHICS",
  "IMMUNIZATION",
  "NUTRITION",
  "APPOINTMENTS",
  "SERVICE_DELIVERY",
];
const button =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 disabled:cursor-not-allowed disabled:opacity-50";
const primary =
  "rounded-lg bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50";
const input =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm";

export default function IntegrationAdministration() {
  const { organizationId } = useContext(UserContext);
  const [tab, setTab] = useState<Tab>("connections");
  const [connections, setConnections] = useState<IntegrationConnection[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [mappings, setMappings] = useState<IntegrationMapping[]>([]);
  const [imports, setImports] = useState<IntegrationImport[]>([]);
  const [jobs, setJobs] = useState<IntegrationJob[]>([]);
  const [reconciliations, setReconciliations] = useState<
    IntegrationReconciliation[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [connectionOpen, setConnectionOpen] = useState(false);
  const [mappingOpen, setMappingOpen] = useState(false);
  const [jobOpen, setJobOpen] = useState(false);
  const [action, setAction] = useState<
    | { type: "connection"; id: string }
    | { type: "import"; id: string }
    | { type: "job"; id: string }
    | null
  >(null);
  const [revealed, setRevealed] = useState<{
    id: string;
    resourceType: string;
    payload: unknown;
    payloadHash: string;
  } | null>(null);
  const [connectionForm, setConnectionForm] = useState<{
    name: string;
    partnerIdentifier: string;
    type: IntegrationConnection["type"];
    baseUrl: string;
    authType: IntegrationConnection["authType"];
    credentialSecretName: string;
    dhis2ApiVersion: string;
    timeoutMs: number;
    allowedDataCategories: string[];
  }>({
    name: "",
    partnerIdentifier: "",
    type: "FHIR_R4",
    baseUrl: "https://",
    authType: "BEARER_TOKEN",
    credentialSecretName: "",
    dhis2ApiVersion: "41",
    timeoutMs: 10000,
    allowedDataCategories: ["IDENTITY", "DEMOGRAPHICS"],
  });
  const [mappingForm, setMappingForm] = useState({
    resourceType: "Patient",
    direction: "EXPORT" as "IMPORT" | "EXPORT",
    version: 1,
    definition: '{\n  "identifierSystem": "https://example.org/medfinet-id"\n}',
  });
  const [jobForm, setJobForm] = useState({
    mappingId: "",
    childIds: "",
    since: "",
  });
  const selected = connections.find((item) => item.id === selectedId) || null;

  const load = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setError(null);
    try {
      const [connectionPage, importPage, jobPage, reconciliationPage] =
        await Promise.all([
          medfinetIntegrationsApi.listConnections(organizationId),
          medfinetIntegrationsApi.listImports(organizationId),
          medfinetIntegrationsApi.listJobs(organizationId),
          medfinetIntegrationsApi.listReconciliations(organizationId),
        ]);
      setConnections(connectionPage.items);
      setImports(importPage.items);
      setJobs(jobPage.items);
      setReconciliations(reconciliationPage.items);
      const id = selectedId || connectionPage.items[0]?.id || "";
      setSelectedId(id);
      setMappings(
        id
          ? (await medfinetIntegrationsApi.listMappings(organizationId, id))
              .items
          : [],
      );
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to load integration operations",
      );
    } finally {
      setLoading(false);
    }
  }, [organizationId, selectedId]);

  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    if (!organizationId || !selectedId) {
      setMappings([]);
      return;
    }
    void medfinetIntegrationsApi
      .listMappings(organizationId, selectedId)
      .then((page) => setMappings(page.items))
      .catch((reason) =>
        setError(
          reason instanceof Error ? reason.message : "Unable to load mappings",
        ),
      );
  }, [organizationId, selectedId]);

  const run = async (operation: () => Promise<unknown>, success: string) => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await operation();
      setNotice(success);
      await load();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Integration operation failed",
      );
    } finally {
      setBusy(false);
    }
  };

  const createConnection = async (event: FormEvent) => {
    event.preventDefault();
    if (!organizationId) return;
    await run(
      () =>
        medfinetIntegrationsApi.createConnection(organizationId, {
          ...connectionForm,
          fhirVersion: connectionForm.type === "FHIR_R4" ? "4.0.1" : undefined,
          dhis2ApiVersion:
            connectionForm.type === "DHIS2"
              ? connectionForm.dhis2ApiVersion
              : undefined,
        }),
      "Connection created in draft. Run a health check before activation.",
    );
    setConnectionOpen(false);
  };

  const createMapping = async (event: FormEvent) => {
    event.preventDefault();
    if (!organizationId || !selected) return;
    let definition: Record<string, unknown>;
    try {
      definition = JSON.parse(mappingForm.definition) as Record<
        string,
        unknown
      >;
    } catch {
      setError("Mapping definition must be valid JSON.");
      return;
    }
    await run(
      () =>
        medfinetIntegrationsApi.createMapping(organizationId, selected.id, {
          resourceType: mappingForm.resourceType,
          direction: mappingForm.direction,
          version: mappingForm.version,
          mappingDefinition: definition,
        }),
      "Versioned mapping created in draft.",
    );
    setMappingOpen(false);
  };

  const startJob = async (event: FormEvent) => {
    event.preventDefault();
    if (!organizationId || !selected) return;
    const mapping = mappings.find((item) => item.id === jobForm.mappingId);
    if (!mapping) {
      setError("Select an active mapping.");
      return;
    }
    const criteria =
      mapping.direction === "EXPORT"
        ? { childIds: jobForm.childIds.split(/[\s,]+/).filter(Boolean) }
        : jobForm.since
          ? { since: new Date(jobForm.since).toISOString() }
          : {};
    setBusy(true);
    setError(null);
    try {
      const result = await medfinetIntegrationsApi.startJob(
        organizationId,
        selected.id,
        {
          mappingId: mapping.id,
          direction: mapping.direction,
          criteria,
          idempotencyKey: crypto.randomUUID(),
        },
      );
      setJobs((current) => [
        result.job,
        ...current.filter((item) => item.id !== result.job.id),
      ]);
      setNotice(
        result.idempotentReplay
          ? "Existing job returned safely."
          : "Integration job queued.",
      );
      setJobOpen(false);
      setTab("jobs");
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to start integration job",
      );
    } finally {
      setBusy(false);
    }
  };

  const activeMappings = useMemo(
    () => mappings.filter((item) => item.status === "ACTIVE"),
    [mappings],
  );
  const empty =
    tab === "connections"
      ? !connections.length
      : tab === "mappings"
        ? !mappings.length
        : tab === "imports"
          ? !imports.length
          : tab === "jobs"
            ? !jobs.length
            : !reconciliations.length;

  return (
    <main className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-cyan-700">
            Controlled interoperability
          </p>
          <h1 className="text-3xl font-bold text-slate-950 dark:text-white">
            FHIR and DHIS2 integrations
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
            Managed-secret connections, allowlisted endpoints, versioned
            mappings, reviewed imports, bounded jobs and reconciliation
            evidence.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={button}
            onClick={() => void load()}
            disabled={loading || busy}
          >
            <RefreshCw className="mr-2 inline h-4 w-4" />
            Refresh
          </button>
          <button
            type="button"
            className={primary}
            onClick={() => setConnectionOpen(true)}
          >
            <Plus className="mr-2 inline h-4 w-4" />
            New connection
          </button>
        </div>
      </div>
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <ShieldCheck className="mr-2 inline h-5 w-5" />
        Activation, imports and jobs require a recent multi-factor session.
        Credentials are referenced by managed-secret name and are never entered
        or displayed here.
      </div>
      {notice && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900"
        >
          {notice}
        </div>
      )}
      <div className="flex gap-2 overflow-x-auto" role="tablist">
        {(
          [
            "connections",
            "mappings",
            "imports",
            "jobs",
            "reconciliations",
          ] as Tab[]
        ).map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={tab === item}
            onClick={() => setTab(item)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === item ? "bg-slate-950 text-white" : "border bg-white"}`}
          >
            {item}
          </button>
        ))}
      </div>
      {(tab === "mappings" || tab === "jobs") && (
        <div className="flex flex-col gap-3 rounded-xl border bg-white p-4 sm:flex-row sm:items-end sm:justify-between">
          <label className="text-sm font-semibold">
            Connection
            <select
              className={input}
              value={selectedId}
              onChange={(event) => setSelectedId(event.target.value)}
            >
              {connections.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} · {item.status}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className={primary}
            disabled={!selected || (tab === "jobs" && !activeMappings.length)}
            onClick={() =>
              tab === "mappings" ? setMappingOpen(true) : setJobOpen(true)
            }
          >
            <Plus className="mr-2 inline h-4 w-4" />
            {tab === "mappings" ? "New mapping" : "Start job"}
          </button>
        </div>
      )}
      <PageFeedback
        loading={loading}
        error={error}
        empty={empty}
        onRetry={() => void load()}
      >
        {tab === "connections" ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {connections.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-slate-950">{item.name}</h2>
                    <p className="text-sm text-slate-600">
                      {item.type} · {item.partnerIdentifier}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold">
                    {item.status}
                  </span>
                </div>
                <p className="mt-3 break-all text-sm text-slate-600">
                  {item.baseUrl}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Health: {item.lastHealthStatus || "NOT CHECKED"}
                  {item.lastHealthErrorCode
                    ? ` · ${item.lastHealthErrorCode}`
                    : ""}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    className={button}
                    disabled={busy}
                    onClick={() =>
                      organizationId &&
                      void run(
                        () =>
                          medfinetIntegrationsApi.checkHealth(
                            organizationId,
                            item.id,
                          ),
                        "Health check completed.",
                      )
                    }
                  >
                    Check health
                  </button>
                  {item.status !== "ACTIVE" && (
                    <button
                      className={primary}
                      disabled={busy || item.lastHealthStatus !== "HEALTHY"}
                      onClick={() =>
                        organizationId &&
                        void run(
                          () =>
                            medfinetIntegrationsApi.activateConnection(
                              organizationId,
                              item.id,
                            ),
                          "Connection activated.",
                        )
                      }
                    >
                      Activate
                    </button>
                  )}
                  {item.status === "ACTIVE" && (
                    <button
                      className={button}
                      disabled={busy}
                      onClick={() =>
                        setAction({ type: "connection", id: item.id })
                      }
                    >
                      Suspend
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : tab === "mappings" ? (
          <div className="space-y-3">
            {mappings.map((item) => (
              <article key={item.id} className="rounded-xl border bg-white p-4">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <p className="font-semibold">
                      {item.resourceType} · {item.direction} · v{item.version}
                    </p>
                    <p className="text-xs text-slate-500">{item.status}</p>
                  </div>
                  {item.status === "DRAFT" && (
                    <button
                      type="button"
                      className={primary}
                      disabled={busy}
                      onClick={() =>
                        organizationId &&
                        void run(
                          () =>
                            medfinetIntegrationsApi.activateMapping(
                              organizationId,
                              item.id,
                            ),
                          "Mapping activated; any previous active version was retired.",
                        )
                      }
                    >
                      Activate mapping
                    </button>
                  )}
                </div>
                <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-950 p-3 text-xs text-slate-100">
                  {JSON.stringify(item.mappingDefinition, null, 2)}
                </pre>
              </article>
            ))}
          </div>
        ) : tab === "imports" ? (
          <div className="space-y-3">
            {imports.map((item) => (
              <article key={item.id} className="rounded-xl border bg-white p-4">
                <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
                  <div>
                    <p className="font-semibold">
                      {item.externalResourceType} · {item.externalResourceId}
                    </p>
                    <p className="text-xs text-slate-500">
                      {item.status} · hash {item.payloadHash.slice(0, 16)}…
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      className={button}
                      disabled={busy}
                      onClick={() =>
                        organizationId &&
                        void medfinetIntegrationsApi
                          .revealImport(organizationId, item.id)
                          .then(setRevealed)
                          .catch((reason) =>
                            setError(
                              reason instanceof Error
                                ? reason.message
                                : "Unable to reveal import",
                            ),
                          )
                      }
                    >
                      Secure review
                    </button>
                    {item.status === "PENDING" && (
                      <>
                        <button
                          className={primary}
                          disabled={busy}
                          onClick={() =>
                            organizationId &&
                            void run(
                              () =>
                                medfinetIntegrationsApi.applyImport(
                                  organizationId,
                                  item.id,
                                ),
                              "Import applied after consent and maker-checker validation.",
                            )
                          }
                        >
                          Apply
                        </button>
                        <button
                          className={button}
                          disabled={busy}
                          onClick={() =>
                            setAction({ type: "import", id: item.id })
                          }
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : tab === "jobs" ? (
          <div className="space-y-3">
            {jobs.map((item) => (
              <article
                key={item.id}
                className="flex flex-col justify-between gap-3 rounded-xl border bg-white p-4 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="font-semibold">
                    {item.resourceType} · {item.status}
                  </p>
                  <p className="text-xs text-slate-500">{item.id}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    className={button}
                    onClick={() =>
                      organizationId &&
                      void medfinetIntegrationsApi
                        .getJob(organizationId, item.id)
                        .then((job) =>
                          setJobs((all) =>
                            all.map((value) =>
                              value.id === job.id
                                ? { ...value, status: job.status }
                                : value,
                            ),
                          ),
                        )
                        .catch((reason) =>
                          setError(
                            reason instanceof Error
                              ? reason.message
                              : "Unable to refresh job",
                          ),
                        )
                    }
                  >
                    Refresh status
                  </button>
                  {["QUEUED", "PROCESSING"].includes(item.status) && (
                    <button
                      className={button}
                      onClick={() => setAction({ type: "job", id: item.id })}
                    >
                      Cancel
                    </button>
                  )}
                  {["COMPLETED", "PARTIAL"].includes(item.status) && (
                    <button
                      className={primary}
                      onClick={() =>
                        organizationId &&
                        void run(
                          () =>
                            medfinetIntegrationsApi.startReconciliation(
                              organizationId,
                              item.connectionId,
                              item.id,
                            ),
                          "Reconciliation queued.",
                        ).then(() => setTab("reconciliations"))
                      }
                    >
                      Reconcile
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {reconciliations.map((item) => (
              <article key={item.id} className="rounded-xl border bg-white p-4">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <p className="font-semibold">
                      {item.connection.name} · {item.status}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Started {new Date(item.startedAt).toLocaleString()}
                      {item.job ? ` · ${item.job.resourceType} job` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    className={button}
                    onClick={() =>
                      organizationId &&
                      void medfinetIntegrationsApi
                        .getReconciliation(organizationId, item.id)
                        .then((record) =>
                          setReconciliations((rows) =>
                            rows.map((row) =>
                              row.id === record.id ? record : row,
                            ),
                          ),
                        )
                        .catch((reason) =>
                          setError(
                            reason instanceof Error
                              ? reason.message
                              : "Unable to refresh reconciliation",
                          ),
                        )
                    }
                  >
                    Refresh status
                  </button>
                </div>
                <dl className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
                  {[
                    ["Local", item.localCount],
                    ["External", item.externalCount],
                    ["Matched", item.matchedCount],
                    ["Missing local", item.missingLocalCount],
                    ["Missing external", item.missingExternalCount],
                    ["Mismatched", item.mismatchCount],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg bg-slate-50 p-3">
                      <dt className="text-xs font-semibold text-slate-500">
                        {label}
                      </dt>
                      <dd className="mt-1 text-xl font-bold">{value}</dd>
                    </div>
                  ))}
                </dl>
                {item.errorCode && (
                  <p className="mt-3 text-sm text-red-700">
                    Error code: {item.errorCode}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </PageFeedback>
      <Modal
        open={connectionOpen}
        onClose={() => setConnectionOpen(false)}
        title="Create managed integration connection"
      >
        <form
          className="space-y-4"
          onSubmit={(event) => void createConnection(event)}
        >
          <label className="block text-sm font-semibold">
            Connection name
            <input
              required
              className={input}
              value={connectionForm.name}
              onChange={(e) =>
                setConnectionForm({ ...connectionForm, name: e.target.value })
              }
            />
          </label>
          <label className="block text-sm font-semibold">
            Partner identifier
            <input
              required
              className={input}
              value={connectionForm.partnerIdentifier}
              onChange={(e) =>
                setConnectionForm({
                  ...connectionForm,
                  partnerIdentifier: e.target.value,
                })
              }
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              Standard
              <select
                className={input}
                value={connectionForm.type}
                onChange={(e) => {
                  const type = e.target.value as "FHIR_R4" | "DHIS2";
                  setConnectionForm({ ...connectionForm, type });
                  setMappingForm({
                    ...mappingForm,
                    resourceType:
                      type === "FHIR_R4" ? "Patient" : "TRACKED_ENTITY",
                  });
                }}
              >
                <option value="FHIR_R4">FHIR R4</option>
                <option value="DHIS2">DHIS2</option>
              </select>
            </label>
            <label className="text-sm font-semibold">
              Authentication
              <select
                className={input}
                value={connectionForm.authType}
                onChange={(e) =>
                  setConnectionForm({
                    ...connectionForm,
                    authType: e.target
                      .value as IntegrationConnection["authType"],
                  })
                }
              >
                <option value="BEARER_TOKEN">Bearer token</option>
                <option value="BASIC">Basic</option>
                <option value="OAUTH2_CLIENT_CREDENTIALS">
                  OAuth2 client credentials
                </option>
              </select>
            </label>
          </div>
          <label className="block text-sm font-semibold">
            HTTPS base URL
            <input
              required
              type="url"
              className={input}
              value={connectionForm.baseUrl}
              onChange={(e) =>
                setConnectionForm({
                  ...connectionForm,
                  baseUrl: e.target.value,
                })
              }
            />
          </label>
          <label className="block text-sm font-semibold">
            Managed-secret reference
            <input
              required
              pattern="[A-Z][A-Z0-9_]{2,99}"
              className={input}
              placeholder="PARTNER_FHIR_TOKEN"
              value={connectionForm.credentialSecretName}
              onChange={(e) =>
                setConnectionForm({
                  ...connectionForm,
                  credentialSecretName: e.target.value.toUpperCase(),
                })
              }
            />
          </label>
          {connectionForm.type === "DHIS2" && (
            <label className="block text-sm font-semibold">
              DHIS2 API version
              <input
                required
                className={input}
                value={connectionForm.dhis2ApiVersion}
                onChange={(e) =>
                  setConnectionForm({
                    ...connectionForm,
                    dhis2ApiVersion: e.target.value,
                  })
                }
              />
            </label>
          )}
          <fieldset>
            <legend className="text-sm font-semibold">
              Authorized data categories
            </legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {categories.map((category) => (
                <label
                  key={category}
                  className="flex items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={connectionForm.allowedDataCategories.includes(
                      category,
                    )}
                    onChange={(e) =>
                      setConnectionForm({
                        ...connectionForm,
                        allowedDataCategories: e.target.checked
                          ? [...connectionForm.allowedDataCategories, category]
                          : connectionForm.allowedDataCategories.filter(
                              (item) => item !== category,
                            ),
                      })
                    }
                  />
                  {category.replaceAll("_", " ")}
                </label>
              ))}
            </div>
          </fieldset>
          <button className={primary} disabled={busy}>
            Create draft connection
          </button>
        </form>
      </Modal>
      <Modal
        open={mappingOpen}
        onClose={() => setMappingOpen(false)}
        title={`Create mapping${selected ? ` for ${selected.name}` : ""}`}
      >
        <form
          className="space-y-4"
          onSubmit={(event) => void createMapping(event)}
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="text-sm font-semibold">
              Resource
              <select
                className={input}
                value={mappingForm.resourceType}
                onChange={(e) =>
                  setMappingForm({
                    ...mappingForm,
                    resourceType: e.target.value,
                  })
                }
              >
                {(selected?.type === "DHIS2"
                  ? ["TRACKED_ENTITY", "EVENT", "DATA_VALUE_SET"]
                  : ["Patient", "Immunization", "Observation", "Appointment"]
                ).map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold">
              Direction
              <select
                className={input}
                value={mappingForm.direction}
                onChange={(e) =>
                  setMappingForm({
                    ...mappingForm,
                    direction: e.target.value as "IMPORT" | "EXPORT",
                  })
                }
              >
                <option>EXPORT</option>
                <option>IMPORT</option>
              </select>
            </label>
            <label className="text-sm font-semibold">
              Version
              <input
                type="number"
                min="1"
                className={input}
                value={mappingForm.version}
                onChange={(e) =>
                  setMappingForm({
                    ...mappingForm,
                    version: Number(e.target.value),
                  })
                }
              />
            </label>
          </div>
          <label className="block text-sm font-semibold">
            Safe declarative mapping JSON
            <textarea
              required
              rows={10}
              className={`${input} font-mono`}
              value={mappingForm.definition}
              onChange={(e) =>
                setMappingForm({ ...mappingForm, definition: e.target.value })
              }
            />
          </label>
          <button className={primary} disabled={busy}>
            Create draft mapping
          </button>
        </form>
      </Modal>
      <Modal
        open={jobOpen}
        onClose={() => setJobOpen(false)}
        title="Start bounded integration job"
      >
        <form className="space-y-4" onSubmit={(event) => void startJob(event)}>
          <label className="block text-sm font-semibold">
            Active mapping
            <select
              required
              className={input}
              value={jobForm.mappingId}
              onChange={(e) =>
                setJobForm({ ...jobForm, mappingId: e.target.value })
              }
            >
              <option value="">Select mapping</option>
              {activeMappings.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.resourceType} · {item.direction} · v{item.version}
                </option>
              ))}
            </select>
          </label>
          {mappings.find((item) => item.id === jobForm.mappingId)?.direction ===
          "IMPORT" ? (
            <label className="block text-sm font-semibold">
              Import records since (optional)
              <input
                type="datetime-local"
                className={input}
                value={jobForm.since}
                onChange={(e) =>
                  setJobForm({ ...jobForm, since: e.target.value })
                }
              />
            </label>
          ) : (
            <label className="block text-sm font-semibold">
              Child IDs (comma or line separated)
              <textarea
                required
                rows={5}
                className={input}
                value={jobForm.childIds}
                onChange={(e) =>
                  setJobForm({ ...jobForm, childIds: e.target.value })
                }
              />
            </label>
          )}
          <button className={primary} disabled={busy}>
            <DatabaseZap className="mr-2 inline h-4 w-4" />
            Queue job
          </button>
        </form>
      </Modal>
      <Modal
        open={Boolean(revealed)}
        onClose={() => setRevealed(null)}
        title="Sensitive staged import review"
      >
        {revealed && (
          <div>
            <div className="mb-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
              <CheckCircle2 className="mr-2 inline h-4 w-4" />
              Hash: {revealed.payloadHash}
            </div>
            <pre className="max-h-[55vh] overflow-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-100">
              {JSON.stringify(revealed.payload, null, 2)}
            </pre>
          </div>
        )}
      </Modal>
      <ActionReasonModal
        open={Boolean(action)}
        title={
          action?.type === "connection"
            ? "Suspend integration connection"
            : action?.type === "import"
              ? "Reject staged import"
              : "Cancel integration job"
        }
        description="This decision is tenant scoped, requires a reason, and is audit recorded."
        confirmLabel={
          action?.type === "connection"
            ? "Suspend connection"
            : action?.type === "import"
              ? "Reject import"
              : "Cancel job"
        }
        destructive
        busy={busy}
        onClose={() => setAction(null)}
        onConfirm={async (reason) => {
          if (!organizationId || !action) return;
          if (action.type === "connection") {
            await run(
              () =>
                medfinetIntegrationsApi.suspendConnection(
                  organizationId,
                  action.id,
                  reason,
                ),
              "Connection suspended.",
            );
          } else if (action.type === "import") {
            await run(
              () =>
                medfinetIntegrationsApi.rejectImport(
                  organizationId,
                  action.id,
                  reason,
                ),
              "Import rejected.",
            );
          } else {
            await run(
              () =>
                medfinetIntegrationsApi.cancelJob(
                  organizationId,
                  action.id,
                  reason,
                ),
              "Job cancelled.",
            );
          }
          setAction(null);
        }}
      />
    </main>
  );
}
