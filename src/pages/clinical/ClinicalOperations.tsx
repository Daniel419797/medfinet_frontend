import {
  type FormEvent,
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
  MapPin,
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
import {
  medfinetClinicalApi,
  type ClinicalTimeline,
} from "../../services/medfinetClinicalApi";
import { medfinetIdentityApi } from "../../services/medfinetIdentityApi";
import {
  medfinetFacilityApi,
  type MedfinetFacility,
} from "../../services/medfinetFacilityApi";

type Child = Awaited<
  ReturnType<typeof medfinetIdentityApi.listChildren>
>["items"][number];
type Timeline = ClinicalTimeline;
type Immunization = Timeline["immunizations"][number];
type RecordKind =
  | "immunization"
  | "growth"
  | "alert"
  | "allergy"
  | "appointment";
type Tab =
  | "summary"
  | "immunizations"
  | "growth"
  | "alerts"
  | "allergies"
  | "appointments"
  | "schedule";

type VaccinationMetadataForm = {
  facilitySelection: string;
  facilityName: string;
  state: string;
  lga: string;
  ward: string;
  vaccinatorMode: "SELF" | "OTHER";
  vaccinatorName: string;
};

const MANUAL_FACILITY = "__MANUAL__";
const fieldClass =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm";
const secondaryButton =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold disabled:opacity-50";
const primaryButton =
  "rounded-lg bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function emptyVaccinationMetadata(): VaccinationMetadataForm {
  return {
    facilitySelection: "",
    facilityName: "",
    state: "",
    lga: "",
    ward: "",
    vaccinatorMode: "SELF",
    vaccinatorName: "",
  };
}

