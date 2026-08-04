import { type FormEvent, useContext, useState } from "react";
import { Calendar, PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Modal } from "../../components/common/Modal";
import { PageFeedback } from "../../components/common/PageFeedback";
import UserContext from "../../contexts/UserContext";
import { useApi } from "../../hooks/useMedfinetApi";
import { medfinetIdentityApi } from "../../services/medfinetIdentityApi";

const emptyForm = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  sex: "UNKNOWN",
};
const input =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm";

export default function ChildProfiles() {
  const { organizationId, currentMembership } = useContext(UserContext);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const { data, loading, error, refetch } = useApi(
    () =>
      organizationId
        ? medfinetIdentityApi.listChildren(organizationId, { limit: 100 })
        : Promise.resolve(null),
    [organizationId],
  );
  const children = data?.items || [];
  const canCreate = ["OWNER", "ADMIN", "HEALTH_WORKER"].includes(
    currentMembership?.role || "",
  );

  async function create(event: FormEvent) {
    event.preventDefault();
    if (!organizationId || !canCreate) return;
    setSaving(true);
    setActionError(null);
    try {
      await medfinetIdentityApi.registerChild(organizationId, form);
      setForm(emptyForm);
      setOpen(false);
      setNotice(
        "Child record created. Link and verify an authorized caregiver before caregiver access is granted.",
      );
      await refetch();
    } catch (reason) {
      setActionError(
        reason instanceof Error
          ? reason.message
          : "Unable to create child record",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-semibold text-cyan-700">
            Identity records
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950">
            Child profiles
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Only records available under your organization access and consent
            are shown.
          </p>
        </div>
        {canCreate && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-lg bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white"
          >
            <PlusCircle className="mr-2 inline h-4 w-4" />
            Register child
          </button>
        )}
      </header>

      {notice && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900"
        >
          {notice}
        </div>
      )}
      <PageFeedback
        loading={loading}
        error={error || actionError}
        empty={!children.length}
        onRetry={() => void refetch()}
        emptyTitle="No child records"
        emptyDescription="No child records are currently available under your access."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {children.map((child) => (
            <article
              key={child.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-cyan-50 font-bold text-cyan-800">
                  {child.firstName[0]}
                  {child.lastName[0]}
                </div>
                <div className="min-w-0">
                  <h2 className="truncate font-bold text-slate-950">
                    {child.firstName} {child.lastName}
                  </h2>
                  <p className="mt-1 flex items-center gap-1 text-sm text-slate-600">
                    <Calendar className="h-4 w-4" />
                    {new Date(child.dateOfBirth).toLocaleDateString()}
                  </p>
                  <p className="mt-1 break-all text-xs text-slate-500">
                    {child.medfinetId}
                  </p>
                </div>
              </div>
              <Link
                to={`/vaccination-history/${child.id}`}
                className="mt-5 block rounded-lg border border-slate-300 px-3 py-2 text-center text-sm font-semibold"
              >
                View health record
              </Link>
            </article>
          ))}
        </div>
      </PageFeedback>

      <Modal
        open={open}
        title="Register child identity"
        description="Clinical and caregiver relationships are added through separately audited workflows."
        onClose={() => !saving && setOpen(false)}
      >
        <form className="space-y-4" onSubmit={(event) => void create(event)}>
          {actionError && (
            <div
              role="alert"
              className="rounded-lg bg-rose-50 p-3 text-sm text-rose-800"
            >
              {actionError}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              First name
              <input
                required
                className={input}
                value={form.firstName}
                onChange={(event) =>
                  setForm({ ...form, firstName: event.target.value })
                }
              />
            </label>
            <label className="text-sm font-semibold">
              Last name
              <input
                required
                className={input}
                value={form.lastName}
                onChange={(event) =>
                  setForm({ ...form, lastName: event.target.value })
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
              value={form.dateOfBirth}
              onChange={(event) =>
                setForm({ ...form, dateOfBirth: event.target.value })
              }
            />
          </label>
          <label className="block text-sm font-semibold">
            Sex
            <select
              className={input}
              value={form.sex}
              onChange={(event) =>
                setForm({ ...form, sex: event.target.value })
              }
            >
              <option value="UNKNOWN">Unknown</option>
              <option value="FEMALE">Female</option>
              <option value="MALE">Male</option>
              <option value="INTERSEX">Intersex</option>
            </select>
          </label>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={() => setOpen(false)}
              className="rounded-lg border px-4 py-2.5 text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              disabled={saving}
              className="rounded-lg bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving ? "Registering…" : "Register child"}
            </button>
          </div>
        </form>
      </Modal>
    </main>
  );
}
