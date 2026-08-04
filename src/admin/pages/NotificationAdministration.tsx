import { useCallback, useContext, useEffect, useState } from "react";
import { BellRing, Plus, Send } from "lucide-react";
import UserContext from "../../contexts/UserContext";
import { Modal } from "../../components/common/Modal";
import { ConfirmActionModal } from "../../components/common/ConfirmActionModal";
import { PageFeedback } from "../../components/common/PageFeedback";
import { medfinetNotificationsApi } from "../../services/medfinetNotificationsApi";

type Template = Awaited<
  ReturnType<typeof medfinetNotificationsApi.listTemplates>
>["items"][number];

export default function NotificationAdministration() {
  const { organizationId } = useContext(UserContext);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [open, setOpen] = useState(false);
  const [activationTarget, setActivationTarget] = useState<Template | null>(
    null,
  );
  const [preferenceOpen, setPreferenceOpen] = useState(false);
  const [form, setForm] = useState({
    key: "",
    version: "1",
    channel: "IN_APP",
    locale: "en",
    subject: "",
    body: "",
    variableNames: "",
  });
  const [preference, setPreference] = useState({
    subjectId: "",
    category: "APPOINTMENTS",
    channel: "IN_APP",
    enabled: true,
    locale: "en",
    timezone: "Africa/Lagos",
    quietHoursStart: "",
    quietHoursEnd: "",
  });

  const load = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setError("");
    try {
      setTemplates(
        (await medfinetNotificationsApi.listTemplates(organizationId)).items,
      );
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to load notification templates",
      );
    } finally {
      setLoading(false);
    }
  }, [organizationId]);
  useEffect(() => {
    void load();
  }, [load]);

  async function create(event: React.FormEvent) {
    event.preventDefault();
    if (!organizationId) return;
    setBusy(true);
    setError("");
    try {
      await medfinetNotificationsApi.createTemplate(organizationId, {
        key: form.key,
        version: Number(form.version),
        channel: form.channel as "IN_APP",
        locale: form.locale,
        subject: form.subject || undefined,
        body: form.body,
        variableNames: form.variableNames
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
      });
      setOpen(false);
      setNotice(
        "Template draft created. Activate it after reviewing every placeholder.",
      );
      await load();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to create template",
      );
    } finally {
      setBusy(false);
    }
  }

  async function activate(template: Template) {
    if (!organizationId) return;
    setBusy(true);
    try {
      await medfinetNotificationsApi.activateTemplate(
        organizationId,
        template.id,
      );
      setNotice("Template activated; the previous active version was retired.");
      await load();
      setActivationTarget(null);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to activate template",
      );
    } finally {
      setBusy(false);
    }
  }

  async function savePreference(event: React.FormEvent) {
    event.preventDefault();
    if (!organizationId) return;
    setBusy(true);
    try {
      await medfinetNotificationsApi.upsertPreference(organizationId, {
        subjectId: preference.subjectId || undefined,
        category: preference.category,
        channel: preference.channel as "IN_APP",
        enabled: preference.enabled,
        locale: preference.locale,
        timezone: preference.timezone,
        quietHoursStart:
          preference.quietHoursStart === ""
            ? null
            : Number(preference.quietHoursStart),
        quietHoursEnd:
          preference.quietHoursEnd === ""
            ? null
            : Number(preference.quietHoursEnd),
      });
      setPreferenceOpen(false);
      setNotice("Notification preference saved.");
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to save preference",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-cyan-700">Messaging</p>
          <h1 className="text-3xl font-bold text-slate-950">
            Notification administration
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Versioned templates and user-controlled delivery preferences.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPreferenceOpen(true)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold"
          >
            Manage preference
          </button>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-lg bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white"
          >
            <Plus className="mr-2 inline h-4 w-4" />
            New template
          </button>
        </div>
      </div>
      {notice && (
        <div
          role="status"
          className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"
        >
          {notice}
        </div>
      )}
      <div className="mt-6">
        <PageFeedback
          loading={loading}
          error={error}
          empty={!templates.length}
          onRetry={() => void load()}
        >
          <div className="grid gap-4 lg:grid-cols-2">
            {templates.map((template) => (
              <article
                key={template.id}
                className="rounded-2xl border bg-white p-5"
              >
                <div className="flex justify-between gap-3">
                  <div>
                    <h2 className="font-bold">{template.key}</h2>
                    <p className="text-sm text-slate-600">
                      {template.channel} · {template.locale} · version{" "}
                      {template.version}
                    </p>
                  </div>
                  <span className="text-xs font-semibold">
                    {template.status}
                  </span>
                </div>
                {template.subject && (
                  <p className="mt-4 text-sm font-semibold">
                    {template.subject}
                  </p>
                )}
                <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm text-slate-600">
                  {template.body}
                </p>
                <p className="mt-3 text-xs text-slate-500">
                  Variables: {template.variableNames.join(", ") || "none"}
                </p>
                {template.status === "DRAFT" && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setActivationTarget(template)}
                    className="mt-4 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white"
                  >
                    Activate
                  </button>
                )}
              </article>
            ))}
          </div>
        </PageFeedback>
      </div>
      <Modal
        open={open}
        title="Create notification template"
        description="Declared variable names must exactly match every {{placeholder}}."
        onClose={() => setOpen(false)}
      >
        <form onSubmit={create} className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium">
            Template key
            <input
              required
              pattern="[A-Za-z0-9_]+"
              value={form.key}
              onChange={(event) =>
                setForm({ ...form, key: event.target.value.toUpperCase() })
              }
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </label>
          <label className="text-sm font-medium">
            Version
            <input
              required
              min="1"
              type="number"
              value={form.version}
              onChange={(event) =>
                setForm({ ...form, version: event.target.value })
              }
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </label>
          <label className="text-sm font-medium">
            Channel
            <select
              value={form.channel}
              onChange={(event) =>
                setForm({ ...form, channel: event.target.value })
              }
              className="mt-1 w-full rounded-lg border px-3 py-2"
            >
              {["IN_APP", "EMAIL", "SMS", "PUSH"].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            Locale
            <select
              value={form.locale}
              onChange={(event) =>
                setForm({ ...form, locale: event.target.value })
              }
              className="mt-1 w-full rounded-lg border px-3 py-2"
            >
              <option value="en">English</option>
              <option value="ha">Hausa</option>
              <option value="yo">Yoruba</option>
              <option value="ig">Igbo</option>
            </select>
          </label>
          {form.channel === "EMAIL" && (
            <label className="sm:col-span-2 text-sm font-medium">
              Subject
              <input
                required
                value={form.subject}
                onChange={(event) =>
                  setForm({ ...form, subject: event.target.value })
                }
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </label>
          )}
          <label className="sm:col-span-2 text-sm font-medium">
            Body
            <textarea
              required
              maxLength={10000}
              value={form.body}
              onChange={(event) =>
                setForm({ ...form, body: event.target.value })
              }
              className="mt-1 min-h-32 w-full rounded-lg border px-3 py-2"
            />
          </label>
          <label className="sm:col-span-2 text-sm font-medium">
            Variable names, separated by commas
            <input
              value={form.variableNames}
              onChange={(event) =>
                setForm({ ...form, variableNames: event.target.value })
              }
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </label>
          <button
            disabled={busy}
            className="sm:col-span-2 rounded-lg bg-cyan-700 px-4 py-2.5 font-semibold text-white"
          >
            <Send className="mr-2 inline h-4 w-4" />
            Create draft
          </button>
        </form>
      </Modal>
      <Modal
        open={preferenceOpen}
        title="Manage notification preference"
        onClose={() => setPreferenceOpen(false)}
      >
        <form onSubmit={savePreference} className="grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2 text-sm font-medium">
            Subject ID (leave blank for yourself)
            <input
              value={preference.subjectId}
              onChange={(event) =>
                setPreference({ ...preference, subjectId: event.target.value })
              }
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </label>
          <label className="text-sm font-medium">
            Category
            <input
              required
              value={preference.category}
              onChange={(event) =>
                setPreference({
                  ...preference,
                  category: event.target.value.toUpperCase(),
                })
              }
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </label>
          <label className="text-sm font-medium">
            Channel
            <select
              value={preference.channel}
              onChange={(event) =>
                setPreference({ ...preference, channel: event.target.value })
              }
              className="mt-1 w-full rounded-lg border px-3 py-2"
            >
              {["IN_APP", "EMAIL", "SMS", "PUSH"].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            Quiet hours start
            <input
              min="0"
              max="23"
              type="number"
              value={preference.quietHoursStart}
              onChange={(event) =>
                setPreference({
                  ...preference,
                  quietHoursStart: event.target.value,
                })
              }
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </label>
          <label className="text-sm font-medium">
            Quiet hours end
            <input
              min="0"
              max="23"
              type="number"
              value={preference.quietHoursEnd}
              onChange={(event) =>
                setPreference({
                  ...preference,
                  quietHoursEnd: event.target.value,
                })
              }
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </label>
          <label className="sm:col-span-2 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={preference.enabled}
              onChange={(event) =>
                setPreference({ ...preference, enabled: event.target.checked })
              }
            />
            Delivery enabled
          </label>
          <button
            disabled={busy}
            className="sm:col-span-2 rounded-lg bg-cyan-700 px-4 py-2.5 font-semibold text-white"
          >
            <BellRing className="mr-2 inline h-4 w-4" />
            Save preference
          </button>
        </form>
      </Modal>
      <ConfirmActionModal
        open={Boolean(activationTarget)}
        title="Activate notification template"
        description={`Activate ${activationTarget?.key || "template"} version ${activationTarget?.version || ""}? The previous active version for this channel and locale will be retired.`}
        confirmLabel="Activate template"
        busy={busy}
        onClose={() => setActivationTarget(null)}
        onConfirm={() => {
          if (activationTarget) return activate(activationTarget);
        }}
      />
    </main>
  );
}
