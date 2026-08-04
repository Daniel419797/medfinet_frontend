import { useCallback, useContext, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import UserContext from "../../contexts/UserContext";
import { Modal } from "../../components/common/Modal";
import { ActionReasonModal } from "../../components/common/ActionReasonModal";
import { PageFeedback } from "../../components/common/PageFeedback";
import { medfinetGovernanceApi } from "../../services/medfinetGovernanceApi";

type Policy = Awaited<
  ReturnType<typeof medfinetGovernanceApi.listRetentionPolicies>
>[number];
type Hold = Awaited<
  ReturnType<typeof medfinetGovernanceApi.listLegalHolds>
>[number];
type SubjectRequest = Awaited<
  ReturnType<typeof medfinetGovernanceApi.listSubjectRequests>
>[number];
type Audit = Awaited<
  ReturnType<typeof medfinetGovernanceApi.listAuditEvents>
>[number];

export default function GovernanceAdministration() {
  const { organizationId } = useContext(UserContext);
  const [tab, setTab] = useState<"retention" | "holds" | "requests" | "audit">(
    "retention",
  );
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [holds, setHolds] = useState<Hold[]>([]);
  const [requests, setRequests] = useState<SubjectRequest[]>([]);
  const [audit, setAudit] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [releaseTarget, setReleaseTarget] = useState<Hold | null>(null);
  const [decisionRequest, setDecisionRequest] = useState<SubjectRequest | null>(
    null,
  );
  const [policyForm, setPolicyForm] = useState({
    recordCategory: "NOTIFICATION_ATTEMPT",
    retentionDays: "365",
    disposition: "REVIEW_ONLY",
    legalBasis: "",
  });
  const [holdForm, setHoldForm] = useState({
    targetType: "CHILD",
    targetReference: "",
    reason: "",
    legalAuthority: "",
  });
  const [requestForm, setRequestForm] = useState({
    requestType: "ACCESS",
    caregiverId: "",
    childId: "",
    requestDetails: "",
  });
  const [decision, setDecision] = useState({
    decision: "APPROVED",
    decisionReason: "",
  });

  const load = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setError("");
    try {
      const [policyRows, holdRows, requestRows, auditRows] = await Promise.all([
        medfinetGovernanceApi.listRetentionPolicies(organizationId),
        medfinetGovernanceApi.listLegalHolds(organizationId),
        medfinetGovernanceApi.listSubjectRequests(organizationId),
        medfinetGovernanceApi.listAuditEvents(organizationId, { limit: 100 }),
      ]);
      setPolicies(policyRows);
      setHolds(holdRows);
      setRequests(requestRows);
      setAudit(auditRows);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to load governance data",
      );
    } finally {
      setLoading(false);
    }
  }, [organizationId]);
  useEffect(() => {
    void load();
  }, [load]);

  async function createRecord(event: React.FormEvent) {
    event.preventDefault();
    if (!organizationId) return;
    setBusy(true);
    setError("");
    try {
      if (tab === "retention")
        await medfinetGovernanceApi.createRetentionPolicy(organizationId, {
          ...policyForm,
          recordCategory: policyForm.recordCategory,
          retentionDays: Number(policyForm.retentionDays),
          disposition: policyForm.disposition as "REVIEW_ONLY",
          legalBasis: policyForm.legalBasis,
        });
      if (tab === "holds")
        await medfinetGovernanceApi.placeLegalHold(organizationId, {
          ...holdForm,
          targetType: holdForm.targetType as "CHILD",
        });
      if (tab === "requests")
        await medfinetGovernanceApi.submitSubjectRequest(organizationId, {
          requestType: requestForm.requestType as "ACCESS",
          caregiverId: requestForm.caregiverId || undefined,
          childId: requestForm.childId || undefined,
          requestDetails: requestForm.requestDetails,
        });
      setCreateOpen(false);
      setNotice("Governance record created and audit evidence recorded.");
      await load();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to create governance record",
      );
    } finally {
      setBusy(false);
    }
  }

  async function policyAction(policy: Policy, action: "activate" | "preview") {
    if (!organizationId) return;
    setBusy(true);
    try {
      if (action === "activate")
        await medfinetGovernanceApi.activateRetentionPolicy(
          organizationId,
          policy.id,
        );
      else
        await medfinetGovernanceApi.previewRetentionRun(
          organizationId,
          policy.id,
          crypto.randomUUID(),
        );
      setNotice(
        action === "activate"
          ? "Retention policy activated."
          : "Retention preview created.",
      );
      await load();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Retention action failed",
      );
    } finally {
      setBusy(false);
    }
  }

  async function requestAction(
    item: SubjectRequest,
    action: "verify" | "complete",
  ) {
    if (!organizationId) return;
    setBusy(true);
    try {
      if (action === "verify")
        await medfinetGovernanceApi.verifySubjectRequest(
          organizationId,
          item.id,
        );
      else
        await medfinetGovernanceApi.completeSubjectRequest(
          organizationId,
          item.id,
        );
      setNotice(
        action === "verify"
          ? "Identity verification recorded."
          : "Data-subject request completed.",
      );
      await load();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Request action failed",
      );
    } finally {
      setBusy(false);
    }
  }

  async function decide(event: React.FormEvent) {
    event.preventDefault();
    if (!organizationId || !decisionRequest) return;
    setBusy(true);
    try {
      await medfinetGovernanceApi.decideSubjectRequest(
        organizationId,
        decisionRequest.id,
        {
          decision: decision.decision as "APPROVED",
          decisionReason: decision.decisionReason,
        },
      );
      setDecisionRequest(null);
      setNotice("Decision recorded and anchoring requested.");
      await load();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to decide request",
      );
    } finally {
      setBusy(false);
    }
  }

  const active =
    tab === "retention"
      ? policies
      : tab === "holds"
        ? holds
        : tab === "requests"
          ? requests
          : audit;
  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-cyan-700">
            Privacy and accountability
          </p>
          <h1 className="text-3xl font-bold text-slate-950">Data governance</h1>
          <p className="mt-2 text-sm text-slate-600">
            Retention, legal holds, data-subject rights and immutable audit
            evidence.
          </p>
        </div>
        {tab !== "audit" && (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="rounded-lg bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white"
          >
            <Plus className="mr-2 inline h-4 w-4" />
            New record
          </button>
        )}
      </div>
      {notice && (
        <div
          role="status"
          className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"
        >
          {notice}
        </div>
      )}
      <div className="mt-6 flex gap-2 overflow-x-auto">
        {(["retention", "holds", "requests", "audit"] as const).map((value) => (
          <button
            type="button"
            key={value}
            onClick={() => setTab(value)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === value ? "bg-slate-950 text-white" : "border bg-white"}`}
          >
            {value}
          </button>
        ))}
      </div>
      <div className="mt-5">
        <PageFeedback
          loading={loading}
          error={error}
          empty={!active.length}
          onRetry={() => void load()}
        >
          {tab === "retention" ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {policies.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border bg-white p-5"
                >
                  <div className="flex justify-between">
                    <div>
                      <h2 className="font-bold">
                        {item.recordCategory.replaceAll("_", " ")}
                      </h2>
                      <p className="text-sm text-slate-600">
                        {item.retentionDays} days · {item.disposition} · v
                        {item.version}
                      </p>
                    </div>
                    <span className="text-xs font-semibold">{item.status}</span>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">
                    {item.legalBasis}
                  </p>
                  <div className="mt-4 flex gap-2">
                    {item.status === "DRAFT" && (
                      <button
                        type="button"
                        onClick={() => void policyAction(item, "activate")}
                        className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white"
                      >
                        Activate
                      </button>
                    )}
                    {item.status === "ACTIVE" && (
                      <button
                        type="button"
                        onClick={() => void policyAction(item, "preview")}
                        className="rounded-lg border px-3 py-2 text-sm font-semibold"
                      >
                        Preview run
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : tab === "holds" ? (
            <div className="space-y-3">
              {holds.map((item) => (
                <article
                  key={item.id}
                  className="flex flex-col justify-between gap-3 rounded-xl border bg-white p-4 sm:flex-row sm:items-center"
                >
                  <div>
                    <p className="font-semibold">
                      {item.targetType} · {item.targetReference}
                    </p>
                    <p className="text-sm text-slate-600">{item.reason}</p>
                  </div>
                  {item.status === "ACTIVE" && (
                    <button
                      type="button"
                      onClick={() => setReleaseTarget(item)}
                      className="rounded-lg border px-3 py-2 text-sm font-semibold"
                    >
                      Release
                    </button>
                  )}
                </article>
              ))}
            </div>
          ) : tab === "requests" ? (
            <div className="space-y-3">
              {requests.map((item) => (
                <article
                  key={item.id}
                  className="rounded-xl border bg-white p-4"
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                      <p className="font-semibold">
                        {item.requestType} · {item.status}
                      </p>
                      <p className="text-sm text-slate-600">
                        {item.requestDetails}
                      </p>
                      <p className="text-xs text-slate-500">
                        Due {new Date(item.dueAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {item.status === "RECEIVED" && (
                        <button
                          type="button"
                          onClick={() => void requestAction(item, "verify")}
                          className="rounded-lg bg-cyan-700 px-3 py-2 text-sm font-semibold text-white"
                        >
                          Verify identity
                        </button>
                      )}
                      {["IDENTITY_VERIFIED", "IN_REVIEW"].includes(
                        item.status,
                      ) && (
                        <button
                          type="button"
                          onClick={() => setDecisionRequest(item)}
                          className="rounded-lg border px-3 py-2 text-sm font-semibold"
                        >
                          Decide
                        </button>
                      )}
                      {item.status === "APPROVED" && (
                        <button
                          type="button"
                          onClick={() => void requestAction(item, "complete")}
                          className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border bg-white">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-3">Time</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Actor</th>
                    <th className="p-3">Entity</th>
                  </tr>
                </thead>
                <tbody>
                  {audit.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="p-3">
                        {new Date(item.createdAt).toLocaleString()}
                      </td>
                      <td className="p-3 font-medium">{item.action}</td>
                      <td className="p-3">{item.actorSubjectId}</td>
                      <td className="p-3">
                        {item.entityType} · {item.entityId}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </PageFeedback>
      </div>
      <Modal
        open={createOpen}
        title={`Create ${tab === "retention" ? "retention policy" : tab === "holds" ? "legal hold" : "data-subject request"}`}
        onClose={() => setCreateOpen(false)}
      >
        <form onSubmit={createRecord} className="space-y-4">
          {tab === "retention" && (
            <>
              <label className="block text-sm font-medium">
                Record category
                <select
                  value={policyForm.recordCategory}
                  onChange={(event) =>
                    setPolicyForm({
                      ...policyForm,
                      recordCategory: event.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                >
                  {[
                    "AUDIT_EVIDENCE",
                    "CLINICAL_RECORD",
                    "IDENTITY_RECORD",
                    "NOTIFICATION_ATTEMPT",
                    "INTEGRATION_STAGING",
                    "PUBLISHED_OUTBOX",
                  ].map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-medium">
                Retention days
                <input
                  required
                  min="1"
                  max="36500"
                  type="number"
                  value={policyForm.retentionDays}
                  onChange={(event) =>
                    setPolicyForm({
                      ...policyForm,
                      retentionDays: event.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                />
              </label>
              <label className="block text-sm font-medium">
                Legal basis
                <textarea
                  required
                  value={policyForm.legalBasis}
                  onChange={(event) =>
                    setPolicyForm({
                      ...policyForm,
                      legalBasis: event.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                />
              </label>
            </>
          )}
          {tab === "holds" && (
            <>
              <label className="block text-sm font-medium">
                Target type
                <select
                  value={holdForm.targetType}
                  onChange={(event) =>
                    setHoldForm({ ...holdForm, targetType: event.target.value })
                  }
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                >
                  <option>CHILD</option>
                  <option>CAREGIVER</option>
                  <option>ORGANIZATION</option>
                </select>
              </label>
              <label className="block text-sm font-medium">
                Target reference
                <input
                  required
                  value={holdForm.targetReference}
                  onChange={(event) =>
                    setHoldForm({
                      ...holdForm,
                      targetReference: event.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                />
              </label>
              <label className="block text-sm font-medium">
                Reason
                <textarea
                  required
                  value={holdForm.reason}
                  onChange={(event) =>
                    setHoldForm({ ...holdForm, reason: event.target.value })
                  }
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                />
              </label>
              <label className="block text-sm font-medium">
                Legal authority
                <textarea
                  required
                  value={holdForm.legalAuthority}
                  onChange={(event) =>
                    setHoldForm({
                      ...holdForm,
                      legalAuthority: event.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                />
              </label>
            </>
          )}
          {tab === "requests" && (
            <>
              <label className="block text-sm font-medium">
                Request type
                <select
                  value={requestForm.requestType}
                  onChange={(event) =>
                    setRequestForm({
                      ...requestForm,
                      requestType: event.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                >
                  {[
                    "ACCESS",
                    "RECTIFICATION",
                    "ERASURE",
                    "RESTRICTION",
                    "PORTABILITY",
                  ].map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-medium">
                Caregiver ID
                <input
                  value={requestForm.caregiverId}
                  onChange={(event) =>
                    setRequestForm({
                      ...requestForm,
                      caregiverId: event.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                />
              </label>
              <label className="block text-sm font-medium">
                Child ID
                <input
                  value={requestForm.childId}
                  onChange={(event) =>
                    setRequestForm({
                      ...requestForm,
                      childId: event.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                />
              </label>
              <label className="block text-sm font-medium">
                Request details
                <textarea
                  required
                  value={requestForm.requestDetails}
                  onChange={(event) =>
                    setRequestForm({
                      ...requestForm,
                      requestDetails: event.target.value,
                    })
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
            Create record
          </button>
        </form>
      </Modal>
      <Modal
        open={Boolean(decisionRequest)}
        title="Decide data-subject request"
        onClose={() => setDecisionRequest(null)}
      >
        <form onSubmit={decide} className="space-y-4">
          <label className="block text-sm font-medium">
            Decision
            <select
              value={decision.decision}
              onChange={(event) =>
                setDecision({ ...decision, decision: event.target.value })
              }
              className="mt-1 w-full rounded-lg border px-3 py-2"
            >
              <option>APPROVED</option>
              <option>DENIED</option>
            </select>
          </label>
          <label className="block text-sm font-medium">
            Decision reason
            <textarea
              required
              value={decision.decisionReason}
              onChange={(event) =>
                setDecision({ ...decision, decisionReason: event.target.value })
              }
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </label>
          <button
            disabled={busy}
            className="w-full rounded-lg bg-cyan-700 px-4 py-2.5 font-semibold text-white"
          >
            Record decision
          </button>
        </form>
      </Modal>
      <ActionReasonModal
        open={Boolean(releaseTarget)}
        title="Release legal hold"
        description="Releasing a hold permits the applicable retention policy to resume. The release is audit recorded."
        confirmLabel="Release hold"
        destructive
        busy={busy}
        onClose={() => setReleaseTarget(null)}
        onConfirm={async (reason) => {
          if (!organizationId || !releaseTarget) return;
          setBusy(true);
          setError("");
          try {
            await medfinetGovernanceApi.releaseLegalHold(
              organizationId,
              releaseTarget.id,
              reason,
            );
            setNotice("Legal hold released.");
            setReleaseTarget(null);
            await load();
          } catch (cause) {
            setError(
              cause instanceof Error ? cause.message : "Unable to release hold",
            );
          } finally {
            setBusy(false);
          }
        }}
      />
    </main>
  );
}
