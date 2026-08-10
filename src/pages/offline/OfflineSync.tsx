import {
  type FormEvent,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  ArrowLeft,
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
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";
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
import {
  OFFLINE_SYNC_COMPLETED_EVENT,
  preferredOfflineDevice,
  rememberOfflineDevice,
  syncOfflineQueue,
} from "../../services/offlineSyncService";

type Payload = Record<string, string | number | boolean>;

const types: SyncOperationType[] = [
  "APPOINTMENT.SCHEDULE",
  "CLIMATE.PROFILE_UPSERT",
  "CLINICAL.GROWTH_RECORD",
  "CLINICAL.IMMUNIZATION_RECORD",
  "RESPONSE.DELIVERY_RECORD",
  "RESPONSE.REFERRAL_CREATE",
];

function futureDateTime() {
  return new Date(Date.now() + 86_400_000).toISOString().slice(0, 16);
}

function currentDateTime() {
  return new Date().toISOString().slice(0, 16);
}

const templates: Record<SyncOperationType, Payload> = {
  "APPOINTMENT.SCHEDULE": {
    childId: "",
    kind: "VACCINATION",
    scheduledFor: futureDateTime(),
    notes: "",
  },
  "CLIMATE.PROFILE_UPSERT": {
    childId: "",
    administrativeAreaCode: "",
    vulnerability: "MEDIUM",
    displaced: false,
    assessedAt: currentDateTime(),
  },
  "CLINICAL.GROWTH_RECORD": {
    childId: "",
    measuredAt: currentDateTime(),
    weightGrams: 0,
    heightMillimeters: 0,
    muacMillimeters: 0,
  },
  "CLINICAL.IMMUNIZATION_RECORD": {
    childId: "",
    vaccineCode: "",
    doseNumber: 1,
    administeredAt: currentDateTime(),
    route: "IM",
    lotNumber: "",
    facilityId: "",
    facilityName: "",
    state: "",
    lga: "",
    ward: "",
    vaccinatorMode: "SELF",
    vaccinatorName: "",
  },
  "RESPONSE.DELIVERY_RECORD": {
    entryId: "",
    category: "",
    quantity: 1,
    unit: "ITEM",
    deliveredAt: currentDateTime(),
    notes: "",
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

function isoPayload(type: SyncOperationType, payload: Payload) {
  const dateFields: Partial<Record<SyncOperationType, string[]>> = {
    "APPOINTMENT.SCHEDULE": ["scheduledFor"],
    "CLIMATE.PROFILE_UPSERT": ["assessedAt"],
    "CLINICAL.GROWTH_RECORD": ["measuredAt"],
    "CLINICAL.IMMUNIZATION_RECORD": ["administeredAt"],
    "RESPONSE.DELIVERY_RECORD": ["deliveredAt"],
  };

  const normalized: Record<string, unknown> = { ...payload };
  for (const field of dateFields[type] || []) {
    const value = payload[field];
    if (typeof value === "string" && value) {
      normalized[field] = new Date(value).toISOString();
    }
  }

  for (const [key, value] of Object.entries(normalized)) {
    if (value === "") delete normalized[key];
  }
  return normalized;
}

export default function OfflineSync() {
  const { organizationId, user } = useContext(UserContext);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const pwaSurface = location.pathname.startsWith("/nfc/");
  const online = useOnlineStatus();
  const requestedType = searchParams.get("type") as SyncOperationType | null;
  const initialType = requestedType && types.includes(requestedType)
    ? requestedType
    : "CLINICAL.IMMUNIZATION_RECORD";
  const requestedChildId = searchParams.get("childId") || "";
  const [devices, setDevices] = useState<Array<Record<string, unknown>>>([]);
  const [deviceId, setDeviceId] = useState("");
  const [queue, setQueue] = useState<SyncOperationInput[]>([]);
  const [batches, setBatches] = useState<SyncBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [open, setOpen] = useState(Boolean(requestedType));
  const [operationType, setOperationType] = useState<SyncOperationType>(initialType);
  const [payload, setPayload] = useState<Payload>({
    ...templates[initialType],
    ...(requestedChildId ? { childId: requestedChildId } : {}),
  });
  const [entityId, setEntityId] = useState("");
  const [baseVersion, setBaseVersion] = useState("");
  const currentUserName = String(user?.name || "").trim();

  const load = useCallback(async () => {
    if (!organizationId || !user) return;
    setLoading(true);
    setError(null);
    try {
      const saved = await readOfflineQueue(organizationId, user.id);
      setQueue(saved);

      const rememberedDevice = preferredOfflineDevice(organizationId);
      setDeviceId((current) => current || rememberedDevice);
      if (!online) return;

      const [deviceRows, page] = await Promise.all([
        medfinetOperationsApi.devices(organizationId, "ACTIVE"),
        medfinetOfflineApi.listBatches(organizationId),
      ]);
      setDevices(deviceRows);
      setDeviceId((current) => {
        const localRecordId = localStorage.getItem(
          "medfinet.nfc.device-record-id",
        );
        const localIdentifier = localStorage.getItem("medfinet.nfc.device-id");
        const localDevice = deviceRows.find(
          (device) =>
            (localRecordId && String(device.id) === localRecordId) ||
            (localIdentifier &&
              String(device.deviceIdentifier || "") === localIdentifier),
        );
        const selected =
          current || rememberedDevice || String(localDevice?.id || "");
        if (selected) rememberOfflineDevice(organizationId, selected);
        return selected;
      });
      setBatches(page.items);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to load offline synchronization",
      );
    } finally {
      setLoading(false);
    }
  }, [online, organizationId, user]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!organizationId || !user) return;
    const handleCompleted = (event: Event) => {
      const completed = (event as CustomEvent<{
        batch: SyncBatch;
        submittedCount: number;
      }>).detail;
      void readOfflineQueue(organizationId, user.id).then(setQueue);
      setBatches((current) => [
        completed.batch,
        ...current.filter((batch) => batch.id !== completed.batch.id),
      ]);
      setNotice(
        `${completed.submittedCount} offline operation${completed.submittedCount === 1 ? "" : "s"} synchronized automatically.`,
      );
    };
    window.addEventListener(OFFLINE_SYNC_COMPLETED_EVENT, handleCompleted);
    return () =>
      window.removeEventListener(OFFLINE_SYNC_COMPLETED_EVENT, handleCompleted);
  }, [organizationId, user]);

  async function persist(next: SyncOperationInput[]) {
    if (!organizationId || !user) return;
    setQueue(next);
    await writeOfflineQueue(organizationId, user.id, next);
  }

  async function add(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      const payloadForQueue: Payload = { ...payload };
      if (
        operationType === "CLINICAL.IMMUNIZATION_RECORD"
        && payloadForQueue.vaccinatorMode === "SELF"
      ) {
        if (!currentUserName) {
          throw new Error(
            "Your account needs a display name before you can queue yourself as the vaccinator.",
          );
        }
        payloadForQueue.vaccinatorName = currentUserName;
      }
      const operation: SyncOperationInput = {
        clientOperationId: crypto.randomUUID(),
        operationType,
        payload: isoPayload(operationType, payloadForQueue),
        ...(entityId.trim() && { entityId: entityId.trim() }),
        ...(baseVersion && { baseVersion: Number(baseVersion) }),
      };
      await persist([...queue, operation]);
      setOpen(false);
      setNotice(
        online
          ? "Operation encrypted. Medfinet will synchronize it automatically."
          : "Operation encrypted and stored on this approved browser until connectivity returns.",
      );
      setPayload({ ...templates[operationType] });
      setEntityId("");
      setBaseVersion("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to add operation");
    }
  }

  async function submit() {
    if (!organizationId || !user || !queue.length) return;
    setBusy(true);
    setError(null);
    try {
      const result = await syncOfflineQueue(
        organizationId,
        user.id,
        deviceId,
      );
      if (result) {
        setQueue(await readOfflineQueue(organizationId, user.id));
        setBatches((current) => [
          result.batch,
          ...current.filter((item) => item.id !== result.batch.id),
        ]);
        setNotice(
          result.idempotentReplay
            ? "The existing batch was returned safely."
            : "Encrypted offline operations were accepted for processing.",
        );
      }
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
    <main
      className={
        pwaSurface
          ? "mx-auto min-h-screen max-w-7xl space-y-6 bg-slate-50 px-4 py-6 sm:px-6"
          : "space-y-6"
      }
    >
      <header className="flex flex-col justify-between gap-4 lg:flex-row">
        <div>
          <p className="text-sm font-semibold text-cyan-700">Intermittent-connectivity operations</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950">Offline sync</h1>
          <p className="mt-2 text-sm text-slate-600">
            Capture supported field operations with guided forms. Medfinet encrypts them locally and synchronizes them automatically when connectivity returns.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {pwaSurface ? (
            <Link className={button} to="/nfc/scanner">
              <ArrowLeft className="mr-2 inline h-4 w-4" />NFC scanner
            </Link>
          ) : null}
          <button className={button} onClick={() => void load()}>
            <RefreshCw className="mr-2 inline h-4 w-4" />Refresh
          </button>
          <button className={primary} onClick={() => setOpen(true)}>
            <Plus className="mr-2 inline h-4 w-4" />Queue operation
          </button>
        </div>
      </header>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <ShieldCheck className="mr-2 inline h-5 w-5" />
        Pending payloads are encrypted at rest with a non-exportable browser key. Use only an organization-approved device.
      </div>

      {notice && (
        <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
          {notice}
        </div>
      )}

      {error && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
          <p>{error}</p>
          <button type="button" className={`${button} mt-3`} onClick={() => void load()}>
            Retry
          </button>
        </div>
      )}

      <PageFeedback loading={loading}>
        <section className="rounded-2xl border bg-white p-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <label className="text-sm font-semibold">
              Registered active device
              <select className={input} value={deviceId} onChange={(event) => {
                const selected = event.target.value;
                setDeviceId(selected);
                if (organizationId && user && selected) {
                  rememberOfflineDevice(organizationId, selected);
                  void syncOfflineQueue(organizationId, user.id, selected).catch(
                    (reason: unknown) => {
                      setError(
                        reason instanceof Error
                          ? reason.message
                          : "Unable to synchronize offline work",
                      );
                    },
                  );
                }
              }}>
                <option value="">Select this device</option>
                {deviceId && !devices.some((device) => String(device.id) === deviceId) ? (
                  <option value={deviceId}>Previously selected device</option>
                ) : null}
                {devices.map((device) => (
                  <option key={String(device.id)} value={String(device.id)}>
                    {String(device.displayName || device.deviceIdentifier || device.id)}
                  </option>
                ))}
              </select>
            </label>
            <button
              className={primary}
              disabled={busy || !queue.length || !online || !deviceId}
              onClick={() => void submit()}
            >
              <CloudUpload className="mr-2 inline h-4 w-4" />
              {busy ? "Submitting…" : `Sync ${queue.length} operation${queue.length === 1 ? "" : "s"}`}
            </button>
          </div>

          {!online && (
            <p className="mt-3 text-sm text-amber-700">
              <WifiOff className="mr-2 inline h-4 w-4" />Offline. Queued work remains encrypted locally.
            </p>
          )}
          {online && queue.length && deviceId ? (
            <p className="mt-3 text-sm text-cyan-700">
              <RefreshCw className="mr-2 inline h-4 w-4" />Automatic synchronization is active. You can also sync immediately.
            </p>
          ) : null}
          {online && queue.length && !deviceId ? (
            <p className="mt-3 text-sm text-amber-700">
              Select this approved browser above to enable automatic synchronization.
            </p>
          ) : null}

          <div className="mt-5 space-y-3">
            {queue.map((operation) => (
              <article key={operation.clientOperationId} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-4">
                <div>
                  <p className="font-semibold">{operation.operationType.replaceAll(".", " ")}</p>
                  <p className="text-xs text-slate-500">{operation.clientOperationId}</p>
                </div>
                <button
                  type="button"
                  aria-label="Remove queued operation"
                  className="rounded-lg p-2 text-rose-700 hover:bg-rose-50"
                  onClick={() => void persist(queue.filter((item) => item.clientOperationId !== operation.clientOperationId))}
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
              <article key={batch.id} className="rounded-xl border bg-white p-4">
                <p className="font-semibold">{batch.status} · {batch.operationCount} operation(s)</p>
                <p className="text-xs text-slate-500">{new Date(batch.createdAt).toLocaleString()} · {batch.id}</p>
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
        description="Choose a supported operation and complete the required fields. Record identifiers must come from an authorized workflow."
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
                setPayload({ ...templates[next] });
              }}
            >
              {types.map((type) => <option key={type}>{type}</option>)}
            </select>
          </label>

          <OperationFields
            type={operationType}
            payload={payload}
            currentUserName={currentUserName}
            onChange={setPayload}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              Existing entity ID (optional)
              <input className={input} value={entityId} onChange={(event) => setEntityId(event.target.value)} />
            </label>
            <label className="text-sm font-semibold">
              Base version (optional)
              <input type="number" min="0" className={input} value={baseVersion} onChange={(event) => setBaseVersion(event.target.value)} />
            </label>
          </div>
          <button className={primary}>Encrypt and queue</button>
        </form>
      </Modal>
    </main>
  );
}

