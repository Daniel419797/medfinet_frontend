import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  Cpu,
  Fingerprint,
  Info,
  Loader2,
  SearchCheck,
  ShieldCheck,
  UserRoundSearch,
} from "lucide-react";
import UserContext from "../../contexts/UserContext";
import { PageFeedback } from "../../components/common/PageFeedback";
import { medfinetAiApi } from "../../services/medfinetAiApi";
import { medfinetIdentityApi } from "../../services/medfinetIdentityApi";

type Child = {
  id: string;
  firstName: string;
  lastName: string;
  medfinetId: string;
};

type DuplicateCandidate = {
  childId?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  medfinetId?: string;
  score?: number;
  components?: Record<string, number>;
};

type DuplicateDetectionResult = {
  source?: string;
  model?: string | null;
  policyVersion?: string;
  items: DuplicateCandidate[];
};

const input =
  "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100";
const primary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-50";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeResults(value: unknown): DuplicateDetectionResult | null {
  if (!isRecord(value) || !Array.isArray(value.items)) return null;

  const items = value.items
    .filter(isRecord)
    .map((item) => ({
      childId: typeof item.childId === "string" ? item.childId : undefined,
      firstName: typeof item.firstName === "string" ? item.firstName : undefined,
      lastName: typeof item.lastName === "string" ? item.lastName : undefined,
      dateOfBirth:
        typeof item.dateOfBirth === "string" ? item.dateOfBirth : undefined,
      medfinetId:
        typeof item.medfinetId === "string" ? item.medfinetId : undefined,
      score: typeof item.score === "number" ? item.score : undefined,
      components: isRecord(item.components)
        ? Object.fromEntries(
            Object.entries(item.components).filter(
              (entry): entry is [string, number] => typeof entry[1] === "number",
            ),
          )
        : undefined,
    }));

  return {
    source: typeof value.source === "string" ? value.source : undefined,
    model:
      typeof value.model === "string" || value.model === null
        ? value.model
        : undefined,
    policyVersion:
      typeof value.policyVersion === "string" ? value.policyVersion : undefined,
    items,
  };
}

function displayComponentName(name: string) {
  return name
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/^./, (value) => value.toUpperCase());
}

