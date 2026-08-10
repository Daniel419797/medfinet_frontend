import { type FormEvent, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Activity, Plus, RefreshCw, Search } from "lucide-react";
import { Modal } from "../../components/common/Modal";
import { PageFeedback } from "../../components/common/PageFeedback";
import UserContext from "../../contexts/UserContext";
import { medfinetClinicalApi, type ClinicalTimeline } from "../../services/medfinetClinicalApi";
import { medfinetIdentityApi } from "../../services/medfinetIdentityApi";

type Child = Awaited<ReturnType<typeof medfinetIdentityApi.listChildren>>["items"][number];

const input = "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm";
const secondary = "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold disabled:opacity-50";
const primary = "rounded-lg bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50";

const emptyForm = () => ({
  measuredAt: new Date().toISOString().slice(0, 10),
  weightGrams: "",
  heightMillimeters: "",
  muacMillimeters: "",
  vitaminAAdministered: false,
  oedemaPresent: false,
  notes: "",
});

export default function NutritionOperations() {
  const { organizationId } = useContext(UserContext);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [timeline, setTimeline] = useState<ClinicalTimeline | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [recordOpen, setRecordOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const selected = children.find((child) => child.id === selectedId) || null;

  const loadChildren = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await medfinetIdentityApi.listChildren(organizationId, { limit: 100 });
      setChildren(result.items);
      setSelectedId((current) =>
        current && result.items.some((child) => child.id === current)
          ? current
          : result.items[0]?.id || "",
      );
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load child records");
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  const loadTimeline = useCallback(async () => {
    if (!organizationId || !selectedId) {
      setTimeline(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setTimeline(await medfinetClinicalApi.getNutritionTimeline(organizationId, selectedId));
    } catch (reason) {
      setTimeline(null);
      setError(reason instanceof Error ? reason.message : "Unable to load nutrition records");
    } finally {
      setLoading(false);
    }
  }, [organizationId, selectedId]);

  useEffect(() => {
    void loadChildren();
  }, [loadChildren]);

  useEffect(() => {
    void loadTimeline();
  }, [loadTimeline]);

  const filteredChildren = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return children;
    return children.filter(
      (child) =>
        child.medfinetId.toLowerCase().includes(value) ||
        `${child.firstName} ${child.lastName}`.toLowerCase().includes(value),
    );
  }, [children, query]);

  async function recordGrowth(event: FormEvent) {
    event.preventDefault();
    if (!organizationId || !selectedId) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      await medfinetClinicalApi.recordNutritionGrowth(organizationId, selectedId, {
        measuredAt: new Date(`${form.measuredAt}T12:00:00Z`).toISOString(),
        weightGrams: form.weightGrams ? Number(form.weightGrams) : undefined,
        heightMillimeters: form.heightMillimeters ? Number(form.heightMillimeters) : undefined,
        muacMillimeters: form.muacMillimeters ? Number(form.muacMillimeters) : undefined,
        vitaminAAdministered: form.vitaminAAdministered,
        oedemaPresent: form.oedemaPresent,
        notes: form.notes || undefined,
        sourceOperationId: crypto.randomUUID(),
      });
      setForm(emptyForm());
      setRecordOpen(false);
      setNotice("Growth and nutrition measurement recorded with an audit event.");
      await loadTimeline();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to record nutrition measurement");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-cyan-700">Nutrition-specific child record</p>
          <h1 className="text-3xl font-bold text-slate-950 dark:text-white">Growth & nutrition</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
            Review and record only the growth and nutrition information required for nutrition care.
          </p>
        </div>
        <button className={secondary} onClick={() => void Promise.all([loadChildren(), loadTimeline()])}>
          <RefreshCw className="mr-2 inline h-4 w-4" />
          Refresh
        </button>
      </div>

      {notice && (
        <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
          {notice}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[300px_1fr]">
        <aside className="rounded-xl border bg-white p-4">
          <label className="relative block">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              aria-label="Search children"
              className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Name or Medfinet ID"
            />
          </label>
          <div className="mt-3 max-h-[65vh] space-y-2 overflow-y-auto">
            {filteredChildren.map((child) => (
              <button
                key={child.id}
                type="button"
                onClick={() => setSelectedId(child.id)}
                className={`w-full rounded-lg p-3 text-left ${selectedId === child.id ? "bg-cyan-50 ring-1 ring-cyan-300" : "hover:bg-slate-50"}`}
              >
                <p className="font-semibold">{child.firstName} {child.lastName}</p>
                <p className="truncate text-xs text-slate-500">{child.medfinetId}</p>
              </button>
            ))}
          </div>
        </aside>

        <section>
          <PageFeedback
            loading={loading}
            error={error}
            empty={!selected}
            onRetry={() => void Promise.all([loadChildren(), loadTimeline()])}
            emptyTitle="Select a child"
            emptyDescription="Choose a child to view growth and nutrition records."
          >
            {selected && (
              <div className="space-y-5">
                <div className="rounded-xl border bg-white p-5">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div>
                      <p className="text-xs font-bold uppercase text-cyan-700">{selected.medfinetId}</p>
                      <h2 className="text-2xl font-bold">{selected.firstName} {selected.lastName}</h2>
                      <p className="text-sm text-slate-600">
                        Born {new Date(selected.dateOfBirth).toLocaleDateString()} · {selected.sex}
                      </p>
                    </div>
                    <button className={primary} onClick={() => setRecordOpen(true)}>
                      <Plus className="mr-2 inline h-4 w-4" />
                      Record measurement
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold">Growth history</h3>
                      <p className="text-sm text-slate-600">{timeline?.growth.length || 0} measurement(s)</p>
                    </div>
                    <Activity className="h-5 w-5 text-cyan-700" />
                  </div>
                  {timeline?.growth.length ? timeline.growth.map((item) => (
                    <article key={item.id} className="rounded-xl border bg-white p-4">
                      <p className="font-semibold">
                        {item.weightGrams ? `${item.weightGrams / 1000} kg` : "No weight"} · {item.heightMillimeters ? `${item.heightMillimeters} mm` : "No height"} · {item.muacMillimeters ? `MUAC ${item.muacMillimeters} mm` : "No MUAC"}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Vitamin A: {item.vitaminAAdministered ? "Yes" : "No"} · Oedema: {item.oedemaPresent ? "Present" : "Not recorded"}
                      </p>
                      {item.notes && <p className="mt-1 text-sm text-slate-600">{item.notes}</p>}
                      <p className="mt-1 text-xs text-slate-500">{item.status} · {new Date(item.measuredAt).toLocaleString()}</p>
                    </article>
                  )) : (
                    <p className="rounded-xl border border-dashed bg-white p-8 text-center text-sm text-slate-500">
                      No growth or nutrition measurements recorded.
                    </p>
                  )}
                </div>
              </div>
            )}
          </PageFeedback>
        </section>
      </div>

      <Modal open={recordOpen} onClose={() => !saving && setRecordOpen(false)} title="Record growth & nutrition">
        <form className="space-y-4" onSubmit={(event) => void recordGrowth(event)}>
          <label className="block text-sm font-semibold">
            Measured date
            <input required type="date" max={new Date().toISOString().slice(0, 10)} className={input} value={form.measuredAt} onChange={(event) => setForm((current) => ({ ...current, measuredAt: event.target.value }))} />
          </label>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="text-sm font-semibold">
              Weight (g)
              <input type="number" min="1" className={input} value={form.weightGrams} onChange={(event) => setForm((current) => ({ ...current, weightGrams: event.target.value }))} />
            </label>
            <label className="text-sm font-semibold">
              Height (mm)
              <input type="number" min="1" className={input} value={form.heightMillimeters} onChange={(event) => setForm((current) => ({ ...current, heightMillimeters: event.target.value }))} />
            </label>
            <label className="text-sm font-semibold">
              MUAC (mm)
              <input type="number" min="1" className={input} value={form.muacMillimeters} onChange={(event) => setForm((current) => ({ ...current, muacMillimeters: event.target.value }))} />
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.vitaminAAdministered} onChange={(event) => setForm((current) => ({ ...current, vitaminAAdministered: event.target.checked }))} />
            Vitamin A administered
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.oedemaPresent} onChange={(event) => setForm((current) => ({ ...current, oedemaPresent: event.target.checked }))} />
            Oedema present
          </label>
          <label className="block text-sm font-semibold">
            Notes
            <textarea className={input} value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} />
          </label>
          <div className="flex justify-end gap-3">
            <button type="button" className={secondary} disabled={saving} onClick={() => setRecordOpen(false)}>Cancel</button>
            <button className={primary} disabled={saving}>{saving ? "Saving…" : "Save measurement"}</button>
          </div>
        </form>
      </Modal>
    </main>
  );
}
