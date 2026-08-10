import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  CircleDollarSign,
  Info,
  Loader2,
  SearchCheck,
  ShieldAlert,
  Store,
} from "lucide-react";
import UserContext from "../../contexts/UserContext";
import { PageFeedback } from "../../components/common/PageFeedback";
import { medfinetAiApi } from "../../services/medfinetAiApi";

type RewardAnomalyItem = {
  id?: string;
  redemptionId?: string;
  merchantId?: string;
  merchantName?: string;
  caregiverId?: string;
  caregiverName?: string;
  category?: string;
  status?: string;
  amount?: number;
  credits?: number;
  score?: number;
  riskScore?: number;
  anomalyScore?: number;
  redeemedAt?: string;
  createdAt?: string;
  reasons?: string[];
  signals?: Record<string, string | number | boolean>;
};

type RewardAnomalyResult = {
  source?: string;
  model?: string | null;
  policyVersion?: string;
  note?: string;
  items: RewardAnomalyItem[];
};

const input =
  "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white";
const primary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-50";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function number(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function normalizeItem(value: unknown): RewardAnomalyItem | null {
  if (!isRecord(value)) return null;

  const reasons = Array.isArray(value.reasons)
    ? value.reasons.filter((item): item is string => typeof item === "string")
    : Array.isArray(value.flags)
      ? value.flags.filter((item): item is string => typeof item === "string")
      : undefined;

  const signalSource = isRecord(value.signals)
    ? value.signals
    : isRecord(value.components)
      ? value.components
      : null;
  const signals = signalSource
    ? Object.fromEntries(
        Object.entries(signalSource).filter(([, item]) =>
          ["string", "number", "boolean"].includes(typeof item),
        ),
      )
    : undefined;

  return {
    id: text(value.id),
    redemptionId: text(value.redemptionId),
    merchantId: text(value.merchantId),
    merchantName: text(value.merchantName),
    caregiverId: text(value.caregiverId),
    caregiverName: text(value.caregiverName),
    category: text(value.category),
    status: text(value.status),
    amount: number(value.amount),
    credits: number(value.credits),
    score: number(value.score),
    riskScore: number(value.riskScore),
    anomalyScore: number(value.anomalyScore),
    redeemedAt: text(value.redeemedAt),
    createdAt: text(value.createdAt),
    reasons,
    signals,
  };
}

function normalizeResults(value: unknown): RewardAnomalyResult | null {
  if (!isRecord(value) || !Array.isArray(value.items)) return null;

  return {
    source: text(value.source),
    model:
      typeof value.model === "string" || value.model === null
        ? value.model
        : undefined,
    policyVersion: text(value.policyVersion),
    note: text(value.note),
    items: value.items
      .map(normalizeItem)
      .filter((item): item is RewardAnomalyItem => Boolean(item)),
  };
}

function engineLabel(result: RewardAnomalyResult) {
  if (result.model) return result.model;
  if (result.source === "rules") return "Rules-based screening";
  return result.source || "Automated screening";
}

function riskSignal(item: RewardAnomalyItem) {
  return item.riskScore ?? item.anomalyScore ?? item.score;
}

function displayDate(value?: string) {
  if (!value) return "Not provided";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function displaySignalName(value: string) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/^./, (character) => character.toUpperCase());
}

function displaySignalValue(value: string | number | boolean) {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") {
    return Number.isInteger(value) ? String(value) : value.toFixed(3);
  }
  return value;
}

