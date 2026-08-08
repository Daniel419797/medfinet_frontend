import {
  Flask,
  GlobeHemisphereWest,
  Warning,
} from "@phosphor-icons/react";
import { useState } from "react";
import { useBlockchain } from "../../contexts/BlockchainContext";
import type { AlgorandNetwork } from "../../services/medfinetBlockchainApi";
import { Modal } from "../common/Modal";

export default function AlgorandNetworkSelector() {
  const {
    health,
    loading,
    selectedNetwork,
    availableNetworks,
    selectNetwork,
  } = useBlockchain();
  const [confirmMainnet, setConfirmMainnet] = useState(false);
  const [switching, setSwitching] = useState(false);

  if (!health?.enabled) return null;

  const available = new Set(availableNetworks.map((network) => network.id));

  async function applyNetwork(network: AlgorandNetwork) {
    setSwitching(true);
    try {
      await selectNetwork(network);
      setConfirmMainnet(false);
    } finally {
      setSwitching(false);
    }
  }

  return (
    <>
      <div className="inline-flex border border-slate-300 bg-white p-1" aria-label="Algorand network">
        <button
          type="button"
          disabled={loading || switching || !available.has("testnet")}
          onClick={() => void applyNetwork("testnet")}
          className={`inline-flex min-h-9 items-center gap-2 px-3 text-xs font-extrabold transition disabled:cursor-not-allowed disabled:opacity-40 ${
            selectedNetwork === "testnet"
              ? "bg-cyan-700 text-white"
              : "text-slate-600 hover:bg-slate-50"
          }`}
          aria-pressed={selectedNetwork === "testnet"}
        >
          <Flask size={16} /> TestNet
        </button>
        <button
          type="button"
          disabled={
            loading ||
            switching ||
            selectedNetwork === "mainnet" ||
            !available.has("mainnet")
          }
          onClick={() => setConfirmMainnet(true)}
          className={`inline-flex min-h-9 items-center gap-2 px-3 text-xs font-extrabold transition disabled:cursor-not-allowed ${
            selectedNetwork === "mainnet"
              ? "bg-amber-500 text-slate-950"
              : "text-slate-600 hover:bg-amber-50 hover:text-amber-900 disabled:opacity-40"
          }`}
          aria-pressed={selectedNetwork === "mainnet"}
        >
          <GlobeHemisphereWest size={16} /> MainNet
        </button>
      </div>

      <Modal
        open={confirmMainnet}
        onClose={() => setConfirmMainnet(false)}
        title="Switch to Algorand MainNet?"
        description="MainNet transactions use real ALGO and cannot be reversed."
      >
        <div className="border-l-4 border-amber-500 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          <div className="flex items-start gap-3">
            <Warning className="mt-0.5 shrink-0" size={21} weight="fill" />
            <p>
              Your current Pera session will disconnect. Reconnect only after
              confirming the wallet is on MainNet and the amount, campaign and
              recipient are correct.
            </p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setConfirmMainnet(false)}
            className="border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={switching}
            onClick={() => void applyNetwork("mainnet")}
            className="bg-amber-500 px-4 py-2.5 text-sm font-extrabold text-slate-950 hover:bg-amber-400 disabled:opacity-50"
          >
            {switching ? "Switching…" : "Use MainNet"}
          </button>
        </div>
      </Modal>
    </>
  );
}