function makeInitialForms() {
  return {
    immunization: {
      vaccineCode: "",
      doseNumber: "1",
      administeredAt: today(),
      lotNumber: "",
      route: "IM",
      site: "",
      notes: "",
      ...emptyVaccinationMetadata(),
    },
    growth: {
      measuredAt: today(),
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
}

function locationFromFacility(facility: MedfinetFacility | undefined) {
  return {
    facilityName: facility?.name || "",
    state: facility?.state || facility?.administrativeArea || "",
    lga: facility?.lga || "",
    ward: facility?.ward || "",
  };
}

function metadataPayload(form: VaccinationMetadataForm) {
  return {
    ...(form.facilitySelection && form.facilitySelection !== MANUAL_FACILITY
      ? { facilityId: form.facilitySelection }
      : { facilityName: form.facilityName.trim() }),
    state: form.state.trim(),
    lga: form.lga.trim(),
    ward: form.ward.trim(),
    vaccinatorMode: form.vaccinatorMode,
    ...(form.vaccinatorMode === "OTHER"
      ? { vaccinatorName: form.vaccinatorName.trim() }
      : {}),
  };
}

function certificateMetadataComplete(item: Immunization) {
  const metadata = item.certificateMetadata;
  return Boolean(
    metadata?.facilityName
      && metadata.state
      && metadata.lga
      && metadata.ward
      && metadata.vaccinatorName,
  );
}

function VaccinationMetadataFields({
  value,
  facilities,
  currentUserName,
  onChange,
  historical = false,
}: {
  value: VaccinationMetadataForm;
  facilities: MedfinetFacility[];
  currentUserName: string;
  onChange: (next: VaccinationMetadataForm) => void;
  historical?: boolean;
}) {
  const selectedFacility = facilities.find(
    (facility) => facility.id === value.facilitySelection,
  );
  const facilityIncomplete = Boolean(
    selectedFacility
      && (!selectedFacility.state || !selectedFacility.lga || !selectedFacility.ward),
  );

  return (
    <div className="space-y-4 rounded-xl border border-cyan-100 bg-cyan-50/50 p-4">
      <div>
        <p className="font-semibold text-slate-900">Certificate details</p>
        <p className="mt-1 text-xs leading-5 text-slate-600">
          These values are snapshotted with the vaccination and are used on its
          certificate. The person entering the record is audited separately from
          the person who actually administered the vaccine.
        </p>
      </div>
      {historical && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs font-medium leading-5 text-amber-900">
          This is a historical correction. Verify the location and vaccinator from
          the source record before saving; Medfinet will not guess missing values.
        </p>
      )}
      <label className="block text-sm font-semibold">
        Health facility
        <select
          required
          className={fieldClass}
          value={value.facilitySelection}
          onChange={(event) => {
            const facilitySelection = event.target.value;
            const facility = facilities.find((row) => row.id === facilitySelection);
            const location = locationFromFacility(facility);
            onChange({
              ...value,
              facilitySelection,
              facilityName:
                facilitySelection === MANUAL_FACILITY ? "" : location.facilityName,
              state: facilitySelection === MANUAL_FACILITY ? "" : location.state,
              lga: facilitySelection === MANUAL_FACILITY ? "" : location.lga,
              ward: facilitySelection === MANUAL_FACILITY ? "" : location.ward,
            });
          }}
        >
          <option value="">Select facility</option>
          {facilities.map((facility) => (
            <option key={facility.id} value={facility.id}>
              {facility.name}
            </option>
          ))}
          <option value={MANUAL_FACILITY}>Outreach / external location</option>
        </select>
      </label>
      {value.facilitySelection === MANUAL_FACILITY && (
        <label className="block text-sm font-semibold">
          Facility / vaccination site name
          <input
            required
            className={fieldClass}
            value={value.facilityName}
            onChange={(event) => onChange({ ...value, facilityName: event.target.value })}
          />
        </label>
      )}
      {facilityIncomplete && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          This facility does not yet have a complete State, LGA and Ward profile.
          Confirm the missing values below for this vaccination, and ask an admin
          to update the facility in Organization → Facilities.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="text-sm font-semibold">
          State
          <input
            required
            className={fieldClass}
            value={value.state}
            onChange={(event) => onChange({ ...value, state: event.target.value })}
          />
        </label>
        <label className="text-sm font-semibold">
          LGA
          <input
            required
            className={fieldClass}
            value={value.lga}
            onChange={(event) => onChange({ ...value, lga: event.target.value })}
          />
        </label>
        <label className="text-sm font-semibold">
          Ward
          <input
            required
            className={fieldClass}
            value={value.ward}
            onChange={(event) => onChange({ ...value, ward: event.target.value })}
          />
        </label>
      </div>
      <label className="block text-sm font-semibold">
        Who administered this vaccine?
        <select
          className={fieldClass}
          value={value.vaccinatorMode}
          onChange={(event) =>
            onChange({
              ...value,
              vaccinatorMode: event.target.value as "SELF" | "OTHER",
              vaccinatorName:
                event.target.value === "SELF" ? "" : value.vaccinatorName,
            })
          }
        >
          <option value="SELF">Me — {currentUserName || "current account"}</option>
          <option value="OTHER">Another / external vaccinator</option>
        </select>
      </label>
      {value.vaccinatorMode === "OTHER" && (
        <label className="block text-sm font-semibold">
          Vaccinator name
          <input
            required
            className={fieldClass}
            value={value.vaccinatorName}
            onChange={(event) => onChange({ ...value, vaccinatorName: event.target.value })}
          />
        </label>
      )}
    </div>
  );
}

export default function ClinicalOperations() {
  const { organizationId, user } = useContext(UserContext);
  const [children, setChildren] = useState<Child[]>([]);
  const [facilities, setFacilities] = useState<MedfinetFacility[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [timeline, setTimeline] = useState<Timeline | null>(null);
  const [schedule, setSchedule] = useState<Awaited<
    ReturnType<typeof medfinetClinicalApi.evaluateSchedule>
  > | null>(null);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("summary");
  const [recordKind, setRecordKind] = useState<RecordKind | null>(null);
  const [childOpen, setChildOpen] = useState(false);
  const [resolveTarget, setResolveTarget] = useState<{
    kind: "alert" | "allergy";
    id: string;
  } | null>(null);
  const [amendTarget, setAmendTarget] = useState<Immunization | null>(null);
  const [amendForm, setAmendForm] = useState<
    VaccinationMetadataForm & { reason: string }
  >({ ...emptyVaccinationMetadata(), reason: "" });
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
  const [forms, setForms] = useState(makeInitialForms);
  const selected = children.find((child) => child.id === selectedId) || null;

  const loadChildrenAndFacilities = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setError(null);
    try {
      const [childrenResult, facilityRows] = await Promise.all([
        medfinetIdentityApi.listChildren(organizationId, { limit: 100 }),
        medfinetFacilityApi.list(organizationId),
      ]);
      setChildren(childrenResult.items);
      setFacilities(facilityRows);
      setSelectedId((current) => current || childrenResult.items[0]?.id || "");
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
    void loadChildrenAndFacilities();
  }, [loadChildrenAndFacilities]);
  useEffect(() => {
    void loadRecord();
  }, [loadRecord]);

  const filteredChildren = useMemo(() => {
    const value = query.trim().toLowerCase();
    return value
      ? children.filter(
          (child) =>
            child.medfinetId.toLowerCase().includes(value) ||
            `${child.firstName} ${child.lastName}`.toLowerCase().includes(value),
        )
      : children;
  }, [children, query]);

  async function run(operation: () => Promise<unknown>, message: string) {
    setBusy(true);
    setError(null);
    try {
      await operation();
      setNotice(message);
      await loadRecord();
      return true;
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Clinical operation failed",
      );
      return false;
    } finally {
      setBusy(false);
    }
  }

  function openRecord(kind: RecordKind) {
    if (kind === "immunization") {
      const firstFacility = facilities[0];
      const location = locationFromFacility(firstFacility);
      setForms((current) => ({
        ...current,
        immunization: {
          ...current.immunization,
          facilitySelection: firstFacility?.id || MANUAL_FACILITY,
          facilityName: firstFacility ? location.facilityName : "",
          state: firstFacility ? location.state : "",
          lga: firstFacility ? location.lga : "",
          ward: firstFacility ? location.ward : "",
          vaccinatorMode: "SELF",
          vaccinatorName: "",
        },
      }));
    }
    setRecordKind(kind);
  }

  async function createChild(event: FormEvent) {
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
      setChildForm({ firstName: "", lastName: "", dateOfBirth: "", sex: "UNKNOWN" });
      await loadChildrenAndFacilities();
      setSelectedId(child.id);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to register child",
      );
    } finally {
      setBusy(false);
    }
  }

  async function createRecord(event: FormEvent) {
    event.preventDefault();
    if (!organizationId || !selectedId || !recordKind) return;
    let operation: Promise<unknown>;
    if (recordKind === "immunization") {
      const form = forms.immunization;
      operation = medfinetClinicalApi.recordImmunization(
        organizationId,
        selectedId,
        {
          vaccineCode: form.vaccineCode.trim(),
          doseNumber: Number(form.doseNumber),
          administeredAt: new Date(`${form.administeredAt}T12:00:00Z`).toISOString(),
          lotNumber: form.lotNumber.trim() || undefined,
          route: form.route.trim() || undefined,
          site: form.site.trim() || undefined,
          notes: form.notes.trim() || undefined,
          sourceOperationId: crypto.randomUUID(),
          ...metadataPayload(form),
        },
      );
    } else if (recordKind === "growth") {
      operation = medfinetClinicalApi.recordGrowth(organizationId, selectedId, {
        measuredAt: new Date(`${forms.growth.measuredAt}T12:00:00Z`).toISOString(),
        weightGrams: forms.growth.weightGrams ? Number(forms.growth.weightGrams) : undefined,
        heightMillimeters: forms.growth.heightMillimeters ? Number(forms.growth.heightMillimeters) : undefined,
        muacMillimeters: forms.growth.muacMillimeters ? Number(forms.growth.muacMillimeters) : undefined,
        vitaminAAdministered: forms.growth.vitaminAAdministered,
        oedemaPresent: forms.growth.oedemaPresent,
        notes: forms.growth.notes.trim() || undefined,
        sourceOperationId: crypto.randomUUID(),
      });
    } else if (recordKind === "alert") {
      operation = medfinetClinicalApi.createAlert(organizationId, selectedId, {
        ...forms.alert,
        severity: forms.alert.severity as "LOW" | "MODERATE" | "HIGH" | "CRITICAL",
      });
    } else if (recordKind === "allergy") {
      operation = medfinetClinicalApi.recordAllergy(organizationId, selectedId, {
        ...forms.allergy,
      });
    } else {
      operation = medfinetClinicalApi.scheduleAppointment(
        organizationId,
        selectedId,
        {
          ...forms.appointment,
          scheduledFor: new Date(forms.appointment.scheduledFor).toISOString(),
          notes: forms.appointment.notes.trim() || undefined,
        },
      );
    }
    const saved = await run(
      () => operation,
      `${recordKind} recorded with an audit event.`,
    );
    if (saved) {
      setRecordKind(null);
      setForms(makeInitialForms());
    }
  }

  function openAmendment(item: Immunization) {
    const metadata = item.certificateMetadata;
    const facilityId = metadata?.facilityId || item.facilityId || "";
    const facility = facilities.find((row) => row.id === facilityId);
    const currentLocation = locationFromFacility(facility);
    const useSelf = Boolean(
      metadata?.vaccinatorSubjectId
        && user?.id
        && metadata.vaccinatorSubjectId === user.id,
    );
    setAmendTarget(item);
    setAmendForm({
      facilitySelection: facilityId || MANUAL_FACILITY,
      facilityName: metadata?.facilityName || (facility ? currentLocation.facilityName : ""),
      state: metadata?.state || currentLocation.state,
      lga: metadata?.lga || currentLocation.lga,
      ward: metadata?.ward || currentLocation.ward,
      vaccinatorMode: useSelf ? "SELF" : "OTHER",
      vaccinatorName: useSelf ? "" : metadata?.vaccinatorName || "",
      reason: "",
    });
  }

  async function saveAmendment(event: FormEvent) {
    event.preventDefault();
    if (!organizationId || !amendTarget) return;
    const reason = amendForm.reason.trim();
    if (reason.length < 3) return;
    const saved = await run(
      () => medfinetClinicalApi.amendImmunization(
        organizationId,
        amendTarget.id,
        {
          reason,
          ...metadataPayload(amendForm),
        },
      ),
      "Vaccination certificate details amended. A new integrity proof has been queued.",
    );
    if (saved) setAmendTarget(null);
  }

  function updateAppointment(
    id: string,
    status: "COMPLETED" | "CANCELLED" | "MISSED",
  ) {
    if (!organizationId) return;
    void run(
      () => medfinetClinicalApi.updateAppointmentStatus(organizationId, id, { status }),
      `Appointment marked ${status.toLowerCase()}.`,
    );
  }

  function renderRecords() {
    if (!timeline) return null;
    if (tab === "summary") {
      const incompleteCertificates = timeline.immunizations.filter(
        (item) => !certificateMetadataComplete(item),
      ).length;
      return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          {[
            { label: "Immunizations", value: timeline.immunizations.length },
            { label: "Certificate details missing", value: incompleteCertificates },
            { label: "Growth checks", value: timeline.growth.length },
            { label: "Active alerts", value: timeline.alerts.filter((x) => x.status === "ACTIVE").length },
            { label: "Active allergies", value: timeline.allergies.filter((x) => x.status === "ACTIVE").length },
            { label: "Appointments", value: timeline.appointments.length },
          ].map((item) => (
            <article key={item.label} className="rounded-xl border bg-white p-5">
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className="mt-2 text-3xl font-bold">{item.value}</p>
            </article>
          ))}
        </div>
      );
    }

    if (tab === "schedule") {
      const overdue = schedule?.recommendations.filter((x) => x.status === "OVERDUE") || [];
      const upcoming = schedule?.recommendations.filter((x) =>
        ["DUE", "UPCOMING", "NOT_ELIGIBLE", "BLOCKED_PREVIOUS_DOSE"].includes(x.status),
      ) || [];
      return (
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-xl border border-amber-200 bg-amber-50 p-5">
            <h3 className="font-bold text-amber-950">Overdue</h3>
            {overdue.length ? overdue.map((item) => (
              <p key={`${item.vaccineCode}-${item.doseNumber}`} className="mt-2 text-sm">
                {item.vaccineCode} dose {item.doseNumber} · due {new Date(item.dueAt).toLocaleDateString()}
              </p>
            )) : <p className="mt-2 text-sm">No overdue doses.</p>}
          </section>
          <section className="rounded-xl border bg-white p-5">
            <h3 className="font-bold">Upcoming</h3>
            {upcoming.length ? upcoming.map((item) => (
              <p key={`${item.vaccineCode}-${item.doseNumber}`} className="mt-2 text-sm">
                {item.vaccineCode} dose {item.doseNumber} · {item.status} · {new Date(item.dueAt).toLocaleDateString()}
              </p>
            )) : <p className="mt-2 text-sm">No upcoming doses.</p>}
          </section>
        </div>
      );
    }

    if (tab === "immunizations") {
      return (
        <div className="space-y-3">
          {timeline.immunizations.map((item) => {
            const complete = certificateMetadataComplete(item);
            return (
              <article key={item.id} className="rounded-xl border bg-white p-4">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                  <div>
                    <p className="font-semibold">{item.vaccineCode} · dose {item.doseNumber}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.status} · {new Date(item.administeredAt).toLocaleString()}
                    </p>
                    {complete ? (
                      <div className="mt-3 text-sm text-slate-700">
                        <p className="flex items-center gap-2 font-medium">
                          <MapPin className="h-4 w-4" />
                          {item.certificateMetadata?.facilityName}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {item.certificateMetadata?.state} · {item.certificateMetadata?.lga} · {item.certificateMetadata?.ward}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Vaccinator: {item.certificateMetadata?.vaccinatorName}
                        </p>
                      </div>
                    ) : (
                      <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-900">
                        Certificate location or vaccinator details were not recorded for this dose. Verify the historical record and amend the certificate details.
                      </p>
                    )}
                  </div>
                  {(["ACTIVE", "AMENDED"].includes(item.status)) && (
                    <button
                      type="button"
                      className={secondaryButton}
                      onClick={() => openAmendment(item)}
                    >
                      {complete ? "Amend certificate details" : "Complete certificate details"}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
          {!timeline.immunizations.length && (
            <p className="rounded-xl border border-dashed bg-white p-8 text-center text-sm text-slate-500">No immunizations recorded.</p>
          )}
        </div>
      );
    }

    if (tab === "growth") {
      return (
        <div className="space-y-3">
          {timeline.growth.map((item) => (
            <article key={item.id} className="rounded-xl border bg-white p-4">
              <p className="font-semibold">
                {item.weightGrams ? `${item.weightGrams / 1000} kg` : "No weight"} · {item.heightMillimeters ? `${item.heightMillimeters} mm` : "No height"}
              </p>
              <p className="text-sm text-slate-600">{item.notes || ""}</p>
              <p className="text-xs text-slate-500">{item.status} · {new Date(item.measuredAt).toLocaleString()}</p>
            </article>
          ))}
          {!timeline.growth.length && <p className="rounded-xl border border-dashed bg-white p-8 text-center text-sm text-slate-500">No growth measurements recorded.</p>}
        </div>
      );
    }

    if (tab === "alerts") {
      return (
        <div className="space-y-3">
          {timeline.alerts.map((item) => (
            <article key={item.id} className="rounded-xl border bg-white p-4">
              <div className="flex items-start justify-between gap-4">
                <div><p className="font-semibold">{item.category} · {item.severity}</p><p className="text-sm text-slate-600">{item.summary}</p><p className="text-xs text-slate-500">{item.status}</p></div>
                {item.status === "ACTIVE" && <button className={secondaryButton} onClick={() => setResolveTarget({ kind: "alert", id: item.id })}>Resolve</button>}
              </div>
            </article>
          ))}
          {!timeline.alerts.length && <p className="rounded-xl border border-dashed bg-white p-8 text-center text-sm text-slate-500">No alerts recorded.</p>}
        </div>
      );
    }

    if (tab === "allergies") {
      return (
        <div className="space-y-3">
          {timeline.allergies.map((item) => (
            <article key={item.id} className="rounded-xl border bg-white p-4">
              <div className="flex items-start justify-between gap-4">
                <div><p className="font-semibold">{item.substanceDisplay} · {item.severity}</p><p className="text-sm text-slate-600">{item.reaction || ""}</p><p className="text-xs text-slate-500">{item.status}</p></div>
                {item.status === "ACTIVE" && <button className={secondaryButton} onClick={() => setResolveTarget({ kind: "allergy", id: item.id })}>Resolve</button>}
              </div>
            </article>
          ))}
          {!timeline.allergies.length && <p className="rounded-xl border border-dashed bg-white p-8 text-center text-sm text-slate-500">No allergies recorded.</p>}
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {timeline.appointments.map((item) => (
          <article key={item.id} className="rounded-xl border bg-white p-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div><p className="font-semibold">{item.kind}</p><p className="text-sm text-slate-600">{item.notes || ""}</p><p className="text-xs text-slate-500">{item.status} · {new Date(item.scheduledFor).toLocaleString()}</p></div>
              {item.status === "SCHEDULED" && (
                <div className="flex flex-wrap gap-2">
                  {(["COMPLETED", "MISSED", "CANCELLED"] as const).map((status) => (
                    <button key={status} className={secondaryButton} onClick={() => updateAppointment(item.id, status)}>{status.toLowerCase()}</button>
                  ))}
                </div>
              )}
            </div>
          </article>
        ))}
        {!timeline.appointments.length && <p className="rounded-xl border border-dashed bg-white p-8 text-center text-sm text-slate-500">No appointments recorded.</p>}
      </div>
    );
  }

  return (
    <main className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-cyan-700">Longitudinal child health record</p>
          <h1 className="text-3xl font-bold text-slate-950 dark:text-white">Clinical operations</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Search, register, review and record care with append-only audit evidence.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className={secondaryButton} onClick={() => void Promise.all([loadChildrenAndFacilities(), loadRecord()])}>
            <RefreshCw className="mr-2 inline h-4 w-4" /> Refresh
          </button>
          <button className={primaryButton} onClick={() => setChildOpen(true)}>
            <UserRoundPlus className="mr-2 inline h-4 w-4" /> Register child
          </button>
        </div>
      </div>

      {notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">{notice}</div>}

      <div className="grid gap-6 xl:grid-cols-[300px_1fr]">
        <aside className="rounded-xl border bg-white p-4">
          <label className="relative block">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input aria-label="Search children" className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name or Medfinet ID" />
          </label>
          <div className="mt-3 max-h-[65vh] space-y-2 overflow-y-auto">
            {filteredChildren.map((child) => (
              <button key={child.id} type="button" onClick={() => setSelectedId(child.id)} className={`w-full rounded-lg p-3 text-left ${selectedId === child.id ? "bg-cyan-50 ring-1 ring-cyan-300" : "hover:bg-slate-50"}`}>
                <p className="font-semibold">{child.firstName} {child.lastName}</p>
                <p className="truncate text-xs text-slate-500">{child.medfinetId}</p>
              </button>
            ))}
          </div>
        </aside>

        <section>
          <PageFeedback loading={loading} error={error} empty={!selected} onRetry={() => void Promise.all([loadChildrenAndFacilities(), loadRecord()])}>
            {selected && (
              <>
                <div className="rounded-xl border bg-white p-5">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div>
                      <p className="text-xs font-bold uppercase text-cyan-700">{selected.medfinetId}</p>
                      <h2 className="text-2xl font-bold">{selected.firstName} {selected.lastName}</h2>
                      <p className="text-sm text-slate-600">Born {new Date(selected.dateOfBirth).toLocaleDateString()} · {selected.sex}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button className={secondaryButton} onClick={() => openRecord("immunization")}><Syringe className="mr-2 inline h-4 w-4" /> Immunization</button>
                      <button className={secondaryButton} onClick={() => openRecord("growth")}><Activity className="mr-2 inline h-4 w-4" /> Growth</button>
                      <button className={secondaryButton} onClick={() => openRecord("alert")}><AlertTriangle className="mr-2 inline h-4 w-4" /> Alert</button>
                      <button className={secondaryButton} onClick={() => openRecord("allergy")}><Plus className="mr-2 inline h-4 w-4" /> Allergy</button>
                      <button className={primaryButton} onClick={() => openRecord("appointment")}><CalendarPlus className="mr-2 inline h-4 w-4" /> Appointment</button>
                    </div>
                  </div>
                </div>
                <div className="my-5 flex gap-2 overflow-x-auto">
                  {(["summary", "immunizations", "growth", "alerts", "allergies", "appointments", "schedule"] as const).map((value) => (
                    <button key={value} className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === value ? "bg-slate-950 text-white" : "border bg-white"}`} onClick={() => setTab(value)}>{value}</button>
                  ))}
                </div>
                {renderRecords()}
              </>
            )}
          </PageFeedback>
        </section>
      </div>

      <Modal open={childOpen} onClose={() => setChildOpen(false)} title="Register child">
        <form className="space-y-4" onSubmit={(event) => void createChild(event)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold">First name<input required className={fieldClass} value={childForm.firstName} onChange={(event) => setChildForm({ ...childForm, firstName: event.target.value })} /></label>
            <label className="text-sm font-semibold">Last name<input required className={fieldClass} value={childForm.lastName} onChange={(event) => setChildForm({ ...childForm, lastName: event.target.value })} /></label>
          </div>
          <label className="block text-sm font-semibold">Date of birth<input required type="date" max={today()} className={fieldClass} value={childForm.dateOfBirth} onChange={(event) => setChildForm({ ...childForm, dateOfBirth: event.target.value })} /></label>
          <label className="block text-sm font-semibold">Sex<select className={fieldClass} value={childForm.sex} onChange={(event) => setChildForm({ ...childForm, sex: event.target.value })}><option>FEMALE</option><option>MALE</option><option>INTERSEX</option><option>UNKNOWN</option></select></label>
          <button className={primaryButton} disabled={busy}>Register child</button>
        </form>
      </Modal>

      <Modal open={Boolean(recordKind)} onClose={() => !busy && setRecordKind(null)} title={`Record ${recordKind || "clinical event"}`}>
        <form className="space-y-4" onSubmit={(event) => void createRecord(event)}>
          {recordKind === "immunization" ? (
            <>
              <label className="block text-sm font-semibold">Vaccine code<input required className={fieldClass} value={forms.immunization.vaccineCode} onChange={(event) => setForms((current) => ({ ...current, immunization: { ...current.immunization, vaccineCode: event.target.value } }))} /></label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold">Dose<input required type="number" min="1" max="20" className={fieldClass} value={forms.immunization.doseNumber} onChange={(event) => setForms((current) => ({ ...current, immunization: { ...current.immunization, doseNumber: event.target.value } }))} /></label>
                <label className="text-sm font-semibold">Administered<input required type="date" max={today()} className={fieldClass} value={forms.immunization.administeredAt} onChange={(event) => setForms((current) => ({ ...current, immunization: { ...current.immunization, administeredAt: event.target.value } }))} /></label>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="text-sm font-semibold">Lot number<input className={fieldClass} value={forms.immunization.lotNumber} onChange={(event) => setForms((current) => ({ ...current, immunization: { ...current.immunization, lotNumber: event.target.value } }))} /></label>
                <label className="text-sm font-semibold">Route<input className={fieldClass} value={forms.immunization.route} onChange={(event) => setForms((current) => ({ ...current, immunization: { ...current.immunization, route: event.target.value } }))} /></label>
                <label className="text-sm font-semibold">Site<input className={fieldClass} value={forms.immunization.site} onChange={(event) => setForms((current) => ({ ...current, immunization: { ...current.immunization, site: event.target.value } }))} /></label>
              </div>
              <label className="block text-sm font-semibold">Notes<textarea className={fieldClass} value={forms.immunization.notes} onChange={(event) => setForms((current) => ({ ...current, immunization: { ...current.immunization, notes: event.target.value } }))} /></label>
              <VaccinationMetadataFields
                value={forms.immunization}
                facilities={facilities}
                currentUserName={user?.name || ""}
                onChange={(next) => setForms((current) => ({ ...current, immunization: { ...current.immunization, ...next } }))}
              />
            </>
          ) : recordKind === "growth" ? (
            <>
              <label className="block text-sm font-semibold">Measured<input required type="date" max={today()} className={fieldClass} value={forms.growth.measuredAt} onChange={(event) => setForms((current) => ({ ...current, growth: { ...current.growth, measuredAt: event.target.value } }))} /></label>
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="text-sm font-semibold">Weight (g)<input type="number" min="1" className={fieldClass} value={forms.growth.weightGrams} onChange={(event) => setForms((current) => ({ ...current, growth: { ...current.growth, weightGrams: event.target.value } }))} /></label>
                <label className="text-sm font-semibold">Height (mm)<input type="number" min="1" className={fieldClass} value={forms.growth.heightMillimeters} onChange={(event) => setForms((current) => ({ ...current, growth: { ...current.growth, heightMillimeters: event.target.value } }))} /></label>
                <label className="text-sm font-semibold">MUAC (mm)<input type="number" min="1" className={fieldClass} value={forms.growth.muacMillimeters} onChange={(event) => setForms((current) => ({ ...current, growth: { ...current.growth, muacMillimeters: event.target.value } }))} /></label>
              </div>
              <label className="flex gap-2 text-sm"><input type="checkbox" checked={forms.growth.vitaminAAdministered} onChange={(event) => setForms((current) => ({ ...current, growth: { ...current.growth, vitaminAAdministered: event.target.checked } }))} />Vitamin A administered</label>
              <label className="flex gap-2 text-sm"><input type="checkbox" checked={forms.growth.oedemaPresent} onChange={(event) => setForms((current) => ({ ...current, growth: { ...current.growth, oedemaPresent: event.target.checked } }))} />Oedema present</label>
              <label className="block text-sm font-semibold">Notes<textarea className={fieldClass} value={forms.growth.notes} onChange={(event) => setForms((current) => ({ ...current, growth: { ...current.growth, notes: event.target.value } }))} /></label>
            </>
          ) : recordKind === "alert" ? (
            <>
              <label className="block text-sm font-semibold">Category<input required className={fieldClass} value={forms.alert.category} onChange={(event) => setForms((current) => ({ ...current, alert: { ...current.alert, category: event.target.value } }))} /></label>
              <label className="block text-sm font-semibold">Severity<select className={fieldClass} value={forms.alert.severity} onChange={(event) => setForms((current) => ({ ...current, alert: { ...current.alert, severity: event.target.value } }))}><option>LOW</option><option>MODERATE</option><option>HIGH</option><option>CRITICAL</option></select></label>
              <label className="block text-sm font-semibold">Summary<textarea required className={fieldClass} value={forms.alert.summary} onChange={(event) => setForms((current) => ({ ...current, alert: { ...current.alert, summary: event.target.value } }))} /></label>
              <label className="flex gap-2 text-sm"><input type="checkbox" checked={forms.alert.emergencyVisible} onChange={(event) => setForms((current) => ({ ...current, alert: { ...current.alert, emergencyVisible: event.target.checked } }))} />Visible in emergency profile</label>
            </>
          ) : recordKind === "allergy" ? (
            <>
              <label className="block text-sm font-semibold">Substance<input required className={fieldClass} value={forms.allergy.substanceDisplay} onChange={(event) => setForms((current) => ({ ...current, allergy: { ...current.allergy, substanceDisplay: event.target.value } }))} /></label>
              <label className="block text-sm font-semibold">Reaction<input className={fieldClass} value={forms.allergy.reaction} onChange={(event) => setForms((current) => ({ ...current, allergy: { ...current.allergy, reaction: event.target.value } }))} /></label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold">Severity<select className={fieldClass} value={forms.allergy.severity} onChange={(event) => setForms((current) => ({ ...current, allergy: { ...current.allergy, severity: event.target.value } }))}><option>LOW</option><option>MODERATE</option><option>HIGH</option><option>CRITICAL</option></select></label>
                <label className="text-sm font-semibold">Criticality<select className={fieldClass} value={forms.allergy.criticality} onChange={(event) => setForms((current) => ({ ...current, allergy: { ...current.allergy, criticality: event.target.value } }))}><option>LOW</option><option>HIGH</option><option>UNABLE_TO_ASSESS</option></select></label>
              </div>
            </>
          ) : (
            <>
              <label className="block text-sm font-semibold">Appointment kind<input required className={fieldClass} value={forms.appointment.kind} onChange={(event) => setForms((current) => ({ ...current, appointment: { ...current.appointment, kind: event.target.value } }))} /></label>
              <label className="block text-sm font-semibold">Scheduled for<input required type="datetime-local" className={fieldClass} value={forms.appointment.scheduledFor} onChange={(event) => setForms((current) => ({ ...current, appointment: { ...current.appointment, scheduledFor: event.target.value } }))} /></label>
              <label className="block text-sm font-semibold">Notes<textarea className={fieldClass} value={forms.appointment.notes} onChange={(event) => setForms((current) => ({ ...current, appointment: { ...current.appointment, notes: event.target.value } }))} /></label>
            </>
          )}
          <button className={primaryButton} disabled={busy}>{busy ? "Saving…" : "Save record"}</button>
        </form>
      </Modal>

      <Modal
        open={Boolean(amendTarget)}
        onClose={() => !busy && setAmendTarget(null)}
        title="Amend vaccination certificate details"
        description="Use the source vaccination record. Saving creates an amendment and a new cryptographic proof while preserving prior evidence."
      >
        {amendTarget && (
          <form className="space-y-4" onSubmit={(event) => void saveAmendment(event)}>
            <div className="rounded-lg bg-slate-50 p-3 text-sm">
              <strong>{amendTarget.vaccineCode} dose {amendTarget.doseNumber}</strong>
              <p className="mt-1 text-xs text-slate-500">Administered {new Date(amendTarget.administeredAt).toLocaleString()}</p>
            </div>
            <VaccinationMetadataFields
              value={amendForm}
              facilities={facilities}
              currentUserName={user?.name || ""}
              historical={!certificateMetadataComplete(amendTarget)}
              onChange={(next) => setAmendForm((current) => ({ ...current, ...next }))}
            />
            <label className="block text-sm font-semibold">
              Amendment reason
              <textarea
                required
                minLength={3}
                className={fieldClass}
                value={amendForm.reason}
                onChange={(event) => setAmendForm((current) => ({ ...current, reason: event.target.value }))}
                placeholder="Example: Verified original paper vaccination register"
              />
            </label>
            <button className={primaryButton} disabled={busy || amendForm.reason.trim().length < 3}>{busy ? "Saving…" : "Save amendment"}</button>
          </form>
        )}
      </Modal>

      <ActionReasonModal
        open={Boolean(resolveTarget)}
        title={resolveTarget?.kind === "alert" ? "Resolve clinical alert" : "Resolve allergy record"}
        description="A reason is required and will be retained in the audit trail."
        confirmLabel="Resolve"
        busy={busy}
        onClose={() => setResolveTarget(null)}
        onConfirm={async (reason) => {
          if (!organizationId || !resolveTarget) return;
          const target = resolveTarget;
          const saved = await run(
            () => target.kind === "alert"
              ? medfinetClinicalApi.resolveAlert(organizationId, target.id, { status: "RESOLVED", reason })
              : medfinetClinicalApi.resolveAllergy(organizationId, target.id, { status: "RESOLVED", resolutionReason: reason }),
            `${target.kind} resolved.`,
          );
          if (saved) setResolveTarget(null);
        }}
      />
    </main>
  );
}
