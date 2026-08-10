import { FormEvent, useCallback, useContext, useEffect, useState } from "react";
import { Copy, KeyRound, Plus, RefreshCw, ShieldAlert } from "lucide-react";
import UserContext from "../../contexts/UserContext";
import { Modal } from "../../components/common/Modal";
import { ActionReasonModal } from "../../components/common/ActionReasonModal";
import { PageFeedback } from "../../components/common/PageFeedback";
import { medfinetClinicalApi } from "../../services/medfinetClinicalApi";
import { medfinetIdentityApi } from "../../services/medfinetIdentityApi";
import { medfinetOperationsApi } from "../../services/medfinetOperationsApi";
import {
  ChildCredential,
  ConsentGrant,
  medfinetSafetyApi,
} from "../../services/medfinetSafetyApi";

type Tab = "emergency" | "consents" | "credentials";
type Emergency = Record<string, unknown> & {
  id: string;
  reasonCode: string;
  justification: string;
  status: string;
  reviewStatus: string;
  actorSubjectId: string;
  activatedAt: string;
  expiresAt: string;
  child: { medfinetId: string; firstName: string; lastName: string };
};
const categories = [
  "IDENTITY",
  "DEMOGRAPHICS",
  "CAREGIVER",
  "IMMUNIZATION",
  "NUTRITION",
  "CLINICAL_ALERTS",
  "APPOINTMENTS",
  "EMERGENCY_PROFILE",
  "CLIMATE",
  "SERVICE_DELIVERY",
  "REWARDS",
];
const input = "mt-1 w-full rounded-lg border px-3 py-2 text-sm";
const button =
  "rounded-lg border bg-white px-3 py-2 text-sm font-semibold disabled:opacity-50";
const primary =
  "rounded-lg bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50";
