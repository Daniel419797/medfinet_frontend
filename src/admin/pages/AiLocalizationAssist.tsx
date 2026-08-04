import { FormEvent, useState } from "react";
import { Languages } from "lucide-react";
import { PageFeedback } from "../../components/common/PageFeedback";
import { medfinetAiApi } from "../../services/medfinetAiApi";
import UserContext from "../../contexts/UserContext";
import { useContext } from "react";

const input = "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm";
const primary = "rounded-lg bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50";

const LOCALES = [
  { code: "en", label: "English" },
  { code: "yo", label: "Yoruba" },
  { code: "ha", label: "Hausa" },
  { code: "ig", label: "Igbo" },
  { code: "pcm", label: "Nigerian Pidgin" },
  { code: "sw", label: "Swahili" },
  { code: "fr", label: "French" },
  { code: "ar", label: "Arabic" },
];

export default function AiLocalizationAssist() {
  const { organizationId } = useContext(UserContext);
  const [contentKey, setContentKey] = useState("");
  const [value, setValue] = useState("");
  const [sourceLocale, setSourceLocale] = useState("en");
  const [targetLocale, setTargetLocale] = useState("yo");
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
      const result = await medfinetAiApi.generateTranslation(organizationId, {
        contentKey,
        value,
        sourceLocale,
        targetLocale,
      });
      setResults(result);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Translation failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <header className="flex items-center gap-3">
        <Languages className="h-6 w-6 text-cyan-700" />
        <div>
          <h1 className="text-xl font-bold">AI Localization Assist</h1>
          <p className="text-sm text-slate-600">Generate AI-assisted translations for content keys.</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600">Content key</label>
          <input value={contentKey} onChange={(e) => setContentKey(e.target.value)} placeholder="e.g. child.registered.success" className={input} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600">Source text</label>
          <textarea value={value} onChange={(e) => setValue(e.target.value)} rows={3} className={input} placeholder="The text to translate..." />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-600">Source language</label>
            <select value={sourceLocale} onChange={(e) => setSourceLocale(e.target.value)} className={input}>
              {LOCALES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600">Target language</label>
            <select value={targetLocale} onChange={(e) => setTargetLocale(e.target.value)} className={input}>
              {LOCALES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </div>
        </div>
        <button type="submit" disabled={busy || !contentKey || !value} className={primary}>
          {busy ? "Translating..." : "Generate Translation"}
        </button>
      </form>

      <PageFeedback loading={false} error={error}>
        {results && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-3 text-sm font-semibold text-slate-800">Translation Result</div>
            <pre className="overflow-x-auto whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
              {typeof results === "string" ? results : JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}
      </PageFeedback>
    </main>
  );
}
