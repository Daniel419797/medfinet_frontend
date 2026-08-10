import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Download, Loader2, RefreshCw, Search, Syringe } from "lucide-react";
import { PageFeedback } from "../../components/common/PageFeedback";
import UserContext from "../../contexts/UserContext";
import { medfinetClinicalApi } from "../../services/medfinetClinicalApi";
import { medfinetIdentityApi } from "../../services/medfinetIdentityApi";

type Child = Awaited<
  ReturnType<typeof medfinetIdentityApi.listChildren>
>["items"][number];
type Timeline = Awaited<
  ReturnType<typeof medfinetClinicalApi.getClinicalTimeline>
>;

const secondaryButton =
  "inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60";

export default function VaccineCertificates() {
  const { organizationId } = useContext(UserContext);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [timeline, setTimeline] = useState<Timeline | null>(null);
  const [query, setQuery] = useState("");
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadId, setDownloadId] = useState<string | null>(null);
  const selected = children.find((child) => child.id === selectedId) || null;

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
      return;
    }
    setLoadingTimeline(true);
    setError(null);
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
  }, [organizationId, selectedId]);

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

  const downloadCertificate = async (immunizationId: string) => {
    if (!organizationId || !selectedId) return;
    setDownloadId(immunizationId);
    setError(null);
    try {
      const { blob, filename } =
        await medfinetClinicalApi.downloadImmunizationCertificate(
          organizationId,
          selectedId,
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
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to download the vaccination certificate",
      );
    } finally {
      setDownloadId(null);
    }
  };

  return (
    <main className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-semibold text-cyan-700">Immunization records</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">
            Vaccines & certificates
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
            Review each child&apos;s recorded vaccines and download the certificate for an active vaccination record.
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
            <div className="mt-3 max-h-[68vh] space-y-2 overflow-y-auto">
              {filteredChildren.map((child) => (
                <button
                  key={child.id}
                  type="button"
                  onClick={() => setSelectedId(child.id)}
                  className={`w-full rounded-lg p-3 text-left transition ${
                    selectedId === child.id
                      ? "bg-cyan-50 ring-1 ring-cyan-300"
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
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-cyan-50 font-bold text-cyan-800">
                      {selected.firstName[0]}
                      {selected.lastName[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wide text-cyan-700">
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
                    <Syringe className="h-5 w-5 text-cyan-700" />
                  </div>

                  {timeline?.immunizations.length ? (
                    timeline.immunizations.map((vaccination) => {
                      const certificateAvailable = ["ACTIVE", "AMENDED"].includes(
                        vaccination.status,
                      );
                      return (
                        <article
                          key={vaccination.id}
                          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                            <div>
                              <p className="font-bold text-slate-950">
                                {vaccination.vaccineCode} · dose {vaccination.doseNumber}
                              </p>
                              <p className="mt-1 text-sm text-slate-600">
                                Administered {new Date(vaccination.administeredAt).toLocaleString()}
                              </p>
                              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                {vaccination.status}
                              </p>
                            </div>
                            <button
                              type="button"
                              className={secondaryButton}
                              disabled={!certificateAvailable || downloadId !== null}
                              title={
                                certificateAvailable
                                  ? "Download vaccination certificate"
                                  : `Certificate unavailable for ${vaccination.status.toLowerCase()} records`
                              }
                              onClick={() => void downloadCertificate(vaccination.id)}
                            >
                              {downloadId === vaccination.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                              {downloadId === vaccination.id
                                ? "Preparing certificate…"
                                : "Download certificate"}
                            </button>
                          </div>
                        </article>
                      );
                    })
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                      No vaccinations have been recorded for this child yet.
                    </div>
                  )}
                </section>
              </div>
            )}
          </PageFeedback>
        </section>
      </div>
    </main>
  );
}
