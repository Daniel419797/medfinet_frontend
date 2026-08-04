import { FormEvent, useContext, useEffect, useState } from "react";
import { CheckCircle2, Copy, CreditCard, ShieldAlert } from "lucide-react";
import {
  medfinetNfcApi,
  NfcDraft,
  NfcPreparation,
} from "../../services/medfinetNfcApi";
import UserContext from "../../contexts/UserContext";
import { ActionReasonModal } from "../../components/common/ActionReasonModal";
import { medfinetIdentityApi } from "../../services/medfinetIdentityApi";
import { medfinetOperationsApi } from "../../services/medfinetOperationsApi";

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-mono text-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
      />
    </label>
  );
}

function SecretValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-amber-800">
          {label}
        </span>
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(value)}
          className="rounded-lg p-1.5 text-amber-800 hover:bg-amber-100"
          aria-label={`Copy ${label}`}
        >
          <Copy size={16} />
        </button>
      </div>
      <code className="mt-2 block break-all text-xs text-amber-950">
        {value}
      </code>
    </div>
  );
}

export default function NfcProvisioningPage() {
  const { organizationId } = useContext(UserContext);
  const [childId, setChildId] = useState("");
  const [children, setChildren] = useState<
    Array<{
      id: string;
      firstName: string;
      lastName: string;
      medfinetId: string;
    }>
  >([]);
  const [devices, setDevices] = useState<Array<Record<string, unknown>>>([]);
  const [versionResponse, setVersionResponse] = useState("");
  const [uid, setUid] = useState("");
  const [originalitySignature, setOriginalitySignature] = useState("");
  const [originalityVerified, setOriginalityVerified] = useState(false);
  const [deviceId, setDeviceId] = useState("");
  const [deviceSignature, setDeviceSignature] = useState("");
  const [readback, setReadback] = useState("");
  const [ndefReadback, setNdefReadback] = useState("");
  const [configurationPageHex, setConfigurationPageHex] = useState("");
  const [accessPageHex, setAccessPageHex] = useState("");
  const [packResponseHex, setPackResponseHex] = useState("");
  const [activationSignature, setActivationSignature] = useState("");
  const [draft, setDraft] = useState<NfcDraft | null>(null);
  const [preparation, setPreparation] = useState<NfcPreparation | null>(null);
  const [activated, setActivated] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState<Awaited<
    ReturnType<typeof medfinetNfcApi.operationsSummary>
  > | null>(null);
  const [bindings, setBindings] = useState<
    Awaited<ReturnType<typeof medfinetNfcApi.listChildBindings>>
  >([]);
  const [lifecycleTarget, setLifecycleTarget] = useState<{
    binding: Awaited<
      ReturnType<typeof medfinetNfcApi.listChildBindings>
    >[number];
    action: "revoke" | "replace" | "cancel";
  } | null>(null);

  useEffect(() => {
    if (!organizationId) return;
    Promise.all([
      medfinetIdentityApi.listChildren(organizationId, { limit: 100 }),
      medfinetOperationsApi.devices(organizationId),
      medfinetNfcApi.operationsSummary(organizationId),
    ])
      .then(([childPage, registeredDevices, currentSummary]) => {
        setChildren(childPage.items);
        setDevices(registeredDevices);
        setSummary(currentSummary);
      })
      .catch((reason) =>
        setError(
          reason instanceof Error
            ? reason.message
            : "Could not load NFC operations",
        ),
      );
  }, [organizationId]);

  useEffect(() => {
    if (!organizationId || !childId) {
      setBindings([]);
      return;
    }
    void medfinetNfcApi
      .listChildBindings(organizationId, childId)
      .then(setBindings)
      .catch((reason) =>
        setError(
          reason instanceof Error
            ? reason.message
            : "Could not load child card lifecycle",
        ),
      );
  }, [childId, organizationId]);

  async function run(operation: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await operation();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "NFC operation failed",
      );
    } finally {
      setBusy(false);
    }
  }

  async function refreshLifecycle(orgId: string, selectedChildId: string) {
    const [rows, currentSummary] = await Promise.all([
      medfinetNfcApi.listChildBindings(orgId, selectedChildId),
      medfinetNfcApi.operationsSummary(orgId),
    ]);
    setBindings(rows);
    setSummary(currentSummary);
  }

  function create(event: FormEvent) {
    event.preventDefault();
    const orgId = organizationId;
    if (!orgId) return;
    void run(async () => {
      setDraft(await medfinetNfcApi.createDraft(orgId, childId.trim()));
      setPreparation(null);
      setActivated(false);
      await refreshLifecycle(orgId, childId.trim());
    });
  }

  function prepare(event: FormEvent) {
    event.preventDefault();
    const orgId = organizationId;
    if (!draft || !orgId) return;
    void run(async () => {
      setPreparation(
        await medfinetNfcApi.prepare(orgId, draft.binding.id, {
          personalizationToken: draft.personalizationToken,
          versionResponse: versionResponse.trim(),
          uid: uid.trim(),
          originalitySignature: originalitySignature.trim(),
          originalityVerified,
          deviceId: deviceId.trim(),
          deviceSignature: deviceSignature.trim(),
        }),
      );
    });
  }

  function activate(event: FormEvent) {
    event.preventDefault();
    const orgId = organizationId;
    if (!draft || !orgId) return;
    void run(async () => {
      await medfinetNfcApi.activate(orgId, draft.binding.id, {
        personalizationToken: draft.personalizationToken,
        cardToken: draft.cardToken,
        uc: readback.trim(),
        ndefReadback: ndefReadback.trim(),
        configurationPageHex: configurationPageHex.trim(),
        accessPageHex: accessPageHex.trim(),
        packResponseHex: packResponseHex.trim(),
        writeProtected: true,
        configurationLocked: true,
        deviceId: deviceId.trim(),
        deviceSignature: activationSignature.trim(),
      });
      setActivated(true);
      await refreshLifecycle(orgId, childId);
    });
  }

  function cancelDraft() {
    const orgId = organizationId;
    if (!draft || !orgId) return;
    void run(async () => {
      await medfinetNfcApi.cancelProvisioning(
        orgId,
        draft.binding.id,
        "Provisioning cancelled by administrator before activation",
      );
      setDraft(null);
      setPreparation(null);
      setActivated(false);
      setVersionResponse("");
      setUid("");
      setOriginalitySignature("");
      setDeviceSignature("");
      setReadback("");
      setNdefReadback("");
      setConfigurationPageHex("");
      setAccessPageHex("");
      setPackResponseHex("");
      setActivationSignature("");
      setBindings(await medfinetNfcApi.listChildBindings(orgId, childId));
    });
  }

  return (
    <main className="mx-auto max-w-5xl p-4 sm:p-6">
      <header className="mb-6">
        <p className="text-sm font-semibold text-cyan-700">
          NTAG215 OPERATIONS
        </p>
        <h1 className="mt-1 text-3xl font-bold text-slate-950">
          Provision child NFC card
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Use a genuine NTAG215 card and an approved raw-NFC provisioning
          station. One-time tokens and card passwords exist only in this page’s
          memory; closing or refreshing it discards them.
        </p>
      </header>

      <section className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
        <button
          type="button"
          disabled={busy || !organizationId}
          onClick={() => {
            const orgId = organizationId;
            if (orgId)
              void run(async () =>
                setSummary(await medfinetNfcApi.operationsSummary(orgId)),
              );
          }}
          className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 disabled:opacity-50"
        >
          Refresh NFC operations
        </button>
        {summary && (
          <>
            <span>
              <strong>{summary.bindings.ACTIVE || 0}</strong> active
            </span>
            <span>
              <strong>{summary.bindings.PENDING || 0}</strong> pending
            </span>
            <span>
              <strong>{summary.bindings.REVOKED || 0}</strong> revoked
            </span>
            <span>
              <strong>{summary.pendingChallenges}</strong> live challenges
            </span>
          </>
        )}
      </section>

      {error && (
        <div
          role="alert"
          className="mb-5 flex gap-3 rounded-xl border border-rose-300 bg-rose-50 p-4 text-rose-900"
        >
          <ShieldAlert className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        <form
          onSubmit={create}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="mb-4 flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-900 font-bold text-white">
              1
            </span>
            <h2 className="font-semibold text-slate-900">Issue draft</h2>
          </div>
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Child record
              </span>
              <select
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
                value={childId}
                onChange={(event) => setChildId(event.target.value)}
              >
                <option value="">Select child</option>
                {children.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.firstName} {child.lastName} · {child.medfinetId}
                  </option>
                ))}
              </select>
            </label>
            <button
              disabled={busy || !organizationId || !childId.trim()}
              className="w-full rounded-xl bg-slate-900 px-4 py-2.5 font-semibold text-white disabled:opacity-50"
            >
              Create NFC draft
            </button>
          </div>
        </form>

        <form
          onSubmit={prepare}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="mb-4 flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-cyan-700 font-bold text-white">
              2
            </span>
            <h2 className="font-semibold text-slate-900">
              Verify physical card
            </h2>
          </div>
          <div className="space-y-4">
            <Field
              label="GET_VERSION response"
              value={versionResponse}
              onChange={setVersionResponse}
              placeholder="0004040201001103"
            />
            <Field
              label="7-byte UID"
              value={uid}
              onChange={setUid}
              placeholder="04DE5F1EACC040"
            />
            <Field
              label="READ_SIG response"
              value={originalitySignature}
              onChange={setOriginalitySignature}
              placeholder="64 hexadecimal characters"
            />
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Approved provisioning device
              </span>
              <select
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
                value={deviceId}
                onChange={(event) => setDeviceId(event.target.value)}
              >
                <option value="">Select device</option>
                {devices.map((device) => (
                  <option key={String(device.id)} value={String(device.id)}>
                    {String(
                      device.displayName ||
                        device.deviceIdentifier ||
                        device.id,
                    )}{" "}
                    · {String(device.status || "UNKNOWN")}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              disabled={busy || !organizationId || !deviceId.trim()}
              onClick={() =>
                void run(async () => {
                  if (!organizationId) return;
                  await medfinetNfcApi.setProvisioningCapability(
                    organizationId,
                    deviceId.trim(),
                    true,
                  );
                })
              }
              className="w-full rounded-xl border border-cyan-700 px-4 py-2.5 text-sm font-semibold text-cyan-800 disabled:opacity-50"
            >
              Approve this raw-NFC station
            </button>
            <Field
              label="Station attestation signature"
              value={deviceSignature}
              onChange={setDeviceSignature}
              placeholder="Base64url signature from approved station"
            />
            <label className="flex gap-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={originalityVerified}
                onChange={(event) =>
                  setOriginalityVerified(event.target.checked)
                }
                className="mt-0.5 h-4 w-4"
              />
              Approved scanner verified the NXP originality signature.
            </label>
            <button
              disabled={
                busy ||
                !draft ||
                versionResponse.toUpperCase() !== "0004040201001103" ||
                !uid ||
                !originalitySignature ||
                !originalityVerified ||
                !deviceId ||
                !deviceSignature
              }
              className="w-full rounded-xl bg-cyan-700 px-4 py-2.5 font-semibold text-white disabled:opacity-50"
            >
              Derive write protection
            </button>
          </div>
        </form>

        <form
          onSubmit={activate}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="mb-4 flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-700 font-bold text-white">
              3
            </span>
            <h2 className="font-semibold text-slate-900">
              Read back and activate
            </h2>
          </div>
          <div className="space-y-4">
            <Field
              label="Mirrored UID + counter"
              value={readback}
              onChange={setReadback}
              placeholder="04DE5F1EACC040x000001"
            />
            <Field
              label="Exact NDEF URL read-back"
              value={ndefReadback}
              onChange={setNdefReadback}
            />
            <Field
              label="CFG0 page 131 read-back"
              value={configurationPageHex}
              onChange={setConfigurationPageHex}
              placeholder={draft?.manifest.stationPlan.configurationPageHex}
            />
            <Field
              label="ACCESS page 132 read-back"
              value={accessPageHex}
              onChange={setAccessPageHex}
              placeholder="57000000"
            />
            <Field
              label="PWD_AUTH PACK response"
              value={packResponseHex}
              onChange={setPackResponseHex}
              placeholder={preparation?.access.packHex}
            />
            <Field
              label="Activation attestation signature"
              value={activationSignature}
              onChange={setActivationSignature}
              placeholder="Signed read-back from approved station"
            />
            <button
              disabled={
                busy ||
                !preparation ||
                !/^[0-9A-F]{14}x[0-9A-F]{6}$/.test(readback) ||
                !ndefReadback ||
                !/^[0-9A-Fa-f]{8}$/.test(configurationPageHex) ||
                accessPageHex.toUpperCase() !== "57000000" ||
                !/^[0-9A-Fa-f]{4}$/.test(packResponseHex) ||
                !deviceId ||
                !activationSignature
              }
              className="w-full rounded-xl bg-emerald-700 px-4 py-2.5 font-semibold text-white disabled:opacity-50"
            >
              Activate protected card
            </button>
            {activated && (
              <div className="flex gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-800">
                <CheckCircle2 size={18} /> Card activated
              </div>
            )}
          </div>
        </form>
      </div>

      {draft && (
        <section className="mt-5 rounded-2xl border border-amber-300 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CreditCard className="text-amber-700" />
              <h2 className="font-semibold text-slate-900">
                One-time station package
              </h2>
            </div>
            {!activated && (
              <button
                type="button"
                onClick={cancelDraft}
                disabled={busy}
                className="rounded-lg border border-rose-300 px-3 py-1.5 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
              >
                Cancel safely
              </button>
            )}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <SecretValue label="Card token" value={draft.cardToken} />
            <SecretValue
              label="Personalization token"
              value={draft.personalizationToken}
            />
            <SecretValue
              label="Type 2 memory (hex)"
              value={draft.manifest.type2UserMemoryHex}
            />
            <SecretValue
              label="Mirror configuration"
              value={`UID+COUNTER page ${draft.manifest.mirror.page}, byte ${draft.manifest.mirror.byte}`}
            />
          </div>
        </section>
      )}

      {preparation && (
        <section className="mt-5 rounded-2xl border border-cyan-300 bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-semibold text-slate-900">
            Write-protection credentials
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <SecretValue label="PWD" value={preparation.access.passwordHex} />
            <SecretValue label="PACK" value={preparation.access.packHex} />
          </div>
        </section>
      )}

      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold text-slate-950">Card lifecycle</h2>
            <p className="mt-1 text-sm text-slate-600">
              Review, cancel, revoke or replace cards for the selected child.
            </p>
          </div>
          <button
            type="button"
            disabled={!organizationId || !childId || busy}
            onClick={() => {
              if (organizationId && childId)
                void run(async () =>
                  setBindings(
                    await medfinetNfcApi.listChildBindings(
                      organizationId,
                      childId,
                    ),
                  ),
                );
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold disabled:opacity-50"
          >
            Refresh cards
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {bindings.map((binding) => (
            <article
              key={binding.id}
              className="flex flex-col justify-between gap-3 rounded-xl bg-slate-50 p-4 sm:flex-row sm:items-center"
            >
              <div className="min-w-0">
                <p className="font-semibold text-slate-950">
                  {binding.status} card
                </p>
                <p className="truncate text-xs text-slate-500">
                  Public route {binding.publicId}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Created {new Date(binding.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {binding.status === "PENDING" && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      setLifecycleTarget({ binding, action: "cancel" })
                    }
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold"
                  >
                    Cancel draft
                  </button>
                )}
                {binding.status === "ACTIVE" && (
                  <>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        setLifecycleTarget({ binding, action: "replace" })
                      }
                      className="rounded-lg border border-cyan-300 bg-white px-3 py-2 text-sm font-semibold text-cyan-800"
                    >
                      Replace card
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        setLifecycleTarget({ binding, action: "revoke" })
                      }
                      className="rounded-lg border border-rose-300 bg-white px-3 py-2 text-sm font-semibold text-rose-700"
                    >
                      Revoke card
                    </button>
                  </>
                )}
              </div>
            </article>
          ))}
          {childId && !bindings.length && (
            <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
              No card lifecycle records for this child.
            </p>
          )}
          {!childId && (
            <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
              Select a child to review cards.
            </p>
          )}
        </div>
      </section>

      <ActionReasonModal
        open={Boolean(lifecycleTarget)}
        title={`${lifecycleTarget?.action === "cancel" ? "Cancel draft" : lifecycleTarget?.action === "replace" ? "Replace card" : "Revoke card"}`}
        description={
          lifecycleTarget?.action === "replace"
            ? "The active card is rotated immediately and a new one-time station package will be shown."
            : "This action is audit recorded and cannot be silently undone."
        }
        confirmLabel={
          lifecycleTarget?.action === "replace"
            ? "Start replacement"
            : lifecycleTarget?.action === "cancel"
              ? "Cancel draft"
              : "Revoke card"
        }
        destructive={lifecycleTarget?.action !== "replace"}
        busy={busy}
        onClose={() => setLifecycleTarget(null)}
        onConfirm={async (reason) => {
          if (!organizationId || !lifecycleTarget) return;
          const target = lifecycleTarget;
          await run(async () => {
            if (target.action === "replace") {
              const replacement = await medfinetNfcApi.replaceBinding(
                organizationId,
                target.binding.id,
                reason,
              );
              setDraft(replacement);
              setPreparation(null);
              setActivated(false);
            } else if (target.action === "revoke")
              await medfinetNfcApi.revokeBinding(
                organizationId,
                target.binding.id,
                reason,
              );
            else
              await medfinetNfcApi.cancelProvisioning(
                organizationId,
                target.binding.id,
                reason,
              );
            if (childId)
              setBindings(
                await medfinetNfcApi.listChildBindings(organizationId, childId),
              );
          });
          setLifecycleTarget(null);
        }}
      />
    </main>
  );
}
