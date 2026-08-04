import {
  type FormEvent,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  CloudUpload,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  WifiOff,
} from "lucide-react";
import { Modal } from "../../components/common/Modal";
import { PageFeedback } from "../../components/common/PageFeedback";
import UserContext from "../../contexts/UserContext";
import {
  medfinetOfflineApi,
  type SyncBatch,
  type SyncOperationInput,
  type SyncOperationType,
} from "../../services/medfinetOfflineApi";
import { medfinetOperationsApi } from "../../services/medfinetOperationsApi";
import {
  readOfflineQueue,
  writeOfflineQueue,
} from "../../services/offlineQueueStore";

const types: SyncOperationType[] = [
  "APPOINTMENT.SCHEDULE",
  "CLIMATE.PROFILE_UPSERT",
  "CLINICAL.GROWTH_RECORD",
  "CLINICAL.IMMUNIZATION_RECORD",
  "RESPONSE.DELIVERY_RECORD",
  "RESPONSE.REFERRAL_CREATE",
];
const templates: Record<SyncOperationType, Record<string, unknown>> = {
  "APPOINTMENT.SCHEDULE": {
    childId: "",
    kind: "VACCINATION",
    scheduledFor: new Date(Date.now() + 86400000).toISOString(),
    notes: "",
  },
  "CLIMATE.PROFILE_UPSERT": {
    childId: "",
    administrativeAreaCode: "",
    vulnerability: "MEDIUM",
    displaced: false,
    assessedAt: new Date().toISOString(),
  },
  "CLINICAL.GROWTH_RECORD": {
    childId: "",
    measuredAt: new Date().toISOString(),
    weightGrams: 0,
    heightMillimeters: 0,
  },
  "CLINICAL.IMMUNIZATION_RECORD": {
    childId: "",
    vaccineCode: "",
    doseNumber: 1,
    administeredAt: new Date().toISOString(),
    route: "IM",
  },
  "RESPONSE.DELIVERY_RECORD": {
    entryId: "",
    category: "",
    quantity: 1,
    unit: "item",
    deliveredAt: new Date().toISOString(),
  },
  "RESPONSE.REFERRAL_CREATE": {
    entryId: "",
    referralType: "",
    destination: "",
    priority: "MEDIUM",
    reason: "",
  },
};
const input =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm";
const button =
  "rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold disabled:opacity-50";
const primary =
  "rounded-lg bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50";

