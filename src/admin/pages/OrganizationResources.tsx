import { useCallback, useContext, useEffect, useState } from "react";
import { Building2, CalendarRange, Plus, Power } from "lucide-react";
import UserContext from "../../contexts/UserContext";
import { Modal } from "../../components/common/Modal";
import { ConfirmActionModal } from "../../components/common/ConfirmActionModal";
import { PageFeedback } from "../../components/common/PageFeedback";
import { medfinetIdentityApi } from "../../services/medfinetIdentityApi";

type Facility = Awaited<
  ReturnType<typeof medfinetIdentityApi.listFacilities>
>[number];
type Programme = Awaited<
  ReturnType<typeof medfinetIdentityApi.listProgrammes>
>[number];

const emptyFacility = {
  name: "",
  code: "",
  administrativeArea: "",
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
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [facilityOpen, setFacilityOpen] = useState(false);
  const [programmeOpen, setProgrammeOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState<{
    kind: "facility" | "programme";
    record: Facility | Programme;
  } | null>(null);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [editingProgramme, setEditingProgramme] = useState<Programme | null>(
    null,
  );
  const [facilityForm, setFacilityForm] = useState(emptyFacility);
  const [programmeForm, setProgrammeForm] = useState(emptyProgramme);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setError("");
    try {
      const [facilityRows, programmeRows] = await Promise.all([
        medfinetIdentityApi.listFacilities(organizationId),
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

  function openFacility(facility?: Facility) {
    setEditingFacility(facility || null);
    setFacilityForm(
      facility
        ? {
            name: facility.name,
            code: facility.code,
            administrativeArea: facility.administrativeArea || "",
            address: facility.address || "",
            phone: facility.phone || "",
            openingHours: Object.values(facility.openingHours || {}).join(", "),
            programmeCategories: (facility.programmeCategories || []).join(
              ", ",
            ),
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
      administrativeArea: facilityForm.administrativeArea.trim(),
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
      if (editingFacility)
        await medfinetIdentityApi.updateFacility(
          organizationId,
          editingFacility.id,
          body,
        );
      else
        await medfinetIdentityApi.createFacility(organizationId, {
          ...body,
          code: facilityForm.code.trim(),
        });
      setFacilityOpen(false);
      setNotice(editingFacility ? "Facility updated." : "Facility created.");
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
      if (editingProgramme)
        await medfinetIdentityApi.updateProgramme(
          organizationId,
          editingProgramme.id,
          body,
        );
      else
        await medfinetIdentityApi.createProgramme(organizationId, {
          ...body,
          code: programmeForm.code.trim(),
        });
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

  async function changeActive(
    kind: "facility" | "programme",
    record: Facility | Programme,
  ) {
    if (!organizationId) return;
    setBusy(true);
    setError("");
    try {
      if (kind === "facility")
        await medfinetIdentityApi.updateFacility(organizationId, record.id, {
          isActive: !record.isActive,
        });
      else
        await medfinetIdentityApi.updateProgramme(organizationId, record.id, {
          isActive: !record.isActive,
        });
      setNotice(
        `${record.name} was ${record.isActive ? "archived" : "restored"}.`,
      );
      await load();
      setStatusTarget(null);
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
        </div>
        <button
          type="button"
          onClick={() =>
            tab === "facilities" ? openFacility() : openProgramme()
          }
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
          <Building2 className="mr-2 inline h-4 w-4" />
          Facilities
        </button>
        <button
          type="button"
          onClick={() => setTab("programmes")}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === "programmes" ? "bg-slate-950 text-white" : "border bg-white"}`}
        >
          <CalendarRange className="mr-2 inline h-4 w-4" />
          Programmes
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
            {(tab === "facilities" ? facilities : programmes).map((record) => (
              <article
                key={record.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-bold text-slate-950">{record.name}</h2>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      {record.code}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${record.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
                  >
                    {record.isActive ? "Active" : "Archived"}
                  </span>
                </div>
                {"administrativeArea" in record && (
                  <p className="mt-3 text-sm text-slate-600">
                    {record.administrativeArea || "Area not set"} ·{" "}
                    {record.phone || "Phone not set"}
                  </p>
                )}
                <div className="mt-5 flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      tab === "facilities"
                        ? openFacility(record as Facility)
                        : openProgramme(record as Programme)
                    }
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      setStatusTarget({
                        kind: tab === "facilities" ? "facility" : "programme",
                        record,
                      })
                    }
                    className="rounded-lg border border-slate-300 p-2"
                    aria-label={`${record.isActive ? "Archive" : "Restore"} ${record.name}`}
                  >
                    <Power className="h-4 w-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </PageFeedback>
      </div>
      <Modal
        open={facilityOpen}
        title={editingFacility ? "Edit facility" : "Create facility"}
        onClose={() => setFacilityOpen(false)}
      >
        <form onSubmit={saveFacility} className="grid gap-4 sm:grid-cols-2">
          {(
            [
              "name",
              "code",
              "administrativeArea",
              "address",
              "phone",
              "openingHours",
              "programmeCategories",
            ] as const
          ).map((field) => (
            <label
              key={field}
              className={`text-sm font-medium ${["address", "openingHours", "programmeCategories"].includes(field) ? "sm:col-span-2" : ""}`}
            >
              {field.replace(/([A-Z])/g, " $1")}
              <input
                required={field === "name" || field === "code"}
                disabled={field === "code" && Boolean(editingFacility)}
                value={facilityForm[field] as string}
                onChange={(event) =>
                  setFacilityForm({
                    ...facilityForm,
                    [field]: event.target.value,
                  })
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
          ))}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={facilityForm.isTemporary}
              onChange={(event) =>
                setFacilityForm({
                  ...facilityForm,
                  isTemporary: event.target.checked,
                })
              }
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
                onChange={(event) =>
                  setFacilityForm({
                    ...facilityForm,
                    temporaryUntil: event.target.value,
                  })
                }
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </label>
          )}
          <button
            disabled={busy}
            className="sm:col-span-2 rounded-lg bg-cyan-700 px-4 py-2.5 font-semibold text-white disabled:opacity-50"
          >
            {busy ? "Saving…" : "Save facility"}
          </button>
        </form>
      </Modal>
      <Modal
        open={programmeOpen}
        title={editingProgramme ? "Edit programme" : "Create programme"}
        onClose={() => setProgrammeOpen(false)}
      >
        <form onSubmit={saveProgramme} className="grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2 text-sm font-medium">
            Name
            <input
              required
              value={programmeForm.name}
              onChange={(event) =>
                setProgrammeForm({ ...programmeForm, name: event.target.value })
              }
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </label>
          <label className="sm:col-span-2 text-sm font-medium">
            Code
            <input
              required
              disabled={Boolean(editingProgramme)}
              value={programmeForm.code}
              onChange={(event) =>
                setProgrammeForm({ ...programmeForm, code: event.target.value })
              }
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </label>
          <label className="text-sm font-medium">
            Starts
            <input
              type="datetime-local"
              value={programmeForm.startsAt}
              onChange={(event) =>
                setProgrammeForm({
                  ...programmeForm,
                  startsAt: event.target.value,
                })
              }
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </label>
          <label className="text-sm font-medium">
            Ends
            <input
              type="datetime-local"
              value={programmeForm.endsAt}
              onChange={(event) =>
                setProgrammeForm({
                  ...programmeForm,
                  endsAt: event.target.value,
                })
              }
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </label>
          <button
            disabled={busy}
            className="sm:col-span-2 rounded-lg bg-cyan-700 px-4 py-2.5 font-semibold text-white"
          >
            {busy ? "Saving…" : "Save programme"}
          </button>
        </form>
      </Modal>
      <ConfirmActionModal
        open={Boolean(statusTarget)}
        title={`${statusTarget?.record.isActive ? "Archive" : "Restore"} ${statusTarget?.kind || "resource"}`}
        description={`${statusTarget?.record.isActive ? "Archive" : "Restore"} ${statusTarget?.record.name || "this resource"}? Published availability and downstream workflows will update immediately.`}
        confirmLabel={statusTarget?.record.isActive ? "Archive" : "Restore"}
        destructive={Boolean(statusTarget?.record.isActive)}
        busy={busy}
        onClose={() => setStatusTarget(null)}
        onConfirm={() => {
          if (statusTarget)
            return changeActive(statusTarget.kind, statusTarget.record);
        }}
      />
    </main>
  );
}
