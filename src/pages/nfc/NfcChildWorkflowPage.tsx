import { FormEvent, useContext, useEffect, useState } from 'react';
import { AlertTriangle, ArrowLeft, CheckCircle2, Loader2, ShieldAlert, Syringe } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { medfinetClinicalApi } from '../../services/medfinetClinicalApi';
import UserContext from '../../contexts/UserContext';

type Timeline = Awaited<ReturnType<typeof medfinetClinicalApi.getClinicalTimeline>>;
type EmergencyProfile = Awaited<ReturnType<typeof medfinetClinicalApi.getEmergencyProfile>>;

function WorkflowShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-950 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <Link to="/health-worker/nfc" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-800"><ArrowLeft size={17} /> Back to scanner</Link>
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
  useEffect(() => {
    if (!organizationId) return;
    medfinetClinicalApi.getClinicalTimeline(organizationId, childId)
      .then(setTimeline)
      .catch((caught: unknown) => setError(caught instanceof Error ? caught.message : 'Could not load clinical record'));
  }, [childId, organizationId]);
  return (
    <WorkflowShell title="Clinical record">
      {error && <p role="alert" className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-rose-900">{error}</p>}
      {!timeline && !error && <Loader2 className="animate-spin text-cyan-700" />}
      {timeline && (
        <div className="grid gap-5 md:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-bold">Immunizations</h2>
            <div className="mt-3 divide-y divide-slate-100">
              {timeline.immunizations.map((item) => <div key={item.id} className="flex justify-between py-3 text-sm"><span>{item.vaccineCode} · Dose {item.doseNumber}</span><time className="text-slate-500">{new Date(item.administeredAt).toLocaleDateString()}</time></div>)}
              {!timeline.immunizations.length && <p className="py-4 text-sm text-slate-500">No immunizations recorded.</p>}
            </div>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-bold">Allergies and alerts</h2>
            <div className="mt-3 space-y-3">
              {timeline.allergies.filter(({ status }) => status === 'ACTIVE').map((item) => <div key={item.id} className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm"><strong>{item.substanceDisplay}</strong>{item.reaction && <p>{item.reaction}</p>}</div>)}
              {timeline.alerts.filter(({ status }) => status === 'ACTIVE').map((item) => <div key={item.id} className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm"><strong>{item.category}</strong><p>{item.summary}</p></div>)}
              {!timeline.allergies.length && !timeline.alerts.length && <p className="text-sm text-slate-500">No active allergies or alerts.</p>}
            </div>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 md:col-span-2">
            <h2 className="text-lg font-bold">Growth and appointments</h2>
            <p className="mt-2 text-sm text-slate-600">{timeline.growth.length} growth measurements · {timeline.appointments.length} appointments</p>
          </section>
        </div>
      )}
    </WorkflowShell>
  );
}

export function NfcVaccinationPage() {
  const { organizationId } = useContext(UserContext);
  const { childId = '' } = useParams();
  const [form, setForm] = useState({ vaccineCode: '', doseNumber: '1', lotNumber: '', route: '', site: '', notes: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setError(''); setSaved(false);
    try {
      if (!organizationId) throw new Error('Select an organization first.');
      await medfinetClinicalApi.recordImmunization(organizationId, childId, {
        vaccineCode: form.vaccineCode.trim(),
        doseNumber: Number(form.doseNumber),
        administeredAt: new Date().toISOString(),
        lotNumber: form.lotNumber.trim() || undefined,
        route: form.route.trim() || undefined,
        site: form.site.trim() || undefined,
        notes: form.notes.trim() || undefined,
        sourceOperationId: crypto.randomUUID(),
      });
      setSaved(true);
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Vaccination could not be recorded'); }
    finally { setBusy(false); }
  }
  return (
    <WorkflowShell title="Record vaccination">
      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {Object.entries(form).map(([name, value]) => (
            <label key={name} className={name === 'notes' ? 'sm:col-span-2' : ''}><span className="mb-1.5 block text-sm font-semibold capitalize text-slate-700">{name.replace(/([A-Z])/g, ' $1')}</span><input required={name === 'vaccineCode' || name === 'doseNumber'} type={name === 'doseNumber' ? 'number' : 'text'} min={name === 'doseNumber' ? 1 : undefined} value={value} onChange={(event) => setForm((current) => ({ ...current, [name]: event.target.value }))} className="w-full rounded-xl border border-slate-300 px-3 py-2.5" /></label>
          ))}
        </div>
        {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
        {saved && <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700"><CheckCircle2 size={18} /> Vaccination recorded and audited.</p>}
        <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 font-semibold text-white disabled:opacity-50">{busy ? <Loader2 className="animate-spin" /> : <Syringe size={19} />} Save vaccination</button>
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
    event.preventDefault(); setBusy(true); setError('');
    try {
      if (!organizationId) throw new Error('Select an organization first.');
      const access = await medfinetClinicalApi.activateEmergencyAccess(organizationId, childId, { reasonCode, justification, durationMinutes: 15 });
      setProfile(await medfinetClinicalApi.getEmergencyProfile(organizationId, childId, access.id));
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Emergency access failed'); }
    finally { setBusy(false); }
  }
  return (
    <WorkflowShell title="Emergency access">
      {!profile && <form onSubmit={activate} className="space-y-4 rounded-2xl border border-rose-200 bg-white p-5 sm:p-6"><div className="flex gap-3 rounded-xl bg-rose-50 p-4 text-sm text-rose-900"><ShieldAlert className="shrink-0" /><p>This action requires recent step-up authentication, is time-limited, notifies the caregiver and is reviewed by administrators.</p></div><label className="block"><span className="mb-1 block text-sm font-semibold">Reason code</span><select value={reasonCode} onChange={(event) => setReasonCode(event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5"><option value="IMMEDIATE_CARE">Immediate care</option><option value="UNCONSCIOUS_PATIENT">Unconscious patient</option><option value="LIFE_THREATENING">Life threatening</option></select></label><label className="block"><span className="mb-1 block text-sm font-semibold">Clinical justification</span><textarea required minLength={10} value={justification} onChange={(event) => setJustification(event.target.value)} className="min-h-28 w-full rounded-xl border border-slate-300 px-3 py-2.5" /></label>{error && <p role="alert" className="text-sm text-rose-700">{error}</p>}<button disabled={busy} className="w-full rounded-xl bg-rose-700 px-4 py-3 font-semibold text-white disabled:opacity-50">Activate 15-minute emergency access</button></form>}
      {profile && <section className="space-y-4 rounded-2xl border border-rose-300 bg-white p-5"><div className="flex items-center gap-2 text-rose-700"><AlertTriangle /><strong>Emergency session expires {new Date(profile.access.expiresAt).toLocaleTimeString()}</strong></div><h2 className="text-2xl font-bold">{profile.profile.firstName} {profile.profile.lastName}</h2><div><h3 className="font-bold">Critical allergies</h3>{profile.profile.allergies.map((item) => <p key={item.substanceDisplay} className="mt-2 rounded-xl bg-amber-50 p-3">{item.substanceDisplay}{item.reaction ? ` · ${item.reaction}` : ''}</p>)}</div><div><h3 className="font-bold">Emergency alerts</h3>{profile.profile.clinicalAlerts.map((item) => <p key={`${item.category}-${item.summary}`} className="mt-2 rounded-xl bg-rose-50 p-3">{item.summary}</p>)}</div></section>}
    </WorkflowShell>
  );
}
