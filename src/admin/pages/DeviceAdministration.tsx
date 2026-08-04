import { FormEvent, useCallback, useContext, useEffect, useState } from "react";
import { Laptop, Plus, RefreshCw, ShieldCheck } from "lucide-react";
import UserContext from "../../contexts/UserContext";
import { Modal } from "../../components/common/Modal";
import { ActionReasonModal } from "../../components/common/ActionReasonModal";
import { PageFeedback } from "../../components/common/PageFeedback";
import { medfinetNfcApi } from "../../services/medfinetNfcApi";
import { medfinetOperationsApi } from "../../services/medfinetOperationsApi";

type Device = Record<string, unknown> & {
  id: string;
  displayName?: string;
  deviceIdentifier?: string;
  platform?: string;
  appVersion?: string;
  status?: string;
  nfcProvisioningEnabled?: boolean;
  createdAt?: string;
};
const input =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm";
const button =
  "rounded-lg border bg-white px-3 py-2 text-sm font-semibold disabled:opacity-50";
const primary =
  "rounded-lg bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50";

export default function DeviceAdministration() {
  const { organizationId } = useContext(UserContext);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<Device | null>(null);
  const [form, setForm] = useState({
    deviceIdentifier: "",
    displayName: "",
    platform: "WINDOWS",
    appVersion: "",
    publicKey: "",
  });
  const load = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setError(null);
    try {
      setDevices(
        (await medfinetOperationsApi.devices(organizationId)) as Device[],
      );
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to load devices",
      );
    } finally {
      setLoading(false);
    }
  }, [organizationId]);
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
        reason instanceof Error ? reason.message : "Device operation failed",
      );
    } finally {
      setBusy(false);
    }
  };
  const create = async (event: FormEvent) => {
    event.preventDefault();
    if (!organizationId) return;
    await run(
      () => medfinetNfcApi.registerDevice(organizationId, form),
      "Device registered. Provisioning remains disabled until separately approved.",
    );
    setOpen(false);
  };
  return (
    <main className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row">
        <div>
          <p className="text-sm font-semibold text-cyan-700">
            Trusted field hardware
          </p>
          <h1 className="text-3xl font-bold">Device administration</h1>
          <p className="mt-2 text-sm text-slate-600">
            Registration, revocation and separate NFC-station capability
            approval.
          </p>
        </div>
        <div className="flex gap-2">
          <button className={button} onClick={() => void load()}>
            <RefreshCw className="mr-2 inline h-4 w-4" />
            Refresh
          </button>
          <button className={primary} onClick={() => setOpen(true)}>
            <Plus className="mr-2 inline h-4 w-4" />
            Register device
          </button>
        </div>
      </div>
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <ShieldCheck className="mr-2 inline h-5 w-5" />
        Private signing keys must remain on the device. Only the public key is
        registered here. NFC provisioning approval requires recent MFA.
      </div>
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
        error={error}
        empty={!devices.length}
        onRetry={() => void load()}
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {devices.map((device) => (
            <article key={device.id} className="rounded-xl border bg-white p-5">
              <div className="flex justify-between">
                <div>
                  <Laptop className="mb-3 h-6 w-6 text-cyan-700" />
                  <h2 className="font-bold">
                    {device.displayName || device.deviceIdentifier || device.id}
                  </h2>
                  <p className="text-sm text-slate-600">
                    {device.platform} · app {device.appVersion || "unknown"}
                  </p>
                </div>
                <span className="text-xs font-bold">
                  {device.status || "UNKNOWN"}
                </span>
              </div>
              <p className="mt-3 text-sm">
                Provisioning:{" "}
                <strong>
                  {device.nfcProvisioningEnabled ? "approved" : "not approved"}
                </strong>
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {device.status !== "REVOKED" && (
                  <button
                    className={button}
                    disabled={busy}
                    onClick={() =>
                      organizationId &&
                      void run(
                        () =>
                          medfinetNfcApi.setProvisioningCapability(
                            organizationId,
                            device.id,
                            !device.nfcProvisioningEnabled,
                          ),
                        `NFC provisioning ${device.nfcProvisioningEnabled ? "disabled" : "approved"}.`,
                      )
                    }
                  >
                    {device.nfcProvisioningEnabled
                      ? "Remove NFC capability"
                      : "Approve NFC capability"}
                  </button>
                )}
                {device.status !== "REVOKED" && (
                  <button
                    className={button}
                    disabled={busy}
                    onClick={() => setRevokeTarget(device)}
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
        title="Register trusted device"
      >
        <form className="space-y-4" onSubmit={(event) => void create(event)}>
          <label className="block text-sm font-semibold">
            Stable device identifier
            <input
              required
              className={input}
              value={form.deviceIdentifier}
              onChange={(e) =>
                setForm({ ...form, deviceIdentifier: e.target.value })
              }
            />
          </label>
          <label className="block text-sm font-semibold">
            Display name
            <input
              required
              className={input}
              value={form.displayName}
              onChange={(e) =>
                setForm({ ...form, displayName: e.target.value })
              }
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              Platform
              <input
                required
                className={input}
                value={form.platform}
                onChange={(e) => setForm({ ...form, platform: e.target.value })}
              />
            </label>
            <label className="text-sm font-semibold">
              App version
              <input
                required
                className={input}
                value={form.appVersion}
                onChange={(e) =>
                  setForm({ ...form, appVersion: e.target.value })
                }
              />
            </label>
          </div>
          <label className="block text-sm font-semibold">
            Device public key
            <textarea
              required
              rows={5}
              className={`${input} font-mono`}
              value={form.publicKey}
              onChange={(e) => setForm({ ...form, publicKey: e.target.value })}
            />
          </label>
          <button className={primary} disabled={busy}>
            Register device
          </button>
        </form>
      </Modal>
      <ActionReasonModal
        open={Boolean(revokeTarget)}
        title="Revoke trusted device"
        description="The device will immediately lose trusted access and NFC provisioning capability."
        confirmLabel="Revoke device"
        destructive
        busy={busy}
        onClose={() => setRevokeTarget(null)}
        onConfirm={async (reason) => {
          if (!organizationId || !revokeTarget) return;
          await run(
            () =>
              medfinetNfcApi.revokeDevice(
                organizationId,
                revokeTarget.id,
                reason,
              ),
            "Device revoked.",
          );
          setRevokeTarget(null);
        }}
      />
    </main>
  );
}
