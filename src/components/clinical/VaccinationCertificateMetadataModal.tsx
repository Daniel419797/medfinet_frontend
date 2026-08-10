import { type FormEvent, useEffect, useMemo, useState } from "react";
import { MapPin, ShieldCheck } from "lucide-react";
import { Modal } from "../common/Modal";
import {
  medfinetClinicalApi,
  type ClinicalTimeline,
} from "../../services/medfinetClinicalApi";
import type { MedfinetFacility } from "../../services/medfinetFacilityApi";

type Immunization = ClinicalTimeline["immunizations"][number];

type Props = {
  open: boolean;
  organizationId: string;
  vaccination: Immunization | null;
  facilities: MedfinetFacility[];
  currentUserName: string;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
};

type FormState = {
  facilitySelection: string;
  facilityName: string;
  state: string;
  lga: string;
  ward: string;
  vaccinatorMode: "SELF" | "OTHER";
  vaccinatorName: string;
  reason: string;
};

const MANUAL_FACILITY = "__MANUAL__";
const fieldClass =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm";

function isComplete(vaccination: Immunization | null) {
  const metadata = vaccination?.certificateMetadata;
  return Boolean(
    metadata?.facilityName &&
      metadata.state &&
      metadata.lga &&
      metadata.ward &&
      metadata.vaccinatorName,
  );
}

function initialForm(
  vaccination: Immunization | null,
  currentUserName: string,
): FormState {
  const metadata = vaccination?.certificateMetadata;
  const historical = !isComplete(vaccination);
  const isSelf = Boolean(
    metadata?.vaccinatorName &&
      currentUserName &&
      metadata.vaccinatorName.trim().toLowerCase() ===
        currentUserName.trim().toLowerCase(),
  );

  return {
    facilitySelection:
      metadata?.facilityId || vaccination?.facilityId || MANUAL_FACILITY,
    // For legacy records, intentionally do not reconstruct human-readable
    // certificate facts from today's facility profile. The user must verify
    // the source register and enter what was true when the vaccine was given.
    facilityName: historical ? "" : metadata?.facilityName || "",
    state: historical ? "" : metadata?.state || "",
    lga: historical ? "" : metadata?.lga || "",
    ward: historical ? "" : metadata?.ward || "",
    vaccinatorMode: historical ? "OTHER" : isSelf ? "SELF" : "OTHER",
    vaccinatorName:
      historical || isSelf ? "" : metadata?.vaccinatorName || "",
    reason: "",
  };
}

