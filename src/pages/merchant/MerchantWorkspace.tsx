import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  Banknote,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Store,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import UserContext from "../../contexts/UserContext";
import { OrganizationSwitcher } from "../../components/common/OrganizationSwitcher";
import { PageFeedback } from "../../components/common/PageFeedback";
import { medfinetRewardsApi } from "../../services/medfinetRewardsApi";

type Membership = Awaited<
  ReturnType<typeof medfinetRewardsApi.listMyMerchants>
>[number];
type Settlement = Awaited<
  ReturnType<typeof medfinetRewardsApi.listMerchantSettlements>
>["items"][number];

const field = "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5";

export default function MerchantWorkspace() {
  const { organizationId, logout } = useContext(UserContext);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [merchantId, setMerchantId] = useState("");
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [redemption, setRedemption] = useState({
    reservationToken: "",
    amount: "",
    reference: "",
  });
  const [period, setPeriod] = useState({ periodStart: "", periodEnd: "" });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const selected = useMemo(
    () => memberships.find((entry) => entry.merchant.id === merchantId) || null,
    [memberships, merchantId],
  );
  const canRedeem = selected?.role === "OWNER" || selected?.role === "CASHIER";
  const canSettle =
    selected?.role === "OWNER" || selected?.role === "SETTLEMENT";

  const load = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setError("");
    try {
      const rows = await medfinetRewardsApi.listMyMerchants(organizationId);
      setMemberships(rows);
      setMerchantId((current) =>
        rows.some((row) => row.merchant.id === current)
          ? current
          : rows[0]?.merchant.id || "",
      );
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to load merchant access",
      );
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  const loadSettlements = useCallback(async () => {
    if (!organizationId || !merchantId || !canSettle) {
      setSettlements([]);
      return;
    }
    try {
      const result = await medfinetRewardsApi.listMerchantSettlements(
        organizationId,
        merchantId,
      );
      setSettlements(result.items);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to load settlement history",
      );
    }
  }, [canSettle, merchantId, organizationId]);

  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    void loadSettlements();
  }, [loadSettlements]);

  async function redeem(event: React.FormEvent) {
    event.preventDefault();
    if (!organizationId || !merchantId || !canRedeem) return;
    const amount = Number(redemption.amount);
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await medfinetRewardsApi.redeem(
        organizationId,
        merchantId,
        {
          reservationToken: redemption.reservationToken.trim(),
          amount,
          ...(redemption.reference.trim()
            ? { reference: redemption.reference.trim() }
            : {}),
        },
      );
      setNotice(`Redemption ${result.id} completed and recorded.`);
      setRedemption({ reservationToken: "", amount: "", reference: "" });
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Redemption could not be completed",
      );
    } finally {
      setBusy(false);
    }
  }

  async function createSettlement(event: React.FormEvent) {
    event.preventDefault();
    if (!organizationId || !merchantId || !canSettle) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await medfinetRewardsApi.createSettlement(
        organizationId,
        merchantId,
        {
          periodStart: new Date(
            `${period.periodStart}T00:00:00.000Z`,
          ).toISOString(),
          periodEnd: new Date(
            `${period.periodEnd}T23:59:59.999Z`,
          ).toISOString(),
        },
      );
      setNotice(`Settlement ${result.id} created for administrator review.`);
      setPeriod({ periodStart: "", periodEnd: "" });
      await loadSettlements();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Settlement could not be created",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-cyan-700" />
            <div>
              <p className="font-bold text-slate-950">Medfinet Merchant</p>
              <p className="text-xs text-slate-500">
                Authorized benefits redemption
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <OrganizationSwitcher />
            <Link
              to="/account"
              className="rounded-lg border px-3 py-2 text-sm font-semibold"
            >
              <UserRound className="mr-2 inline h-4 w-4" />
              Account
            </Link>
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-lg border px-3 py-2 text-sm font-semibold"
            >
              <LogOut className="mr-2 inline h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-cyan-700">
              Merchant operations
            </p>
            <h1 className="text-3xl font-bold text-slate-950">
              Redeem and settle benefits
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Only short-lived caregiver reservations can be redeemed. Tokens
              are cleared after each attempt.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-lg border bg-white px-3 py-2 text-sm font-semibold"
          >
            <RefreshCw className="mr-2 inline h-4 w-4" />
            Refresh access
          </button>
        </div>
        {notice && (
          <div
            role="status"
            className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"
          >
            {notice}
          </div>
        )}
        <PageFeedback
          loading={loading}
          error={error}
          empty={!memberships.length}
          emptyTitle="No active merchant access"
          emptyDescription="An organization administrator must add your verified subject ID to an active merchant."
          onRetry={() => void load()}
        >
          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <label className="block text-sm font-semibold">
              Operating merchant
              <select
                value={merchantId}
                onChange={(event) => {
                  setMerchantId(event.target.value);
                  setNotice("");
                  setError("");
                }}
                className={field}
              >
                {memberships.map((entry) => (
                  <option key={entry.id} value={entry.merchant.id}>
                    {entry.merchant.name} ({entry.merchant.code}) · {entry.role}
                  </option>
                ))}
              </select>
            </label>
            {selected && (
              <div className="mt-4 flex flex-wrap gap-2">
                {selected.merchant.eligibleCategories.map((category) => (
                  <span
                    key={category}
                    className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-800"
                  >
                    {category}
                  </span>
                ))}
              </div>
            )}
          </section>
          <div className="grid gap-6 lg:grid-cols-2">
            {canRedeem && (
              <form
                onSubmit={(event) => void redeem(event)}
                className="rounded-2xl border bg-white p-6 shadow-sm"
              >
                <Store className="h-7 w-7 text-cyan-700" />
                <h2 className="mt-3 text-xl font-bold">
                  Complete a redemption
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Enter the one-time reservation exactly as shown by the
                  caregiver.
                </p>
                <label className="mt-5 block text-sm font-semibold">
                  One-time reservation token
                  <input
                    required
                    type="password"
                    autoComplete="off"
                    value={redemption.reservationToken}
                    onChange={(event) =>
                      setRedemption({
                        ...redemption,
                        reservationToken: event.target.value,
                      })
                    }
                    className={field}
                  />
                </label>
                <label className="mt-4 block text-sm font-semibold">
                  Credits
                  <input
                    required
                    type="number"
                    min="1"
                    step="1"
                    value={redemption.amount}
                    onChange={(event) =>
                      setRedemption({
                        ...redemption,
                        amount: event.target.value,
                      })
                    }
                    className={field}
                  />
                </label>
                <label className="mt-4 block text-sm font-semibold">
                  Merchant reference{" "}
                  <span className="font-normal text-slate-500">(optional)</span>
                  <input
                    maxLength={120}
                    value={redemption.reference}
                    onChange={(event) =>
                      setRedemption({
                        ...redemption,
                        reference: event.target.value,
                      })
                    }
                    className={field}
                  />
                </label>
                <button
                  disabled={busy}
                  className="mt-5 w-full rounded-lg bg-cyan-700 px-4 py-2.5 font-semibold text-white disabled:opacity-50"
                >
                  {busy ? "Processing…" : "Confirm redemption"}
                </button>
              </form>
            )}
            {canSettle && (
              <form
                onSubmit={(event) => void createSettlement(event)}
                className="rounded-2xl border bg-white p-6 shadow-sm"
              >
                <Banknote className="h-7 w-7 text-cyan-700" />
                <h2 className="mt-3 text-xl font-bold">
                  Create settlement batch
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Bundle completed redemptions for administrator approval.
                </p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-semibold">
                    Period start
                    <input
                      required
                      type="date"
                      value={period.periodStart}
                      onChange={(event) =>
                        setPeriod({
                          ...period,
                          periodStart: event.target.value,
                        })
                      }
                      className={field}
                    />
                  </label>
                  <label className="text-sm font-semibold">
                    Period end
                    <input
                      required
                      type="date"
                      min={period.periodStart}
                      value={period.periodEnd}
                      onChange={(event) =>
                        setPeriod({ ...period, periodEnd: event.target.value })
                      }
                      className={field}
                    />
                  </label>
                </div>
                <button
                  disabled={busy}
                  className="mt-5 w-full rounded-lg bg-slate-900 px-4 py-2.5 font-semibold text-white disabled:opacity-50"
                >
                  {busy ? "Creating…" : "Create settlement"}
                </button>
              </form>
            )}
          </div>
          {canSettle && (
            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold">Settlement history</h2>
              <div className="mt-4 grid gap-3">
                {settlements.length ? (
                  settlements.map((item) => (
                    <article
                      key={item.id}
                      className="flex flex-col justify-between gap-2 rounded-xl border p-4 sm:flex-row sm:items-center"
                    >
                      <div>
                        <p className="font-semibold">
                          {new Date(item.periodStart).toLocaleDateString()} –{" "}
                          {new Date(item.periodEnd).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-slate-600">
                          {item.totalCredits} credits
                        </p>
                      </div>
                      <span className="w-fit rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold">
                        {item.status}
                      </span>
                    </article>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    No settlement batches yet.
                  </p>
                )}
              </div>
            </section>
          )}
        </PageFeedback>
      </main>
    </div>
  );
}