export default function OfflineSync() {
  const { organizationId, user } = useContext(UserContext);
  const [devices, setDevices] = useState<Array<Record<string, unknown>>>([]);
  const [deviceId, setDeviceId] = useState("");
  const [queue, setQueue] = useState<SyncOperationInput[]>([]);
  const [batches, setBatches] = useState<SyncBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [operationType, setOperationType] = useState<SyncOperationType>(
    "CLINICAL.IMMUNIZATION_RECORD",
  );
  const [payload, setPayload] = useState(
    JSON.stringify(templates["CLINICAL.IMMUNIZATION_RECORD"], null, 2),
  );
  const [entityId, setEntityId] = useState("");
  const [baseVersion, setBaseVersion] = useState("");

  const load = useCallback(async () => {
    if (!organizationId || !user) return;
    setLoading(true);
    setError(null);
    try {
      const [deviceRows, page, saved] = await Promise.all([
        medfinetOperationsApi.devices(organizationId, "ACTIVE"),
        medfinetOfflineApi.listBatches(organizationId),
        readOfflineQueue(organizationId, user.id),
      ]);
      setDevices(deviceRows);
      setDeviceId((current) => current || String(deviceRows[0]?.id || ""));
      setBatches(page.items);
      setQueue(saved);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to load offline synchronization",
      );
    } finally {
      setLoading(false);
    }
  }, [organizationId, user]);
  useEffect(() => {
    void load();
  }, [load]);
  async function persist(next: SyncOperationInput[]) {
    if (!organizationId || !user) return;
    setQueue(next);
    await writeOfflineQueue(organizationId, user.id, next);
  }
  async function add(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      const parsed = JSON.parse(payload) as unknown;
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
        throw new Error("Payload must be a JSON object.");
      const operation: SyncOperationInput = {
        clientOperationId: crypto.randomUUID(),
        operationType,
        payload: parsed as Record<string, unknown>,
        ...(entityId.trim() && { entityId: entityId.trim() }),
        ...(baseVersion && { baseVersion: Number(baseVersion) }),
      };
      await persist([...queue, operation]);
      setOpen(false);
      setNotice(
        "Operation encrypted and stored on this trusted browser until sync.",
      );
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to add operation",
      );
    }
  }
  async function submit() {
    if (!organizationId || !deviceId || !queue.length) return;
    setBusy(true);
    setError(null);
    try {
      const result = await medfinetOfflineApi.submitBatch(
        organizationId,
        deviceId,
        {
          clientBatchId: crypto.randomUUID(),
          operations: queue.map((operation) => ({
            ...operation,
            payload: {
              ...operation.payload,
              sourceOperationId: operation.clientOperationId,
            },
          })),
        },
      );
      await persist([]);
      setBatches((current) => [
        result.batch,
        ...current.filter((item) => item.id !== result.batch.id),
      ]);
      setNotice(
        result.idempotentReplay
          ? "The existing batch was returned safely."
          : "Encrypted offline operations were accepted for processing.",
      );
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to submit offline batch",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="space-y-6">
      <header className="flex flex-col justify-between gap-4 lg:flex-row">
        <div>
          <p className="text-sm font-semibold text-cyan-700">
            Intermittent-connectivity operations
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950">
            Offline sync
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Queue bounded operations on a trusted device, then submit
            idempotently when connectivity returns.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className={button} onClick={() => void load()}>
            <RefreshCw className="mr-2 inline h-4 w-4" />
            Refresh
          </button>
          <button className={primary} onClick={() => setOpen(true)}>
            <Plus className="mr-2 inline h-4 w-4" />
            Queue operation
          </button>
        </div>
      </header>
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <ShieldCheck className="mr-2 inline h-5 w-5" />
        Pending payloads are encrypted at rest with a non-exportable browser
        key. Use only an organization-approved device and clear queued work
        before device reassignment.
      </div>
      {notice && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900"
        >
          {notice}
        </div>
      )}
      <PageFeedback loading={loading} error={error} onRetry={() => void load()}>
        <section className="rounded-2xl border bg-white p-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <label className="text-sm font-semibold">
              Registered active device
              <select
                className={input}
                value={deviceId}
                onChange={(event) => setDeviceId(event.target.value)}
              >
                <option value="">Select this device</option>
                {devices.map((device) => (
                  <option key={String(device.id)} value={String(device.id)}>
                    {String(
                      device.displayName ||
                        device.deviceIdentifier ||
                        device.id,
                    )}
                  </option>
                ))}
              </select>
            </label>
            <button
              className={primary}
              disabled={busy || !queue.length || !deviceId || !navigator.onLine}
              onClick={() => void submit()}
            >
              <CloudUpload className="mr-2 inline h-4 w-4" />
              {busy
                ? "Submitting…"
                : `Sync ${queue.length} operation${queue.length === 1 ? "" : "s"}`}
            </button>
          </div>
          {!navigator.onLine && (
            <p className="mt-3 text-sm text-amber-700">
              <WifiOff className="mr-2 inline h-4 w-4" />
              Offline. Queued work remains encrypted locally.
            </p>
          )}
          <div className="mt-5 space-y-3">
            {queue.map((operation) => (
              <article
                key={operation.clientOperationId}
                className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-4"
              >
                <div>
                  <p className="font-semibold">
                    {operation.operationType.replaceAll(".", " ")}
                  </p>
                  <p className="text-xs text-slate-500">
                    {operation.clientOperationId}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Remove queued operation"
                  className="rounded-lg p-2 text-rose-700 hover:bg-rose-50"
                  onClick={() =>
                    void persist(
                      queue.filter(
                        (item) =>
                          item.clientOperationId !==
                          operation.clientOperationId,
                      ),
                    )
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </article>
            ))}
            {!queue.length && (
              <p className="rounded-xl border border-dashed p-6 text-center text-sm text-slate-500">
                No operations are waiting on this device.
              </p>
            )}
          </div>
        </section>
        <section className="mt-6">
          <h2 className="text-lg font-bold">Server sync batches</h2>
          <div className="mt-3 space-y-3">
            {batches.map((batch) => (
              <article
                key={batch.id}
                className="rounded-xl border bg-white p-4"
              >
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      {batch.status} · {batch.operationCount} operation(s)
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(batch.createdAt).toLocaleString()} · {batch.id}
                    </p>
                  </div>
                  <button
                    className={button}
                    onClick={() =>
                      organizationId &&
                      void medfinetOfflineApi
                        .getBatch(organizationId, batch.id)
                        .then((fresh) =>
                          setBatches((all) =>
                            all.map((item) =>
                              item.id === fresh.id ? fresh : item,
                            ),
                          ),
                        )
                        .catch((reason) =>
                          setError(
                            reason instanceof Error
                              ? reason.message
                              : "Unable to refresh batch",
                          ),
                        )
                    }
                  >
                    Refresh status
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {batch.operations.map((operation) => (
                    <span
                      key={operation.id}
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${["APPLIED"].includes(operation.status) ? "bg-emerald-50 text-emerald-700" : ["REJECTED", "CONFLICT"].includes(operation.status) ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-slate-700"}`}
                    >
                      {operation.operationType}: {operation.status}
                      {operation.errorCode ? ` (${operation.errorCode})` : ""}
                    </span>
                  ))}
                </div>
              </article>
            ))}
            {!batches.length && (
              <p className="rounded-xl border border-dashed p-6 text-center text-sm text-slate-500">
                No submitted batches for this worker.
              </p>
            )}
          </div>
        </section>
      </PageFeedback>
      <Modal
        open={open}
        title="Queue offline operation"
        description="Use the generated schema template. Required record identifiers must come from an authorized online workflow."
        onClose={() => setOpen(false)}
      >
        <form className="space-y-4" onSubmit={(event) => void add(event)}>
          <label className="block text-sm font-semibold">
            Operation type
            <select
              className={input}
              value={operationType}
              onChange={(event) => {
                const next = event.target.value as SyncOperationType;
                setOperationType(next);
                setPayload(JSON.stringify(templates[next], null, 2));
              }}
            >
              {types.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold">
            Operation payload
            <textarea
              required
              rows={12}
              spellCheck={false}
              className={`${input} font-mono`}
              value={payload}
              onChange={(event) => setPayload(event.target.value)}
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              Existing entity ID (optional)
              <input
                className={input}
                value={entityId}
                onChange={(event) => setEntityId(event.target.value)}
              />
            </label>
            <label className="text-sm font-semibold">
              Base version (optional)
              <input
                type="number"
                min="0"
                className={input}
                value={baseVersion}
                onChange={(event) => setBaseVersion(event.target.value)}
              />
            </label>
          </div>
          <button className={primary}>Encrypt and queue</button>
        </form>
      </Modal>
    </main>
  );
}