export default function AiRewardAnomalies() {
  const { organizationId } = useContext(UserContext);
  const [limit, setLimit] = useState("20");
  const [results, setResults] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialScanStarted = useRef(false);

  const detect = useCallback(async () => {
    if (!organizationId) return;
    setBusy(true);
    setError(null);
    setResults(null);
    setLoading(true);
    try {
      const parsedLimit = Number.parseInt(limit, 10);
      const result = await medfinetAiApi.detectRewardAnomalies(
        organizationId,
        Number.isFinite(parsedLimit) ? parsedLimit : undefined,
      );
      setResults(result);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Anomaly screening failed",
      );
    } finally {
      setBusy(false);
      setLoading(false);
    }
  }, [organizationId, limit]);

  useEffect(() => {
    if (!organizationId || initialScanStarted.current) return;
    initialScanStarted.current = true;
    void detect();
  }, [detect, organizationId]);

  const normalized = useMemo(() => normalizeResults(results), [results]);
  const anomalyCount = normalized?.items.length || 0;

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-cyan-50 p-2.5 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-300">
              Rewards oversight
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">
              Reward anomaly review
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Screen completed reward redemptions for unusual patterns that may
              require a human review. A flag is not proof of fraud and does not
              automatically block a caregiver or merchant.
            </p>
          </div>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
            Maximum flags to return
            <input
              value={limit}
              onChange={(event) => setLimit(event.target.value)}
              type="number"
              min="1"
              max="100"
              className={input}
            />
            <span className="mt-1.5 block text-xs font-normal leading-5 text-slate-500 dark:text-slate-400">
              This limits how many review candidates are shown; it does not change
              the screening rules.
            </span>
          </label>
          <button onClick={() => void detect()} disabled={busy} className={primary}>
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SearchCheck className="h-4 w-4" />
            )}
            {busy ? "Scanning reward activity…" : "Scan reward activity"}
          </button>
        </div>
      </section>

      <PageFeedback loading={loading} error={error} onRetry={() => void detect()}>
        {results === null ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900">
            <SearchCheck className="mx-auto h-10 w-10 text-slate-400" />
            <h2 className="mt-4 font-bold text-slate-900 dark:text-white">
              No scan has been run yet
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500 dark:text-slate-400">
              Run a reward activity scan to look for completed redemptions that
              need manual review.
            </p>
          </div>
        ) : normalized ? (
          <div className="space-y-5">
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Review flags
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
                  {anomalyCount}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Returned by this scan
                </p>
              </article>
              <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Screening engine
                </p>
                <p className="mt-2 font-bold text-slate-950 dark:text-white">
                  {engineLabel(normalized)}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {normalized.model ? "Configured model" : "No model reported"}
                </p>
              </article>
              <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Policy
                </p>
                <p className="mt-2 font-bold text-slate-950 dark:text-white">
                  {normalized.policyVersion || "Not reported"}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Screening policy version
                </p>
              </article>
              <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Review status
                </p>
                <p className="mt-2 flex items-center gap-2 font-bold text-slate-950 dark:text-white">
                  {anomalyCount ? (
                    <>
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      Manual review needed
                    </>
                  ) : (
                    <>
                      <BadgeCheck className="h-4 w-4 text-emerald-600" />
                      No flags returned
                    </>
                  )}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  No automated enforcement is performed
                </p>
              </article>
            </section>

            {anomalyCount === 0 ? (
              <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900 dark:bg-emerald-950/20">
                <div className="flex items-start gap-3">
                  <BadgeCheck className="mt-0.5 h-6 w-6 shrink-0 text-emerald-700 dark:text-emerald-400" />
                  <div>
                    <h2 className="font-bold text-emerald-950 dark:text-emerald-100">
                      No reward anomalies to review
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-emerald-900/80 dark:text-emerald-200/80">
                      {normalized.note ||
                        "The screening service did not return any completed reward redemptions that require manual review."}
                    </p>
                    {normalized.note
                      ?.toLowerCase()
                      .includes("no completed redemptions") && (
                      <p className="mt-3 rounded-xl bg-white/70 p-3 text-sm leading-6 text-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
                        There is nothing to evaluate yet because anomaly screening
                        operates on completed redemption activity. Complete a normal
                        reward redemption workflow first, then run this scan again.
                      </p>
                    )}
                  </div>
                </div>
              </section>
            ) : (
              <section className="space-y-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                    Redemptions requiring review
                  </h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Review the underlying transaction and programme context before
                    taking any administrative action.
                  </p>
                </div>

                {normalized.items.map((item, index) => {
                  const score = riskSignal(item);
                  const amount = item.credits ?? item.amount;
                  const reference = item.redemptionId || item.id || `flag-${index + 1}`;
                  return (
                    <article
                      key={reference}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
                    >
                      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                              Review flag {index + 1}
                            </span>
                            {item.status && (
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                {item.status}
                              </span>
                            )}
                          </div>
                          <h3 className="mt-3 text-lg font-bold text-slate-950 dark:text-white">
                            Redemption {item.redemptionId || item.id || "reference not reported"}
                          </h3>
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {displayDate(item.redeemedAt || item.createdAt)}
                          </p>
                        </div>

                        {score !== undefined && (
                          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-right dark:border-amber-900 dark:bg-amber-950/30">
                            <p className="text-xs font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                              Screening signal
                            </p>
                            <p className="mt-1 text-2xl font-bold text-amber-950 dark:text-amber-100">
                              {score.toFixed(3)}
                            </p>
                            <p className="mt-1 text-[11px] text-amber-800/80 dark:text-amber-300/80">
                              Review signal, not a fraud probability
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
                          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                            <Store className="h-3.5 w-3.5" /> Merchant
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                            {item.merchantName || item.merchantId || "Not reported"}
                          </p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                            Caregiver
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                            {item.caregiverName || item.caregiverId || "Not reported"}
                          </p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
                          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                            <CircleDollarSign className="h-3.5 w-3.5" /> Value
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                            {amount !== undefined ? amount.toLocaleString() : "Not reported"}
                          </p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                            Category
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                            {item.category || "Not reported"}
                          </p>
                        </div>
                      </div>

                      {item.reasons && item.reasons.length > 0 && (
                        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/20">
                          <p className="font-semibold text-amber-950 dark:text-amber-100">
                            Why this was flagged
                          </p>
                          <ul className="mt-2 space-y-1.5 text-sm text-amber-900 dark:text-amber-200">
                            {item.reasons.map((reason) => (
                              <li key={reason} className="flex gap-2">
                                <span aria-hidden="true">•</span>
                                <span>{reason}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {item.signals && Object.keys(item.signals).length > 0 && (
                        <details className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                          <summary className="cursor-pointer text-sm font-semibold text-slate-800 dark:text-slate-200">
                            Screening signals
                          </summary>
                          <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {Object.entries(item.signals).map(([name, value]) => (
                              <div key={name}>
                                <dt className="text-xs font-semibold text-slate-500">
                                  {displaySignalName(name)}
                                </dt>
                                <dd className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                                  {displaySignalValue(value)}
                                </dd>
                              </div>
                            ))}
                          </dl>
                        </details>
                      )}
                    </article>
                  );
                })}
              </section>
            )}

            <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
              <div className="flex gap-3">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-cyan-700 dark:text-cyan-300" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    How to interpret this page
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    The screening service surfaces patterns for investigation. It
                    does not automatically reverse a redemption, suspend an account,
                    deny benefits, or determine fraud. Any action should be based on
                    the underlying programme and audit evidence.
                  </p>
                </div>
              </div>
            </section>
          </div>
        ) : (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/20">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-300" />
              <div>
                <h2 className="font-bold text-amber-950 dark:text-amber-100">
                  The screening response could not be displayed
                </h2>
                <p className="mt-1 text-sm leading-6 text-amber-900 dark:text-amber-200">
                  Medfinet received a response in an unsupported format. No raw API
                  payload is shown here. Run the scan again or review the service
                  logs if the problem continues.
                </p>
              </div>
            </div>
          </section>
        )}
      </PageFeedback>
    </main>
  );
}
