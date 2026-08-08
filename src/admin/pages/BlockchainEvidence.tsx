import { useCallback, useContext, useEffect, useState } from "react";
import {
  Blocks,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  ShieldX,
} from "lucide-react";
import AlgorandNetworkSelector from "../../components/blockchain/AlgorandNetworkSelector";
import BlockchainFeatureGate from "../../components/blockchain/BlockchainFeatureGate";
import { PageFeedback } from "../../components/common/PageFeedback";
import { useBlockchain } from "../../contexts/BlockchainContext";
import UserContext from "../../contexts/UserContext";
import {
  type AnchorReceipt,
  medfinetBlockchainApi,
} from "../../services/medfinetBlockchainApi";

const button = "border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold disabled:opacity-50";

function BlockchainEvidenceWorkspace() {
  const { organizationId } = useContext(UserContext);
  const {
    health,
    selectedNetwork,
    refreshCapabilities,
  } = useBlockchain();
  const [anchors, setAnchors] = useState<AnchorReceipt[]>([]);
  const [verified, setVerified] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setError(null);
    try {
      const rows = await medfinetBlockchainApi.list(
        organizationId,
        selectedNetwork,
      );
      setAnchors(rows);
      await refreshCapabilities();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load anchor evidence");
    } finally {
      setLoading(false);
    }
  }, [organizationId, refreshCapabilities, selectedNetwork]);

  useEffect(() => {
    setVerified({});
    void load();
  }, [load]);

  async function verify(item: AnchorReceipt) {
    if (!organizationId) return;
    try {
      const result = await medfinetBlockchainApi.verify(
        organizationId,
        item.anchorId,
        selectedNetwork,
      );
      setVerified((current) => ({
        ...current,
        [item.anchorId]: result.hashIntegrity,
      }));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to verify anchor");
    }
  }

  const explorerBase = health?.explorerTransactionUrl?.replace(/\/$/, "");

  return (
    <main className="space-y-6">
      <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <p className="text-sm font-semibold text-cyan-700">Tamper-evident evidence</p>
          <h1 className="mt-1 text-3xl font-extrabold">Blockchain anchors</h1>
          <p className="mt-2 text-sm text-slate-600">Review audit receipts, network health and deterministic hash integrity.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AlgorandNetworkSelector />
          <button className={button} onClick={() => void load()} disabled={loading}>
            <RefreshCw className="mr-2 inline h-4 w-4" />
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </header>

      {selectedNetwork === "mainnet" && (
        <div className="border-l-4 border-amber-500 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-950">
          MainNet is selected. New blockchain transactions use real ALGO. Existing receipts remain part of the organization audit history.
        </div>
      )}

      {health && (
        <section className={`grid gap-4 border p-5 sm:grid-cols-4 ${
          health.enabled && health.reachable
            ? "border-emerald-200 bg-emerald-50 text-emerald-950"
            : "border-amber-200 bg-amber-50 text-amber-950"
        }`}>
          <div className="sm:col-span-2">
            <p className="text-xs font-bold uppercase tracking-wider opacity-65">Selected network</p>
            <p className="mt-2 flex items-center gap-2 text-base font-extrabold">
              <Blocks className="h-5 w-5" />
              {health.network || selectedNetwork}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider opacity-65">Connection</p>
            <p className="mt-2 text-sm font-extrabold">{health.reachable ? "Reachable" : "Unreachable"}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider opacity-65">Platform balance</p>
            <p className="mt-2 text-sm font-extrabold">
              {health.balanceMicroAlgos == null
                ? "Unavailable"
                : `${(health.balanceMicroAlgos / 1_000_000).toLocaleString()} ALGO`}
            </p>
          </div>
          {health.address && (
            <p className="break-all border-t border-current/15 pt-4 text-xs sm:col-span-4">
              Platform address: <span className="font-mono font-semibold">{health.address}</span>
            </p>
          )}
        </section>
      )}

      <PageFeedback
        loading={loading}
        error={error}
        empty={!anchors.length}
        onRetry={() => void load()}
      >
        <div className="overflow-x-auto border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-3">Anchor</th>
                <th className="p-3">Category</th>
                <th className="p-3">Status</th>
                <th className="p-3">Transaction</th>
                <th className="p-3">Integrity</th>
              </tr>
            </thead>
            <tbody>
              {anchors.map((item) => (
                <tr key={item.anchorId} className="border-t border-slate-200">
                  <td className="max-w-xs break-all p-3 font-mono text-xs">{item.anchorId}</td>
                  <td className="p-3">{item.eventCategory || item.eventCode}</td>
                  <td className="p-3">{item.status}</td>
                  <td className="max-w-xs break-all p-3 text-xs">
                    {item.txId ? (
                      explorerBase ? (
                        <a
                          href={`${explorerBase}/${item.txId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-semibold text-cyan-700 hover:underline"
                        >
                          {item.txId}
                          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                        </a>
                      ) : (
                        item.txId
                      )
                    ) : (
                      "Pending"
                    )}
                  </td>
                  <td className="p-3">
                    {item.anchorId in verified ? (
                      verified[item.anchorId] ? (
                        <span className="text-emerald-700">
                          <CheckCircle2 className="mr-1 inline h-4 w-4" /> Valid
                        </span>
                      ) : (
                        <span className="text-red-700">
                          <ShieldX className="mr-1 inline h-4 w-4" /> Mismatch
                        </span>
                      )
                    ) : (
                      <button className={button} onClick={() => void verify(item)}>
                        Verify
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PageFeedback>
    </main>
  );
}

export default function BlockchainEvidence() {
  return (
    <BlockchainFeatureGate feature="anchors">
      <BlockchainEvidenceWorkspace />
    </BlockchainFeatureGate>
  );
}