function formatDate(value?: string) {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

function scorePercent(score?: number) {
  if (typeof score !== "number" || !Number.isFinite(score)) return null;
  return Math.max(0, Math.min(100, score * 100));
}

function sourceLabel(source?: string) {
  if (!source) return "Detection service";
  if (source.toLowerCase() === "rules") return "Rules engine";
  return source.replace(/[_-]+/g, " ");
}

export default function AiDuplicates() {
  const { organizationId } = useContext(UserContext);
  const [children, setChildren] = useState<Child[]>([]);
  const [childId, setChildId] = useState("");
  const [limit, setLimit] = useState("10");
  const [results, setResults] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadChildren = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await medfinetIdentityApi.listChildren(organizationId, {
        limit: 100,
      });
      setChildren(result.items);
      setChildId((current) =>
        current && result.items.some((child) => child.id === current)
          ? current
          : result.items[0]?.id || "",
      );
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to load children",
      );
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    void loadChildren();
  }, [loadChildren]);

  const selectedChild = useMemo(
    () => children.find((child) => child.id === childId) || null,
    [childId, children],
  );
  const normalizedResults = useMemo(() => normalizeResults(results), [results]);

  const detect = async () => {
    if (!organizationId || !childId || busy) return;
    setBusy(true);
    setError(null);
    setResults(null);
    try {
      const result = await medfinetAiApi.detectDuplicates(
        organizationId,
        childId,
        parseInt(limit, 10) || undefined,
      );
      setResults(result);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Duplicate detection failed",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div className="max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-cyan-800">
            <Fingerprint className="h-4 w-4" /> Identity integrity
          </div>
          <h1 className="text-3xl font-bold text-slate-950">
            Duplicate identity review
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Compare one child record against other records in this organization and
            surface possible matches for human review. A detection result is a
            signal only; Medfinet does not automatically merge, reject, or alter a
            child record from this screen.
          </p>
        </div>
      </header>

      <PageFeedback loading={loading} error={error} onRetry={loadChildren}>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-slate-100 p-2.5 text-slate-700">
              <UserRoundSearch className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-950">Choose a record to review</h2>
              <p className="mt-1 text-sm text-slate-600">
                The selected child remains the reference record. Returned records
                are possible matches to inspect, not confirmed duplicates.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_auto] lg:items-end">
            <label className="block text-sm font-semibold text-slate-700">
              Child record
              <select
                value={childId}
                onChange={(event) => {
                  setChildId(event.target.value);
                  setResults(null);
                }}
                className={input}
              >
                {children.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.firstName} {child.lastName} ({child.medfinetId})
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              Results to return
              <select
                value={limit}
                onChange={(event) => setLimit(event.target.value)}
                className={input}
              >
                <option value="5">5 candidates</option>
                <option value="10">10 candidates</option>
                <option value="20">20 candidates</option>
                <option value="50">50 candidates</option>
              </select>
            </label>

            <button
              type="button"
              onClick={() => void detect()}
              disabled={busy || !childId}
              className={`${primary} min-h-11`}
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SearchCheck className="h-4 w-4" />
              )}
              {busy ? "Checking records…" : "Check for possible duplicates"}
            </button>
          </div>

          {selectedChild && (
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <span>
                Reference: <strong className="text-slate-900">{selectedChild.firstName} {selectedChild.lastName}</strong>
              </span>
              <span>
                Medfinet ID: <strong className="text-slate-900">{selectedChild.medfinetId}</strong>
              </span>
            </div>
          )}
        </section>
      </PageFeedback>

      {results !== null && normalizedResults && (
        <section className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <p className="flex items-center gap-2 text-sm font-bold text-slate-950">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  Review results
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-950">
                  {normalizedResults.items.length === 1
                    ? "1 possible match returned"
                    : `${normalizedResults.items.length} possible matches returned`}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Review the identifying fields and component signals before taking
                  any action elsewhere in Medfinet. The combined score is not shown
                  as a probability or an automatic decision.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-slate-700">
                  <Cpu className="h-3.5 w-3.5" />
                  {sourceLabel(normalizedResults.source)}
                </span>
                {normalizedResults.policyVersion && (
                  <span className="rounded-full bg-cyan-50 px-3 py-1.5 text-cyan-800">
                    {normalizedResults.policyVersion}
                  </span>
                )}
              </div>
            </div>
          </div>

          {normalizedResults.items.length === 0 ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                <div>
                  <h3 className="font-bold text-emerald-950">
                    No possible matches returned
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-emerald-900/80">
                    The current detection run did not return another record for
                    review under this policy and result limit.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {normalizedResults.items.map((candidate, index) => {
                const percent = scorePercent(candidate.score);
                const fullName =
                  `${candidate.firstName || ""} ${candidate.lastName || ""}`.trim() ||
                  "Unnamed child record";
                const componentEntries = Object.entries(candidate.components || {});

                return (
                  <article
                    key={candidate.childId || `${candidate.medfinetId || "candidate"}-${index}`}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-start sm:p-6">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-cyan-50 text-sm font-bold text-cyan-800">
                          {(candidate.firstName?.[0] || "?").toUpperCase()}
                          {(candidate.lastName?.[0] || "").toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                            Candidate {index + 1}
                          </p>
                          <h3 className="mt-1 truncate text-lg font-bold text-slate-950">
                            {fullName}
                          </h3>
                          <p className="mt-1 text-sm text-slate-500">
                            {candidate.medfinetId || "Medfinet ID unavailable"}
                          </p>
                        </div>
                      </div>

                      <div className="min-w-[180px] rounded-xl bg-slate-50 p-4">
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                            Combined signal
                          </span>
                          <span className="text-lg font-bold text-slate-950">
                            {typeof candidate.score === "number"
                              ? candidate.score.toFixed(3)
                              : "—"}
                          </span>
                        </div>
                        {percent !== null && (
                          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className="h-full rounded-full bg-cyan-700"
                              style={{ width: `${percent}%` }}
                              aria-label={`Combined duplicate signal ${percent.toFixed(1)} percent of the score scale`}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[260px_1fr]">
                      <div className="space-y-3">
                        <div className="rounded-xl border border-slate-200 p-4">
                          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                            <CalendarDays className="h-4 w-4" /> Date of birth
                          </p>
                          <p className="mt-2 font-semibold text-slate-950">
                            {formatDate(candidate.dateOfBirth)}
                          </p>
                        </div>
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-950">
                          <strong>Manual review required.</strong> Compare this
                          candidate with the source record before correcting or
                          linking identities.
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-bold text-slate-950">
                          Component signals
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          These are the individual values returned by the current
                          detection policy.
                        </p>

                        {componentEntries.length ? (
                          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            {componentEntries.map(([name, value]) => {
                              const componentPercent = scorePercent(value);
                              return (
                                <div
                                  key={name}
                                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    <span className="text-xs font-semibold text-slate-600">
                                      {displayComponentName(name)}
                                    </span>
                                    <span className="font-mono text-sm font-bold text-slate-900">
                                      {value.toFixed(3)}
                                    </span>
                                  </div>
                                  {componentPercent !== null && (
                                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
                                      <div
                                        className="h-full rounded-full bg-slate-700"
                                        style={{ width: `${componentPercent}%` }}
                                      />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="mt-3 rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                            No component breakdown was returned for this candidate.
                          </p>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <details className="rounded-2xl border border-slate-200 bg-white p-5 text-sm shadow-sm">
            <summary className="cursor-pointer list-none font-semibold text-slate-800">
              <span className="inline-flex items-center gap-2">
                <Info className="h-4 w-4" /> Technical response details
              </span>
            </summary>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs font-semibold text-slate-500">Source</p>
                <p className="mt-1 font-medium text-slate-900">
                  {sourceLabel(normalizedResults.source)}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs font-semibold text-slate-500">Model</p>
                <p className="mt-1 font-medium text-slate-900">
                  {normalizedResults.model || "No model reported"}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs font-semibold text-slate-500">Policy</p>
                <p className="mt-1 font-medium text-slate-900">
                  {normalizedResults.policyVersion || "Not reported"}
                </p>
              </div>
            </div>
          </details>
        </section>
      )}

      {results !== null && !normalizedResults && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
            <div>
              <h2 className="font-bold text-amber-950">
                Detection completed, but the result format could not be displayed
              </h2>
              <p className="mt-1 text-sm leading-6 text-amber-900/80">
                The service returned a response that does not match the structured
                duplicate-review format expected by this page. No raw JSON is shown
                to administrators.
              </p>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
