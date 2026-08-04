import { FormEvent, useCallback, useContext, useEffect, useState } from "react";
import { Bot, Send } from "lucide-react";
import UserContext from "../../contexts/UserContext";
import { PageFeedback } from "../../components/common/PageFeedback";
import { medfinetAiApi } from "../../services/medfinetAiApi";
import { medfinetIdentityApi } from "../../services/medfinetIdentityApi";

type Child = { id: string; firstName: string; lastName: string; medfinetId: string };
type ChatMessage = { role: "user" | "assistant"; content: string };
const input = "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm";
const primary = "rounded-lg bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50";

export default function AiAssistant() {
  const { organizationId } = useContext(UserContext);
  const [children, setChildren] = useState<Child[]>([]);
  const [childId, setChildId] = useState("");
  const [locale, setLocale] = useState("en");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!organizationId || !childId || !question.trim() || busy) return;
    const q = question.trim();
    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setQuestion("");
    setBusy(true);
    setError(null);
    try {
      const answer = await medfinetAiApi.askAssistant(organizationId, childId, { question: q, locale });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: typeof answer === "string" ? answer : JSON.stringify(answer, null, 2) },
      ]);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "AI request failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <header className="flex items-center gap-3">
        <Bot className="h-6 w-6 text-cyan-700" />
        <div>
          <h1 className="text-xl font-bold">AI Health Assistant</h1>
          <p className="text-sm text-slate-600">Ask questions about a child's health record context.</p>
        </div>
      </header>

      <PageFeedback loading={loading} error={error} onRetry={loadChildren}>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600">Child</label>
              <select value={childId} onChange={(e) => { setChildId(e.target.value); setMessages([]); }} className={input}>
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
        </div>
      </PageFeedback>

      <div className="space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm whitespace-pre-wrap ${
              msg.role === "user"
                ? "bg-cyan-700 text-white"
                : "border border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex justify-start">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">
              Thinking...
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask about immunizations, growth, allergies..."
          className={input}
          disabled={busy || !childId}
        />
        <button type="submit" disabled={busy || !question.trim() || !childId} className={primary}>
          <Send className="h-4 w-4" />
        </button>
      </form>
    </main>
  );
}
