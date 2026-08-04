import { useCallback, useContext, useEffect, useState } from "react";
import { Clock, FileText } from "lucide-react";
import UserContext from "../../contexts/UserContext";
import { PageFeedback } from "../../components/common/PageFeedback";
import { medfinetAiApi } from "../../services/medfinetAiApi";
import { medfinetIdentityApi } from "../../services/medfinetIdentityApi";

type Child = { id: string; firstName: string; lastName: string; medfinetId: string };
const input = "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm";
const primary = "rounded-lg bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50";

export default function AiTimelineSummary() {
  const { organizationId } = useContext(UserContext);
  const [children, setChildren] = useState<Child[]>([]);
  const [childId, setChildId] = useState("");
  const [locale, setLocale] = useState("en");
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadChildren = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    try {
      const result = await medfinetIdentityApi.listChildren(organizationId, { limit: 100 });
      setChildren(result.items);
      if (result.items.length > 0 && !childId) setChildId(result.items[0].id);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load children");
    } finally {
      setLoading(false);
    }
  }, [organizationId, childId]);

  useEffect(() => { loadChildren(); }, [loadChildren]);

  const generate = async () => {
    if (!organizationId || !childId || busy) return;
    setBusy(true);
    setError(null);
    setSummary(null);
    try {
      const result = await medfinetAiApi.summarizeTimeline(organizationId, childId, locale);
      setSummary(typeof result === "string" ? result : JSON.stringify(result, null, 2));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Failed to generate summary");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <header className="flex items-center gap-3">
        <Clock className="h-6 w-6 text-cyan-700" />
        <div>
          <h1 className="text-xl font-bold">AI Timeline Summary</h1>
          <p className="text-sm text-slate-600">Generate a natural language summary of a child's health timeline.</p>
        </div>
      </header>

      <PageFeedback loading={loading} error={error} onRetry={loadChildren}>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600">Child</label>
              <select value={childId} onChange={(e) => { setChildId(e.target.value); setSummary(null); }} className={input}>
                {children.map((c) => (
                  <option key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.medfinetId})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600">Language</label>
              <select value={locale} onChange={(e) => setLocale(e.target.value)} className={input}>
                <option value="en">English</option>
                <option value="yo">Yoruba</option>
                <option value="ha">Hausa</option>
                <option value="ig">Igbo</option>
                <option value="pcm">Nigerian Pidgin</option>
              </select>
            </div>
          </div>
          <button onClick={generate} disabled={busy || !childId} className={`${primary} mt-4`}>
            {busy ? "Generating..." : "Generate Summary"}
          </button>
        </div>
      </PageFeedback>

      {summary && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <FileText className="h-4 w-4" />
            Generated Summary
          </div>
          <div className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">{summary}</div>
        </div>
      )}
    </main>
  );
}
