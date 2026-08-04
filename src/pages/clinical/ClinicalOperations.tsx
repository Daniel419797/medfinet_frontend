import {
  FormEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Activity,
  AlertTriangle,
  CalendarPlus,
  Plus,
  RefreshCw,
  Search,
  Syringe,
  UserRoundPlus,
} from "lucide-react";
import UserContext from "../../contexts/UserContext";
import { Modal } from "../../components/common/Modal";
import { ActionReasonModal } from "../../components/common/ActionReasonModal";
import { PageFeedback } from "../../components/common/PageFeedback";
import { medfinetClinicalApi } from "../../services/medfinetClinicalApi";
import { medfinetIdentityApi } from "../../services/medfinetIdentityApi";

type Child = Awaited<
  ReturnType<typeof medfinetIdentityApi.listChildren>
>["items"][number];
type Timeline = Awaited<
  ReturnType<typeof medfinetClinicalApi.getClinicalTimeline>
>;
type RecordKind =
  "immunization" | "growth" | "alert" | "allergy" | "appointment";
const input =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm";
const button =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold disabled:opacity-50";
const primary =
  "rounded-lg bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50";

const initialForms = {
  immunization: {
    vaccineCode: "",
    doseNumber: "1",
    administeredAt: new Date().toISOString().slice(0, 10),
    lotNumber: "",
    route: "IM",
    site: "",
    notes: "",
  },
  growth: {
    measuredAt: new Date().toISOString().slice(0, 10),
    weightGrams: "",
    heightMillimeters: "",
    muacMillimeters: "",
    vitaminAAdministered: false,
    oedemaPresent: false,
    notes: "",
  },
  alert: {
    category: "",
    severity: "MODERATE",
    summary: "",
    emergencyVisible: false,
  },
  allergy: {
    substanceDisplay: "",
    reaction: "",
    severity: "MODERATE",
    criticality: "LOW",
  },
  appointment: { kind: "VACCINATION", scheduledFor: "", notes: "" },
};

