import { useContext } from "react";
import { Calendar, ChevronLeft, Shield } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { PageFeedback } from "../../components/common/PageFeedback";
import UserContext from "../../contexts/UserContext";
import { useApi } from "../../hooks/useMedfinetApi";
import { medfinetClinicalApi } from "../../services/medfinetClinicalApi";
import { medfinetIdentityApi } from "../../services/medfinetIdentityApi";

export default function VaccinationHistory() {
  const { id } = useParams<{ id: string }>();
  const { organizationId } = useContext(UserContext);
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
