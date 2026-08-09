import { CaretDown, Wallet } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { useBlockchain } from "../../contexts/BlockchainContext";

function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export default function WalletStatusButton() {
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
  const walletEnabled = Boolean(
    health?.enabled && (health.walletConnect?.enabled ?? true),
  );

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  if (loading || !walletEnabled || !health?.reachable) return null;

  if (!walletAddress) {
    const handleConnect = async () => {
      try {
        await connectWallet();
      } catch {
        // BlockchainContext owns the user-facing wallet error state.
      }
    };

    return (
      <div className="flex max-w-xs flex-col items-end gap-1.5">
        <button
          type="button"
          onClick={() => void handleConnect()}
          disabled={walletConnecting}
          className="inline-flex h-10 items-center gap-2 border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 hover:border-primary-300 hover:text-primary-700 disabled:opacity-50"
          aria-describedby={walletError ? "pera-wallet-error" : undefined}
        >
          <Wallet size={18} />
          {walletConnecting ? "Opening Pera…" : "Connect Pera"}
        </button>
        {walletError && (
          <p
            id="pera-wallet-error"
            role="alert"
            className="text-right text-xs font-semibold leading-5 text-rose-700"
          >
            {walletError}
          </p>
        )}
      </div>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-10 items-center gap-2 border border-emerald-200 bg-emerald-50 px-3 text-sm font-bold text-emerald-800"
        aria-expanded={open}
      >
        <span className="h-2 w-2 bg-emerald-500" />
        {shortAddress(walletAddress)}
        <CaretDown size={14} />
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-50 w-72 border border-slate-200 bg-white p-4 shadow-xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Pera Wallet
          </p>
          <p className="mt-2 break-all text-xs font-semibold text-slate-700">
            {walletAddress}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            {health.network || "Algorand"}
          </p>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              void disconnectWallet();
            }}
            className="mt-4 w-full border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            Disconnect wallet
          </button>
        </div>
      )}
    </div>
  );
}
