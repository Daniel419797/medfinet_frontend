import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Download,
  Eye,
  FileCheck2,
  Loader2,
  RefreshCw,
  Search,
  Syringe,
} from "lucide-react";
import { PageFeedback } from "../../components/common/PageFeedback";
import CertificateBlockchainEvidence, {
  unavailableEvidence,
} from "../../components/clinical/CertificateBlockchainEvidence";
import UserContext from "../../contexts/UserContext";
import {
  medfinetClinicalApi,
  type VaccinationCertificateEvidence,
} from "../../services/medfinetClinicalApi";
import { medfinetIdentityApi } from "../../services/medfinetIdentityApi";

type Child = Awaited<
  ReturnType<typeof medfinetIdentityApi.listChildren>
>["items"][number];
type Timeline = Awaited<
  ReturnType<typeof medfinetClinicalApi.getClinicalTimeline>
>;
type Immunization = Timeline["immunizations"][number];
type CertificatePreview = {
  immunizationId: string;
  url: string;
  filename: string;
  label: string;
  evidence: VaccinationCertificateEvidence;
};

const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60";
const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60";

function certificateAvailable(vaccination: Immunization) {
  return ["ACTIVE", "AMENDED"].includes(vaccination.status);
}

export default function VaccineCertificates() {
  const { organizationId } = useContext(UserContext);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [timeline, setTimeline] = useState<Timeline | null>(null);
  const [query, setQuery] = useState("");
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewBusyId, setPreviewBusyId] = useState<string | null>(null);
  const [evidenceBusy, setEvidenceBusy] = useState(false);
  const [preview, setPreview] = useState<CertificatePreview | null>(null);
  const selected = children.find((child) => child.id === selectedId) || null;

  const clearPreview = useCallback(() => {
    setPreview((current) => {
      if (current?.url) URL.revokeObjectURL(current.url);
      return null;
    });
  }, []);

  useEffect(() => () => clearPreview(), [clearPreview]);

  const loadChildren = useCallback(async () => {
    if (!organizationId) return;
    setLoadingChildren(true);
    setError(null);
    try {
      const result = await medfinetIdentityApi.listChildren(organizationId, {
        limit: 100,
      });
      setChildren(result.items);
      setSelectedId((current) =>
        current && result.items.some((child) => child.id === current)
          ? current
          : result.items[0]?.id || "",
      );
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to load child records",
      );
    } finally {
      setLoadingChildren(false);
    }
  }, [organizationId]);

  const loadTimeline = useCallback(async () => {
    if (!organizationId || !selectedId) {
      setTimeline(null);
      clearPreview();
      return;
    }
    setLoadingTimeline(true);
    setError(null);
    clearPreview();
    try {
      setTimeline(
        await medfinetClinicalApi.getClinicalTimeline(organizationId, selectedId),
      );
    } catch (reason) {
      setTimeline(null);
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to load vaccination records",
      );
    } finally {
      setLoadingTimeline(false);
    }
  }, [clearPreview, organizationId, selectedId]);

  useEffect(() => {
    void loadChildren();
  }, [loadChildren]);

  useEffect(() => {
    void loadTimeline();
  }, [loadTimeline]);

  const filteredChildren = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return children;
    return children.filter(
      (child) =>
        child.medfinetId.toLowerCase().includes(value) ||
        `${child.firstName} ${child.lastName}`.toLowerCase().includes(value),
    );
  }, [children, query]);

  const showCertificate = useCallback(
    async (vaccination: Immunization) => {
      if (!organizationId || !selectedId || !certificateAvailable(vaccination)) {
        return;
      }
      if (preview?.immunizationId === vaccination.id) return;

      setPreviewBusyId(vaccination.id);
      setError(null);
      try {
        const [certificateResult, evidenceResult] = await Promise.allSettled([
          medfinetClinicalApi.downloadImmunizationCertificate(
            organizationId,
            selectedId,
            vaccination.id,
          ),
          medfinetClinicalApi.getImmunizationCertificateEvidence(
            organizationId,
            selectedId,
            vaccination.id,
          ),
        ]);
        if (certificateResult.status === "rejected") {
          throw certificateResult.reason;
        }
        const { blob, filename } = certificateResult.value;
        const evidence =
          evidenceResult.status === "fulfilled"
            ? evidenceResult.value
            : unavailableEvidence(vaccination.id);
        const objectUrl = URL.createObjectURL(blob);
        setPreview((current) => {
          if (current?.url) URL.revokeObjectURL(current.url);
          return {
            immunizationId: vaccination.id,
            url: objectUrl,
            filename: filename || "vaccination-certificate.png",
            label: `${vaccination.vaccineCode} dose ${vaccination.doseNumber}`,
            evidence,
          };
        });
      } catch (reason) {
        setError(
          reason instanceof Error
            ? reason.message
            : "Unable to prepare the vaccination certificate",
        );
      } finally {
        setPreviewBusyId(null);
      }
    },
    [organizationId, preview?.immunizationId, selectedId],
  );

  const refreshEvidence = useCallback(async () => {
    if (!organizationId || !selectedId || !preview) return;
    const immunizationId = preview.immunizationId;
    setEvidenceBusy(true);
    setError(null);
    try {
      const evidence = await medfinetClinicalApi.getImmunizationCertificateEvidence(
        organizationId,
        selectedId,
        immunizationId,
      );
      setPreview((current) =>
        current?.immunizationId === immunizationId
          ? { ...current, evidence }
          : current,
      );
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to refresh blockchain evidence",
      );
    } finally {
      setEvidenceBusy(false);
    }
  }, [organizationId, preview, selectedId]);

  useEffect(() => {
    if (loadingTimeline || preview || previewBusyId) return;
    const firstAvailable = timeline?.immunizations.find(certificateAvailable);
    if (firstAvailable) void showCertificate(firstAvailable);
  }, [loadingTimeline, preview, previewBusyId, showCertificate, timeline]);

  const downloadPreview = () => {
    if (!preview) return;
    const link = document.createElement("a");
    link.href = preview.url;
    link.download = preview.filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <main className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-semibold text-emerald-700">Immunization records</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">
            Vaccines & certificates
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
            Select a child and vaccine to view the generated certificate, download it, and verify its Algorand fingerprint anchor and certificate NFT.
          </p>
        </div>
        <button
          type="button"
          className={secondaryButton}
          onClick={() => void Promise.all([loadChildren(), loadTimeline()])}
          disabled={loadingChildren || loadingTimeline}
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </header>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[300px_1fr]">
        <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="relative block">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              aria-label="Search children"
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Name or Medfinet ID"
            />
          </label>
          <PageFeedback
            loading={loadingChildren}
            error={null}
            empty={!filteredChildren.length}
            emptyTitle="No child records"
            emptyDescription="No matching child records were found."
          >
            <div className="mt-3 max-h-[72vh] space-y-2 overflow-y-auto">
              {filteredChildren.map((child) => (
                <button
                  key={child.id}
                  type="button"
                  onClick={() => setSelectedId(child.id)}
                  className={`w-full rounded-lg p-3 text-left transition ${
                    selectedId === child.id
                      ? "bg-emerald-50 ring-1 ring-emerald-300"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <p className="font-semibold text-slate-950">
                    {child.firstName} {child.lastName}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {child.medfinetId}
                  </p>
                </button>
              ))}
            </div>
          </PageFeedback>
        </aside>

        <section className="min-w-0">
          <PageFeedback
            loading={loadingTimeline}
            error={null}
            empty={!selected}
            emptyTitle="Select a child"
            emptyDescription="Choose a child record to view vaccination history and certificates."
          >
            {selected && (
              <div className="space-y-5">
                <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-emerald-50 font-bold text-emerald-800">
                      {selected.firstName[0]}
                      {selected.lastName[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                        {selected.medfinetId}
                      </p>
                      <h2 className="mt-1 text-2xl font-bold text-slate-950">
                        {selected.firstName} {selected.lastName}
                      </h2>
                      <p className="mt-1 text-sm text-slate-600">
                        {new Date(selected.dateOfBirth).toLocaleDateString()} · {selected.sex}
                      </p>
                    </div>
                  </div>
                </section>

                <div className="grid gap-5 2xl:grid-cols-[360px_minmax(0,1fr)]">
                  <section className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-slate-950">
                          Recorded vaccines
                        </h3>
                        <p className="text-sm text-slate-600">
                          {timeline?.immunizations.length || 0} immunization record(s)
                        </p>
                      </div>
                      <Syringe className="h-5 w-5 text-emerald-700" />
                    </div>

                    {timeline?.immunizations.length ? (
                      timeline.immunizations.map((vaccination) => {
                        const available = certificateAvailable(vaccination);
                        const active = preview?.immunizationId === vaccination.id;
                        const busy = previewBusyId === vaccination.id;
                        return (
                          <article
                            key={vaccination.id}
                            className={`rounded-xl border bg-white p-4 shadow-sm transition ${
                              active
                                ? "border-emerald-400 ring-2 ring-emerald-100"
                                : "border-slate-200"
                            }`}
                          >
                            <p className="font-bold text-slate-950">
                              {vaccination.vaccineCode} · dose {vaccination.doseNumber}
                            </p>
                            <p className="mt-1 text-sm text-slate-600">
                              {new Date(vaccination.administeredAt).toLocaleString()}
                            </p>
                            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                              {vaccination.status}
                            </p>
                            <button
                              type="button"
                              className={`${secondaryButton} mt-4 w-full`}
                              disabled={!available || previewBusyId !== null}
                              onClick={() => void showCertificate(vaccination)}
                              title={
                                available
                                  ? "View generated vaccination certificate"
                                  : `Certificate unavailable for ${vaccination.status.toLowerCase()} records`
                              }
                            >
                              {busy ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                              {busy
                                ? "Preparing certificate…"
                                : active
                                  ? "Certificate shown"
                                  : "View certificate"}
                            </button>
                          </article>
                        );
                      })
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                        No vaccinations have been recorded for this child yet.
                      </div>
                    )}
                  </section>

                  <section className="min-w-0">
                    <div className="sticky top-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-sm sm:p-5">
                      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            <FileCheck2 className="h-5 w-5 text-emerald-700" />
                            <h3 className="font-bold text-slate-950">
                              Certificate preview
                            </h3>
                          </div>
                          <p className="mt-1 text-xs text-slate-600">
                            The image below is the same PNG file that will be downloaded.
                          </p>
                        </div>
                        <button
                          type="button"
                          className={primaryButton}
                          onClick={downloadPreview}
                          disabled={!preview}
                        >
                          <Download className="h-4 w-4" />
                          Download certificate
                        </button>
                      </div>

                      {preview ? (
                        <div className="mx-auto max-w-[720px] space-y-4">
                          <div className="overflow-hidden rounded-xl border border-emerald-300 bg-white shadow-lg">
                            <img
                              src={preview.url}
                              alt={`Vaccination certificate for ${selected.firstName} ${selected.lastName} — ${preview.label}`}
                              className="block h-auto w-full"
                            />
                          </div>
                          <p className="text-center text-xs text-slate-500">
                            {preview.label} · generated from the current Medfinet record
                          </p>
                          <CertificateBlockchainEvidence
                            evidence={preview.evidence}
                            busy={evidenceBusy}
                            onRefresh={() => void refreshEvidence()}
                          />
                        </div>
                      ) : previewBusyId ? (
                        <div className="grid min-h-[520px] place-items-center rounded-xl border border-dashed border-emerald-300 bg-white/80">
                          <div className="text-center text-sm text-slate-600">
                            <Loader2 className="mx-auto mb-3 h-7 w-7 animate-spin text-emerald-700" />
                            Preparing certificate preview…
                          </div>
                        </div>
                      ) : (
                        <div className="grid min-h-[420px] place-items-center rounded-xl border border-dashed border-emerald-300 bg-white/80 p-8 text-center">
                          <div>
                            <FileCheck2 className="mx-auto h-9 w-9 text-emerald-700" />
                            <p className="mt-3 font-semibold text-slate-900">
                              No certificate selected
                            </p>
                            <p className="mt-1 text-sm text-slate-600">
                              Choose an active or amended vaccination record to view its certificate.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              </div>
            )}
          </PageFeedback>
        </section>
      </div>
    </main>
  );
}