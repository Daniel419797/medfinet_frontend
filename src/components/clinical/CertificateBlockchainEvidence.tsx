import {
  Blocks,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import type {
  CertificateNftEvidence,
  VaccinationCertificateEvidence,
} from "../../services/medfinetClinicalApi";

export type { CertificateNftEvidence };
export type ExtendedVaccinationCertificateEvidence =
  VaccinationCertificateEvidence;

export function unavailableEvidence(
  recordId: string,
): VaccinationCertificateEvidence {
  return {
    recordId,
    fingerprint: "",
    anchorId: "",
    status: "UNAVAILABLE",
    queued: false,
    network: null,
    txId: null,
    blockHeight: null,
    confirmedAt: null,
    explorerUrl: null,
    hashIntegrity: null,
    noteIntegrity: null,
    chainConfirmed: null,
    reason: "CERTIFICATE_EVIDENCE_UNAVAILABLE",
  };
}

type Props = {
  evidence: VaccinationCertificateEvidence;
  busy?: boolean;
  onRefresh?: () => void;
  tone?: "light" | "dark";
};

function statusLabel(status: string) {
  switch (status) {
    case "CONFIRMED":
      return "Confirmed";
    case "PENDING":
      return "Pending";
    case "MISMATCH":
      return "Mismatch";
    case "DISABLED":
      return "Disabled";
    case "UNCONFIRMED":
      return "Unconfirmed";
    default:
      return "Unavailable";
  }
}

function statusClass(status: string, dark: boolean) {
  if (status === "CONFIRMED") {
    return dark
      ? "border-emerald-700/60 bg-emerald-950/40 text-emerald-200"
      : "border-emerald-200 bg-emerald-50 text-emerald-800";
  }
  if (status === "MISMATCH") {
    return dark
      ? "border-rose-700/60 bg-rose-950/40 text-rose-200"
      : "border-rose-200 bg-rose-50 text-rose-800";
  }
  return dark
    ? "border-amber-700/50 bg-amber-950/30 text-amber-100"
    : "border-amber-200 bg-amber-50 text-amber-800";
}

export default function CertificateBlockchainEvidence({
  evidence,
  busy = false,
  onRefresh,
  tone = "light",
}: Props) {
  const dark = tone === "dark";
  const nft = evidence.nft;
  const anchorConfirmed = evidence.status === "CONFIRMED";
  const nftStatus = nft
    ? nft.status === "CONFIRMED" && nft.verified !== true
      ? "PENDING"
      : nft.status
    : "UNAVAILABLE";
  const nftConfirmed = nftStatus === "CONFIRMED" && nft?.verified === true;
  const heading = anchorConfirmed && nftConfirmed
    ? "Blockchain evidence confirmed"
    : evidence.status === "MISMATCH" || nftStatus === "MISMATCH"
      ? "Blockchain evidence mismatch"
      : "Blockchain evidence processing";

  return (
    <section
      className={`rounded-xl border p-4 ${
        dark
          ? "border-slate-600 bg-slate-900/70"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <p
            className={`flex items-center gap-2 font-semibold ${
              dark ? "text-slate-100" : "text-slate-950"
            }`}
          >
            {anchorConfirmed && nftConfirmed ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            ) : (
              <Blocks className="h-5 w-5 text-amber-500" />
            )}
            {heading}
          </p>
          <p
            className={`mt-2 max-w-2xl text-xs leading-5 ${
              dark ? "text-slate-400" : "text-slate-600"
            }`}
          >
            Medfinet keeps the child identity, vaccination details and certificate
            image off-chain. Algorand receives cryptographic proof only: the
            fingerprint anchor and a 1-of-1 certificate NFT bound to that same
            fingerprint.
          </p>
        </div>
        {onRefresh && evidence.status !== "DISABLED" && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={busy}
            className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold disabled:opacity-60 ${
              dark
                ? "border-slate-600 text-slate-200 hover:bg-slate-800"
                : "border-slate-300 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <RefreshCw className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} />
            Refresh evidence
          </button>
        )}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <article className={`rounded-xl border p-3 ${statusClass(evidence.status, dark)}`}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-wide">Fingerprint anchor</p>
            <span className="rounded-full border border-current/20 px-2 py-0.5 text-[11px] font-bold">
              {statusLabel(evidence.status)}
            </span>
          </div>
          <p className="mt-2 text-xs opacity-80">
            {evidence.network || "Algorand network not available"}
          </p>
          {evidence.txId && (
            <p className="mt-2 break-all font-mono text-[11px] opacity-80">
              TX {evidence.txId}
            </p>
          )}
          {evidence.explorerUrl && (
            <a
              href={evidence.explorerUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold underline underline-offset-2"
            >
              View anchor transaction <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </article>

        <article
          className={`rounded-xl border p-3 ${statusClass(nftStatus, dark)}`}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-wide">Certificate NFT</p>
            <span className="rounded-full border border-current/20 px-2 py-0.5 text-[11px] font-bold">
              {statusLabel(nftStatus)}
            </span>
          </div>
          <p className="mt-2 text-xs opacity-80">
            {nftStatus === "CONFIRMED"
              ? "Immutable 1-of-1 Algorand certificate asset"
              : nftStatus === "PENDING"
                ? "Mint request is queued or awaiting confirmation"
                : nftStatus === "UNCONFIRMED"
                  ? "Asset evidence matches, but the mint is not yet confirmed"
                  : nftStatus === "DISABLED"
                    ? "NFT minting is disabled for this environment"
                    : "NFT evidence is not confirmed yet"}
          </p>
          {nft?.assetId && (
            <p className="mt-2 font-mono text-xs font-bold">Asset ID {nft.assetId}</p>
          )}
          {nft?.mintTxId && (
            <p className="mt-2 break-all font-mono text-[11px] opacity-80">
              Mint TX {nft.mintTxId}
            </p>
          )}
          {nft?.explorerUrl && (
            <a
              href={nft.explorerUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold underline underline-offset-2"
            >
              View NFT mint <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </article>
      </div>

      <div
        className={`mt-3 flex gap-2 rounded-lg p-3 text-xs leading-5 ${
          dark ? "bg-slate-800 text-slate-300" : "bg-slate-50 text-slate-600"
        }`}
      >
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
        <span>
          Fingerprint{" "}
          <span className="break-all font-mono">
            {evidence.fingerprint || "pending"}
          </span>.
          No child name, DOB, vaccine, facility or certificate PNG is stored in the NFT.
        </span>
      </div>
    </section>
  );
}
