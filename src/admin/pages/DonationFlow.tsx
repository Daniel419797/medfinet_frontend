import { FormEvent, useCallback, useContext, useEffect, useState } from "react";
import { CheckCircle, HandCoins, Wallet } from "@phosphor-icons/react";
import BlockchainFeatureGate from "../../components/blockchain/BlockchainFeatureGate";
import WalletStatusButton from "../../components/wallet/WalletStatusButton";
import { useBlockchain } from "../../contexts/BlockchainContext";
import UserContext from "../../contexts/UserContext";
import { medfinetDonationApi } from "../../services/medfinetDonationApi";

type DonationStep = "form" | "preparing" | "review" | "signing" | "done";

type PreparedDonation = {
  donationId: string;
  unsignedTransactions: string[];
  transactionHash: string;
  campaign: { title: string; escrowAddress: string };
};

const input = "mt-1 w-full border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-cyan-700 focus:outline-none";
const primary = "inline-flex items-center justify-center gap-2 bg-cyan-700 px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50";

function shortAddress(address: string) {
  return `${address.slice(0, 8)}…${address.slice(-6)}`;
}

function DonationWorkspace() {
  const { organizationId } = useContext(UserContext);
  const {
    health,
    walletAddress,
    walletConnecting,
    connectWallet,
    signTransactions,
  } = useBlockchain();
  const [campaignId, setCampaignId] = useState("");
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<DonationStep>("form");
  const [prepared, setPrepared] = useState<PreparedDonation | null>(null);
  const [txHash, setTxHash] = useState("");
  const [donations, setDonations] = useState<Awaited<ReturnType<typeof medfinetDonationApi.listForCampaign>>>([]);
  const [error, setError] = useState<string | null>(null);

  const loadDonations = useCallback(async () => {
    if (!organizationId || !campaignId) return;
    try {
      setDonations(await medfinetDonationApi.listForCampaign(organizationId, campaignId));
    } catch {
      setDonations([]);
    }
  }, [campaignId, organizationId]);

  useEffect(() => {
    void loadDonations();
  }, [loadDonations]);

  async function handlePrepare(event: FormEvent) {
    event.preventDefault();
    if (!organizationId || !campaignId || !amount) return;

    setStep("preparing");
    setError(null);
    try {
      const donorWallet = walletAddress || (await connectWallet());
      const result = await medfinetDonationApi.prepare(organizationId, {
        campaignId,
        amount: Number(amount),
        donorWallet,
      });
      setPrepared(result);
      setStep("review");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to prepare donation");
      setStep("form");
    }
  }

  async function handleSignAndConfirm() {
    if (!organizationId || !prepared) return;
    setStep("signing");
    setError(null);
    try {
      const signedTransaction = await signTransactions(prepared.unsignedTransactions);
      const result = await medfinetDonationApi.confirm(organizationId, {
        donationId: prepared.donationId,
        signedTransaction,
      });
      setTxHash(result.transactionHash);
      setStep("done");
      await loadDonations();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to sign donation");
      setStep("review");
    }
  }

  function reset() {
    setCampaignId("");
    setAmount("");
    setPrepared(null);
    setTxHash("");
    setError(null);
    setStep("form");
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 place-items-center bg-cyan-50 text-cyan-700">
            <HandCoins size={24} />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-700">Algorand donations</p>
            <h1 className="mt-1 text-2xl font-extrabold">Donate with Pera Wallet</h1>
            <p className="mt-1 text-sm text-slate-600">Prepare a grouped transaction, approve it in Pera, and let Medfinet submit it.</p>
          </div>
        </div>
        <WalletStatusButton />
      </header>

      <div className="grid gap-4 border-y border-slate-200 py-4 sm:grid-cols-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Network</p>
          <p className="mt-1 text-sm font-bold">{health?.network || "Algorand"}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Wallet</p>
          <p className="mt-1 text-sm font-bold">{walletAddress ? shortAddress(walletAddress) : "Not connected"}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Signing</p>
          <p className="mt-1 text-sm font-bold">User-approved in Pera</p>
        </div>
      </div>

      {error && <div className="border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-900">{error}</div>}

      {step === "form" && (
        <form onSubmit={handlePrepare} className="border border-slate-200 bg-white p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-bold text-slate-700">
              Campaign ID
              <input value={campaignId} onChange={(event) => setCampaignId(event.target.value)} className={input} required />
            </label>
            <label className="text-sm font-bold text-slate-700">
              Amount in ALGO
              <input value={amount} onChange={(event) => setAmount(event.target.value)} type="number" min="0.000001" step="0.000001" className={input} required />
            </label>
          </div>
          <button type="submit" disabled={!campaignId || !amount || walletConnecting} className={`${primary} mt-5`}>
            <Wallet size={18} />
            {walletAddress ? "Prepare donation" : walletConnecting ? "Connecting…" : "Connect Pera and continue"}
          </button>
        </form>
      )}

      {step === "preparing" && <div className="border border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-600">Preparing a secure grouped transaction…</div>}

      {(step === "review" || step === "signing") && prepared && (
        <section className="border border-slate-200 bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Review before signing</p>
          <h2 className="mt-2 text-xl font-extrabold">{prepared.campaign.title}</h2>
          <dl className="mt-5 grid gap-4 border-y border-slate-200 py-4 sm:grid-cols-2">
            <div><dt className="text-xs font-bold text-slate-400">Amount</dt><dd className="mt-1 font-bold">{amount} ALGO</dd></div>
            <div><dt className="text-xs font-bold text-slate-400">Transactions</dt><dd className="mt-1 font-bold">{prepared.unsignedTransactions.length} grouped approvals</dd></div>
            <div><dt className="text-xs font-bold text-slate-400">Escrow</dt><dd className="mt-1 break-all text-xs font-semibold">{prepared.campaign.escrowAddress}</dd></div>
            <div><dt className="text-xs font-bold text-slate-400">Wallet</dt><dd className="mt-1 break-all text-xs font-semibold">{walletAddress}</dd></div>
          </dl>
          <button type="button" disabled={step === "signing"} onClick={() => void handleSignAndConfirm()} className={`${primary} mt-5`}>
            <Wallet size={18} /> {step === "signing" ? "Waiting for Pera approval…" : "Review and sign in Pera"}
          </button>
        </section>
      )}

      {step === "done" && (
        <section className="border border-emerald-200 bg-emerald-50 p-6 text-emerald-950">
          <CheckCircle size={30} weight="fill" />
          <h2 className="mt-3 text-xl font-extrabold">Donation confirmed</h2>
          <p className="mt-2 break-all text-sm">Transaction: <code>{txHash}</code></p>
          <button type="button" onClick={reset} className={`${primary} mt-5`}>Make another donation</button>
        </section>
      )}

      {donations.length > 0 && (
        <section className="border border-slate-200 bg-white">
          <h2 className="border-b border-slate-200 px-5 py-4 text-sm font-extrabold">Campaign donations</h2>
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

export default function DonationFlow() {
  return (
    <BlockchainFeatureGate feature="donations">
      <DonationWorkspace />
    </BlockchainFeatureGate>
  );
}
