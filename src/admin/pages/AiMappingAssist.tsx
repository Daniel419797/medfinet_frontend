import { FormEvent, useState } from "react";
import { Waypoints } from "lucide-react";
import { PageFeedback } from "../../components/common/PageFeedback";
import { medfinetAiApi } from "../../services/medfinetAiApi";
import UserContext from "../../contexts/UserContext";
import { useContext } from "react";

const input = "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm";
const primary = "rounded-lg bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50";

export default function AiMappingAssist() {
  const { organizationId } = useContext(UserContext);
  const [connectionType, setConnectionType] = useState("FHIR");
  const [resourceType, setResourceType] = useState("Patient");
  const [sourceFields, setSourceFields] = useState("id,name,dateOfBirth,gender");
  const [targetFields, setTargetFields] = useState("id,name,birthDate,gender");
  const [results, setResults] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!organizationId || busy) return;
    setBusy(true);
    setError(null);
    setResults(null);
    try {
      const result = await medfinetAiApi.suggestMapping(organizationId, {
        connectionType,
        resourceType,
        sourceFields: sourceFields.split(",").map((s) => s.trim()).filter(Boolean),
        targetFields: targetFields.split(",").map((s) => s.trim()).filter(Boolean),
      });
      setResults(result);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Mapping assist failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <header className="flex items-center gap-3">
        <Waypoints className="h-6 w-6 text-cyan-700" />
        <div>
          <h1 className="text-xl font-bold">AI Mapping Assist</h1>
          <p className="text-sm text-slate-600">Get AI-powered mapping suggestions for FHIR/DHIS2 integrations.</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-600">Connection type</label>
            <select value={connectionType} onChange={(e) => setConnectionType(e.target.value)} className={input}>
              <option value="FHIR">FHIR</option>
              <option value="DHIS2">DHIS2</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600">Resource type</label>
            <input value={resourceType} onChange={(e) => setResourceType(e.target.value)} className={input} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600">Source fields (comma-separated)</label>
          <input value={sourceFields} onChange={(e) => setSourceFields(e.target.value)} className={input} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600">Target fields (comma-separated)</label>
          <input value={targetFields} onChange={(e) => setTargetFields(e.target.value)} className={input} />
        </div>
        <button type="submit" disabled={busy} className={primary}>
          {busy ? "Generating..." : "Get Mapping Suggestions"}
        </button>
      </form>

      <PageFeedback loading={false} error={error}>
        {results && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-3 text-sm font-semibold text-slate-800">Mapping Suggestions</div>
            <pre className="overflow-x-auto whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
              {typeof results === "string" ? results : JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}
      </PageFeedback>
    </main>
  );
}
