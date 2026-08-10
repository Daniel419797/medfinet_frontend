import { useCallback, useContext, useEffect, useState } from "react";
import { ArrowRight, Plus, ShieldCheck, Store, Users } from "lucide-react";
import { Link } from "react-router-dom";
import UserContext from "../../contexts/UserContext";
import { Modal } from "../../components/common/Modal";
import { PageFeedback } from "../../components/common/PageFeedback";
import { medfinetIdentityApi } from "../../services/medfinetIdentityApi";

type Membership = Awaited<
  ReturnType<typeof medfinetIdentityApi.listMemberships>
>[number];

const staffRoles = [
  "OWNER",
  "ADMIN",
  "HEALTH_WORKER",
  "NUTRITION_WORKER",
  "EMERGENCY_COORDINATOR",
  "AUDITOR",
];

const blank = {
  subjectId: "",
  role: "HEALTH_WORKER",
  status: "ACTIVE",
  scopeMode: "GLOBAL" as "GLOBAL" | "SCOPED",
  facilityIds: [] as string[],
  programmeIds: [] as string[],
};

export default function UserManagement() {
  const { organizationId, currentMembership } = useContext(UserContext);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [facilities, setFacilities] = useState<
    Awaited<ReturnType<typeof medfinetIdentityApi.listFacilities>>
  >([]);
  const [programmes, setProgrammes] = useState<
    Awaited<ReturnType<typeof medfinetIdentityApi.listProgrammes>>
  >([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState<Membership | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setError("");
    try {
      const [memberRows, facilityRows, programmeRows] = await Promise.all([
        medfinetIdentityApi.listMemberships(organizationId),
        medfinetIdentityApi.listFacilities(organizationId),
        medfinetIdentityApi.listProgrammes(organizationId),
      ]);
      setMemberships(memberRows);
      setFacilities(facilityRows);
      setProgrammes(programmeRows);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to load team access",
      );
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    void load();
  }, [load]);

  function edit(member?: Membership) {
    setEditing(member || null);
    setForm(
      member
        ? {
            subjectId: member.subjectId,
            role: member.role,
            status: member.status,
            scopeMode: member.scopeMode,
            facilityIds: member.facilityScopes.map((scope) => scope.facilityId),
            programmeIds: member.programmeScopes.map(
              (scope) => scope.programmeId,
            ),
          }
        : blank,
    );
    setOpen(true);
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!organizationId) return;
    setBusy(true);
    setError("");
    try {
      const saved = (await medfinetIdentityApi.upsertMembership(organizationId, {
        subjectId: form.subjectId.trim(),
        role: form.role,
        status: form.status,
        scopeMode: form.scopeMode,
      })) as { id?: string };
      const membershipId = editing?.id || saved.id;
      if (form.scopeMode === "SCOPED" && membershipId) {
        await medfinetIdentityApi.replaceMembershipScopes(
          organizationId,
          membershipId,
          {
            facilityIds: form.facilityIds,
            programmeIds: form.programmeIds,
          },
        );
      }
      setOpen(false);
      setNotice(editing ? "Membership updated." : "Staff member added.");
      await load();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to save membership",
      );
    } finally {
      setBusy(false);
    }
  }

  function toggle(
    id: string,
    collection: "facilityIds" | "programmeIds",
  ) {
    const current = form[collection];
    setForm({
      ...form,
      [collection]: current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    });
  }

  return (
    <main className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-cyan-700">Access control</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950">
            Team and permissions
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Assign staff and audit roles using the Medfinet Account ID shown to a
            verified user. Parent/caregiver and merchant access use dedicated
            workflows because those roles also require child or merchant
            relationships.
          </p>
        </div>
        <button
          type="button"
          onClick={() => edit()}
          className="rounded-lg bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white"
        >
          <Plus className="mr-2 inline h-4 w-4" /> Add staff member
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link
          to="/admin/caregivers"
          className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-cyan-300"
        >
          <div className="flex items-start justify-between gap-4">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-50 text-cyan-700">
              <Users className="h-5 w-5" />
            </span>
            <ArrowRight className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1" />
          </div>
          <h2 className="mt-4 font-bold text-slate-950">
            Connect a parent or caregiver
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Verify the parent account, create or reuse the caregiver profile and
            link the correct child in one guided flow.
          </p>
        </Link>
        <Link
          to="/admin/rewards"
          className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-cyan-300"
        >
          <div className="flex items-start justify-between gap-4">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-50 text-cyan-700">
              <Store className="h-5 w-5" />
            </span>
            <ArrowRight className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1" />
          </div>
          <h2 className="mt-4 font-bold text-slate-950">Merchant access</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Merchant users are connected through the merchant/rewards workflow so
            their organization role and merchant permissions stay aligned.
          </p>
        </Link>
      </div>

      {notice && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"
        >
          {notice}
        </div>
      )}

      <PageFeedback
        loading={loading}
        error={error}
        empty={!memberships.length}
        onRetry={() => void load()}
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {memberships.map((member) => (
            <article
              key={member.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-50 text-cyan-700">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="break-all font-semibold text-slate-950">
                      {member.subjectId}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {member.role.replaceAll("_", " ")} · {member.scopeMode}
                    </p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold ${
                    member.status === "ACTIVE"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {member.status}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                <p className="text-xs text-slate-500">
                  {member.facilityScopes.length} facilities · {member.programmeScopes.length} programmes
                </p>
                <button
                  type="button"
                  onClick={() => edit(member)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold"
                >
                  Manage access
                </button>
              </div>
            </article>
          ))}
        </div>
      </PageFeedback>

      <Modal
        open={open}
        title={editing ? "Manage staff member" : "Add staff member"}
        description="Use the Medfinet Account ID from the user's verified waiting screen. Parent/caregiver and merchant roles are intentionally managed through their dedicated workflows."
        onClose={() => setOpen(false)}
      >
        <form onSubmit={(event) => void save(event)} className="space-y-4">
          <label className="block text-sm font-medium">
            Medfinet Account ID
            <input
              required
              disabled={Boolean(editing)}
              value={form.subjectId}
              onChange={(event) => setForm({ ...form, subjectId: event.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 disabled:bg-slate-100"
              placeholder="Paste the Account ID shown to the verified user"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium">
              Staff role
              <select
                value={form.role}
                onChange={(event) => setForm({ ...form, role: event.target.value })}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              >
                {staffRoles
                  .filter(
                    (role) =>
                      role !== "OWNER" || currentMembership?.role === "OWNER",
                  )
                  .map((role) => (
                    <option key={role}>{role}</option>
                  ))}
              </select>
            </label>
            <label className="block text-sm font-medium">
              Status
              <select
                value={form.status}
                onChange={(event) => setForm({ ...form, status: event.target.value })}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              >
                <option>ACTIVE</option>
                <option>SUSPENDED</option>
                <option>REVOKED</option>
              </select>
            </label>
          </div>
          <label className="block text-sm font-medium">
            Access scope
            <select
              value={form.scopeMode}
              disabled={form.role === "OWNER"}
              onChange={(event) =>
                setForm({
                  ...form,
                  scopeMode: event.target.value as "GLOBAL" | "SCOPED",
                })
              }
              className="mt-1 w-full rounded-lg border px-3 py-2"
            >
              <option value="GLOBAL">All organization resources</option>
              <option value="SCOPED">Selected resources only</option>
            </select>
          </label>
          {form.scopeMode === "SCOPED" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <fieldset>
                <legend className="text-sm font-semibold">Facilities</legend>
                <div className="mt-2 max-h-36 space-y-2 overflow-y-auto rounded-lg border p-3">
                  {facilities
                    .filter((item) => item.isActive)
                    .map((item) => (
                      <label key={item.id} className="flex gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={form.facilityIds.includes(item.id)}
                          onChange={() => toggle(item.id, "facilityIds")}
                        />
                        {item.name}
                      </label>
                    ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="text-sm font-semibold">Programmes</legend>
                <div className="mt-2 max-h-36 space-y-2 overflow-y-auto rounded-lg border p-3">
                  {programmes
                    .filter((item) => item.isActive)
                    .map((item) => (
                      <label key={item.id} className="flex gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={form.programmeIds.includes(item.id)}
                          onChange={() => toggle(item.id, "programmeIds")}
                        />
                        {item.name}
                      </label>
                    ))}
                </div>
              </fieldset>
            </div>
          )}
          <button
            disabled={
              busy ||
              (form.scopeMode === "SCOPED" &&
                !form.facilityIds.length &&
                !form.programmeIds.length)
            }
            className="w-full rounded-lg bg-cyan-700 px-4 py-2.5 font-semibold text-white disabled:opacity-50"
          >
            <ShieldCheck className="mr-2 inline h-4 w-4" />
            {busy ? "Saving…" : "Save access"}
          </button>
        </form>
      </Modal>
    </main>
  );
}