const nfcClinicalScopes = [
  { category: "IMMUNIZATION", access: "READ" as const },
  { category: "NUTRITION", access: "READ" as const },
  { category: "CLINICAL_ALERTS", access: "READ" as const },
  { category: "APPOINTMENTS", access: "READ" as const },
];
const vaccinationCertificateScopes = [
  { category: "IDENTITY", access: "READ" as const },
  { category: "DEMOGRAPHICS", access: "READ" as const },
  { category: "IMMUNIZATION", access: "READ" as const },
];
export default function SafetyAdministration() {
  const { organizationId } = useContext(UserContext);
  const [tab, setTab] = useState<Tab>("emergency");
  const [children, setChildren] = useState<
    Array<{
      id: string;
      firstName: string;
      lastName: string;
      medfinetId: string;
    }>
  >([]);
  const [childId, setChildId] = useState("");
  const [consentCaregivers, setConsentCaregivers] = useState<
    Array<{
      id: string;
      firstName: string;
      lastName: string;
      relationship: string;
    }>
  >([]);
  const [emergency, setEmergency] = useState<Emergency[]>([]);
  const [consents, setConsents] = useState<ConsentGrant[]>([]);
  const [credentials, setCredentials] = useState<ChildCredential[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [oneTimeToken, setOneTimeToken] = useState("");
  const [action, setAction] = useState<
    | { type: "emergency"; item: Emergency; decision: "APPROVED" | "FLAGGED" }
    | { type: "consent"; id: string }
    | { type: "credential"; id: string }
    | null
  >(null);
  const [consentForm, setConsentForm] = useState({
    bundle: "NFC_VACCINATION" as "NFC_VACCINATION" | "CUSTOM",
    grantedByCaregiverId: "",
    recipientType: "ORGANIZATION",
    recipientId: "",
    purpose: "",
    legalBasis: "",
    policyVersion: "1.0",
    captureMethod: "IN_PERSON",
    expiresAt: "",
    category: "IMMUNIZATION",
    access: "READ" as "READ" | "WRITE",
  });
  const [credentialForm, setCredentialForm] = useState({
    kind: "QR" as "QR" | "RECOVERY",
    expiresAt: "",
  });
  const load = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setError(null);
    try {
      const [childPage, emergencyRows] = await Promise.all([
        medfinetIdentityApi.listChildren(organizationId, { limit: 100 }),
        medfinetOperationsApi.emergencyAccess(organizationId),
      ]);
      setChildren(childPage.items);
      setEmergency(emergencyRows as Emergency[]);
      const selected = childId || childPage.items[0]?.id || "";
      setChildId(selected);
      if (selected) {
        const [grantRows, credentialRows, authorityRows] = await Promise.all([
          medfinetSafetyApi.listConsents(organizationId, selected),
          medfinetSafetyApi.listCredentials(organizationId, selected),
          medfinetSafetyApi.listConsentAuthorities(organizationId, selected),
        ]);
        setConsents(grantRows);
        setCredentials(credentialRows);
        const authorities = authorityRows.map((link) => ({
          id: link.caregiver.id,
          firstName: link.caregiver.firstName,
          lastName: link.caregiver.lastName,
          relationship: link.relationship,
        }));
        setConsentCaregivers(authorities);
        setConsentForm((current) => ({
          ...current,
          recipientId: current.recipientId || organizationId,
          grantedByCaregiverId: authorities.some(
            (caregiver) => caregiver.id === current.grantedByCaregiverId,
          )
            ? current.grantedByCaregiverId
            : authorities[0]?.id || "",
        }));
      }
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to load safety operations",
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
        reason instanceof Error ? reason.message : "Safety operation failed",
      );
    } finally {
      setBusy(false);
    }
  };
  const create = async (event: FormEvent) => {
    event.preventDefault();
    if (!organizationId || !childId) return;
    setBusy(true);
    setError(null);
    try {
      if (tab === "consents") {
        const common = {
          grantedByCaregiverId: consentForm.grantedByCaregiverId,
          recipientType: consentForm.recipientType,
          recipientId: consentForm.recipientId,
          legalBasis: consentForm.legalBasis,
          policyVersion: consentForm.policyVersion,
          captureMethod: consentForm.captureMethod,
          expiresAt: consentForm.expiresAt
            ? new Date(consentForm.expiresAt).toISOString()
            : undefined,
        };
        if (consentForm.bundle === "NFC_VACCINATION") {
          await medfinetSafetyApi.grantConsent(organizationId, childId, {
            ...common,
            purpose: "clinical-record-view",
            scopes: nfcClinicalScopes,
          });
          await medfinetSafetyApi.grantConsent(organizationId, childId, {
            ...common,
            purpose: "vaccination-certificate-download",
            scopes: vaccinationCertificateScopes,
          });
        } else {
          await medfinetSafetyApi.grantConsent(organizationId, childId, {
            ...common,
            purpose: consentForm.purpose,
            scopes: [
              { category: consentForm.category, access: consentForm.access },
            ],
          });
        }
      } else {
        const result = await medfinetSafetyApi.issueCredential(
          organizationId,
          childId,
          {
            kind: credentialForm.kind,
            expiresAt: credentialForm.expiresAt
              ? new Date(credentialForm.expiresAt).toISOString()
              : undefined,
          },
        );
        setOneTimeToken(result.token);
      }
      setNotice(
        tab === "consents"
          ? consentForm.bundle === "NFC_VACCINATION"
            ? "Clinical and vaccination-certificate consent grants are active and queued for anchoring."
            : "Consent grant recorded and queued for anchoring."
          : "Credential issued. Copy the token now; it will not be shown again.",
      );
      setOpen(false);
      await load();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to create record",
      );
    } finally {
      setBusy(false);
    }
  };
  const rows =
    tab === "emergency"
      ? emergency
      : tab === "consents"
        ? consents
        : credentials;
  return (
    <main className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row">
        <div>
          <p className="text-sm font-semibold text-cyan-700">
            High-trust operations
          </p>
          <h1 className="text-3xl font-bold">
            Safety, consent and credentials
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Emergency review, narrow consent grants and non-NFC child
            credentials.
          </p>
        </div>
        <div className="flex gap-2">
          <button className={button} onClick={() => void load()}>
            <RefreshCw className="mr-2 inline h-4 w-4" />
            Refresh
          </button>
          {tab !== "emergency" && (
            <button
              className={primary}
              disabled={!childId}
              onClick={() => setOpen(true)}
            >
              <Plus className="mr-2 inline h-4 w-4" />
              New {tab === "consents" ? "consent" : "credential"}
            </button>
          )}
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
      {oneTimeToken && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
          <p className="font-bold text-amber-950">One-time credential token</p>
          <code className="mt-2 block break-all text-sm">{oneTimeToken}</code>
          <button
            className={button}
            onClick={() => void navigator.clipboard.writeText(oneTimeToken)}
          >
            <Copy className="mr-2 inline h-4 w-4" />
            Copy
          </button>
          <button
            className={`${button} ml-2`}
            onClick={() => setOneTimeToken("")}
          >
            I stored it securely
          </button>
        </div>
      )}
      <div className="flex gap-2 overflow-auto">
        {(["emergency", "consents", "credentials"] as Tab[]).map((value) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === value ? "bg-slate-950 text-white" : "border bg-white"}`}
          >
            {value}
          </button>
        ))}
      </div>
      {tab !== "emergency" && (
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
      )}
      <PageFeedback
        loading={loading}
        error={error}
        empty={!rows.length}
        onRetry={() => void load()}
      >
        <div className="space-y-3">
          {tab === "emergency"
            ? emergency.map((item) => (
                <article
                  key={item.id}
                  className="rounded-xl border bg-white p-4"
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row">
                    <div>
                      <p className="font-bold">
                        {item.child.firstName} {item.child.lastName} ·{" "}
                        {item.reasonCode}
                      </p>
                      <p className="text-sm text-slate-600">
                        {item.justification}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.status} · review {item.reviewStatus} · actor{" "}
                        {item.actorSubjectId}
                      </p>
                    </div>
                    {item.reviewStatus === "PENDING" && (
                      <div className="flex gap-2">
                        <button
                          className={primary}
                          onClick={() =>
                            setAction({
                              type: "emergency",
                              item,
                              decision: "APPROVED",
                            })
                          }
                        >
                          Approve
                        </button>
                        <button
                          className={button}
                          onClick={() =>
                            setAction({
                              type: "emergency",
                              item,
                              decision: "FLAGGED",
                            })
                          }
                        >
                          Flag and revoke
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              ))
            : tab === "consents"
              ? consents.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-xl border bg-white p-4"
                  >
                    <div className="flex justify-between gap-3">
                      <div>
                        <p className="font-bold">
                          {item.recipientType} · {item.recipientId}
                        </p>
                        <p className="text-sm text-slate-600">
                          {item.purpose} ·{" "}
                          {item.scopes
                            .map((x) => `${x.category}:${x.access}`)
                            .join(", ")}
                        </p>
                        <p className="text-xs text-slate-500">{item.status}</p>
                      </div>
                      {item.status === "ACTIVE" && (
                        <button
                          className={button}
                          onClick={() =>
                            setAction({ type: "consent", id: item.id })
                          }
                        >
                          Withdraw
                        </button>
                      )}
                    </div>
                  </article>
                ))
              : credentials.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-xl border bg-white p-4"
                  >
                    <div className="flex justify-between gap-3">
                      <div>
                        <p className="font-bold">
                          <KeyRound className="mr-2 inline h-4 w-4" />
                          {item.kind} credential
                        </p>
                        <p className="text-xs text-slate-500">
                          {item.status} · issued{" "}
                          {new Date(item.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {item.status === "ACTIVE" && item.kind !== "NFC" && (
                        <button
                          className={button}
                          onClick={() =>
                            setAction({ type: "credential", id: item.id })
                          }
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  </article>
                ))}
        </div>
      </PageFeedback>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={
          tab === "consents" ? "Grant narrow consent" : "Issue child credential"
        }
      >
        <form className="space-y-4" onSubmit={(event) => void create(event)}>
          {tab === "consents" ? (
            <>
              <label className="block text-sm font-semibold">
                Disclosure bundle
                <select
                  className={input}
                  value={consentForm.bundle}
                  onChange={(e) =>
                    setConsentForm({
                      ...consentForm,
                      bundle: e.target.value as "NFC_VACCINATION" | "CUSTOM",
                    })
                  }
                >
                  <option value="NFC_VACCINATION">
                    NFC clinical record + vaccination certificate
                  </option>
                  <option value="CUSTOM">Custom single scope</option>
                </select>
                {consentForm.bundle === "NFC_VACCINATION" && (
                  <span className="mt-2 block text-xs font-normal text-slate-600">
                    Records the two narrow read grants required to view the
                    clinical timeline and download its vaccination certificate.
                  </span>
                )}
              </label>
              <label className="block text-sm font-semibold">
                Caregiver with consent authority
                <select
                  required
                  className={input}
                  value={consentForm.grantedByCaregiverId}
                  onChange={(e) =>
                    setConsentForm({
                      ...consentForm,
                      grantedByCaregiverId: e.target.value,
                    })
                  }
                >
                  <option value="">Select authorized caregiver</option>
                  {consentCaregivers.map((caregiver) => (
                    <option key={caregiver.id} value={caregiver.id}>
                      {caregiver.firstName} {caregiver.lastName} ·{" "}
                      {caregiver.relationship}
                    </option>
                  ))}
                </select>
                {!consentCaregivers.length && (
                  <span className="mt-2 block text-xs font-normal text-amber-700">
                    Link a caregiver with consent authority before granting
                    consent.
                  </span>
                )}
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold">
                  Recipient type
                  <select
                    className={input}
                    value={consentForm.recipientType}
                    onChange={(e) =>
                      setConsentForm({
                        ...consentForm,
                        recipientType: e.target.value,
                      })
                    }
                  >
                    <option>ORGANIZATION</option>
                    <option>PROGRAMME</option>
                    <option>PARTNER</option>
                    <option>RESEARCH</option>
                  </select>
                </label>
                <label className="text-sm font-semibold">
                  Recipient ID
                  <input
                    required
                    className={input}
                    value={consentForm.recipientId}
                    onChange={(e) =>
                      setConsentForm({
                        ...consentForm,
                        recipientId: e.target.value,
                      })
                    }
                  />
                </label>
              </div>
              {consentForm.bundle === "CUSTOM" && (
                <>
                  <label className="block text-sm font-semibold">
                    Purpose
                    <input
                      required
                      className={input}
                      value={consentForm.purpose}
                      onChange={(e) =>
                        setConsentForm({
                          ...consentForm,
                          purpose: e.target.value,
                        })
                      }
                    />
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-sm font-semibold">
                      Category
                      <select
                        className={input}
                        value={consentForm.category}
                        onChange={(e) =>
                          setConsentForm({
                            ...consentForm,
                            category: e.target.value,
                          })
                        }
                      >
                        {categories.map((x) => (
                          <option key={x}>{x}</option>
                        ))}
                      </select>
                    </label>
                    <label className="text-sm font-semibold">
                      Access
                      <select
                        className={input}
                        value={consentForm.access}
                        onChange={(e) =>
                          setConsentForm({
                            ...consentForm,
                            access: e.target.value as "READ" | "WRITE",
                          })
                        }
                      >
                        <option>READ</option>
                        <option>WRITE</option>
                      </select>
                    </label>
                  </div>
                </>
              )}
              <label className="block text-sm font-semibold">
                Legal basis
                <input
                  required
                  className={input}
                  value={consentForm.legalBasis}
                  onChange={(e) =>
                    setConsentForm({
                      ...consentForm,
                      legalBasis: e.target.value,
                    })
                  }
                />
              </label>
              <label className="block text-sm font-semibold">
                Expiry (optional)
                <input
                  type="datetime-local"
                  className={input}
                  value={consentForm.expiresAt}
                  onChange={(e) =>
                    setConsentForm({
                      ...consentForm,
                      expiresAt: e.target.value,
                    })
                  }
                />
              </label>
            </>
          ) : (
            <>
              <label className="block text-sm font-semibold">
                Credential kind
                <select
                  className={input}
                  value={credentialForm.kind}
                  onChange={(e) =>
                    setCredentialForm({
                      ...credentialForm,
                      kind: e.target.value as "QR" | "RECOVERY",
                    })
                  }
                >
                  <option>QR</option>
                  <option>RECOVERY</option>
                </select>
              </label>
              <label className="block text-sm font-semibold">
                Expiry (optional)
                <input
                  type="datetime-local"
                  className={input}
                  value={credentialForm.expiresAt}
                  onChange={(e) =>
                    setCredentialForm({
                      ...credentialForm,
                      expiresAt: e.target.value,
                    })
                  }
                />
              </label>
              <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                <ShieldAlert className="mr-2 inline h-4 w-4" />
                NFC credentials use the dedicated protected provisioning
                workflow.
              </p>
            </>
          )}
          <button
            className={primary}
            disabled={
              busy || (tab === "consents" && !consentForm.grantedByCaregiverId)
            }
          >
            Save
          </button>
        </form>
      </Modal>
      <ActionReasonModal
        open={Boolean(action)}
        title={
          action?.type === "emergency"
            ? `${action.decision === "APPROVED" ? "Approve" : "Flag"} emergency access`
            : action?.type === "consent"
              ? "Withdraw consent"
              : "Revoke credential"
        }
        description="This high-trust decision is audit recorded and takes effect immediately."
        confirmLabel={
          action?.type === "emergency"
            ? action.decision === "APPROVED"
              ? "Approve access"
              : "Flag and revoke"
            : action?.type === "consent"
              ? "Withdraw consent"
              : "Revoke credential"
        }
        destructive={
          action?.type !== "emergency" || action.decision === "FLAGGED"
        }
        busy={busy}
        onClose={() => setAction(null)}
        onConfirm={async (reason) => {
          if (!organizationId || !action) return;
          if (action.type === "emergency") {
            await run(
              () =>
                medfinetClinicalApi.reviewEmergencyAccess(
                  organizationId,
                  action.item.id,
                  { decision: action.decision, reviewNotes: reason },
                ),
              `Emergency access ${action.decision.toLowerCase()}.`,
            );
          } else if (action.type === "consent") {
            await run(
              () =>
                medfinetSafetyApi.withdrawConsent(
                  organizationId,
                  action.id,
                  reason,
                ),
              "Consent withdrawn.",
            );
          } else {
            await run(
              () =>
                medfinetSafetyApi.revokeCredential(
                  organizationId,
                  action.id,
                  reason,
                ),
              "Credential revoked.",
            );
          }
          setAction(null);
        }}
      />
    </main>
  );
}
