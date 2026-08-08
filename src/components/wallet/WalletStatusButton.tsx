import { CaretDown, Wallet } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { useBlockchain } from "../../contexts/BlockchainContext";

function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function WalletStatusButton() {
  const {
    health,
    loading,
    walletAddress,
    walletConnecting,
    walletError,
    connectWallet,
    disconnectWallet,
  } = useBlockchain();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  if (loading || !health?.enabled || !health.reachable || !health.walletConnect?.enabled) {
    return null;
  }

  if (!walletAddress) {
    return (
      <button
        type="button"
        onClick={() => void connectWallet()}
        disabled={walletConnecting}
        className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition hover:border-primary-300 hover:text-primary-700 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        title={walletError || "Connect Pera Wallet"}
      >
        <Wallet size={18} />
        <span className="hidden 2xl:inline">{walletConnecting ? "Connecting…" : "Connect Pera"}</span>
      </button>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-10 items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-sm font-bold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
        aria-expanded={open}
      >
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        <span className="hidden xl:inline">{shortAddress(walletAddress)}</span>
        <CaretDown size={14} />
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-50 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-900">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Pera Wallet</p>
          <p className="mt-2 break-all text-xs font-semibold text-slate-700 dark:text-slate-200">{walletAddress}</p>
          <p className="mt-2 text-xs text-slate-500">{health.network || "Algorand"}</p>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              void disconnectWallet();
            }}
            className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Disconnect wallet
          </button>
        </div>
      )}
    </div>
  );
}

export default WalletStatusButton;
