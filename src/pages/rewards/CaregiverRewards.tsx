import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Copy, Gift, RefreshCw, ShieldCheck, Store } from "lucide-react";
import UserContext from "../../contexts/UserContext";
import { Modal } from "../../components/common/Modal";
import { PageFeedback } from "../../components/common/PageFeedback";
import { medfinetRewardsApi } from "../../services/medfinetRewardsApi";

type Account = NonNullable<
  Awaited<ReturnType<typeof medfinetRewardsApi.getMyAccount>>
>;
type Merchant = Awaited<
  ReturnType<typeof medfinetRewardsApi.listMerchants>
>["items"][number];
const input = "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5";

export default function CaregiverRewards() {
  const { organizationId } = useContext(UserContext);
  const [account, setAccount] = useState<Account | null>(null);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    merchantId: "",
    category: "",
    amount: "",
    expiresInMinutes: 15,
  });
  const [token, setToken] = useState<{
    value: string;
    expiresAt: string;
    merchantName: string;
    amount: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const selected = useMemo(
    () => merchants.find((item) => item.id === form.merchantId),
    [form.merchantId, merchants],
  );

  const load = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setError("");
    try {
      const [accountRow, merchantPage] = await Promise.all([
        medfinetRewardsApi.getMyAccount(organizationId),
        medfinetRewardsApi.listMerchants(organizationId),
      ]);
      setAccount(accountRow);
      setMerchants(merchantPage.items);
      setForm((current) => {
        const merchant =
          merchantPage.items.find((item) => item.id === current.merchantId) ||
          merchantPage.items[0];
        return {
          ...current,
          merchantId: merchant?.id || "",
          category: merchant?.eligibleCategories.includes(current.category)
            ? current.category
            : merchant?.eligibleCategories[0] || "",
        };
      });
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to load rewards",
      );
    } finally {
      setLoading(false);
    }
  }, [organizationId]);
  useEffect(() => {
    void load();
  }, [load]);

  async function reserve(event: React.FormEvent) {
    event.preventDefault();
    if (!organizationId || !account || !selected) return;
    setBusy(true);
    setError("");
    try {
      const result = await medfinetRewardsApi.createReservation(
        organizationId,
        account.account.id,
        {
          merchantId: selected.id,
          amount: Number(form.amount),
          category: form.category,
          expiresInMinutes: form.expiresInMinutes,
          idempotencyKey: crypto.randomUUID(),
        },
      );
      setToken({
        value: result.redemptionToken,
        expiresAt: result.reservation.expiresAt,
        merchantName: selected.name,
        amount: result.reservation.amount,
      });
      setOpen(false);
      setForm((current) => ({ ...current, amount: "" }));
      await load();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to reserve benefits",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-cyan-700">
            Household benefits
          </p>
          <h1 className="text-3xl font-bold">Rewards wallet</h1>
          <p className="mt-2 text-sm text-slate-600">
            Reserve earned credits for an approved merchant. The redemption code
            expires within 30 minutes.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-lg border bg-white px-3 py-2 text-sm font-semibold"
        >
          <RefreshCw className="mr-2 inline h-4 w-4" />
          Refresh
        </button>
      </div>
      <PageFeedback
        loading={loading}
        error={error}
        empty={!account}
        emptyTitle="No rewards account yet"
        emptyDescription="A rewards account is created when an eligible health milestone is granted."
        onRetry={() => void load()}
      >
        {account && (
          <>
            <section className="grid gap-4 sm:grid-cols-3">
              <article className="rounded-2xl bg-cyan-800 p-6 text-white sm:col-span-2">
                <Gift className="h-7 w-7" />
                <p className="mt-5 text-sm text-cyan-100">Available benefits</p>
                <p className="mt-1 text-4xl font-bold">
                  {account.account.balance} credits
                </p>
                <p className="mt-2 text-sm text-cyan-100">
                  {account.account.caregiver.firstName}{" "}
                  {account.account.caregiver.lastName}
                </p>
              </article>
              <article className="rounded-2xl border bg-white p-6">
                <p className="text-sm text-slate-500">Reserved</p>
                <p className="mt-2 text-3xl font-bold">
                  {account.account.reservedBalance}
                </p>
                <button
                  type="button"
                  disabled={
                    !merchants.length || Number(account.account.balance) < 1
                  }
                  onClick={() => setOpen(true)}
                  className="mt-6 w-full rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  <Store className="mr-2 inline h-4 w-4" />
                  Reserve to redeem
                </button>
              </article>
            </section>
            {token && (
              <section className="rounded-2xl border-2 border-cyan-700 bg-white p-6">
                <div className="flex gap-3">
                  <ShieldCheck className="h-6 w-6 shrink-0 text-cyan-700" />
                  <div>
                    <h2 className="text-xl font-bold">
                      One-time redemption code
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Show this only to {token.merchantName}. It reserves{" "}
                      {token.amount} credits and expires{" "}
                      {new Date(token.expiresAt).toLocaleTimeString()}.
                    </p>
                  </div>
                </div>
                <div className="mt-5 flex flex-col gap-3 rounded-xl bg-slate-950 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <code className="break-all text-sm text-white">
                    {token.value}
                  </code>
                  <button
                    type="button"
                    onClick={() =>
                      void navigator.clipboard.writeText(token.value)
                    }
                    className="shrink-0 rounded-lg bg-white px-3 py-2 text-sm font-semibold"
                  >
                    <Copy className="mr-2 inline h-4 w-4" />
                    Copy
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setToken(null)}
                  className="mt-3 text-sm font-semibold text-slate-600"
                >
                  Hide code
                </button>
              </section>
            )}
            <section className="rounded-2xl border bg-white p-6">
              <h2 className="text-xl font-bold">Recent activity</h2>
              <div className="mt-4 divide-y">
                {account.transactions.items.map((item) => (
                  <article
                    key={item.id}
                    className="flex justify-between gap-3 py-4"
                  >
                    <div>
                      <p className="font-semibold">
                        {item.type.replaceAll("_", " ")}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold ${Number(item.amount) >= 0 ? "text-emerald-700" : "text-slate-950"}`}
                      >
                        {Number(item.amount) >= 0 ? "+" : ""}
                        {item.amount}
                      </p>
                      <p className="text-xs text-slate-500">
                        Balance {item.balanceAfter}
                      </p>
                    </div>
                  </article>
                ))}
                {!account.transactions.items.length && (
                  <p className="py-6 text-sm text-slate-500">
                    No reward activity yet.
                  </p>
                )}
              </div>
            </section>
          </>
        )}
      </PageFeedback>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Reserve benefits"
        description="A one-time code will be generated for the selected approved merchant."
      >
        <form onSubmit={(event) => void reserve(event)} className="space-y-4">
          <label className="block text-sm font-semibold">
            Merchant
            <select
              required
              className={input}
              value={form.merchantId}
              onChange={(event) => {
                const merchant = merchants.find(
                  (item) => item.id === event.target.value,
                );
                setForm({
                  ...form,
                  merchantId: event.target.value,
                  category: merchant?.eligibleCategories[0] || "",
                });
              }}
            >
              {merchants.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.code})
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold">
            Eligible item category
            <select
              required
              className={input}
              value={form.category}
              onChange={(event) =>
                setForm({ ...form, category: event.target.value })
              }
            >
              {selected?.eligibleCategories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold">
            Credits
            <input
              required
              type="number"
              min="1"
              max={account?.account.balance}
              step="1"
              className={input}
              value={form.amount}
              onChange={(event) =>
                setForm({ ...form, amount: event.target.value })
              }
            />
          </label>
          <label className="block text-sm font-semibold">
            Code validity
            <select
              className={input}
              value={form.expiresInMinutes}
              onChange={(event) =>
                setForm({
                  ...form,
                  expiresInMinutes: Number(event.target.value),
                })
              }
            >
              <option value="5">5 minutes</option>
              <option value="10">10 minutes</option>
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
            </select>
          </label>
          <button
            disabled={busy}
            className="w-full rounded-lg bg-cyan-700 px-4 py-2.5 font-semibold text-white disabled:opacity-50"
          >
            {busy ? "Reserving…" : "Generate one-time code"}
          </button>
        </form>
      </Modal>
    </main>
  );
}
