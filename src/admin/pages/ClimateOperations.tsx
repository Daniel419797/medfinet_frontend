import { useCallback, useContext, useEffect, useState } from "react";
import { AlertTriangle, ListChecks, Plus } from "lucide-react";
import UserContext from "../../contexts/UserContext";
import { Modal } from "../../components/common/Modal";
import { ConfirmActionModal } from "../../components/common/ConfirmActionModal";
import { PageFeedback } from "../../components/common/PageFeedback";
import { medfinetClimateApi } from "../../services/medfinetClimateApi";
import { medfinetIdentityApi } from "../../services/medfinetIdentityApi";
import {
  medfinetOperationsApi,
  type ClimateEvent,
  type WorklistDetail,
  type WorklistSummary,
} from "../../services/medfinetOperationsApi";

const nowLocal = () =>
  new Date(Date.now() - new Date().getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
const eventBlank = {
  name: "",
  eventType: "FLOOD",
  severity: "HIGH",
  source: "",
  externalReference: "",
  startsAt: nowLocal(),
  endsAt: "",
};
const areaBlank = {
  administrativeAreaCode: "",
  administrativeAreaName: "",
  severity: "HIGH",
  affectedFrom: nowLocal(),
  affectedUntil: "",
};
const worklistBlank = {
  name: "",
  programmeId: "",
  authorizationBasis: "",
  administrativeAreaCodes: "",
  minimumVulnerability: "MEDIUM",
  displacedOnly: false,
};

export default function ClimateOperations() {
  const { organizationId } = useContext(UserContext);
  const [events, setEvents] = useState<ClimateEvent[]>([]);
  const [worklists, setWorklists] = useState<WorklistSummary[]>([]);
  const [programmes, setProgrammes] = useState<
    Awaited<ReturnType<typeof medfinetIdentityApi.listProgrammes>>
  >([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [eventOpen, setEventOpen] = useState(false);
  const [areaEvent, setAreaEvent] = useState<ClimateEvent | null>(null);
  const [transitionTarget, setTransitionTarget] = useState<{
    item: ClimateEvent;
    status: "ACTIVE" | "CLOSED" | "CANCELLED";
  } | null>(null);
  const [worklistEvent, setWorklistEvent] = useState<ClimateEvent | null>(null);
  const [detail, setDetail] = useState<WorklistDetail | null>(null);
  const [eventForm, setEventForm] = useState(eventBlank);
  const [areaForm, setAreaForm] = useState(areaBlank);
  const [worklistForm, setWorklistForm] = useState(worklistBlank);
  const [serviceEntryId, setServiceEntryId] = useState("");
  const [actionMode, setActionMode] = useState<"delivery" | "referral" | null>(
    null,
  );
  const [actionForm, setActionForm] = useState({
    category: "",
    quantity: "1",
    unit: "item",
    referralType: "",
    destination: "",
    priority: "HIGH",
    reason: "",
    notes: "",
  });

  const load = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setError("");
    try {
      const [eventRows, worklistRows, programmeRows] = await Promise.all([
        medfinetOperationsApi.climateEvents(organizationId),
        medfinetOperationsApi.worklists(organizationId),
        medfinetIdentityApi.listProgrammes(organizationId),
      ]);
      setEvents(eventRows);
      setWorklists(worklistRows);
      setProgrammes(programmeRows);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to load climate operations",
      );
    } finally {
      setLoading(false);
    }
  }, [organizationId]);
  useEffect(() => {
    void load();
  }, [load]);

  async function createEvent(event: React.FormEvent) {
    event.preventDefault();
    if (!organizationId) return;
    setBusy(true);
    try {
      await medfinetClimateApi.createEvent(organizationId, {
        ...eventForm,
        severity: eventForm.severity as "HIGH",
        startsAt: new Date(eventForm.startsAt).toISOString(),
        endsAt: eventForm.endsAt
          ? new Date(eventForm.endsAt).toISOString()
          : undefined,
      });
      setEventOpen(false);
      setEventForm(eventBlank);
      setNotice(
        "Climate event created. Add at least one affected area before activation.",
      );
      await load();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to create event",
      );
    } finally {
      setBusy(false);
    }
  }

  async function addArea(event: React.FormEvent) {
    event.preventDefault();
    if (!organizationId || !areaEvent) return;
    setBusy(true);
    try {
      await medfinetClimateApi.addAffectedArea(organizationId, areaEvent.id, {
        ...areaForm,
        severity: areaForm.severity as "HIGH",
        affectedFrom: new Date(areaForm.affectedFrom).toISOString(),
        affectedUntil: areaForm.affectedUntil
          ? new Date(areaForm.affectedUntil).toISOString()
          : undefined,
      });
      setAreaEvent(null);
      setAreaForm(areaBlank);
      setNotice("Affected area added.");
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to add area");
    } finally {
      setBusy(false);
    }
  }

  async function transition(
    item: ClimateEvent,
    status: "ACTIVE" | "CLOSED" | "CANCELLED",
  ) {
    if (!organizationId) return;
    setBusy(true);
    try {
      await medfinetClimateApi.transitionEvent(organizationId, item.id, {
        status,
      });
      setNotice(`Event moved to ${status}.`);
      await load();
      setTransitionTarget(null);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to update event",
      );
    } finally {
      setBusy(false);
    }
  }

  async function createWorklist(event: React.FormEvent) {
    event.preventDefault();
    if (!organizationId || !worklistEvent) return;
    setBusy(true);
    try {
      await medfinetClimateApi.createWorklist(
        organizationId,
        worklistEvent.id,
        {
          ...worklistForm,
          minimumVulnerability: worklistForm.minimumVulnerability as "MEDIUM",
          administrativeAreaCodes: worklistForm.administrativeAreaCodes
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean),
        },
      );
      setWorklistEvent(null);
      setWorklistForm(worklistBlank);
      setNotice("Draft worklist created. Generate it before authorization.");
      await load();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to create worklist",
      );
    } finally {
      setBusy(false);
    }
  }

  async function worklistAction(
    item: WorklistSummary,
    action: "generate" | "authorize" | "open",
  ) {
    if (!organizationId) return;
    setBusy(true);
    try {
      if (action === "generate")
        await medfinetClimateApi.generateWorklist(organizationId, item.id);
      if (action === "authorize")
        await medfinetClimateApi.authorizeWorklist(organizationId, item.id);
      if (action === "open")
        setDetail(
          await medfinetOperationsApi.worklist(organizationId, item.id),
        );
      else {
        setNotice(
          action === "generate"
            ? "Worklist generation queued."
            : "Worklist authorized.",
        );
        await load();
      }
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Worklist action failed",
      );
    } finally {
      setBusy(false);
    }
  }

  async function submitEntryAction(event: React.FormEvent) {
    event.preventDefault();
    if (!organizationId || !actionMode) return;
    setBusy(true);
    const sourceOperationId = crypto.randomUUID();
    try {
      if (actionMode === "delivery")
        await medfinetClimateApi.recordDelivery(
          organizationId,
          serviceEntryId,
          {
            category: actionForm.category,
            quantity: Number(actionForm.quantity),
            unit: actionForm.unit,
            deliveredAt: new Date().toISOString(),
            notes: actionForm.notes || undefined,
            sourceOperationId,
          },
        );
      else
        await medfinetClimateApi.createReferral(
          organizationId,
          serviceEntryId,
          {
            referralType: actionForm.referralType,
            destination: actionForm.destination,
            priority: actionForm.priority as "HIGH",
            reason: actionForm.reason,
            sourceOperationId,
          },
        );
      setActionMode(null);
      setNotice(
        actionMode === "delivery"
          ? "Service delivery recorded."
          : "Referral created and notification queued.",
      );
      if (detail)
        setDetail(
          await medfinetOperationsApi.worklist(organizationId, detail.id),
        );
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to save field action",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-cyan-700">
            Response operations
          </p>
          <h1 className="text-3xl font-bold text-slate-950">
            Climate and outbreak response
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Events, affected areas, beneficiary worklists, deliveries and
            referrals.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEventOpen(true)}
          className="rounded-lg bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white"
        >
          <Plus className="mr-2 inline h-4 w-4" />
          Create event
        </button>
      </div>
      {notice && (
        <div
          role="status"
          className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"
        >
          {notice}
        </div>
      )}
      <div className="mt-6">
        <PageFeedback
          loading={loading}
          error={error}
          empty={!events.length && !worklists.length}
          onRetry={() => void load()}
        >
          <div className="grid gap-8 xl:grid-cols-2">
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                Events
              </h2>
              <div className="space-y-3">
                {events.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-2xl border bg-white p-5"
                  >
                    <div className="flex justify-between gap-3">
                      <div>
                        <h3 className="font-bold">{item.name}</h3>
                        <p className="text-sm text-slate-600">
                          {item.eventType} · {item.severity} ·{" "}
                          {item.affectedAreas.length} areas
                        </p>
                      </div>
                      <span className="text-xs font-semibold">
                        {item.status}
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {["DRAFT", "ACTIVE"].includes(item.status) && (
                        <button
                          type="button"
                          onClick={() => setAreaEvent(item)}
                          className="rounded-lg border px-3 py-2 text-sm font-semibold"
                        >
                          Add area
                        </button>
                      )}
                      {item.status === "DRAFT" && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            setTransitionTarget({ item, status: "ACTIVE" })
                          }
                          className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white"
                        >
                          Activate
                        </button>
                      )}
                      {item.status === "ACTIVE" && (
                        <>
                          <button
                            type="button"
                            onClick={() => setWorklistEvent(item)}
                            className="rounded-lg bg-cyan-700 px-3 py-2 text-sm font-semibold text-white"
                          >
                            Create worklist
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setTransitionTarget({ item, status: "CLOSED" })
                            }
                            className="rounded-lg border px-3 py-2 text-sm font-semibold"
                          >
                            Close
                          </button>
                        </>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
                <ListChecks className="h-5 w-5 text-cyan-700" />
                Worklists
              </h2>
              <div className="space-y-3">
                {worklists.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-2xl border bg-white p-5"
                  >
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-bold">{item.name}</h3>
                        <p className="text-sm text-slate-600">
                          {item.programme.name} · {item._count.entries} entries
                        </p>
                      </div>
                      <span className="text-xs font-semibold">
                        {item.status}
                      </span>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => void worklistAction(item, "open")}
                        className="rounded-lg border px-3 py-2 text-sm font-semibold"
                      >
                        Open
                      </button>
                      {item.status === "DRAFT" && !item.generationComplete && (
                        <button
                          type="button"
                          onClick={() => void worklistAction(item, "generate")}
                          className="rounded-lg bg-cyan-700 px-3 py-2 text-sm font-semibold text-white"
                        >
                          Generate
                        </button>
                      )}
                      {item.status === "DRAFT" && item.generationComplete && (
                        <button
                          type="button"
                          onClick={() => void worklistAction(item, "authorize")}
                          className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white"
                        >
                          Authorize
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </PageFeedback>
      </div>
      <Modal
        open={eventOpen}
        title="Create climate event"
        onClose={() => setEventOpen(false)}
      >
        <form onSubmit={createEvent} className="grid gap-4 sm:grid-cols-2">
          {(["name", "eventType", "source", "externalReference"] as const).map(
            (field) => (
              <label key={field} className="text-sm font-medium">
                {field.replace(/([A-Z])/g, " $1")}
                <input
                  required={field !== "externalReference"}
                  value={eventForm[field]}
                  onChange={(event) =>
                    setEventForm({ ...eventForm, [field]: event.target.value })
                  }
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                />
              </label>
            ),
          )}
          <label className="text-sm font-medium">
            Severity
            <select
              value={eventForm.severity}
              onChange={(event) =>
                setEventForm({ ...eventForm, severity: event.target.value })
              }
              className="mt-1 w-full rounded-lg border px-3 py-2"
            >
              {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            Starts
            <input
              required
              type="datetime-local"
              value={eventForm.startsAt}
              onChange={(event) =>
                setEventForm({ ...eventForm, startsAt: event.target.value })
              }
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </label>
          <button
            disabled={busy}
            className="sm:col-span-2 rounded-lg bg-cyan-700 px-4 py-2.5 font-semibold text-white"
          >
            Create event
          </button>
        </form>
      </Modal>
      <Modal
        open={Boolean(areaEvent)}
        title="Add affected area"
        onClose={() => setAreaEvent(null)}
      >
        <form onSubmit={addArea} className="grid gap-4 sm:grid-cols-2">
          {(["administrativeAreaCode", "administrativeAreaName"] as const).map(
            (field) => (
              <label key={field} className="text-sm font-medium">
                {field.replace(/([A-Z])/g, " $1")}
                <input
                  required
                  value={areaForm[field]}
                  onChange={(event) =>
                    setAreaForm({ ...areaForm, [field]: event.target.value })
                  }
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                />
              </label>
            ),
          )}
          <label className="text-sm font-medium">
            Severity
            <select
              value={areaForm.severity}
              onChange={(event) =>
                setAreaForm({ ...areaForm, severity: event.target.value })
              }
              className="mt-1 w-full rounded-lg border px-3 py-2"
            >
              {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            Affected from
            <input
              required
              type="datetime-local"
              value={areaForm.affectedFrom}
              onChange={(event) =>
                setAreaForm({ ...areaForm, affectedFrom: event.target.value })
              }
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </label>
          <button
            disabled={busy}
            className="sm:col-span-2 rounded-lg bg-cyan-700 px-4 py-2.5 font-semibold text-white"
          >
            Add area
          </button>
        </form>
      </Modal>
      <Modal
        open={Boolean(worklistEvent)}
        title="Create beneficiary worklist"
        onClose={() => setWorklistEvent(null)}
      >
        <form onSubmit={createWorklist} className="space-y-4">
          <label className="block text-sm font-medium">
            Name
            <input
              required
              value={worklistForm.name}
              onChange={(event) =>
                setWorklistForm({ ...worklistForm, name: event.target.value })
              }
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium">
            Programme
            <select
              required
              value={worklistForm.programmeId}
              onChange={(event) =>
                setWorklistForm({
                  ...worklistForm,
                  programmeId: event.target.value,
                })
              }
              className="mt-1 w-full rounded-lg border px-3 py-2"
            >
              <option value="">Select programme</option>
              {programmes
                .filter((item) => item.isActive)
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
            </select>
          </label>
          <label className="block text-sm font-medium">
            Affected area codes, separated by commas
            <input
              required
              value={worklistForm.administrativeAreaCodes}
              onChange={(event) =>
                setWorklistForm({
                  ...worklistForm,
                  administrativeAreaCodes: event.target.value,
                })
              }
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium">
            Authorization basis
            <textarea
              required
              maxLength={500}
              value={worklistForm.authorizationBasis}
              onChange={(event) =>
                setWorklistForm({
                  ...worklistForm,
                  authorizationBasis: event.target.value,
                })
              }
              className="mt-1 min-h-20 w-full rounded-lg border px-3 py-2"
            />
          </label>
          <button
            disabled={busy}
            className="w-full rounded-lg bg-cyan-700 px-4 py-2.5 font-semibold text-white"
          >
            Create worklist
          </button>
        </form>
      </Modal>
      <Modal
        open={Boolean(detail)}
        title={detail?.name || "Worklist"}
        onClose={() => setDetail(null)}
      >
        <div className="max-h-[60vh] space-y-3 overflow-y-auto">
          {detail?.entries.map((entry) => (
            <article key={entry.id} className="rounded-xl border p-4">
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold">
                    {entry.child.firstName} {entry.child.lastName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {entry.child.medfinetId} · {entry.priority}
                  </p>
                </div>
                <span className="text-xs font-semibold">{entry.status}</span>
              </div>
              {["PENDING", "CONTACTED"].includes(entry.status) && (
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setServiceEntryId(entry.id);
                      setActionMode("delivery");
                    }}
                    className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white"
                  >
                    Record delivery
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setServiceEntryId(entry.id);
                      setActionMode("referral");
                    }}
                    className="rounded-lg border px-3 py-2 text-xs font-semibold"
                  >
                    Create referral
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      </Modal>
      <Modal
        open={Boolean(actionMode)}
        title={
          actionMode === "delivery"
            ? "Record service delivery"
            : "Create referral"
        }
        onClose={() => setActionMode(null)}
      >
        <form onSubmit={submitEntryAction} className="space-y-4">
          {actionMode === "delivery" ? (
            <>
              <label className="block text-sm font-medium">
                Category
                <input
                  required
                  value={actionForm.category}
                  onChange={(event) =>
                    setActionForm({
                      ...actionForm,
                      category: event.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm font-medium">
                  Quantity
                  <input
                    required
                    min="1"
                    type="number"
                    value={actionForm.quantity}
                    onChange={(event) =>
                      setActionForm({
                        ...actionForm,
                        quantity: event.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                  />
                </label>
                <label className="text-sm font-medium">
                  Unit
                  <input
                    required
                    value={actionForm.unit}
                    onChange={(event) =>
                      setActionForm({ ...actionForm, unit: event.target.value })
                    }
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                  />
                </label>
              </div>
            </>
          ) : (
            <>
              <label className="block text-sm font-medium">
                Referral type
                <input
                  required
                  value={actionForm.referralType}
                  onChange={(event) =>
                    setActionForm({
                      ...actionForm,
                      referralType: event.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                />
              </label>
              <label className="block text-sm font-medium">
                Destination
                <input
                  required
                  value={actionForm.destination}
                  onChange={(event) =>
                    setActionForm({
                      ...actionForm,
                      destination: event.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                />
              </label>
              <label className="block text-sm font-medium">
                Reason
                <textarea
                  required
                  value={actionForm.reason}
                  onChange={(event) =>
                    setActionForm({ ...actionForm, reason: event.target.value })
                  }
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                />
              </label>
            </>
          )}
          <button
            disabled={busy}
            className="w-full rounded-lg bg-cyan-700 px-4 py-2.5 font-semibold text-white"
          >
            Save
          </button>
        </form>
      </Modal>
      <ConfirmActionModal
        open={Boolean(transitionTarget)}
        title="Change climate event status"
        description={`Move ${transitionTarget?.item.name || "this event"} to ${transitionTarget?.status || "the selected status"}? This changes response availability and downstream worklists.`}
        confirmLabel={`Move to ${transitionTarget?.status || "status"}`}
        destructive={transitionTarget?.status !== "ACTIVE"}
        busy={busy}
        onClose={() => setTransitionTarget(null)}
        onConfirm={() => {
          if (transitionTarget)
            return transition(transitionTarget.item, transitionTarget.status);
        }}
      />
    </main>
  );
}
