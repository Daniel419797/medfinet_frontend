import { FormEvent, useCallback, useContext, useEffect, useState } from "react";
import { Fingerprint, Plus, RefreshCw } from "lucide-react";
import UserContext from "../../contexts/UserContext";
import { Modal } from "../../components/common/Modal";
import { ActionReasonModal } from "../../components/common/ActionReasonModal";
import { PageFeedback } from "../../components/common/PageFeedback";
import { medfinetIdentityApi } from "../../services/medfinetIdentityApi";
type Tab = "amendments" | "identifiers";
const input = "mt-1 w-full rounded-lg border px-3 py-2 text-sm";
const button =
  "rounded-lg border bg-white px-3 py-2 text-sm font-semibold disabled:opacity-50";
const primary =
  "rounded-lg bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50";
export default function IdentityIntegrityAdministration() {
  const { organizationId, user } = useContext(UserContext);
  const [children, setChildren] = useState<
    Array<{
      id: string;
      firstName: string;
      lastName: string;
      medfinetId: string;
      dateOfBirth: string;
      sex: string;
    }>
  >([]);
  const [childId, setChildId] = useState("");
  const [tab, setTab] = useState<Tab>("amendments");
  const [amendments, setAmendments] = useState<
    Awaited<ReturnType<typeof medfinetIdentityApi.listAmendments>>
  >([]);
  const [identifiers, setIdentifiers] = useState<
    Awaited<ReturnType<typeof medfinetIdentityApi.listIdentifiers>>
  >([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<
    | { type: "amendment"; id: string; decision: "APPLY" | "REJECT" }
    | { type: "identifier"; id: string }
    | null
  >(null);
  const [amendmentForm, setAmendmentForm] = useState({
    reason: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    sex: "",
  });
  const [identifierForm, setIdentifierForm] = useState({
    system: "",
    value: "",
    evidenceReference: "",
    isPrimary: false,
  });
  const load = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setError(null);
    try {
      const page = await medfinetIdentityApi.listChildren(organizationId, {
        limit: 100,
      });
      setChildren(page.items);
      const id = childId || page.items[0]?.id || "";
      setChildId(id);
      if (id) {
        const [a, i] = await Promise.all([
          medfinetIdentityApi.listAmendments(organizationId, id),
          medfinetIdentityApi.listIdentifiers(organizationId, id),
        ]);
        setAmendments(a);
        setIdentifiers(i);
      }
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to load identity integrity records",
      );
    } finally {
      setLoading(false);
    }
  }, [childId, organizationId]);
  useEffect(() => {
    void load();
  }, [load]);
  const run = async (op: () => Promise<unknown>, message: string) => {
    setBusy(true);
    setError(null);
    try {
      await op();
      setNotice(message);
      await load();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Identity operation failed",
      );
    } finally {
      setBusy(false);
    }
  };
  const create = async (event: FormEvent) => {
    event.preventDefault();
    if (!organizationId || !childId) return;
    if (tab === "amendments") {
      const changes = {
        reason: amendmentForm.reason,
        ...(amendmentForm.firstName && { firstName: amendmentForm.firstName }),
        ...(amendmentForm.lastName && { lastName: amendmentForm.lastName }),
        ...(amendmentForm.dateOfBirth && {
          dateOfBirth: amendmentForm.dateOfBirth,
        }),
        ...(amendmentForm.sex && { sex: amendmentForm.sex }),
      };
      await run(
        () =>
          medfinetIdentityApi.requestAmendment(
            organizationId,
            childId,
            changes,
          ),
        "Identity amendment requested for independent review.",
      );
    } else
      await run(
        () =>
          medfinetIdentityApi.createIdentifier(organizationId, childId, {
            ...identifierForm,
            evidenceReference: identifierForm.evidenceReference || undefined,
          }),
        "Identifier created pending independent verification.",
      );
    setOpen(false);
  };
  const rows = tab === "amendments" ? amendments : identifiers;
  return (
    <main className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row">
        <div>
          <p className="text-sm font-semibold text-cyan-700">
            Identity assurance
          </p>
          <h1 className="text-3xl font-bold">Identity integrity</h1>
          <p className="mt-2 text-sm text-slate-600">
            Audited corrections and verified external identifiers; no silent
            demographic edits.
          </p>
        </div>
        <div className="flex gap-2">
          <button className={button} onClick={() => void load()}>
            <RefreshCw className="mr-2 inline h-4 w-4" />
            Refresh
          </button>
          <button
            className={primary}
            disabled={!childId}
            onClick={() => setOpen(true)}
          >
            <Plus className="mr-2 inline h-4 w-4" />
            New {tab === "amendments" ? "correction" : "identifier"}
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
      <label className="block max-w-lg text-sm font-semibold">
        Child
        <select
          className={input}
          value={childId}
          onChange={(e) => setChildId(e.target.value)}
        >
          {children.map((child) => (
            <option key={child.id} value={child.id}>
              {child.firstName} {child.lastName} · {child.medfinetId}
            </option>
          ))}
        </select>
      </label>
      <div className="flex gap-2">
        {(["amendments", "identifiers"] as Tab[]).map((value) => (
          <button
            key={value}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === value ? "bg-slate-950 text-white" : "border bg-white"}`}
            onClick={() => setTab(value)}
          >
            {value}
          </button>
        ))}
      </div>
      <PageFeedback
        loading={loading}
        error={error}
        empty={!rows.length}
        onRetry={() => void load()}
      >
        <div className="space-y-3">
          {tab === "amendments"
            ? amendments.map((item) => (
                <article
                  key={item.id}
                  className="rounded-xl border bg-white p-4"
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row">
                    <div>
                      <p className="font-bold">Correction · {item.status}</p>
                      <p className="text-sm text-slate-600">{item.reason}</p>
                      <pre className="mt-2 rounded-lg bg-slate-50 p-2 text-xs">
                        {JSON.stringify(item.proposedData, null, 2)}
                      </pre>
                    </div>
                    {item.status === "PENDING" && (
                      <div className="flex gap-2">
                        <button
                          className={primary}
                          disabled={
                            busy || item.requestedBySubjectId === user?.id
                          }
                          onClick={() =>
                            setAction({
                              type: "amendment",
                              id: item.id,
                              decision: "APPLY",
                            })
                          }
                        >
                          Apply
                        </button>
                        <button
                          className={button}
                          disabled={
                            busy || item.requestedBySubjectId === user?.id
                          }
                          onClick={() =>
                            setAction({
                              type: "amendment",
                              id: item.id,
                              decision: "REJECT",
                            })
                          }
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              ))
            : identifiers.map((item) => (
                <article
                  key={item.id}
                  className="rounded-xl border bg-white p-4"
                >
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="font-bold">
                        <Fingerprint className="mr-2 inline h-4 w-4" />
                        {item.system}
                      </p>
                      <p className="break-all text-sm text-slate-600">
                        {item.value}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.status}
                        {item.isPrimary ? " · primary" : ""}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {item.status === "PENDING" && (
                        <button
                          className={primary}
                          disabled={
                            busy || item.createdBySubjectId === user?.id
                          }
                          onClick={() =>
                            organizationId &&
                            void run(
                              () =>
                                medfinetIdentityApi.verifyIdentifier(
                                  organizationId,
                                  item.id,
                                ),
                              "Identifier verified.",
                            )
                          }
                        >
                          Verify
                        </button>
                      )}
                      {item.status !== "REVOKED" && (
                        <button
                          className={button}
                          onClick={() =>
                            setAction({ type: "identifier", id: item.id })
                          }
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
        </div>
      </PageFeedback>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={
          tab === "amendments"
            ? "Request identity correction"
            : "Add external identifier"
        }
      >
        <form className="space-y-4" onSubmit={(event) => void create(event)}>
          {tab === "amendments" ? (
            <>
              <label className="block text-sm font-semibold">
                Reason
                <textarea
                  required
                  className={input}
                  value={amendmentForm.reason}
                  onChange={(e) =>
                    setAmendmentForm({
                      ...amendmentForm,
                      reason: e.target.value,
                    })
                  }
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold">
                  Corrected first name
                  <input
                    className={input}
                    value={amendmentForm.firstName}
                    onChange={(e) =>
                      setAmendmentForm({
                        ...amendmentForm,
                        firstName: e.target.value,
                      })
                    }
                  />
                </label>
                <label className="text-sm font-semibold">
                  Corrected last name
                  <input
                    className={input}
                    value={amendmentForm.lastName}
                    onChange={(e) =>
                      setAmendmentForm({
                        ...amendmentForm,
                        lastName: e.target.value,
                      })
                    }
                  />
                </label>
              </div>
              <label className="block text-sm font-semibold">
                Corrected date of birth
                <input
                  type="date"
                  className={input}
                  value={amendmentForm.dateOfBirth}
                  onChange={(e) =>
                    setAmendmentForm({
                      ...amendmentForm,
                      dateOfBirth: e.target.value,
                    })
                  }
                />
              </label>
              <label className="block text-sm font-semibold">
                Corrected sex
                <select
                  className={input}
                  value={amendmentForm.sex}
                  onChange={(e) =>
                    setAmendmentForm({ ...amendmentForm, sex: e.target.value })
                  }
                >
                  <option value="">No change</option>
                  <option>FEMALE</option>
                  <option>MALE</option>
                  <option>INTERSEX</option>
                  <option>UNKNOWN</option>
                </select>
              </label>
            </>
          ) : (
            <>
              <label className="block text-sm font-semibold">
                Stable namespace
                <input
                  required
                  pattern="[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*"
                  className={input}
                  value={identifierForm.system}
                  onChange={(e) =>
                    setIdentifierForm({
                      ...identifierForm,
                      system: e.target.value.toLowerCase(),
                    })
                  }
                />
              </label>
              <label className="block text-sm font-semibold">
                Identifier value
                <input
                  required
                  className={input}
                  value={identifierForm.value}
                  onChange={(e) =>
                    setIdentifierForm({
                      ...identifierForm,
                      value: e.target.value,
                    })
                  }
                />
              </label>
              <label className="block text-sm font-semibold">
                Evidence reference
                <input
                  className={input}
                  value={identifierForm.evidenceReference}
                  onChange={(e) =>
                    setIdentifierForm({
                      ...identifierForm,
                      evidenceReference: e.target.value,
                    })
                  }
                />
              </label>
              <label className="flex gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={identifierForm.isPrimary}
                  onChange={(e) =>
                    setIdentifierForm({
                      ...identifierForm,
                      isPrimary: e.target.checked,
                    })
                  }
                />
                Primary identifier
              </label>
            </>
          )}
          <button className={primary} disabled={busy}>
            Submit for review
          </button>
        </form>
      </Modal>
      <ActionReasonModal
        open={Boolean(action)}
        title={
          action?.type === "identifier"
            ? "Revoke identifier"
            : action?.decision === "APPLY"
              ? "Apply identity correction"
              : "Reject identity correction"
        }
        description="The decision is immutable audit evidence; the original identity history remains preserved."
        confirmLabel={
          action?.type === "identifier"
            ? "Revoke identifier"
            : action?.decision === "APPLY"
              ? "Apply correction"
              : "Reject correction"
        }
        destructive={
          action?.type === "identifier" || action?.decision === "REJECT"
        }
        busy={busy}
        onClose={() => setAction(null)}
        onConfirm={async (reason) => {
          if (!organizationId || !action) return;
          if (action.type === "identifier") {
            await run(
              () =>
                medfinetIdentityApi.revokeIdentifier(
                  organizationId,
                  action.id,
                  reason,
                ),
              "Identifier revoked.",
            );
          } else {
            await run(
              () =>
                medfinetIdentityApi.reviewAmendment(organizationId, action.id, {
                  decision: action.decision,
                  reviewReason: reason,
                }),
              `Amendment ${action.decision === "APPLY" ? "applied" : "rejected"}.`,
            );
          }
          setAction(null);
        }}
      />
    </main>
  );
}
