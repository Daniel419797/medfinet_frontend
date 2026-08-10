import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  Loader2,
  ShieldCheck,
  Syringe,
  X,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import CertificateBlockchainEvidence, {
  unavailableEvidence,
} from "../../components/clinical/CertificateBlockchainEvidence";
import {
  medfinetClinicalApi,
  type VaccinationCertificateEvidence,
} from "../../services/medfinetClinicalApi";
import type { NfcImmunizationRecord } from "../../services/medfinetNfcApi";
import {
  clearNfcVaccineAccess,
  readNfcVaccineAccess,
} from "../../services/nfcSecureAccessStore";

type CertificatePreview = {
  url: string;
  filename: string;
  label: string;
  immunizationId: string;
  evidence: VaccinationCertificateEvidence;
};

export default function NfcVaccinesCertificatesPage() {
  const { publicId = "" } = useParams();
  const navigate = useNavigate();
  const [access] = useState(() => readNfcVaccineAccess(publicId));
  const [certificateDownloadId, setCertificateDownloadId] = useState<string | null>(null);
  const [certificateError, setCertificateError] = useState("");
  const [certificatePreview, setCertificatePreview] =
    useState<CertificatePreview | null>(null);
  const [certificateEvidenceBusy, setCertificateEvidenceBusy] = useState(false);
  const certificatePreviewUrl = useRef<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (certificatePreviewUrl.current) {
        URL.revokeObjectURL(certificatePreviewUrl.current);
        certificatePreviewUrl.current = null;
      }
    };
  }, []);

  function closeCertificatePreview() {
    if (certificatePreviewUrl.current) {
      URL.revokeObjectURL(certificatePreviewUrl.current);
    }
    certificatePreviewUrl.current = null;
    setCertificatePreview(null);
  }

  function backToCard() {
    clearNfcVaccineAccess(publicId);
    navigate(`/nfc/tap/${encodeURIComponent(publicId)}`, { replace: true });
  }

  async function viewCertificate(immunization: NfcImmunizationRecord) {
    if (!access) return;
    setCertificateDownloadId(immunization.id);
    setCertificateError("");
    try {
      const [certificateResult, evidenceResult] = await Promise.allSettled([
        medfinetClinicalApi.downloadImmunizationCertificate(
          access.organizationId,
          access.childId,
          immunization.id,
        ),
        medfinetClinicalApi.getImmunizationCertificateEvidence(
          access.organizationId,
          access.childId,
          immunization.id,
        ),
      ]);
      if (!mountedRef.current) return;
      if (certificateResult.status === "rejected") {
        throw certificateResult.reason;
      }
      const { blob, filename } = certificateResult.value;
      const evidence =
        evidenceResult.status === "fulfilled"
          ? evidenceResult.value
          : unavailableEvidence(immunization.id);
      closeCertificatePreview();
      const url = URL.createObjectURL(blob);
      if (!mountedRef.current) {
        URL.revokeObjectURL(url);
        return;
      }
      certificatePreviewUrl.current = url;
      setCertificatePreview({
        url,
        filename: filename || "vaccination-certificate.png",
        label: `${immunization.vaccineCode} dose ${immunization.doseNumber}`,
        immunizationId: immunization.id,
        evidence,
      });
    } catch (caught) {
      if (!mountedRef.current) return;
      setCertificateError(
        caught instanceof Error
          ? caught.message
          : "Could not load the vaccination certificate",
      );
    } finally {
      if (mountedRef.current) setCertificateDownloadId(null);
    }
  }

  async function refreshCertificateEvidence() {
    if (!access || !certificatePreview) return;
    const immunizationId = certificatePreview.immunizationId;
    setCertificateEvidenceBusy(true);
    setCertificateError("");
    try {
      const evidence = await medfinetClinicalApi.getImmunizationCertificateEvidence(
        access.organizationId,
        access.childId,
        immunizationId,
      );
      if (!mountedRef.current) return;
      setCertificatePreview((current) =>
        current && current.immunizationId === immunizationId
          ? { ...current, evidence }
          : current,
      );
    } catch (caught) {
      if (!mountedRef.current) return;
      setCertificateError(
        caught instanceof Error
          ? caught.message
          : "Could not refresh certificate verification",
      );
    } finally {
      if (mountedRef.current) setCertificateEvidenceBusy(false);
    }
  }

  if (!access) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
        <section className="mx-auto max-w-xl rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
          <ShieldCheck className="h-10 w-10 text-cyan-300" />
          <h1 className="mt-5 text-2xl font-bold">Secure NFC view expired</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Vaccination records are only kept in memory after a verified NFC tap
            and successful sign-in. Tap the card again to start a new secure
            access session.
          </p>
          <button
            type="button"
            onClick={backToCard}
            className="mt-6 w-full rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 hover:bg-cyan-300"
          >
            Return to NFC card
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:py-10">
      <section className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={backToCard}
          className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300"
        >
          <ArrowLeft size={17} /> Back to card
        </button>

        <div className="mt-5 rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl sm:p-8">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
              <Syringe aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium text-cyan-300">Medfinet NFC</p>
              <h1 className="mt-1 text-2xl font-bold">Vaccines &amp; certificates</h1>
              {access.childName && (
                <p className="mt-1 text-sm text-slate-400">{access.childName}</p>
              )}
            </div>
          </div>

          <div className="mt-6 flex gap-3 rounded-2xl border border-emerald-700/50 bg-emerald-950/40 p-4">
            <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-300" />
            <div>
              <p className="font-semibold text-emerald-200">Authenticated NFC access</p>
              <p className="mt-1 text-sm leading-6 text-emerald-100/80">
                These vaccination records were released only after the card was
                verified and your Medfinet credentials were accepted.
              </p>
            </div>
          </div>

          {certificateError && (
            <p
              role="alert"
              className="mt-5 rounded-xl border border-rose-700/50 bg-rose-950/40 p-4 text-sm text-rose-100"
            >
              {certificateError}
            </p>
          )}

          <div className="mt-6 space-y-3">
            {access.immunizations.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-slate-700 bg-slate-800/70 p-4"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <p className="font-semibold text-white">
                      {item.vaccineCode} · Dose {item.doseNumber}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      {new Date(item.administeredAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void viewCertificate(item)}
                    disabled={certificateDownloadId !== null}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {certificateDownloadId === item.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    {certificateDownloadId === item.id
                      ? "Loading…"
                      : "View certificate"}
                  </button>
                </div>
              </article>
            ))}

            {access.immunizations.length === 0 && (
              <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-5 text-sm text-slate-300">
                No vaccination doses are recorded for this card yet.
              </div>
            )}
          </div>

          {certificatePreview && (
            <section className="mt-6 rounded-2xl border border-emerald-700/50 bg-slate-800/70 p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold">Vaccination certificate</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    {certificatePreview.label}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Close certificate preview"
                  onClick={closeCertificatePreview}
                  className="rounded-lg border border-slate-600 p-2 text-slate-300 hover:bg-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <img
                src={certificatePreview.url}
                alt={`Vaccination certificate for ${certificatePreview.label}`}
                className="mx-auto mt-4 max-h-[70vh] w-auto rounded-xl border border-slate-700 bg-white shadow-sm"
              />

              <div className="mt-4">
                <CertificateBlockchainEvidence
                  evidence={certificatePreview.evidence}
                  busy={certificateEvidenceBusy}
                  onRefresh={() => void refreshCertificateEvidence()}
                  tone="dark"
                />
              </div>

              <a
                href={certificatePreview.url}
                download={certificatePreview.filename}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 hover:bg-emerald-400 sm:w-auto"
              >
                <Download className="h-5 w-5" /> Download certificate
              </a>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