export default function VaccinationCertificateMetadataModal({
  open,
  organizationId,
  vaccination,
  facilities,
  currentUserName,
  onClose,
  onSaved,
}: Props) {
  const [form, setForm] = useState<FormState>(() =>
    initialForm(vaccination, currentUserName),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const historical = !isComplete(vaccination);
  const selectedFacility = useMemo(
    () => facilities.find((facility) => facility.id === form.facilitySelection),
    [facilities, form.facilitySelection],
  );

  useEffect(() => {
    if (!open) return;
    setForm(initialForm(vaccination, currentUserName));
    setError("");
  }, [currentUserName, open, vaccination]);

  function selectFacility(value: string) {
    const facility = facilities.find((row) => row.id === value);
    if (historical) {
      setForm((current) => ({
        ...current,
        facilitySelection: value,
        facilityName: "",
        state: "",
        lga: "",
        ward: "",
      }));
      return;
    }
    setForm((current) => ({
      ...current,
      facilitySelection: value,
      facilityName: value === MANUAL_FACILITY ? "" : facility?.name || "",
      state:
        value === MANUAL_FACILITY
          ? ""
          : facility?.state || facility?.administrativeArea || "",
      lga: value === MANUAL_FACILITY ? "" : facility?.lga || "",
      ward: value === MANUAL_FACILITY ? "" : facility?.ward || "",
    }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!vaccination) return;
    setBusy(true);
    setError("");
    try {
      await medfinetClinicalApi.amendImmunization(
        organizationId,
        vaccination.id,
        {
          reason: form.reason.trim(),
          ...(form.facilitySelection !== MANUAL_FACILITY
            ? { facilityId: form.facilitySelection }
            : { facilityId: "", facilityName: form.facilityName.trim() }),
          // Always send the verified display value. This prevents legacy
          // corrections from silently inheriting a facility's current name.
          facilityName: form.facilityName.trim(),
          state: form.state.trim(),
          lga: form.lga.trim(),
          ward: form.ward.trim(),
          vaccinatorMode: form.vaccinatorMode,
          ...(form.vaccinatorMode === "OTHER"
            ? { vaccinatorName: form.vaccinatorName.trim() }
            : {}),
        },
      );
      await onSaved();
      onClose();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to amend vaccination certificate details",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      title={historical ? "Complete certificate details" : "Amend certificate details"}
      description="Certificate facts are historical evidence. Saving creates an audited amendment and a new integrity proof; prior proof history is retained."
      onClose={() => !busy && onClose()}
    >
      {vaccination && (
        <form className="space-y-4" onSubmit={(event) => void submit(event)}>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
            <p className="font-bold text-slate-950">
              {vaccination.vaccineCode} · dose {vaccination.doseNumber}
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Administered {new Date(vaccination.administeredAt).toLocaleString()}
            </p>
          </div>

          {historical && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
              <p className="font-bold">Verify the original source record first</p>
              <p className="mt-1 text-xs leading-5">
                Medfinet intentionally leaves these historical values blank. Do not copy today's facility location or guess the vaccinator unless the paper register or another authoritative source confirms it.
              </p>
            </div>
          )}

          <section className="space-y-4 rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-700" />
              <h3 className="font-bold text-slate-950">Vaccination location</h3>
            </div>
            <label className="block text-sm font-semibold">
              Facility reference
              <select
                required
                className={fieldClass}
                value={form.facilitySelection}
                onChange={(event) => selectFacility(event.target.value)}
              >
                {facilities.map((facility) => (
                  <option key={facility.id} value={facility.id}>
                    {facility.name}
                  </option>
                ))}
                <option value={MANUAL_FACILITY}>
                  Historical / external vaccination site
                </option>
              </select>
            </label>
            <label className="block text-sm font-semibold">
              Health facility / vaccination site name
              <input
                required
                className={fieldClass}
                value={form.facilityName}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    facilityName: event.target.value,
                  }))
                }
                placeholder={
                  historical && selectedFacility
                    ? `Verify the historical name for ${selectedFacility.name}`
                    : "Official facility name"
                }
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-3">
              {(["state", "lga", "ward"] as const).map((field) => (
                <label key={field} className="text-sm font-semibold">
                  {field === "lga"
                    ? "LGA"
                    : field[0].toUpperCase() + field.slice(1)}
                  <input
                    required
                    className={fieldClass}
                    value={form[field]}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        [field]: event.target.value,
                      }))
                    }
                  />
                </label>
              ))}
            </div>
          </section>

          <section className="space-y-4 rounded-xl border border-cyan-100 bg-cyan-50/40 p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-cyan-700" />
              <h3 className="font-bold text-slate-950">Actual vaccinator</h3>
            </div>
            <label className="block text-sm font-semibold">
              Who administered the vaccine?
              <select
                className={fieldClass}
                value={form.vaccinatorMode}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    vaccinatorMode: event.target.value as "SELF" | "OTHER",
                    vaccinatorName:
                      event.target.value === "SELF"
                        ? ""
                        : current.vaccinatorName,
                  }))
                }
              >
                <option value="SELF">
                  Me — {currentUserName || "current account"}
                </option>
                <option value="OTHER">Another / external vaccinator</option>
              </select>
            </label>
            {form.vaccinatorMode === "OTHER" && (
              <label className="block text-sm font-semibold">
                Vaccinator name
                <input
                  required
                  className={fieldClass}
                  value={form.vaccinatorName}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      vaccinatorName: event.target.value,
                    }))
                  }
                />
              </label>
            )}
          </section>

          <label className="block text-sm font-semibold">
            Amendment reason
            <textarea
              required
              minLength={3}
              className={`${fieldClass} min-h-24`}
              value={form.reason}
              onChange={(event) =>
                setForm((current) => ({ ...current, reason: event.target.value }))
              }
              placeholder="Example: Verified original paper vaccination register"
            />
          </label>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"
            >
              {error}
            </p>
          )}

          <button
            disabled={busy || form.reason.trim().length < 3}
            className="w-full rounded-lg bg-emerald-700 px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
          >
            {busy ? "Saving amendment…" : "Save verified certificate details"}
          </button>
        </form>
      )}
    </Modal>
  );
}