export default function ClinicalOperations() {
  const { organizationId } = useContext(UserContext);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [timeline, setTimeline] = useState<Timeline | null>(null);
  const [schedule, setSchedule] = useState<Awaited<
    ReturnType<typeof medfinetClinicalApi.evaluateSchedule>
  > | null>(null);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<
    | "summary"
    | "immunizations"
    | "growth"
    | "alerts"
    | "allergies"
    | "appointments"
    | "schedule"
  >("summary");
  const [recordKind, setRecordKind] = useState<RecordKind | null>(null);
  const [childOpen, setChildOpen] = useState(false);
  const [resolveTarget, setResolveTarget] = useState<{
    kind: "alert" | "allergy";
    id: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [childForm, setChildForm] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    sex: "UNKNOWN",
  });
  const [forms, setForms] = useState(initialForms);
  const selected = children.find((child) => child.id === selectedId) || null;

  const loadChildren = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await medfinetIdentityApi.listChildren(organizationId, {
        limit: 100,
      });
      setChildren(result.items);
      setSelectedId((current) => current || result.items[0]?.id || "");
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to load child records",
      );
    } finally {
      setLoading(false);
    }
  }, [organizationId]);
  const loadRecord = useCallback(async () => {
    if (!organizationId || !selectedId) {
      setTimeline(null);
      setSchedule(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [record, evaluated] = await Promise.all([
        medfinetClinicalApi.getClinicalTimeline(organizationId, selectedId),
        medfinetClinicalApi.evaluateSchedule(organizationId, selectedId),
      ]);
      setTimeline(record);
      setSchedule(evaluated);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to load the clinical record",
      );
    } finally {
      setLoading(false);
    }
  }, [organizationId, selectedId]);
  useEffect(() => {
    void loadChildren();
  }, [loadChildren]);
  useEffect(() => {
    void loadRecord();
  }, [loadRecord]);

  const filteredChildren = useMemo(() => {
    const value = query.trim().toLowerCase();
    return value
      ? children.filter(
          (child) =>
            child.medfinetId.toLowerCase().includes(value) ||
            `${child.firstName} ${child.lastName}`
              .toLowerCase()
              .includes(value),
        )
      : children;
  }, [children, query]);
  const run = async (operation: () => Promise<unknown>, message: string) => {
    setBusy(true);
    setError(null);
    try {
      await operation();
      setNotice(message);
      await loadRecord();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Clinical operation failed",
      );
    } finally {
      setBusy(false);
    }
  };

  const createChild = async (event: FormEvent) => {
    event.preventDefault();
    if (!organizationId) return;
    setBusy(true);
    setError(null);
    try {
      const child = await medfinetIdentityApi.registerChild(
        organizationId,
        childForm,
      );
      setNotice(`Record created with Medfinet ID ${child.medfinetId}.`);
      setChildOpen(false);
      setChildForm({
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        sex: "UNKNOWN",
      });
      await loadChildren();
      setSelectedId(child.id);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to register child",
      );
    } finally {
      setBusy(false);
    }
  };
  const createRecord = async (event: FormEvent) => {
    event.preventDefault();
    if (!organizationId || !selectedId || !recordKind) return;
    const op =
      recordKind === "immunization"
        ? medfinetClinicalApi.recordImmunization(organizationId, selectedId, {
            ...forms.immunization,
            doseNumber: Number(forms.immunization.doseNumber),
            administeredAt: new Date(
              `${forms.immunization.administeredAt}T12:00:00Z`,
            ).toISOString(),
            lotNumber: forms.immunization.lotNumber || undefined,
            site: forms.immunization.site || undefined,
            notes: forms.immunization.notes || undefined,
          })
        : recordKind === "growth"
          ? medfinetClinicalApi.recordGrowth(organizationId, selectedId, {
              measuredAt: new Date(
                `${forms.growth.measuredAt}T12:00:00Z`,
              ).toISOString(),
              weightGrams: forms.growth.weightGrams
                ? Number(forms.growth.weightGrams)
                : undefined,
              heightMillimeters: forms.growth.heightMillimeters
                ? Number(forms.growth.heightMillimeters)
                : undefined,
              muacMillimeters: forms.growth.muacMillimeters
                ? Number(forms.growth.muacMillimeters)
                : undefined,
              vitaminAAdministered: forms.growth.vitaminAAdministered,
              oedemaPresent: forms.growth.oedemaPresent,
              notes: forms.growth.notes || undefined,
              sourceOperationId: crypto.randomUUID(),
            })
          : recordKind === "alert"
            ? medfinetClinicalApi.createAlert(organizationId, selectedId, {
                ...forms.alert,
                severity: forms.alert.severity as
                  "LOW" | "MODERATE" | "HIGH" | "CRITICAL",
              })
            : recordKind === "allergy"
              ? medfinetClinicalApi.recordAllergy(organizationId, selectedId, {
                  ...forms.allergy,
                })
              : medfinetClinicalApi.scheduleAppointment(
                  organizationId,
                  selectedId,
                  {
                    ...forms.appointment,
                    scheduledFor: new Date(
                      forms.appointment.scheduledFor,
                    ).toISOString(),
                    notes: forms.appointment.notes || undefined,
                  },
                );
    await run(() => op, `${recordKind} recorded with an audit event.`);
    setRecordKind(null);
    setForms(initialForms);
  };
  const updateAppointment = (
    id: string,
    status: "COMPLETED" | "CANCELLED" | "MISSED",
  ) => {
    if (!organizationId) return;
    void run(
      () =>
        medfinetClinicalApi.updateAppointmentStatus(organizationId, id, {
          status,
        }),
      `Appointment marked ${status.toLowerCase()}.`,
    );
  };

  const renderRecords = () => {
    if (!timeline) return null;
    if (tab === "summary")
      return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[
            { label: "Immunizations", value: timeline.immunizations.length },
            { label: "Growth checks", value: timeline.growth.length },
            {
              label: "Active alerts",
              value: timeline.alerts.filter((x) => x.status === "ACTIVE")
                .length,
            },
            {
              label: "Active allergies",
              value: timeline.allergies.filter((x) => x.status === "ACTIVE")
                .length,
            },
            { label: "Appointments", value: timeline.appointments.length },
          ].map((item) => (
            <article
              key={item.label}
              className="rounded-xl border bg-white p-5"
            >
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className="mt-2 text-3xl font-bold">{item.value}</p>
            </article>
          ))}
        </div>
      );
    if (tab === "schedule") {
      const overdue =
        schedule?.recommendations.filter((x) => x.status === "OVERDUE") || [];
      const upcoming =
        schedule?.recommendations.filter((x) =>
          ["DUE", "UPCOMING", "NOT_ELIGIBLE", "BLOCKED_PREVIOUS_DOSE"].includes(
            x.status,
          ),
        ) || [];
      return (
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-xl border border-amber-200 bg-amber-50 p-5">
            <h3 className="font-bold text-amber-950">Overdue</h3>
            {overdue.length ? (
              overdue.map((x) => (
                <p
                  key={`${x.vaccineCode}-${x.doseNumber}`}
                  className="mt-2 text-sm"
                >
                  {x.vaccineCode} dose {x.doseNumber} · due{" "}
                  {new Date(x.dueAt).toLocaleDateString()}
                </p>
              ))
            ) : (
              <p className="mt-2 text-sm">No overdue doses.</p>
            )}
          </section>
          <section className="rounded-xl border bg-white p-5">
            <h3 className="font-bold">Upcoming</h3>
            {upcoming.length ? (
              upcoming.map((x) => (
                <p
                  key={`${x.vaccineCode}-${x.doseNumber}`}
                  className="mt-2 text-sm"
                >
                  {x.vaccineCode} dose {x.doseNumber} · {x.status} ·{" "}
                  {new Date(x.dueAt).toLocaleDateString()}
                </p>
              ))
            ) : (
              <p className="mt-2 text-sm">No upcoming doses.</p>
            )}
          </section>
        </div>
      );
    }
    const rows = timeline[tab];
    return (
      <div className="space-y-3">
        {rows.map((raw) => {
          const item = raw as Record<string, unknown> & {
            id: string;
            status: string;
          };
          return (
            <article key={item.id} className="rounded-xl border bg-white p-4">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <p className="font-semibold">
                    {tab === "immunizations"
                      ? `${item.vaccineCode} · dose ${item.doseNumber}`
                      : tab === "growth"
                        ? `${item.weightGrams ? `${Number(item.weightGrams) / 1000} kg` : "No weight"} · ${item.heightMillimeters ? `${item.heightMillimeters} mm` : "No height"}`
                        : tab === "alerts"
                          ? `${item.category} · ${item.severity}`
                          : tab === "allergies"
                            ? `${item.substanceDisplay} · ${item.severity}`
                            : `${item.kind}`}
                  </p>
                  <p className="text-sm text-slate-600">
                    {String(item.summary || item.reaction || item.notes || "")}
                  </p>
                  <p className="text-xs text-slate-500">
                    {item.status} ·{" "}
                    {new Date(
                      String(
                        item.administeredAt ||
                          item.measuredAt ||
                          item.scheduledFor ||
                          "",
                      ),
                    ).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tab === "alerts" && item.status === "ACTIVE" && (
                    <button
                      className={button}
                      onClick={() =>
                        setResolveTarget({ kind: "alert", id: item.id })
                      }
                    >
                      Resolve
                    </button>
                  )}
                  {tab === "allergies" && item.status === "ACTIVE" && (
                    <button
                      className={button}
                      onClick={() =>
                        setResolveTarget({ kind: "allergy", id: item.id })
                      }
                    >
                      Resolve
                    </button>
                  )}
                  {tab === "appointments" && item.status === "SCHEDULED" && (
                    <>
                      {(["COMPLETED", "MISSED", "CANCELLED"] as const).map(
                        (status) => (
                          <button
                            key={status}
                            className={button}
                            onClick={() => updateAppointment(item.id, status)}
                          >
                            {status.toLowerCase()}
                          </button>
                        ),
                      )}
                    </>
                  )}
                </div>
              </div>
            </article>
          );
        })}
        {!rows.length && (
          <p className="rounded-xl border border-dashed bg-white p-8 text-center text-sm text-slate-500">
            No {tab} recorded.
          </p>
        )}
      </div>
    );
  };

  return (
    <main className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-cyan-700">
            Longitudinal child health record
          </p>
          <h1 className="text-3xl font-bold text-slate-950 dark:text-white">
            Clinical operations
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Search, register, review and record care with append-only audit
            evidence.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className={button}
            onClick={() => void Promise.all([loadChildren(), loadRecord()])}
          >
            <RefreshCw className="mr-2 inline h-4 w-4" />
            Refresh
          </button>
          <button className={primary} onClick={() => setChildOpen(true)}>
            <UserRoundPlus className="mr-2 inline h-4 w-4" />
            Register child
          </button>
        </div>
      </div>
      {notice && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900"
        >
          {notice}
        </div>
      )}
      <div className="grid gap-6 xl:grid-cols-[300px_1fr]">
        <aside className="rounded-xl border bg-white p-4">
          <label className="relative block">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              aria-label="Search children"
              className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name or Medfinet ID"
            />
          </label>
          <div className="mt-3 max-h-[65vh] space-y-2 overflow-y-auto">
            {filteredChildren.map((child) => (
              <button
                key={child.id}
                type="button"
                onClick={() => setSelectedId(child.id)}
                className={`w-full rounded-lg p-3 text-left ${selectedId === child.id ? "bg-cyan-50 ring-1 ring-cyan-300" : "hover:bg-slate-50"}`}
              >
                <p className="font-semibold">
                  {child.firstName} {child.lastName}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {child.medfinetId}
                </p>
              </button>
            ))}
          </div>
        </aside>
        <section>
          <PageFeedback
            loading={loading}
            error={error}
            empty={!selected}
            onRetry={() => void Promise.all([loadChildren(), loadRecord()])}
          >
            {selected && (
              <>
                <div className="rounded-xl border bg-white p-5">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div>
                      <p className="text-xs font-bold uppercase text-cyan-700">
                        {selected.medfinetId}
                      </p>
                      <h2 className="text-2xl font-bold">
                        {selected.firstName} {selected.lastName}
                      </h2>
                      <p className="text-sm text-slate-600">
                        Born{" "}
                        {new Date(selected.dateOfBirth).toLocaleDateString()} ·{" "}
                        {selected.sex}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        className={button}
                        onClick={() => setRecordKind("immunization")}
                      >
                        <Syringe className="mr-2 inline h-4 w-4" />
                        Immunization
                      </button>
                      <button
                        className={button}
                        onClick={() => setRecordKind("growth")}
                      >
                        <Activity className="mr-2 inline h-4 w-4" />
                        Growth
                      </button>
                      <button
                        className={button}
                        onClick={() => setRecordKind("alert")}
                      >
                        <AlertTriangle className="mr-2 inline h-4 w-4" />
                        Alert
                      </button>
                      <button
                        className={button}
                        onClick={() => setRecordKind("allergy")}
                      >
                        <Plus className="mr-2 inline h-4 w-4" />
                        Allergy
                      </button>
                      <button
                        className={primary}
                        onClick={() => setRecordKind("appointment")}
                      >
                        <CalendarPlus className="mr-2 inline h-4 w-4" />
                        Appointment
                      </button>
                    </div>
                  </div>
                </div>
                <div className="my-5 flex gap-2 overflow-x-auto">
                  {(
                    [
                      "summary",
                      "immunizations",
                      "growth",
                      "alerts",
                      "allergies",
                      "appointments",
                      "schedule",
                    ] as const
                  ).map((value) => (
                    <button
                      key={value}
                      className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === value ? "bg-slate-950 text-white" : "border bg-white"}`}
                      onClick={() => setTab(value)}
                    >
                      {value}
                    </button>
                  ))}
                </div>
                {renderRecords()}
              </>
            )}
          </PageFeedback>
        </section>
      </div>
      <Modal
        open={childOpen}
        onClose={() => setChildOpen(false)}
        title="Register child"
      >
        <form
          className="space-y-4"
          onSubmit={(event) => void createChild(event)}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              First name
              <input
                required
                className={input}
                value={childForm.firstName}
                onChange={(e) =>
                  setChildForm({ ...childForm, firstName: e.target.value })
                }
              />
            </label>
            <label className="text-sm font-semibold">
              Last name
              <input
                required
                className={input}
                value={childForm.lastName}
                onChange={(e) =>
                  setChildForm({ ...childForm, lastName: e.target.value })
                }
              />
            </label>
          </div>
          <label className="block text-sm font-semibold">
            Date of birth
            <input
              required
              type="date"
              max={new Date().toISOString().slice(0, 10)}
              className={input}
              value={childForm.dateOfBirth}
              onChange={(e) =>
                setChildForm({ ...childForm, dateOfBirth: e.target.value })
              }
            />
          </label>
          <label className="block text-sm font-semibold">
            Sex
            <select
              className={input}
              value={childForm.sex}
              onChange={(e) =>
                setChildForm({ ...childForm, sex: e.target.value })
              }
            >
              <option>FEMALE</option>
              <option>MALE</option>
              <option>INTERSEX</option>
              <option>UNKNOWN</option>
            </select>
          </label>
          <button className={primary} disabled={busy}>
            Register child
          </button>
        </form>
      </Modal>
      <Modal
        open={Boolean(recordKind)}
        onClose={() => setRecordKind(null)}
        title={`Record ${recordKind || "clinical event"}`}
      >
        <form
          className="space-y-4"
          onSubmit={(event) => void createRecord(event)}
        >
          {recordKind === "immunization" ? (
            <>
              <label className="block text-sm font-semibold">
                Vaccine code
                <input
                  required
                  className={input}
                  value={forms.immunization.vaccineCode}
                  onChange={(e) =>
                    setForms({
                      ...forms,
                      immunization: {
                        ...forms.immunization,
                        vaccineCode: e.target.value,
                      },
                    })
                  }
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold">
                  Dose
                  <input
                    required
                    type="number"
                    min="1"
                    max="20"
                    className={input}
                    value={forms.immunization.doseNumber}
                    onChange={(e) =>
                      setForms({
                        ...forms,
                        immunization: {
                          ...forms.immunization,
                          doseNumber: e.target.value,
                        },
                      })
                    }
                  />
                </label>
                <label className="text-sm font-semibold">
                  Administered
                  <input
                    required
                    type="date"
                    max={new Date().toISOString().slice(0, 10)}
                    className={input}
                    value={forms.immunization.administeredAt}
                    onChange={(e) =>
                      setForms({
                        ...forms,
                        immunization: {
                          ...forms.immunization,
                          administeredAt: e.target.value,
                        },
                      })
                    }
                  />
                </label>
              </div>
              <label className="block text-sm font-semibold">
                Lot number
                <input
                  className={input}
                  value={forms.immunization.lotNumber}
                  onChange={(e) =>
                    setForms({
                      ...forms,
                      immunization: {
                        ...forms.immunization,
                        lotNumber: e.target.value,
                      },
                    })
                  }
                />
              </label>
            </>
          ) : recordKind === "growth" ? (
            <>
              <label className="block text-sm font-semibold">
                Measured
                <input
                  required
                  type="date"
                  className={input}
                  value={forms.growth.measuredAt}
                  onChange={(e) =>
                    setForms({
                      ...forms,
                      growth: { ...forms.growth, measuredAt: e.target.value },
                    })
                  }
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="text-sm font-semibold">
                  Weight (g)
                  <input
                    type="number"
                    min="1"
                    className={input}
                    value={forms.growth.weightGrams}
                    onChange={(e) =>
                      setForms({
                        ...forms,
                        growth: {
                          ...forms.growth,
                          weightGrams: e.target.value,
                        },
                      })
                    }
                  />
                </label>
                <label className="text-sm font-semibold">
                  Height (mm)
                  <input
                    type="number"
                    min="1"
                    className={input}
                    value={forms.growth.heightMillimeters}
                    onChange={(e) =>
                      setForms({
                        ...forms,
                        growth: {
                          ...forms.growth,
                          heightMillimeters: e.target.value,
                        },
                      })
                    }
                  />
                </label>
                <label className="text-sm font-semibold">
                  MUAC (mm)
                  <input
                    type="number"
                    min="1"
                    className={input}
                    value={forms.growth.muacMillimeters}
                    onChange={(e) =>
                      setForms({
                        ...forms,
                        growth: {
                          ...forms.growth,
                          muacMillimeters: e.target.value,
                        },
                      })
                    }
                  />
                </label>
              </div>
              <label className="flex gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={forms.growth.vitaminAAdministered}
                  onChange={(e) =>
                    setForms({
                      ...forms,
                      growth: {
                        ...forms.growth,
                        vitaminAAdministered: e.target.checked,
                      },
                    })
                  }
                />
                Vitamin A administered
              </label>
              <label className="flex gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={forms.growth.oedemaPresent}
                  onChange={(e) =>
                    setForms({
                      ...forms,
                      growth: {
                        ...forms.growth,
                        oedemaPresent: e.target.checked,
                      },
                    })
                  }
                />
                Oedema present
              </label>
            </>
          ) : recordKind === "alert" ? (
            <>
              <label className="block text-sm font-semibold">
                Category
                <input
                  required
                  className={input}
                  value={forms.alert.category}
                  onChange={(e) =>
                    setForms({
                      ...forms,
                      alert: { ...forms.alert, category: e.target.value },
                    })
                  }
                />
              </label>
              <label className="block text-sm font-semibold">
                Severity
                <select
                  className={input}
                  value={forms.alert.severity}
                  onChange={(e) =>
                    setForms({
                      ...forms,
                      alert: { ...forms.alert, severity: e.target.value },
                    })
                  }
                >
                  <option>LOW</option>
                  <option>MODERATE</option>
                  <option>HIGH</option>
                  <option>CRITICAL</option>
                </select>
              </label>
              <label className="block text-sm font-semibold">
                Summary
                <textarea
                  required
                  className={input}
                  value={forms.alert.summary}
                  onChange={(e) =>
                    setForms({
                      ...forms,
                      alert: { ...forms.alert, summary: e.target.value },
                    })
                  }
                />
              </label>
              <label className="flex gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={forms.alert.emergencyVisible}
                  onChange={(e) =>
                    setForms({
                      ...forms,
                      alert: {
                        ...forms.alert,
                        emergencyVisible: e.target.checked,
                      },
                    })
                  }
                />
                Visible in emergency profile
              </label>
            </>
          ) : recordKind === "allergy" ? (
            <>
              <label className="block text-sm font-semibold">
                Substance
                <input
                  required
                  className={input}
                  value={forms.allergy.substanceDisplay}
                  onChange={(e) =>
                    setForms({
                      ...forms,
                      allergy: {
                        ...forms.allergy,
                        substanceDisplay: e.target.value,
                      },
                    })
                  }
                />
              </label>
              <label className="block text-sm font-semibold">
                Reaction
                <textarea
                  className={input}
                  value={forms.allergy.reaction}
                  onChange={(e) =>
                    setForms({
                      ...forms,
                      allergy: { ...forms.allergy, reaction: e.target.value },
                    })
                  }
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold">
                  Severity
                  <select
                    className={input}
                    value={forms.allergy.severity}
                    onChange={(e) =>
                      setForms({
                        ...forms,
                        allergy: { ...forms.allergy, severity: e.target.value },
                      })
                    }
                  >
                    <option>LOW</option>
                    <option>MODERATE</option>
                    <option>HIGH</option>
                    <option>CRITICAL</option>
                  </select>
                </label>
                <label className="text-sm font-semibold">
                  Criticality
                  <select
                    className={input}
                    value={forms.allergy.criticality}
                    onChange={(e) =>
                      setForms({
                        ...forms,
                        allergy: {
                          ...forms.allergy,
                          criticality: e.target.value,
                        },
                      })
                    }
                  >
                    <option>LOW</option>
                    <option>HIGH</option>
                    <option>UNABLE_TO_ASSESS</option>
                  </select>
                </label>
              </div>
            </>
          ) : recordKind === "appointment" ? (
            <>
              <label className="block text-sm font-semibold">
                Visit kind
                <input
                  required
                  className={input}
                  value={forms.appointment.kind}
                  onChange={(e) =>
                    setForms({
                      ...forms,
                      appointment: {
                        ...forms.appointment,
                        kind: e.target.value,
                      },
                    })
                  }
                />
              </label>
              <label className="block text-sm font-semibold">
                Scheduled date and time
                <input
                  required
                  type="datetime-local"
                  className={input}
                  value={forms.appointment.scheduledFor}
                  onChange={(e) =>
                    setForms({
                      ...forms,
                      appointment: {
                        ...forms.appointment,
                        scheduledFor: e.target.value,
                      },
                    })
                  }
                />
              </label>
              <label className="block text-sm font-semibold">
                Notes
                <textarea
                  className={input}
                  value={forms.appointment.notes}
                  onChange={(e) =>
                    setForms({
                      ...forms,
                      appointment: {
                        ...forms.appointment,
                        notes: e.target.value,
                      },
                    })
                  }
                />
              </label>
            </>
          ) : null}
          <button className={primary} disabled={busy}>
            Save clinical record
          </button>
        </form>
      </Modal>
      <ActionReasonModal
        open={Boolean(resolveTarget)}
        title={`Resolve ${resolveTarget?.kind || "clinical record"}`}
        description="Resolution is audit recorded and does not delete the original clinical record."
        confirmLabel="Resolve record"
        busy={busy}
        onClose={() => setResolveTarget(null)}
        onConfirm={async (reason) => {
          if (!organizationId || !resolveTarget) return;
          const target = resolveTarget;
          await run(
            () =>
              target.kind === "alert"
                ? medfinetClinicalApi.resolveAlert(organizationId, target.id, {
                    status: "RESOLVED",
                    reason,
                  })
                : medfinetClinicalApi.resolveAllergy(
                    organizationId,
                    target.id,
                    { status: "RESOLVED", resolutionReason: reason },
                  ),
            `${target.kind} resolved.`,
          );
          setResolveTarget(null);
        }}
      />
    </main>
  );
}