function OperationFields({
  type,
  payload,
  currentUserName,
  onChange,
}: {
  type: SyncOperationType;
  payload: Payload;
  currentUserName: string;
  onChange: (next: Payload) => void;
}) {
  const set = (name: string, value: string | number | boolean) =>
    onChange({ ...payload, [name]: value });

  const text = (name: string, label: string, required = true) => (
    <label className="block text-sm font-semibold">
      {label}
      <input required={required} className={input} value={String(payload[name] ?? "")} onChange={(event) => set(name, event.target.value)} />
    </label>
  );

  const number = (name: string, label: string, min = 0) => (
    <label className="block text-sm font-semibold">
      {label}
      <input required type="number" min={min} className={input} value={Number(payload[name] ?? 0)} onChange={(event) => set(name, Number(event.target.value))} />
    </label>
  );

  const dateTime = (name: string, label: string) => (
    <label className="block text-sm font-semibold">
      {label}
      <input required type="datetime-local" className={input} value={String(payload[name] ?? "")} onChange={(event) => set(name, event.target.value)} />
    </label>
  );

  if (type === "APPOINTMENT.SCHEDULE") {
    return <>{text("childId", "Child ID")}{text("kind", "Appointment kind")}{dateTime("scheduledFor", "Scheduled for")}{text("notes", "Notes", false)}</>;
  }
  if (type === "CLIMATE.PROFILE_UPSERT") {
    return <>{text("childId", "Child ID")}{text("administrativeAreaCode", "Administrative area code")}{text("vulnerability", "Vulnerability level")}{dateTime("assessedAt", "Assessed at")}<label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={Boolean(payload.displaced)} onChange={(event) => set("displaced", event.target.checked)} />Displaced household</label></>;
  }
  if (type === "CLINICAL.GROWTH_RECORD") {
    return <>{text("childId", "Child ID")}{dateTime("measuredAt", "Measured at")}<div className="grid gap-4 sm:grid-cols-3">{number("weightGrams", "Weight (g)")}{number("heightMillimeters", "Height (mm)")}{number("muacMillimeters", "MUAC (mm)")}</div></>;
  }
  if (type === "CLINICAL.IMMUNIZATION_RECORD") {
    const vaccinatorMode = String(payload.vaccinatorMode || "SELF");
    return (
      <>
        {text("childId", "Child ID")}
        <div className="grid gap-4 sm:grid-cols-2">
          {text("vaccineCode", "Vaccine code")}
          {number("doseNumber", "Dose number", 1)}
        </div>
        {dateTime("administeredAt", "Administered at")}
        <div className="grid gap-4 sm:grid-cols-2">
          {text("route", "Route")}
          {text("lotNumber", "Lot number", false)}
        </div>
        <div className="space-y-4 rounded-xl border border-cyan-100 bg-cyan-50/60 p-4">
          <div>
            <p className="font-semibold text-slate-900">Certificate details</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              Copy the registered facility ID and confirm the location values from the authorized offline workflow. They are encrypted with this operation and snapshotted when synchronization succeeds.
            </p>
          </div>
          {text("facilityId", "Registered facility ID")}
          {text("facilityName", "Health facility name")}
          <div className="grid gap-4 sm:grid-cols-3">
            {text("state", "State")}
            {text("lga", "LGA")}
            {text("ward", "Ward")}
          </div>
          <label className="block text-sm font-semibold">
            Who administered the vaccine?
            <select
              className={input}
              value={vaccinatorMode}
              onChange={(event) => set("vaccinatorMode", event.target.value)}
            >
              <option value="SELF">Me — {currentUserName || "current account"}</option>
              <option value="OTHER">Another / external vaccinator</option>
            </select>
          </label>
          {vaccinatorMode === "OTHER"
            ? text("vaccinatorName", "Vaccinator name")
            : (
              <p className="rounded-lg bg-white p-3 text-xs text-slate-600">
                The authenticated worker ID remains the vaccinator ID. The display name stored in the encrypted payload is {currentUserName || "taken from your account when available"}.
              </p>
            )}
        </div>
      </>
    );
  }
  if (type === "RESPONSE.DELIVERY_RECORD") {
    return <>{text("entryId", "Worklist entry ID")}<div className="grid gap-4 sm:grid-cols-2">{text("category", "Delivery category")}{number("quantity", "Quantity", 1)}</div>{text("unit", "Unit")}{dateTime("deliveredAt", "Delivered at")}{text("notes", "Notes", false)}</>;
  }
  return <>{text("entryId", "Worklist entry ID")}{text("referralType", "Referral type")}{text("destination", "Destination")}{text("priority", "Priority")}{text("reason", "Reason")}</>;
}
