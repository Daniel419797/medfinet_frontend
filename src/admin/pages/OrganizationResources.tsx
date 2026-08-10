import { useCallback, useContext, useEffect, useState } from "react";
import { Building2, CalendarRange, MapPin, Plus, Power } from "lucide-react";
import UserContext from "../../contexts/UserContext";
import { Modal } from "../../components/common/Modal";
import { ConfirmActionModal } from "../../components/common/ConfirmActionModal";
import { PageFeedback } from "../../components/common/PageFeedback";
import { medfinetIdentityApi } from "../../services/medfinetIdentityApi";
import {
  medfinetFacilityApi,
  type MedfinetFacility,
} from "../../services/medfinetFacilityApi";

type Programme = Awaited<
  ReturnType<typeof medfinetIdentityApi.listProgrammes>
>[number];

type FacilityForm = {
  name: string;
  code: string;
  state: string;
  lga: string;
  ward: string;
  address: string;
  phone: string;
  openingHours: string;
  programmeCategories: string;
  isTemporary: boolean;
  temporaryUntil: string;
};

const emptyFacility: FacilityForm = {
  name: "",
  code: "",
  state: "",
  lga: "",
  ward: "",
  address: "",
  phone: "",
  openingHours: "",
  programmeCategories: "",
  isTemporary: false,
  temporaryUntil: "",
};
const emptyProgramme = { name: "", code: "", startsAt: "", endsAt: "" };

