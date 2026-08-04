import { useContext, useState } from "react";
import { Building2, PauseCircle, PlayCircle, ShieldAlert } from "lucide-react";
import UserContext from "../../contexts/UserContext";
import { ActionReasonModal } from "../../components/common/ActionReasonModal";
import { medfinetIdentityApi } from "../../services/medfinetIdentityApi";

export default function OrganizationLifecycle() {
  const { organizationId, currentMembership, refreshSession } =
    useContext(UserContext);
  const [target, setTarget] = useState<"ACTIVE" | "SUSPENDED" | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const organization = currentMembership?.organization;

  async function change(reason: string) {
    if (!organizationId || !target) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await medfinetIdentityApi.updateOrganizationStatus(organizationId, {
        status: target,
        reason,
      });
      setNotice(
        `Organization ${target === "ACTIVE" ? "restored" : "suspended"}.`,
      );
      setTarget(null);
      await refreshSession();
    } catch (reasonValue) {
      setError(
        reasonValue instanceof Error
          ? reasonValue.message
          : "Unable to change organization status",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-cyan-700">Owner control</p>
        <h1 className="text-3xl font-bold">Organization lifecycle</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Suspend all routine access during a security or operational incident,
          then restore service after the issue is resolved.
        </p>
      </div>
      {notice && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"
        >
          {notice}
        </div>
      )}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          {error}
        </div>
      )}
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div className="flex gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-cyan-50 text-cyan-700">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{organization?.name}</h2>
              <p className="mt-1 text-sm text-slate-600">
                {organization?.slug}
              </p>
              <span
                className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${organization?.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}
              >
                {organization?.status}
              </span>
            </div>
          </div>
          {organization?.status === "ACTIVE" ? (
            <button
              type="button"
              onClick={() => setTarget("SUSPENDED")}
              className="rounded-lg border border-red-300 px-4 py-2.5 text-sm font-semibold text-red-700"
            >
              <PauseCircle className="mr-2 inline h-4 w-4" />
              Suspend organization
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setTarget("ACTIVE")}
              className="rounded-lg bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white"
            >
              <PlayCircle className="mr-2 inline h-4 w-4" />
              Restore organization
            </button>
          )}
        </div>
      </section>
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-800" />
          <div>
            <h2 className="font-bold text-amber-950">Operational impact</h2>
            <p className="mt-1 text-sm text-amber-900">
              Suspension blocks normal membership access across clinical,
              administrative, merchant, caregiver, and integration workflows.
              The owner recovery route remains available. Every transition
              requires recent MFA and an audit reason.
            </p>
          </div>
        </div>
      </section>
      <ActionReasonModal
        open={Boolean(target)}
        title={
          target === "ACTIVE" ? "Restore organization" : "Suspend organization"
        }
        description={
          target === "ACTIVE"
            ? "Confirm the incident is resolved and routine access can resume."
            : "This immediately blocks routine organization access for every role."
        }
        reasonLabel="Audit reason"
        confirmLabel={
          target === "ACTIVE" ? "Restore service" : "Suspend access"
        }
        destructive={target === "SUSPENDED"}
        busy={busy}
        onClose={() => setTarget(null)}
        onConfirm={change}
      />
    </main>
  );
}
