import {
  type FormEvent,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Blocks,
  CheckCircle2,
  Download,
  ExternalLink,
  Loader2,
  MapPin,
  RefreshCw,
  ShieldAlert,
  Syringe,
  X,
} from 'lucide-react';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
  medfinetClinicalApi,
  type VaccinationCertificateEvidence,
} from '../../services/medfinetClinicalApi';
import {
  medfinetFacilityApi,
  type MedfinetFacility,
} from '../../services/medfinetFacilityApi';
import UserContext from '../../contexts/UserContext';

type Timeline = Awaited<ReturnType<typeof medfinetClinicalApi.getClinicalTimeline>>;
type EmergencyProfile = Awaited<ReturnType<typeof medfinetClinicalApi.getEmergencyProfile>>;
const MANUAL_FACILITY = '__MANUAL__';
const fieldClass = 'mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5';

function unavailableEvidence(recordId: string): VaccinationCertificateEvidence {
  return {
    recordId,
    fingerprint: '',
    anchorId: '',
    status: 'UNAVAILABLE',
    queued: false,
    network: null,
    txId: null,
    blockHeight: null,
    confirmedAt: null,
    explorerUrl: null,
    hashIntegrity: null,
    noteIntegrity: null,
    chainConfirmed: null,
  };
}

function WorkflowShell({ title, children }: { title: string; children: ReactNode }) {
  const location = useLocation();
  const scannerPath = location.pathname.startsWith('/nfc/') ? '/nfc/scanner' : '/health-worker/nfc';
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-950 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <Link to={scannerPath} className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-800">
          <ArrowLeft size={17} /> Back to scanner
        </Link>
        <h1 className="mt-5 text-3xl font-bold">{title}</h1>
        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}

