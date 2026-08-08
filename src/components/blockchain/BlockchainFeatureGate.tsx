import { ArrowClockwise, PlugsConnected, WarningCircle } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { useBlockchain } from "../../contexts/BlockchainContext";

type BlockchainFeature = "anchors" | "donations" | "escrow";

export default function BlockchainFeatureGate({ feature, children }: { feature: BlockchainFeature; children: ReactNode }) {
  const { health, loading, error, featureEnabled, refreshCapabilities } = useBlockchain();

  if (loading && !health) {
    return <div className="grid min-h-[45vh] place-items-center text-sm font-semibold text-slate-500">Checking blockchain availability…</div>;
  }

  if (!featureEnabled(feature)) {
    return (
      <section className="mx-auto max-w-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
        <WarningCircle size={28} />
        <h1 className="mt-4 text-2xl font-bold">Blockchain features are disabled</h1>
        <p className="mt-2 text-sm leading-6">Set <code className="font-bold">ALGORAND_ENABLED=true</code> on the backend and redeploy it. This page will unlock automatically after the next capability refresh.</p>
        {error && <p className="mt-3 text-sm font-semibold">{error}</p>}
        <button type="button" onClick={() => void refreshCapabilities()} className="mt-5 inline-flex items-center gap-2 border border-amber-300 bg-white px-4 py-2 text-sm font-bold"><ArrowClockwise size={17} />Recheck configuration</button>
      </section>
    );
  }

  if (!health?.reachable) {
    return (
      <section className="mx-auto max-w-2xl border border-rose-200 bg-rose-50 p-6 text-rose-950">
        <PlugsConnected size={28} />
        <h1 className="mt-4 text-2xl font-bold">Algorand is enabled but unreachable</h1>
        <p className="mt-2 text-sm leading-6">Check the Algod server, backend network access and platform wallet configuration.</p>
        <button type="button" onClick={() => void refreshCapabilities()} className="mt-5 inline-flex items-center gap-2 border border-rose-300 bg-white px-4 py-2 text-sm font-bold"><ArrowClockwise size={17} />Retry connection</button>
      </section>
    );
  }

  return children;
}
