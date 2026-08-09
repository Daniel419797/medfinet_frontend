import { useContext, useState } from "react";
import { Calendar, ChevronLeft, Download, Loader2, Shield } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { PageFeedback } from "../../components/common/PageFeedback";
import UserContext from "../../contexts/UserContext";
import { useApi } from "../../hooks/useMedfinetApi";
import { medfinetClinicalApi } from "../../services/medfinetClinicalApi";
import { medfinetIdentityApi } from "../../services/medfinetIdentityApi";

export default function VaccinationHistory() {
  const { id } = useParams<{ id: string }>();
  const { organizationId } = useContext(UserContext);
  const [certificateDownloadId, setCertificateDownloadId] = useState<string | null>(null);
  const [certificateError, setCertificateError] = useState<string | null>(null);
  const validId = Boolean(id && id !== "all");
  const childRequest = useApi(
    () =>
      organizationId && validId && id
        ? medfinetIdentityApi.getChild(organizationId, id)
        : Promise.resolve(null),
    [organizationId, id, validId],
  );
  const timelineRequest = useApi(
    () =>
      organizationId && validId && id
        ? medfinetClinicalApi.getClinicalTimeline(organizationId, id)
        : Promise.resolve(null),
    [organizationId, id, validId],
  );
  const child = childRequest.data;
  const vaccinations = timelineRequest.data?.immunizations || [];
  const error = !validId
    ? "Select a child profile to view its health record."
    : childRequest.error || timelineRequest.error;

  const downloadCertificate = async (immunizationId: string) => {
    if (!organizationId || !id) return;
    setCertificateDownloadId(immunizationId);
    setCertificateError(null);
    try {
      const { blob, filename } = await medfinetClinicalApi.downloadImmunizationCertificate(
        organizationId,
        id,
        immunizationId,
      );
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename || "vaccination-certificate.png";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1_000);
    } catch (reason) {
      setCertificateError(
        reason instanceof Error
          ? reason.message
          : "Unable to download the vaccination certificate.",
      );
    } finally {
      setCertificateDownloadId(null);
    }
  };

  return (
    <main className="space-y-6">
      <Link
        to="/profiles"
        className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-700"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to child profiles
      </Link>
      <header>
        <p className="text-sm font-semibold text-cyan-700">
          Consent-controlled clinical view
        </p>
        <h1 className="mt-1 text-3xl font-bold text-slate-950">
          Vaccination history
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Only immunization information authorized for your identity is
          displayed.
        </p>
      </header>
      <PageFeedback
        loading={childRequest.loading || timelineRequest.loading}
        error={error}
        empty={!child && validId}
        onRetry={() => {
          void childRequest.refetch();
          void timelineRequest.refetch();
        }}
      >
        {child && (
          <>
            {certificateError && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              >
                {certificateError}
              </div>
            )}
            <section className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-cyan-50 font-bold text-cyan-800">
                {child.firstName[0]}
                {child.lastName[0]}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  {child.firstName} {child.lastName}
                </h2>
                <p className="mt-1 flex items-center gap-1 text-sm text-slate-600">
                  <Calendar className="h-4 w-4" />
                  Born {new Date(child.dateOfBirth).toLocaleDateString()}
                </p>
              </div>
            </section>
            <section className="mt-6 space-y-3">
              {vaccinations.map((vaccination) => (
                <article
                  key={vaccination.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-emerald-50 p-2 text-emerald-700">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col justify-between gap-2 sm:flex-row">
                        <h2 className="font-bold text-slate-950">
                          {vaccination.vaccineCode} · dose{" "}
                          {vaccination.doseNumber}
                        </h2>
                        <span className="text-xs font-bold text-slate-500">
                          {vaccination.status}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-slate-600">
                        <Calendar className="mr-1 inline h-4 w-4" />
                        {new Date(vaccination.administeredAt).toLocaleString()}
                      </p>
                      <button
                        type="button"
                        onClick={() => void downloadCertificate(vaccination.id)}
                        disabled={certificateDownloadId !== null}
                        className="mt-4 inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {certificateDownloadId === vaccination.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                        {certificateDownloadId === vaccination.id
                          ? "Preparing certificate…"
                          : "Download certificate"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
              {!vaccinations.length && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                  <Shield className="mx-auto h-10 w-10 text-slate-400" />
                  <p className="mt-3 font-semibold text-slate-800">
                    No vaccination records
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    No vaccination administration is recorded or disclosed under
                    your access.
                  </p>
                </div>
              )}
            </section>
          </>
        )}
      </PageFeedback>
    </main>
  );
}