export default function OrganizationResources() {
  const { organizationId } = useContext(UserContext);
  const [tab, setTab] = useState<"facilities" | "programmes">("facilities");
  const [facilities, setFacilities] = useState<MedfinetFacility[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [facilityOpen, setFacilityOpen] = useState(false);
  const [programmeOpen, setProgrammeOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<MedfinetFacility | null>(null);
  const [editingProgramme, setEditingProgramme] = useState<Programme | null>(null);
  const [facilityForm, setFacilityForm] = useState<FacilityForm>(emptyFacility);
  const [programmeForm, setProgrammeForm] = useState(emptyProgramme);
  const [statusTarget, setStatusTarget] = useState<{
    kind: "facility" | "programme";
    record: MedfinetFacility | Programme;
  } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setError("");
    try {
      const [facilityRows, programmeRows] = await Promise.all([
        medfinetFacilityApi.list(organizationId),
        medfinetIdentityApi.listProgrammes(organizationId),
      ]);
      setFacilities(facilityRows);
      setProgrammes(programmeRows);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to load organization resources",
      );
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    void load();
  }, [load]);

  function openFacility(facility?: MedfinetFacility) {
    setEditingFacility(facility || null);
    setFacilityForm(
      facility
        ? {
            name: facility.name,
            code: facility.code,
            state: facility.state || facility.administrativeArea || "",
            lga: facility.lga || "",
            ward: facility.ward || "",
            address: facility.address || "",
            phone: facility.phone || "",
            openingHours: Object.values(facility.openingHours || {}).join(", "),
            programmeCategories: (facility.programmeCategories || []).join(", "),
            isTemporary: facility.isTemporary,
            temporaryUntil: facility.temporaryUntil?.slice(0, 16) || "",
          }
        : emptyFacility,
    );
    setFacilityOpen(true);
  }

  function openProgramme(programme?: Programme) {
    setEditingProgramme(programme || null);
    setProgrammeForm(
      programme
        ? {
            name: programme.name,
            code: programme.code,
            startsAt: programme.startsAt?.slice(0, 16) || "",
            endsAt: programme.endsAt?.slice(0, 16) || "",
          }
        : emptyProgramme,
    );
    setProgrammeOpen(true);
  }

  async function saveFacility(event: React.FormEvent) {
    event.preventDefault();
    if (!organizationId) return;
    setBusy(true);
    setError("");
    const body = {
      name: facilityForm.name.trim(),
      state: facilityForm.state.trim(),
      lga: facilityForm.lga.trim(),
      ward: facilityForm.ward.trim(),
      address: facilityForm.address.trim(),
      phone: facilityForm.phone.trim(),
      openingHours: facilityForm.openingHours.trim()
        ? { summary: facilityForm.openingHours.trim() }
        : ({} as Record<string, string>),
      programmeCategories: facilityForm.programmeCategories
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      isTemporary: facilityForm.isTemporary,
      temporaryUntil: facilityForm.temporaryUntil
        ? new Date(facilityForm.temporaryUntil).toISOString()
        : undefined,
    };
    try {
      if (editingFacility) {
        await medfinetFacilityApi.update(
          organizationId,
          editingFacility.id,
          body,
        );
      } else {
        await medfinetFacilityApi.create(organizationId, {
          ...body,
          code: facilityForm.code.trim(),
        });
      }
      setFacilityOpen(false);
      setNotice(
        editingFacility
          ? "Facility and certificate location updated."
          : "Facility created with certificate location details.",
      );
      await load();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to save facility",
      );
    } finally {
      setBusy(false);
    }
  }

  async function saveProgramme(event: React.FormEvent) {
    event.preventDefault();
    if (!organizationId) return;
    setBusy(true);
    setError("");
    const body = {
      name: programmeForm.name.trim(),
      startsAt: programmeForm.startsAt
        ? new Date(programmeForm.startsAt).toISOString()
        : undefined,
      endsAt: programmeForm.endsAt
        ? new Date(programmeForm.endsAt).toISOString()
        : undefined,
    };
    try {
      if (editingProgramme) {
        await medfinetIdentityApi.updateProgramme(
          organizationId,
          editingProgramme.id,
          body,
        );
      } else {
        await medfinetIdentityApi.createProgramme(organizationId, {
          ...body,
          code: programmeForm.code.trim(),
        });
      }
      setProgrammeOpen(false);
      setNotice(editingProgramme ? "Programme updated." : "Programme created.");
      await load();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to save programme",
      );
    } finally {
      setBusy(false);
    }
  }

  async function changeActive() {
    if (!organizationId || !statusTarget) return;
    setBusy(true);
    setError("");
    try {
      if (statusTarget.kind === "facility") {
        const facility = statusTarget.record as MedfinetFacility;
        await medfinetFacilityApi.update(organizationId, facility.id, {
          isActive: !facility.isActive,
        });
      } else {
        const programme = statusTarget.record as Programme;
        await medfinetIdentityApi.updateProgramme(organizationId, programme.id, {
          isActive: !programme.isActive,
        });
      }
      setNotice(
        `${statusTarget.record.name} was ${statusTarget.record.isActive ? "archived" : "restored"}.`,
      );
      setStatusTarget(null);
      await load();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to update resource",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-cyan-700">Organization</p>
          <h1 className="text-3xl font-bold text-slate-950">
            Facilities and programmes
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            State, LGA and Ward are stored with each facility so future vaccination
            certificates can use verified location details automatically.
          </p>
        </div>
        <button
          type="button"
          onClick={() => (tab === "facilities" ? openFacility() : openProgramme())}
          className="rounded-lg bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white"
        >
          <Plus className="mr-2 inline h-4 w-4" />
          Add {tab === "facilities" ? "facility" : "programme"}
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

      <div className="mt-6 flex gap-2">
        <button
          type="button"
          onClick={() => setTab("facilities")}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === "facilities" ? "bg-slate-950 text-white" : "border bg-white"}`}
        >
          <Building2 className="mr-2 inline h-4 w-4" /> Facilities
        </button>
        <button
          type="button"
          onClick={() => setTab("programmes")}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === "programmes" ? "bg-slate-950 text-white" : "border bg-white"}`}
        >
          <CalendarRange className="mr-2 inline h-4 w-4" /> Programmes
        </button>
      </div>

      <div className="mt-5">
        <PageFeedback
          loading={loading}
          error={error}
          empty={tab === "facilities" ? !facilities.length : !programmes.length}
          onRetry={() => void load()}
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {(tab === "facilities" ? facilities : programmes).map((record) => {
              const facility = tab === "facilities"
                ? record as MedfinetFacility
                : null;
              const locationComplete = facility
                ? Boolean(facility.state && facility.lga && facility.ward)
                : true;
              return (
                <article
                  key={record.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-bold text-slate-950">{record.name}</h2>
                      <p className="mt-1 text-xs font-medium text-slate-500">{record.code}</p>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${record.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {record.isActive ? "Active" : "Archived"}
                    </span>
                  </div>

                  {facility && (
                    <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                      <p className="flex items-center gap-2 font-semibold">
                        <MapPin className="h-4 w-4" />
                        {facility.state || "State not set"} · {facility.lga || "LGA not set"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Ward: {facility.ward || "Not set"}
                      </p>
                      {!locationComplete && (
                        <p className="mt-2 text-xs font-semibold text-amber-700">
                          Complete State, LGA and Ward before recording new vaccinations here.
                        </p>
                      )}
                    </div>
                  )}

                  <div className="mt-5 flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        facility
                          ? openFacility(facility)
                          : openProgramme(record as Programme)
                      }
                      className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => setStatusTarget({
                        kind: facility ? "facility" : "programme",
                        record,
                      })}
                      className="rounded-lg border border-slate-300 p-2"
                      aria-label={`${record.isActive ? "Archive" : "Restore"} ${record.name}`}
                    >
                      <Power className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </PageFeedback>
      </div>

      <Modal
        open={facilityOpen}
        title={editingFacility ? "Edit facility" : "Create facility"}
        description="These location fields are used on vaccination certificates. Enter the official location, not an estimate."
        onClose={() => !busy && setFacilityOpen(false)}
      >
        <form onSubmit={saveFacility} className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium">
            Facility name
            <input
              required
              value={facilityForm.name}
              onChange={(event) => setFacilityForm((current) => ({ ...current, name: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="text-sm font-medium">
            Facility code
            <input
              required
              disabled={Boolean(editingFacility)}
              value={facilityForm.code}
              onChange={(event) => setFacilityForm((current) => ({ ...current, code: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 disabled:bg-slate-100"
            />
          </label>
          {(["state", "lga", "ward"] as const).map((field) => (
            <label key={field} className="text-sm font-medium">
              {field === "lga" ? "LGA" : field[0].toUpperCase() + field.slice(1)}
              <input
                required
                value={facilityForm[field]}
                onChange={(event) => setFacilityForm((current) => ({
                  ...current,
                  [field]: event.target.value,
                }))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
          ))}
          <label className="text-sm font-medium sm:col-span-2">
            Address
            <input
              value={facilityForm.address}
              onChange={(event) => setFacilityForm((current) => ({ ...current, address: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="text-sm font-medium">
            Phone
            <input
              value={facilityForm.phone}
              onChange={(event) => setFacilityForm((current) => ({ ...current, phone: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="text-sm font-medium">
            Opening hours
            <input
              value={facilityForm.openingHours}
              onChange={(event) => setFacilityForm((current) => ({ ...current, openingHours: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="text-sm font-medium sm:col-span-2">
            Programme categories
            <input
              value={facilityForm.programmeCategories}
              onChange={(event) => setFacilityForm((current) => ({ ...current, programmeCategories: event.target.value }))}
              placeholder="Immunization, nutrition"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={facilityForm.isTemporary}
              onChange={(event) => setFacilityForm((current) => ({ ...current, isTemporary: event.target.checked }))}
            />
            Temporary clinic
          </label>
          {facilityForm.isTemporary && (
            <label className="text-sm font-medium">
              Temporary until
              <input
                required
                type="datetime-local"
                value={facilityForm.temporaryUntil}
                onChange={(event) => setFacilityForm((current) => ({ ...current, temporaryUntil: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
          )}
          <button
            disabled={busy}
            className="rounded-lg bg-cyan-700 px-4 py-2.5 font-semibold text-white disabled:opacity-50 sm:col-span-2"
          >
            {busy ? "Saving…" : "Save facility"}
          </button>
        </form>
      </Modal>

      <Modal
        open={programmeOpen}
        title={editingProgramme ? "Edit programme" : "Create programme"}
        onClose={() => !busy && setProgrammeOpen(false)}
      >
        <form onSubmit={saveProgramme} className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium sm:col-span-2">
            Name
            <input
              required
              value={programmeForm.name}
              onChange={(event) => setProgrammeForm((current) => ({ ...current, name: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="text-sm font-medium sm:col-span-2">
            Code
            <input
              required
              disabled={Boolean(editingProgramme)}
              value={programmeForm.code}
              onChange={(event) => setProgrammeForm((current) => ({ ...current, code: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 disabled:bg-slate-100"
            />
          </label>
          <label className="text-sm font-medium">
            Starts
            <input
              type="datetime-local"
              value={programmeForm.startsAt}
              onChange={(event) => setProgrammeForm((current) => ({ ...current, startsAt: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="text-sm font-medium">
            Ends
            <input
              type="datetime-local"
              value={programmeForm.endsAt}
              onChange={(event) => setProgrammeForm((current) => ({ ...current, endsAt: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
          <button
            disabled={busy}
            className="rounded-lg bg-cyan-700 px-4 py-2.5 font-semibold text-white disabled:opacity-50 sm:col-span-2"
          >
            {busy ? "Saving…" : "Save programme"}
          </button>
        </form>
      </Modal>

      <ConfirmActionModal
        open={Boolean(statusTarget)}
        title={statusTarget?.record.isActive ? "Archive resource" : "Restore resource"}
        description={statusTarget
          ? `${statusTarget.record.name} will be ${statusTarget.record.isActive ? "hidden from active workflows" : "returned to active workflows"}.`
          : ""}
        confirmLabel={statusTarget?.record.isActive ? "Archive" : "Restore"}
        destructive={Boolean(statusTarget?.record.isActive)}
        busy={busy}
        onClose={() => setStatusTarget(null)}
        onConfirm={changeActive}
      />
    </main>
  );
}
