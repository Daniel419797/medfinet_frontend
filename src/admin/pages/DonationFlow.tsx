import { FormEvent, useCallback, useContext, useEffect, useState } from "react";
import { HandCoins } from "lucide-react";
import UserContext from "../../contexts/UserContext";
import { PageFeedback } from "../../components/common/PageFeedback";
import { medfinetDonationApi } from "../../services/medfinetDonationApi";

type DonationStep = "form" | "preparing" | "signing" | "confirming" | "done";
const input = "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm";
const primary = "rounded-lg bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50";

export default function DonationFlow() {
  const { organizationId } = useContext(UserContext);
  const [campaignId, setCampaignId] = useState("");
  const [amount, setAmount] = useState("");
  const [donorWallet, setDonorWallet] = useState("");
  const [signedTx, setSignedTx] = useState("");
  const [step, setStep] = useState<DonationStep>("form");
  const [donationId, setDonationId] = useState("");
  const [txHash, setTxHash] = useState("");
  const [campaignInfo, setCampaignInfo] = useState<{ title: string; escrowAddress: string } | null>(null);
  const [donations, setDonations] = useState<Array<Record<string, unknown>>>([]);
  const [error, setError] = useState<string | null>(null);

  const loadDonations = useCallback(async () => {
    if (!organizationId || !campaignId) return;
    try {
      const result = await medfinetDonationApi.listForCampaign(organizationId, campaignId);
      setDonations(result as unknown as Array<Record<string, unknown>>);
    } catch {
      // campaign may not exist yet
    }
  }, [organizationId, campaignId]);

  useEffect(() => { loadDonations(); }, [loadDonations]);

  const handlePrepare = async (e: FormEvent) => {
    e.preventDefault();
    if (!organizationId || !campaignId || !amount || !donorWallet) return;
    setStep("preparing");
    setError(null);
    try {
      const result = await medfinetDonationApi.prepare(organizationId, {
        campaignId,
        amount: parseFloat(amount),
        donorWallet,
      });
      setDonationId(result.donationId);
      setCampaignInfo(result.campaign);
      setStep("signing");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Preparation failed");
      setStep("form");
    }
  };

  const handleConfirm = async (e: FormEvent) => {
    e.preventDefault();
    if (!organizationId || !donationId || !signedTx) return;
    setStep("confirming");
    setError(null);
    try {
      const result = await medfinetDonationApi.confirm(organizationId, {
        donationId,
        signedTransaction: signedTx,
      });
      setTxHash(result.transactionHash);
      setStep("done");
      loadDonations();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Confirmation failed");
      setStep("signing");
    }
  };

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <header className="flex items-center gap-3">
        <HandCoins className="h-6 w-6 text-cyan-700" />
        <div>
          <h1 className="text-xl font-bold">Donate to Campaign</h1>
          <p className="text-sm text-slate-600">Prepare and confirm blockchain-backed donations.</p>
        </div>
      </header>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">{error}</div>
      )}

      {step === "form" && (
        <form onSubmit={handlePrepare} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600">Campaign ID</label>
            <input value={campaignId} onChange={(e) => setCampaignId(e.target.value)} className={input} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600">Amount (numeric)</label>
            <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" min="1" className={input} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600">Donor wallet address</label>
            <input value={donorWallet} onChange={(e) => setDonorWallet(e.target.value)} className={input} required />
          </div>
          <button type="submit" disabled={!campaignId || !amount || !donorWallet} className={primary}>
            Prepare Donation
          </button>
        </form>
      )}

      {step === "preparing" && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-600">
          Preparing donation transaction...
        </div>
      )}

      {step === "signing" && campaignInfo && (
        <form onSubmit={handleConfirm} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 space-y-4">
          <div className="rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800">
            <p className="font-semibold">{campaignInfo.title}</p>
            <p className="text-slate-600">Escrow: {campaignInfo.escrowAddress}</p>
            <p className="text-slate-600">Donation ID: {donationId}</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600">Signed transaction (base64)</label>
            <textarea value={signedTx} onChange={(e) => setSignedTx(e.target.value)} rows={4} className={input} required />
          </div>
          <button type="submit" disabled={!signedTx} className={primary}>
            Confirm Donation
          </button>
        </form>
      )}

      {step === "confirming" && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-600">
          Confirming donation on-chain...
        </div>
      )}

      {step === "done" && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-900">
          <p className="font-semibold">Donation confirmed!</p>
          <p className="mt-1">Transaction hash: <code className="text-xs">{txHash}</code></p>
          <button onClick={() => { setStep("form"); setCampaignId(""); setAmount(""); setDonorWallet(""); setSignedTx(""); setDonationId(""); setTxHash(""); setCampaignInfo(null); }} className={`${primary} mt-4`}>
            Make another donation
          </button>
        </div>
      )}

      {donations.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">Existing Donations</h2>
          <div className="space-y-2">
            {donations.map((d, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800">
                <span>{String(d.id || `Donation ${i + 1}`)}</span>
                <span className="text-slate-600">{String(d.status || "unknown")}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
