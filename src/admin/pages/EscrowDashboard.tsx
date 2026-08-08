import { FormEvent, useCallback, useContext, useEffect, useState } from "react";
import { CheckCircle, Landmark, Wallet, WarningCircle } from "@phosphor-icons/react";
import BlockchainFeatureGate from "../../components/blockchain/BlockchainFeatureGate";
import WalletStatusButton from "../../components/wallet/WalletStatusButton";
import { useBlockchain } from "../../contexts/BlockchainContext";
import UserContext from "../../contexts/UserContext";
import { medfinetDonationApi } from "../../services/medfinetDonationApi";
import {
  medfinetEscrowApi,
  type WithdrawalEligibility,
} from "../../services/medfinetEscrowApi";

const input = "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900";
const primary = "inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50";

function shortAddress(address: string) {
  return `${address.slice(0, 8)}…${address.slice(-6)}`;
}

function EscrowWorkspace() {
  const { organizationId } = useContext(UserContext);
  const {
    health,
    walletAddress,
    walletConnecting,
    connectWallet,
    signTransactions,
  } = useBlockchain();
  const [campaignId, setCampaignId] = useState("");
  const [balance, setBalance] = useState<{ balance: number; escrowAddress: string } | null>(null);
  const [eligibility, setEligibility] = useState<WithdrawalEligibility | null>(null);
  const [donations, setDonations] = useState<Awaited<ReturnType<typeof medfinetDonationApi.listForCampaign>>>([]);
  const [loading, setLoading] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadCampaign = useCallback(async () => {
    if (!organizationId || !campaignId) return;
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const [nextBalance, nextEligibility, nextDonations] = await Promise.all([
        medfinetEscrowApi.getBalance(organizationId, campaignId),
        medfinetEscrowApi.checkWithdrawalEligibility(organizationId, campaignId),
        medfinetDonationApi.listForCampaign(organizationId, campaignId),
      ]);
      setBalance(nextBalance);
      setEligibility(nextEligibility);
      setDonations(nextDonations);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load escrow details");
      setBalance(null);
      setEligibility(null);
      setDonations([]);
    } finally {
      setLoading(false);
    }
  }, [campaignId, organizationId]);

  useEffect(() => {
    if (campaignId) void loadCampaign();
  }, [campaignId, loadCampaign]);

  async function handleLoad(event: FormEvent) {
    event.preventDefault();
    await loadCampaign();
  }

  async function handleWithdraw() {
    if (!organizationId || !campaignId || withdrawing) return;
    setWithdrawing(true);
    setError(null);
    setNotice(null);
    try {
      const recipientWallet = walletAddress || (await connectWallet());
      if (eligibility?.creatorWallet && recipientWallet !== eligibility.creatorWallet) {
        throw new Error("Connect the campaign creator wallet to authorize this withdrawal");
      }
      const prepared = await medfinetEscrowApi.initiateWithdrawal(
        organizationId,
        campaignId,
        { recipientWallet },
      );
      const signedTransaction = await signTransactions(prepared.unsignedTransactions);
      const result = await medfinetEscrowApi.completeWithdrawal(
        organizationId,
        prepared.withdrawalId,
        { signedTransaction },
      );
      setNotice(`Withdrawal confirmed on ${health?.network || "Algorand"}. Transaction: ${result.transactionHash}`);
      await loadCampaign();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to complete withdrawal");
    } finally {
      setWithdrawing(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 place-items-center bg-cyan-50 text-cyan-700">
            <Landmark size={24} />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-700">Campaign escrow</p>
            <h1 className="mt-1 text-2xl font-extrabold">Escrow settlement</h1>
            <p className="mt-1 text-sm text-slate-600">Review balances and approve eligible withdrawals in the campaign creator's Pera Wallet.</p>
          </div>
        </div>
        <WalletStatusButton />
      </header>

      <form onSubmit={handleLoad} className="border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">
          Campaign ID
          <div className="mt-1 flex flex-col gap-3 sm:flex-row">
            <input
              value={campaignId}
              onChange={(event) => {
                setCampaignId(event.target.value);
                setBalance(null);
                setEligibility(null);
                setNotice(null);
              }}
              className={input}
              required
            />
            <button type="submit" disabled={!campaignId || loading} className={primary}>
              {loading ? "Loading…" : "Load escrow"}
            </button>
          </div>
        </label>
      </form>

      {error && <div className="border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-900">{error}</div>}
      {notice && (
        <div className="flex items-start gap-3 border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-900">
          <CheckCircle size={20} weight="fill" className="mt-0.5 shrink-0" />
          <span className="break-all">{notice}</span>
        </div>
      )}

      {balance && eligibility && (
        <section className="grid gap-5 lg:grid-cols-[1fr_.9fr]">
          <div className="border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Escrow balance</p>
            <p className="mt-3 text-4xl font-extrabold text-cyan-700">{balance.balance / 1_000_000} ALGO</p>
            <p className="mt-3 break-all text-xs font-semibold text-slate-500">{balance.escrowAddress}</p>
            <div className="mt-6 border-t border-slate-200 pt-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Connected signer</p>
              <p className="mt-2 text-sm font-bold">{walletAddress ? shortAddress(walletAddress) : "Not connected"}</p>
              <p className="mt-1 text-xs text-slate-500">{health?.network || "Algorand"}</p>
            </div>
          </div>

          <div className="border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-start gap-3">
              {eligibility.canWithdraw ? (
                <CheckCircle size={24} weight="fill" className="text-emerald-600" />
              ) : (
                <WarningCircle size={24} weight="fill" className="text-amber-600" />
              )}
              <div>
                <h2 className="text-lg font-extrabold">
                  {eligibility.canWithdraw ? "Ready for wallet approval" : "Withdrawal not available"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {eligibility.canWithdraw
                    ? "The backend will prepare a grouped withdrawal. Pera Wallet will show every transaction before you approve it."
                    : eligibility.reason || "The campaign does not meet the withdrawal conditions yet."}
                </p>
              </div>
            </div>
            {eligibility.creatorWallet && (
              <div className="mt-5 border-y border-slate-200 py-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Required creator wallet</p>
                <p className="mt-2 break-all text-xs font-semibold text-slate-700">{eligibility.creatorWallet}</p>
              </div>
            )}
            <button
              type="button"
              onClick={() => void handleWithdraw()}
              disabled={!eligibility.canWithdraw || withdrawing || walletConnecting}
              className={`${primary} mt-5 w-full`}
            >
              <Wallet size={18} />
              {withdrawing
                ? "Waiting for Pera approval…"
                : walletAddress
                  ? "Prepare and sign withdrawal"
                  : "Connect creator wallet and continue"}
            </button>
          </div>
        </section>
      )}

      {donations.length > 0 && (
        <section className="border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <h2 className="border-b border-slate-200 px-5 py-4 text-sm font-extrabold">Confirmed campaign activity</h2>
          <div className="divide-y divide-slate-200">
            {donations.map((donation) => (
              <div key={donation.id} className="grid gap-2 px-5 py-4 text-sm sm:grid-cols-[1fr_auto_auto] sm:items-center">
                <span className="font-semibold">{donation.donor?.name || donation.donorWallet || "Wallet donor"}</span>
                <span className="font-bold">{donation.amount} ALGO</span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{donation.status}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

export default function EscrowDashboard() {
  return (
    <BlockchainFeatureGate feature="escrow">
      <EscrowWorkspace />
    </BlockchainFeatureGate>
  );
}
