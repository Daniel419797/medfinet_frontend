import { useCallback, useContext, useEffect, useState } from "react";
import {
  BellRing,
  Building2,
  Mail,
  Plus,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import UserContext from "../../contexts/UserContext";
import { OrganizationSwitcher } from "../../components/common/OrganizationSwitcher";
import ThemeToggle from "../../components/common/ThemeToggle";
import { Modal } from "../../components/common/Modal";
import { PageFeedback } from "../../components/common/PageFeedback";
import { medfinetNotificationsApi } from "../../services/medfinetNotificationsApi";

type Preference = Awaited<
  ReturnType<typeof medfinetNotificationsApi.listPreferences>
>[number];
const categories = [
  "APPOINTMENTS",
  "VACCINATION",
  "REWARDS",
  "EMERGENCY",
  "PROGRAMMES",
  "SERVICE_DELIVERY",
];
const channels = ["IN_APP", "EMAIL", "SMS", "PUSH"] as const;
const locales = ["en", "ha", "yo", "ig"];
const input = "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2";

export default function UserProfile() {
  const { user, currentMembership, organizationId } = useContext(UserContext);
  const [preferences, setPreferences] = useState<Preference[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    category: "APPOINTMENTS",
    channel: "IN_APP" as (typeof channels)[number],
    enabled: true,
    locale: "en",
    timezone: "Africa/Lagos",
    quietEnabled: false,
    quietHoursStart: 21,
    quietHoursEnd: 7,
  });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setError("");
    try {
      setPreferences(
        await medfinetNotificationsApi.listPreferences(organizationId),
      );
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to load notification preferences",
      );
    } finally {
      setLoading(false);
    }
  }, [organizationId]);
  useEffect(() => {
    void load();
  }, [load]);

  if (!user || !currentMembership) return null;
  const fields = [
    { label: "Authenticated subject", value: user.id, icon: UserRound },
    { label: "Email", value: user.email, icon: Mail },
    {
      label: "Organization role",
      value: currentMembership.role.replaceAll("_", " "),
      icon: ShieldCheck,
    },
    {
      label: "Access scope",
      value:
        currentMembership.scopeMode === "GLOBAL"
          ? "All organization resources"
          : "Assigned facilities and programmes only",
      icon: Building2,
    },
  ];

  function edit(item?: Preference) {
    setForm(
      item
        ? {
            category: item.category,
            channel: item.channel as (typeof channels)[number],
            enabled: item.enabled,
            locale: item.locale,
            timezone: item.timezone,
            quietEnabled:
              item.quietHoursStart != null && item.quietHoursEnd != null,
            quietHoursStart: item.quietHoursStart ?? 21,
            quietHoursEnd: item.quietHoursEnd ?? 7,
          }
        : {
            category: "APPOINTMENTS",
            channel: "IN_APP",
            enabled: true,
            locale: "en",
            timezone: "Africa/Lagos",
            quietEnabled: false,
            quietHoursStart: 21,
            quietHoursEnd: 7,
          },
    );
    setOpen(true);
    setError("");
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!organizationId) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await medfinetNotificationsApi.upsertPreference(organizationId, {
        category: form.category,
        channel: form.channel,
        enabled: form.enabled,
        locale: form.locale,
        timezone: form.timezone,
        quietHoursStart: form.quietEnabled ? form.quietHoursStart : null,
        quietHoursEnd: form.quietEnabled ? form.quietHoursEnd : null,
      });
      setOpen(false);
      setNotice("Notification preference saved.");
      await load();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to save notification preference",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-sm font-semibold text-cyan-700">Secure account</p>
        <h1 className="text-3xl font-bold">{user.name}</h1>
        <p className="mt-2 text-sm text-slate-600">
          Identity details are managed by the authentication provider;
          organization authorization comes from Medfinet.
        </p>
      </div>
      <section className="rounded-2xl border bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-xl bg-slate-50 p-4">
              <Icon className="h-5 w-5 text-cyan-700" />
              <p className="mt-3 text-xs font-bold uppercase text-slate-500">
                {label}
              </p>
              <p className="mt-1 break-all text-sm font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-2xl border bg-white p-6">
        <h2 className="font-bold">Workspace and appearance</h2>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
          <OrganizationSwitcher />
          <ThemeToggle />
        </div>
      </section>
      {notice && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"
        >
          {notice}
        </div>
      )}
      <section className="rounded-2xl border bg-white p-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="flex items-center gap-2 font-bold">
              <BellRing className="h-5 w-5 text-cyan-700" />
              Notification preferences
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Choose delivery channels, language, timezone and quiet hours by
              category.
            </p>
          </div>
          <button
            type="button"
            onClick={() => edit()}
            className="rounded-lg bg-cyan-700 px-3 py-2 text-sm font-semibold text-white"
          >
            <Plus className="mr-2 inline h-4 w-4" />
            Add preference
          </button>
        </div>
        <div className="mt-5">
          <PageFeedback
            loading={loading}
            error={error}
            empty={!preferences.length}
            emptyTitle="No custom preferences"
            emptyDescription="Default organization delivery rules apply until you add a preference."
            onRetry={() => void load()}
          >
            <div className="grid gap-3 md:grid-cols-2">
              {preferences.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => edit(item)}
                  className="rounded-xl border p-4 text-left hover:border-cyan-400"
                >
                  <div className="flex justify-between gap-3">
                    <p className="font-semibold">
                      {item.category.replaceAll("_", " ")}
                    </p>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-bold ${item.enabled ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
                    >
                      {item.enabled ? "ON" : "OFF"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {item.channel} · {item.locale} · {item.timezone}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    {item.quietHoursStart != null
                      ? `Quiet ${item.quietHoursStart}:00–${item.quietHoursEnd}:00`
                      : "No quiet hours"}
                  </p>
                </button>
              ))}
            </div>
          </PageFeedback>
        </div>
      </section>
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        Profile edits, password changes, multi-factor authentication and account
        deletion must be completed through the verified identity-provider flow.
        Medfinet does not simulate those security-sensitive operations locally.
      </div>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Notification preference"
        description="Saving the same category and channel updates the existing preference."
      >
        <form onSubmit={(event) => void save(event)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              Category
              <select
                className={input}
                value={form.category}
                onChange={(event) =>
                  setForm({ ...form, category: event.target.value })
                }
              >
                {categories.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold">
              Channel
              <select
                className={input}
                value={form.channel}
                onChange={(event) =>
                  setForm({
                    ...form,
                    channel: event.target.value as (typeof channels)[number],
                  })
                }
              >
                {channels.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold">
              Language
              <select
                className={input}
                value={form.locale}
                onChange={(event) =>
                  setForm({ ...form, locale: event.target.value })
                }
              >
                {locales.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold">
              Timezone
              <input
                required
                className={input}
                value={form.timezone}
                onChange={(event) =>
                  setForm({ ...form, timezone: event.target.value })
                }
              />
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(event) =>
                setForm({ ...form, enabled: event.target.checked })
              }
            />
            Enable this delivery route
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={form.quietEnabled}
              onChange={(event) =>
                setForm({ ...form, quietEnabled: event.target.checked })
              }
            />
            Use quiet hours
          </label>
          {form.quietEnabled && (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold">
                Quiet from
                <input
                  type="number"
                  min="0"
                  max="23"
                  className={input}
                  value={form.quietHoursStart}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      quietHoursStart: Number(event.target.value),
                    })
                  }
                />
              </label>
              <label className="text-sm font-semibold">
                Quiet until
                <input
                  type="number"
                  min="0"
                  max="23"
                  className={input}
                  value={form.quietHoursEnd}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      quietHoursEnd: Number(event.target.value),
                    })
                  }
                />
              </label>
            </div>
          )}
          <button
            disabled={
              busy ||
              (form.quietEnabled && form.quietHoursStart === form.quietHoursEnd)
            }
            className="w-full rounded-lg bg-cyan-700 px-4 py-2.5 font-semibold text-white disabled:opacity-50"
          >
            {busy ? "Saving…" : "Save preference"}
          </button>
        </form>
      </Modal>
    </main>
  );
}