export function NfcClinicalRecordPage() {
  const { organizationId } = useContext(UserContext);
  const { childId = '' } = useParams();
  const [timeline, setTimeline] = useState<Timeline | null>(null);
  const [error, setError] = useState('');
  const [certificateDownloadId, setCertificateDownloadId] = useState<string | null>(null);
  const [certificateError, setCertificateError] = useState('');
  const [certificatePreview, setCertificatePreview] = useState<{
    url: string;
    filename: string;
    label: string;
    immunizationId: string;
    evidence: VaccinationCertificateEvidence;
  } | null>(null);
  const certificatePreviewUrl = useRef<string | null>(null);
  const certificatePageMounted = useRef(true);
  const [certificateEvidenceBusy, setCertificateEvidenceBusy] = useState(false);

  useEffect(() => {
    if (!organizationId) return;
    medfinetClinicalApi.getClinicalTimeline(organizationId, childId)
      .then(setTimeline)
      .catch((caught: unknown) => setError(
        caught instanceof Error ? caught.message : 'Could not load clinical record',
      ));
  }, [childId, organizationId]);

  useEffect(() => {
    certificatePageMounted.current = true;
    return () => {
      certificatePageMounted.current = false;
      if (certificatePreviewUrl.current) URL.revokeObjectURL(certificatePreviewUrl.current);
    };
  }, []);

  function closeCertificatePreview() {
    if (certificatePreviewUrl.current) URL.revokeObjectURL(certificatePreviewUrl.current);
    certificatePreviewUrl.current = null;
    setCertificatePreview(null);
  }

  async function viewCertificate(immunization: Timeline['immunizations'][number]) {
    if (!organizationId) return;
    setCertificateDownloadId(immunization.id);
    setCertificateError('');
    try {
      const [certificateResult, evidenceResult] = await Promise.allSettled([
        medfinetClinicalApi.downloadImmunizationCertificate(
          organizationId,
          childId,
          immunization.id,
        ),
        medfinetClinicalApi.getImmunizationCertificateEvidence(
          organizationId,
          childId,
          immunization.id,
        ),
      ]);
      if (certificateResult.status === 'rejected') throw certificateResult.reason;
      const { blob, filename } = certificateResult.value;
      const evidence = evidenceResult.status === 'fulfilled'
        ? evidenceResult.value
        : unavailableEvidence(immunization.id);
      const url = URL.createObjectURL(blob);
      if (!certificatePageMounted.current) {
        URL.revokeObjectURL(url);
        return;
      }
      closeCertificatePreview();
      certificatePreviewUrl.current = url;
      setCertificatePreview({
        url,
        filename: filename || 'vaccination-certificate.png',
        label: `${immunization.vaccineCode} dose ${immunization.doseNumber}`,
        immunizationId: immunization.id,
        evidence,
      });
    } catch (caught) {
      if (certificatePageMounted.current) {
        setCertificateError(
          caught instanceof Error
            ? caught.message
            : 'Could not load the vaccination certificate',
        );
      }
    } finally {
      if (certificatePageMounted.current) setCertificateDownloadId(null);
    }
  }

  async function refreshCertificateEvidence() {
    if (!organizationId || !certificatePreview) return;
    const immunizationId = certificatePreview.immunizationId;
    setCertificateEvidenceBusy(true);
    setCertificateError('');
    try {
      const evidence = await medfinetClinicalApi.getImmunizationCertificateEvidence(
        organizationId,
        childId,
        immunizationId,
      );
      if (certificatePageMounted.current) {
        setCertificatePreview((current) =>
          current?.immunizationId === immunizationId ? { ...current, evidence } : current,
        );
      }
    } catch (caught) {
      if (certificatePageMounted.current) {
        setCertificateError(
          caught instanceof Error
            ? caught.message
            : 'Could not refresh Algorand verification',
        );
      }
    } finally {
      if (certificatePageMounted.current) setCertificateEvidenceBusy(false);
    }
  }

  return (
    <WorkflowShell title="Vaccinations and certificates">
      {error && <p role="alert" className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-rose-900">{error}</p>}
      {certificateError && <p role="alert" className="mb-4 rounded-xl border border-rose-300 bg-rose-50 p-4 text-rose-900">{certificateError}</p>}
      {!timeline && !error && <Loader2 className="animate-spin text-cyan-700" />}
      {timeline && (
        <div className="grid gap-5 md:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-bold">Immunizations</h2>
            <div className="mt-3 divide-y divide-slate-100">
              {timeline.immunizations.map((item) => (
                <div key={item.id} className="py-3 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-semibold text-slate-900">{item.vaccineCode} · Dose {item.doseNumber}</span>
                    <time className="shrink-0 text-slate-500">{new Date(item.administeredAt).toLocaleDateString()}</time>
                  </div>
                  {item.certificateMetadata ? (
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="h-3.5 w-3.5" />
                      {item.certificateMetadata.facilityName} · {item.certificateMetadata.lga}
                    </p>
                  ) : (
                    <p className="mt-2 text-xs font-semibold text-amber-700">
                      Historical certificate details incomplete. Amend this dose from Clinical operations.
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => void viewCertificate(item)}
                    disabled={certificateDownloadId !== null}
                    className="mt-3 inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 font-bold text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {certificateDownloadId === item.id
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <Download className="h-4 w-4" />}
                    {certificateDownloadId === item.id ? 'Loading certificate…' : 'View certificate'}
                  </button>
                </div>
              ))}
              {!timeline.immunizations.length && (
                <div className="py-4 text-sm text-slate-500">
                  <p className="font-semibold text-slate-700">No immunizations recorded.</p>
                  <p className="mt-1">A certificate becomes available after a vaccination dose is recorded.</p>
                </div>
              )}
            </div>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-bold">Allergies and alerts</h2>
            <div className="mt-3 space-y-3">
              {timeline.allergies.filter(({ status }) => status === 'ACTIVE').map((item) => (
                <div key={item.id} className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm">
                  <strong>{item.substanceDisplay}</strong>{item.reaction && <p>{item.reaction}</p>}
                </div>
              ))}
              {timeline.alerts.filter(({ status }) => status === 'ACTIVE').map((item) => (
                <div key={item.id} className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm">
                  <strong>{item.category}</strong><p>{item.summary}</p>
                </div>
              ))}
              {!timeline.allergies.length && !timeline.alerts.length && <p className="text-sm text-slate-500">No active allergies or alerts.</p>}
            </div>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 md:col-span-2">
            <h2 className="text-lg font-bold">Growth and appointments</h2>
            <p className="mt-2 text-sm text-slate-600">{timeline.growth.length} growth measurements · {timeline.appointments.length} appointments</p>
          </section>
          {certificatePreview && (
            <section className="rounded-2xl border border-emerald-200 bg-white p-4 md:col-span-2 sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold">Vaccination certificate</h2>
                  <p className="mt-1 text-sm text-slate-600">{certificatePreview.label}</p>
                </div>
                <button type="button" aria-label="Close certificate preview" onClick={closeCertificatePreview} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <img src={certificatePreview.url} alt={`Vaccination certificate for ${certificatePreview.label}`} className="mx-auto mt-4 max-h-[70vh] w-auto rounded-xl border border-slate-200 shadow-sm" />
              <div className={`mt-4 rounded-xl border p-4 ${
                certificatePreview.evidence.status === 'CONFIRMED'
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-950'
                  : certificatePreview.evidence.status === 'MISMATCH'
                    ? 'border-rose-300 bg-rose-50 text-rose-950'
                    : 'border-amber-300 bg-amber-50 text-amber-950'
              }`}>
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <p className="flex items-center gap-2 font-bold">
                      {certificatePreview.evidence.status === 'CONFIRMED'
                        ? <CheckCircle2 className="h-5 w-5" />
                        : <Blocks className="h-5 w-5" />}
                      {certificatePreview.evidence.status === 'CONFIRMED'
                        ? `Verified on ${certificatePreview.evidence.network || 'Algorand'}`
                        : certificatePreview.evidence.status === 'PENDING'
                          ? 'Algorand verification pending'
                          : certificatePreview.evidence.status === 'MISMATCH'
                            ? 'Algorand proof mismatch'
                            : 'Algorand verification is not yet confirmed'}
                    </p>
                    <p className="mt-1 text-xs leading-5 opacity-80">
                      Only a cryptographic fingerprint is anchored. No child identity or medical details are written to Algorand.
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    {certificatePreview.evidence.explorerUrl && (
                      <a href={certificatePreview.evidence.explorerUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-current/20 bg-white/70 px-3 py-2 text-sm font-bold">
                        View on explorer <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    {certificatePreview.evidence.status !== 'DISABLED' && (
                      <button type="button" onClick={() => void refreshCertificateEvidence()} disabled={certificateEvidenceBusy} className="inline-flex items-center gap-2 rounded-lg border border-current/20 bg-white/70 px-3 py-2 text-sm font-bold disabled:opacity-60">
                        <RefreshCw className={`h-4 w-4 ${certificateEvidenceBusy ? 'animate-spin' : ''}`} /> Refresh proof
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <a href={certificatePreview.url} download={certificatePreview.filename} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white hover:bg-emerald-800">
                <Download className="h-5 w-5" /> Download PNG
              </a>
            </section>
          )}
        </div>
      )}
    </WorkflowShell>
  );
}

export function NfcVaccinationPage() {
  const { organizationId, user } = useContext(UserContext);
  const { childId = '' } = useParams();
  const [facilities, setFacilities] = useState<MedfinetFacility[]>([]);
  const [form, setForm] = useState({
    vaccineCode: '',
    doseNumber: '1',
    administeredAt: new Date().toISOString().slice(0, 10),
    lotNumber: '',
    route: 'IM',
    site: '',
    notes: '',
    facilitySelection: '',
    facilityName: '',
    state: '',
    lga: '',
    ward: '',
    vaccinatorMode: 'SELF' as 'SELF' | 'OTHER',
    vaccinatorName: '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!organizationId) return;
    medfinetFacilityApi.list(organizationId)
      .then((rows) => {
        setFacilities(rows);
        const first = rows[0];
        if (!first) {
          setForm((current) => ({ ...current, facilitySelection: MANUAL_FACILITY }));
          return;
        }
        setForm((current) => ({
          ...current,
          facilitySelection: first.id,
          facilityName: first.name,
          state: first.state || first.administrativeArea || '',
          lga: first.lga || '',
          ward: first.ward || '',
        }));
      })
      .catch((caught: unknown) => setError(
        caught instanceof Error ? caught.message : 'Could not load facilities',
      ));
  }, [organizationId]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setSaved(false);
    try {
      if (!organizationId) throw new Error('Select an organization first.');
      await medfinetClinicalApi.recordImmunization(organizationId, childId, {
        vaccineCode: form.vaccineCode.trim(),
        doseNumber: Number(form.doseNumber),
        administeredAt: new Date(`${form.administeredAt}T12:00:00Z`).toISOString(),
        lotNumber: form.lotNumber.trim() || undefined,
        route: form.route.trim() || undefined,
        site: form.site.trim() || undefined,
        notes: form.notes.trim() || undefined,
        sourceOperationId: crypto.randomUUID(),
        ...(form.facilitySelection !== MANUAL_FACILITY
          ? { facilityId: form.facilitySelection }
          : { facilityName: form.facilityName.trim() }),
        state: form.state.trim(),
        lga: form.lga.trim(),
        ward: form.ward.trim(),
        vaccinatorMode: form.vaccinatorMode,
        ...(form.vaccinatorMode === 'OTHER'
          ? { vaccinatorName: form.vaccinatorName.trim() }
          : {}),
      });
      setSaved(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Vaccination could not be recorded');
    } finally {
      setBusy(false);
    }
  }

  return (
    <WorkflowShell title="Record vaccination">
      <form onSubmit={submit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold">Vaccine code<input required className={fieldClass} value={form.vaccineCode} onChange={(event) => setForm((current) => ({ ...current, vaccineCode: event.target.value }))} /></label>
          <label className="text-sm font-semibold">Dose number<input required type="number" min="1" className={fieldClass} value={form.doseNumber} onChange={(event) => setForm((current) => ({ ...current, doseNumber: event.target.value }))} /></label>
          <label className="text-sm font-semibold">Administered date<input required type="date" max={new Date().toISOString().slice(0, 10)} className={fieldClass} value={form.administeredAt} onChange={(event) => setForm((current) => ({ ...current, administeredAt: event.target.value }))} /></label>
          <label className="text-sm font-semibold">Lot number<input className={fieldClass} value={form.lotNumber} onChange={(event) => setForm((current) => ({ ...current, lotNumber: event.target.value }))} /></label>
          <label className="text-sm font-semibold">Route<input className={fieldClass} value={form.route} onChange={(event) => setForm((current) => ({ ...current, route: event.target.value }))} /></label>
          <label className="text-sm font-semibold">Injection site<input className={fieldClass} value={form.site} onChange={(event) => setForm((current) => ({ ...current, site: event.target.value }))} /></label>
        </div>
        <label className="block text-sm font-semibold">Notes<textarea className={fieldClass} value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} /></label>

        <section className="space-y-4 rounded-xl border border-cyan-100 bg-cyan-50/60 p-4">
          <div>
            <h2 className="font-bold">Certificate details</h2>
            <p className="mt-1 text-xs leading-5 text-slate-600">Confirm where the vaccination happened and who actually administered it. These values are snapshotted for the certificate.</p>
          </div>
          <label className="block text-sm font-semibold">
            Health facility
            <select
              required
              className={fieldClass}
              value={form.facilitySelection}
              onChange={(event) => {
                const facilitySelection = event.target.value;
                const facility = facilities.find((row) => row.id === facilitySelection);
                setForm((current) => ({
                  ...current,
                  facilitySelection,
                  facilityName: facilitySelection === MANUAL_FACILITY ? '' : facility?.name || '',
                  state: facilitySelection === MANUAL_FACILITY ? '' : facility?.state || facility?.administrativeArea || '',
                  lga: facilitySelection === MANUAL_FACILITY ? '' : facility?.lga || '',
                  ward: facilitySelection === MANUAL_FACILITY ? '' : facility?.ward || '',
                }));
              }}
            >
              <option value="">Select facility</option>
              {facilities.map((facility) => <option key={facility.id} value={facility.id}>{facility.name}</option>)}
              <option value={MANUAL_FACILITY}>Outreach / external location</option>
            </select>
          </label>
          {form.facilitySelection === MANUAL_FACILITY && (
            <label className="block text-sm font-semibold">Facility / vaccination site name<input required className={fieldClass} value={form.facilityName} onChange={(event) => setForm((current) => ({ ...current, facilityName: event.target.value }))} /></label>
          )}
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="text-sm font-semibold">State<input required className={fieldClass} value={form.state} onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))} /></label>
            <label className="text-sm font-semibold">LGA<input required className={fieldClass} value={form.lga} onChange={(event) => setForm((current) => ({ ...current, lga: event.target.value }))} /></label>
            <label className="text-sm font-semibold">Ward<input required className={fieldClass} value={form.ward} onChange={(event) => setForm((current) => ({ ...current, ward: event.target.value }))} /></label>
          </div>
          <label className="block text-sm font-semibold">
            Vaccinator
            <select className={fieldClass} value={form.vaccinatorMode} onChange={(event) => setForm((current) => ({ ...current, vaccinatorMode: event.target.value as 'SELF' | 'OTHER', vaccinatorName: event.target.value === 'SELF' ? '' : current.vaccinatorName }))}>
              <option value="SELF">Me — {user?.name || 'current account'}</option>
              <option value="OTHER">Another / external vaccinator</option>
            </select>
          </label>
          {form.vaccinatorMode === 'OTHER' && (
            <label className="block text-sm font-semibold">Vaccinator name<input required className={fieldClass} value={form.vaccinatorName} onChange={(event) => setForm((current) => ({ ...current, vaccinatorName: event.target.value }))} /></label>
          )}
        </section>

        {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
        {saved && <p className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-emerald-700"><CheckCircle2 size={18} /> Vaccination recorded with certificate details and audit evidence.</p>}
        <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 font-semibold text-white disabled:opacity-50">
          {busy ? <Loader2 className="animate-spin" /> : <Syringe size={19} />} Save vaccination
        </button>
      </form>
    </WorkflowShell>
  );
}

export function NfcEmergencyPage() {
  const { organizationId } = useContext(UserContext);
  const { childId = '' } = useParams();
  const [reasonCode, setReasonCode] = useState('IMMEDIATE_CARE');
  const [justification, setJustification] = useState('');
  const [profile, setProfile] = useState<EmergencyProfile | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function activate(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (!organizationId) throw new Error('Select an organization first.');
      const access = await medfinetClinicalApi.activateEmergencyAccess(
        organizationId,
        childId,
        { reasonCode, justification, durationMinutes: 15 },
      );
      setProfile(await medfinetClinicalApi.getEmergencyProfile(
        organizationId,
        childId,
        access.id,
      ));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Emergency access failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <WorkflowShell title="Emergency access">
      {!profile && (
        <form onSubmit={activate} className="space-y-4 rounded-2xl border border-rose-200 bg-white p-5 sm:p-6">
          <div className="flex gap-3 rounded-xl bg-rose-50 p-4 text-sm text-rose-900">
            <ShieldAlert className="shrink-0" />
            <p>This action requires recent step-up authentication, is time-limited, notifies the caregiver and is reviewed by administrators.</p>
          </div>
          <label className="block"><span className="mb-1 block text-sm font-semibold">Reason code</span><select value={reasonCode} onChange={(event) => setReasonCode(event.target.value)} className={fieldClass}><option value="IMMEDIATE_CARE">Immediate care</option><option value="UNCONSCIOUS_PATIENT">Unconscious patient</option><option value="LIFE_THREATENING">Life threatening</option></select></label>
          <label className="block"><span className="mb-1 block text-sm font-semibold">Clinical justification</span><textarea required minLength={10} value={justification} onChange={(event) => setJustification(event.target.value)} className="min-h-28 w-full rounded-xl border border-slate-300 px-3 py-2.5" /></label>
          {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
          <button disabled={busy} className="w-full rounded-xl bg-rose-700 px-4 py-3 font-semibold text-white disabled:opacity-50">Activate 15-minute emergency access</button>
        </form>
      )}
      {profile && (
        <section className="space-y-4 rounded-2xl border border-rose-300 bg-white p-5">
          <div className="flex items-center gap-2 text-rose-700"><AlertTriangle /><strong>Emergency session expires {new Date(profile.access.expiresAt).toLocaleTimeString()}</strong></div>
          <h2 className="text-2xl font-bold">{profile.profile.firstName} {profile.profile.lastName}</h2>
          <div><h3 className="font-bold">Critical allergies</h3>{profile.profile.allergies.map((item) => <p key={item.substanceDisplay} className="mt-2 rounded-xl bg-amber-50 p-3">{item.substanceDisplay}{item.reaction ? ` · ${item.reaction}` : ''}</p>)}</div>
          <div><h3 className="font-bold">Emergency alerts</h3>{profile.profile.clinicalAlerts.map((item) => <p key={`${item.category}-${item.summary}`} className="mt-2 rounded-xl bg-rose-50 p-3">{item.summary}</p>)}</div>
        </section>
      )}
    </WorkflowShell>
  );
}
