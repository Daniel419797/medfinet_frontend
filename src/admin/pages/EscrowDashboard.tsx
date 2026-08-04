import { FormEvent, useCallback, useContext, useEffect, useState } from "react";
import { Landmark, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import UserContext from "../../contexts/UserContext";
import { PageFeedback } from "../../components/common/PageFeedback";
import { medfinetEscrowApi } from "../../services/medfinetEscrowApi";
import { medfinetDonationApi } from "../../services/medfinetDonationApi";

const input = "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm";
const button = "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold disabled:opacity-50";
const primary = "rounded-lg bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50";

export default function EscrowDashboard() {
  const { organizationId } = useContext(UserContext);
  const [campaignId, setCampaignId] = useState("");
  const [balance, setBalance] = useState<{ balance: number; escrowAddress: string } | null>(null);
  const [eligibility, setEligibility] = useState<unknown>(null);
  const [recipientWallet, setRecipientWallet] = useState("");
  const [withdrawalId, setWithdrawalId] = useState("");
  const [withdrawalStatus, setWithdrawalStatus] = useState<unknown>(null);
  const [donations, setDonations] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadBalance = useCallback(async () => {
    if (!organizationId || !campaignId) return;
    setLoading(true);
    setError(null);
    try {
      const [b, e, d] = await Promise.all([
        medfinetEscrowApi.getBalance(organizationId, campaignId),
        medfinetEscrowApi.checkWithdrawalEligibility(organizationId, campaignId),
        medfinetDonationApi.listForCampaign(organizationId, campaignId),
      ]);
      setBalance(b);
      setEligibility(e);
      setDonations(d as unknown as Array<Record<string, unknown>>);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Failed to load escrow data");
    } finally {
      setLoading(false);
    }
  }, [organizationId, campaignId]);

  useEffect(() => { if (campaignId) loadBalance(); }, [campaignId, loadBalance]);

  const handlePayout = async () => {
    if (!organizationId || !campaignId || busy) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const result = await medfinetEscrowApi.initiatePayout(organizationId, campaignId);
      setNotice(`Payout initiated. Tx: ${result.transactionHash}`);
      loadBalance();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Payout failed");
    } finally {
      setBusy(false);
    }
  };

  const handleWithdraw = async (e: FormEvent) => {
    e.preventDefault();
    if (!organizationId || !campaignId || !recipientWallet || busy) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const result = await medfinetEscrowApi.initiateWithdrawal(organizationId, campaignId, { recipientWallet });
      setWithdrawalId(result.withdrawalId);
      setNotice(`Withdrawal initiated. ID: ${result.withdrawalId}`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Withdrawal failed");
    } finally {
      setBusy(false);
    }
  };

  const checkStatus = async () => {
    if (!organizationId || !withdrawalId || busy) return;
    setBusy(true);
    try {
      const result = await medfinetEscrowApi.getWithdrawalStatus(organizationId, withdrawalId);
      setWithdrawalStatus(result);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Status check failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <header className="flex items-center gap-3">
        <Landmark className="h-6 w-6 text-cyan-700" />
        <div>
          <h1 className="text-xl font-bold">Escrow Dashboard</h1>
          <p className="text-sm text-slate-600">Monitor balances and manage fund flows.</p>
        </div>
      </header>

      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <label className="block text-xs font-semibold text-slate-600">Campaign ID</label>
        <div className="flex items-end gap-3">
          <input value={campaignId} onChange={(e) => { setCampaignId(e.target.value); setBalance(null); setEligibility(null); }} className={input} />
          <button onClick={loadBalance} disabled={!campaignId || loading} className={primary}>
            {loading ? "Loading..." : "Load"}
          </button>
        </div>
      </div>

      <PageFeedback loading={loading} error={error} onRetry={loadBalance}>
        {balance && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
              <p className="text-xs font-semibold text-slate-600">Balance</p>
              <p className="mt-1 text-2xl font-bold text-cyan-700">{balance.balance}</p>
              <p className="mt-1 text-xs text-slate-500 break-all">Address: {balance.escrowAddress}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
              <p className="text-xs font-semibold text-slate-600">Withdrawal Eligibility</p>
              <pre className="mt-2 overflow-x-auto text-xs text-slate-700 dark:text-slate-300">
                {JSON.stringify(eligibility, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </PageFeedback>

      {notice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">{notice}</div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 space-y-3">
        <h2 className="text-sm font-semibold text-slate-800">Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button onClick={handlePayout} disabled={busy || !campaignId} className={`${primary} flex items-center gap-2`}>
            <ArrowUpCircle className="h-4 w-4" /> Initiate Payout
          </button>
        </div>
        <form onSubmit={handleWithdraw} className="flex flex-wrap items-end gap-3">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-600">Recipient wallet</label>
            <input value={recipientWallet} onChange={(e) => setRecipientWallet(e.target.value)} className={input} />
          </div>
          <button type="submit" disabled={busy || !recipientWallet || !campaignId} className={primary}>
            <ArrowDownCircle className="mr-1 inline h-4 w-4" /> Withdraw
          </button>
        </form>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-600">Withdrawal ID</label>
            <input value={withdrawalId} onChange={(e) => setWithdrawalId(e.target.value)} className={input} />
          </div>
          <button onClick={checkStatus} disabled={busy || !withdrawalId} className={button}>
            Check Status
          </button>
        </div>
        {withdrawalStatus && (
          <pre className="overflow-x-auto rounded-lg bg-slate-50 p-3 text-xs dark:bg-slate-800">
            {JSON.stringify(withdrawalStatus, null, 2)}
          </pre>
        )}
      </div>

      {donations.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">Donations for this campaign</h2>
          <div className="space-y-2">
            {donations.map((d, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800">
                <span>{String((d as any).donor?.name || `Donation ${i + 1}`)}</span>
                <span className="font-semibold">{String((d as any).amount || "")}</span>
                <span className="text-xs text-slate-500">{String((d as any).status || "")}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
