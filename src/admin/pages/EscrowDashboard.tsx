import { useCallback, useContext, useEffect, useState } from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Landmark,
  Wallet,
} from "lucide-react";
import AlgorandNetworkSelector from "../../components/blockchain/AlgorandNetworkSelector";
import BlockchainFeatureGate from "../../components/blockchain/BlockchainFeatureGate";
import WalletStatusButton from "../../components/wallet/WalletStatusButton";
import { PageFeedback } from "../../components/common/PageFeedback";
import { useBlockchain } from "../../contexts/BlockchainContext";
import UserContext from "../../contexts/UserContext";
import { medfinetDonationApi } from "../../services/medfinetDonationApi";
import { medfinetEscrowApi } from "../../services/medfinetEscrowApi";

const input = "mt-1 w-full border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-cyan-700 focus:outline-none";
const button = "border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold disabled:opacity-50";
const primary = "inline-flex items-center justify-center gap-2 bg-cyan-700 px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50";

function EscrowWorkspace() {
  const { organizationId } = useContext(UserContext);
  const {
    selectedNetwork,
    walletAddress,
    walletConnecting,
    connectWallet,
    signTransactions,
  } = useBlockchain();
  const [campaignId, setCampaignId] = useState("");
  const [balance, setBalance] = useState<Awaited<ReturnType<typeof medfinetEscrowApi.getBalance>> | null>(null);
  const [eligibility, setEligibility] = useState<unknown>(null);
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
      const [nextBalance, nextEligibility, nextDonations] = await Promise.all([
        medfinetEscrowApi.getBalance(
          organizationId,
          campaignId,
          selectedNetwork,
        ),
        medfinetEscrowApi.checkWithdrawalEligibility(
          organizationId,
          campaignId,
          selectedNetwork,
        ),
        medfinetDonationApi.listForCampaign(
          organizationId,
          campaignId,
          selectedNetwork,
        ),
      ]);
      setBalance(nextBalance);
      setEligibility(nextEligibility);
      setDonations(nextDonations as unknown as Array<Record<string, unknown>>);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Failed to load escrow data");
    } finally {
      setLoading(false);
    }
  }, [campaignId, organizationId, selectedNetwork]);

  useEffect(() => {
    if (campaignId) void loadBalance();
  }, [campaignId, loadBalance]);

  useEffect(() => {
    setBalance(null);
    setEligibility(null);
    setWithdrawalId("");
    setWithdrawalStatus(null);
    setDonations([]);
    setNotice(null);
    setError(null);
  }, [selectedNetwork]);

  async function handlePayout() {
    if (!organizationId || !campaignId || busy) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const result = await medfinetEscrowApi.initiatePayout(
        organizationId,
        campaignId,
        selectedNetwork,
      );
      setNotice(
        `Payout initiated on ${result.network}. Transaction: ${result.transactionHash}`,
      );
      await loadBalance();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Payout failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleWithdraw() {
    if (!organizationId || !campaignId || busy) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const recipientWallet = walletAddress || (await connectWallet());
      const prepared = await medfinetEscrowApi.initiateWithdrawal(
        organizationId,
        campaignId,
        selectedNetwork,
        { recipientWallet },
      );
      if (!prepared.unsignedTransactions?.length) {
        throw new Error("The backend did not return signable withdrawal transactions");
      }
      const network = prepared.network || selectedNetwork;
      const signedTransaction = await signTransactions(
        prepared.unsignedTransactions,
        network,
      );
      await medfinetEscrowApi.completeWithdrawal(
        organizationId,
        prepared.withdrawalId,
        network,
        { signedTransaction, network },
      );
      setWithdrawalId(prepared.withdrawalId);
      setNotice(`Withdrawal confirmed on ${network}.`);
      await loadBalance();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Withdrawal failed");
    } finally {
      setBusy(false);
    }
  }

  async function checkStatus() {
    if (!organizationId || !withdrawalId || busy) return;
    setBusy(true);
    setError(null);
    try {
      setWithdrawalStatus(
        await medfinetEscrowApi.getWithdrawalStatus(
          organizationId,
          withdrawalId,
          selectedNetwork,
        ),
      );
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Status check failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6">
      <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 place-items-center bg-cyan-50 text-cyan-700">
            <Landmark className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-700">Algorand escrow</p>
            <h1 className="mt-1 text-2xl font-extrabold">Escrow operations</h1>
            <p className="mt-1 text-sm text-slate-600">Monitor campaign funds and approve creator withdrawals through Pera Wallet.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AlgorandNetworkSelector />
          <WalletStatusButton />
        </div>
      </header>

      {selectedNetwork === "mainnet" && (
        <div className="border-l-4 border-amber-500 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-950">
          MainNet is active. Withdrawals and payouts involve real ALGO and cannot be reversed.
        </div>
      )}

      <section className="border border-slate-200 bg-white p-5">
        <label className="block text-sm font-bold text-slate-700">
          Campaign ID
          <span className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              value={campaignId}
              onChange={(event) => {
                setCampaignId(event.target.value);
                setBalance(null);
                setEligibility(null);
              }}
              className={`${input} mt-0 flex-1`}
            />
            <button
              type="button"
              onClick={() => void loadBalance()}
              disabled={!campaignId || loading}
              className={primary}
            >
              {loading ? "Loading…" : `Load ${selectedNetwork} escrow`}
            </button>
          </span>
        </label>
      </section>

      <PageFeedback loading={loading} error={error} onRetry={loadBalance}>
        {balance && (
          <div className="grid gap-px border border-slate-200 bg-slate-200 sm:grid-cols-2">
            <div className="bg-white p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Escrow balance</p>
              <p className="mt-2 text-2xl font-extrabold text-cyan-700">{balance.balance}</p>
              <p className="mt-2 break-all text-xs text-slate-500">{balance.escrowAddress}</p>
              <p className="mt-2 text-xs font-bold uppercase text-slate-500">{balance.network}</p>
            </div>
            <div className="bg-white p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Withdrawal eligibility</p>
              <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs text-slate-700">
                {JSON.stringify(eligibility, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </PageFeedback>

      {notice && (
        <div className="border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-900">
          {notice}
        </div>
      )}

      <section className="border border-slate-200 bg-white p-5">
        <h2 className="text-base font-extrabold text-slate-900">Fund actions</h2>
        <p className="mt-1 text-sm text-slate-600">Withdrawals connect the campaign creator’s Pera Wallet, request approval, and submit the signed group automatically.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void handlePayout()}
            disabled={busy || !campaignId}
            className={primary}
          >
            <ArrowUpCircle className="h-4 w-4" /> Initiate payout
          </button>
          <button
            type="button"
            onClick={() => void handleWithdraw()}
            disabled={busy || !campaignId || walletConnecting}
            className={primary}
          >
            {walletAddress ? <ArrowDownCircle className="h-4 w-4" /> : <Wallet className="h-4 w-4" />}
            {busy
              ? "Processing…"
              : walletAddress
                ? "Approve creator withdrawal"
                : "Connect Pera and withdraw"}
          </button>
        </div>

        <div className="mt-6 border-t border-slate-200 pt-5">
          <label className="block text-sm font-bold text-slate-700">
            Withdrawal ID
            <span className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                value={withdrawalId}
                onChange={(event) => setWithdrawalId(event.target.value)}
                className={`${input} mt-0 flex-1`}
              />
              <button
                type="button"
                onClick={() => void checkStatus()}
                disabled={busy || !withdrawalId}
                className={button}
              >
                Check status
              </button>
            </span>
          </label>
          {withdrawalStatus !== null && (
            <pre className="mt-4 overflow-x-auto whitespace-pre-wrap bg-slate-50 p-4 text-xs">
              {JSON.stringify(withdrawalStatus, null, 2)}
            </pre>
          )}
        </div>
      </section>

      {donations.length > 0 && (
        <section className="border border-slate-200 bg-white">
          <h2 className="border-b border-slate-200 px-5 py-4 text-sm font-extrabold">Campaign donations</h2>
          <div className="divide-y divide-slate-200">
            {donations.map((donation, index) => (
              <div key={String(donation.id || index)} className="grid gap-2 px-5 py-4 text-sm sm:grid-cols-[1fr_auto_auto] sm:items-center">
                <span className="font-semibold">{String((donation.donor as { name?: string } | undefined)?.name || `Donation ${index + 1}`)}</span>
                <span className="font-bold">{String(donation.amount || "")} ALGO</span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{String(donation.status || "")}</span>
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
