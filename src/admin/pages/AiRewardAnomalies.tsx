import { useCallback, useContext, useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";
import UserContext from "../../contexts/UserContext";
import { PageFeedback } from "../../components/common/PageFeedback";
import { medfinetAiApi } from "../../services/medfinetAiApi";

const input = "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm";
const primary = "rounded-lg bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50";

export default function AiRewardAnomalies() {
  const { organizationId } = useContext(UserContext);
  const [limit, setLimit] = useState("20");
  const [results, setResults] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detect = useCallback(async () => {
    if (!organizationId || busy) return;
    setBusy(true);
    setError(null);
    setResults(null);
    setLoading(true);
    try {
      const result = await medfinetAiApi.detectRewardAnomalies(organizationId, parseInt(limit) || undefined);
      setResults(result);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Anomaly detection failed");
    } finally {
      setBusy(false);
      setLoading(false);
    }
  }, [organizationId, limit, busy]);

  useEffect(() => { detect(); }, []);

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <header className="flex items-center gap-3">
        <ShieldAlert className="h-6 w-6 text-cyan-700" />
        <div>
          <h1 className="text-xl font-bold">AI Reward Anomaly Detection</h1>
          <p className="text-sm text-slate-600">Detect anomalous reward redemption patterns.</p>
        </div>
      </header>

      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <label className="block text-xs font-semibold text-slate-600">Max results</label>
        <div className="flex items-end gap-3">
          <input value={limit} onChange={(e) => setLimit(e.target.value)} type="number" min="1" max="100" className={input} />
          <button onClick={detect} disabled={busy} className={primary}>
            {busy ? "Scanning..." : "Scan for Anomalies"}
          </button>
        </div>
      </div>

      <PageFeedback loading={loading} error={error} onRetry={detect}>
        {results ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-3 text-sm font-semibold text-slate-800">Detection Results</div>
            <pre className="overflow-x-auto whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
              {typeof results === "string" ? results : JSON.stringify(results, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500">
            Click "Scan for Anomalies" to analyze reward redemptions.
          </div>
        )}
      </PageFeedback>
    </main>
  );
}
