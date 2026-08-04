import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, RefreshCw, RadioTower, Send, Smartphone } from 'lucide-react';
import UserContext from '../../contexts/UserContext';
import { Modal } from '../../components/common/Modal';
import { PageFeedback } from '../../components/common/PageFeedback';
import { medfinetIdentityApi } from '../../services/medfinetIdentityApi';
import {
  medfinetUssdApi,
  type UssdQueueItem,
  type UssdQueueStatus,
  type UssdQueueType,
} from '../../services/medfinetUssdApi';

const QUEUES: Array<{ type: UssdQueueType; label: string }> = [
  { type: 'appointments', label: 'Appointments' },
  { type: 'callbacks', label: 'Callbacks' },
  { type: 'cards', label: 'Card support' },
  { type: 'programmes', label: 'Programme interest' },
  { type: 'deliveries', label: 'Delivery responses' },
  { type: 'climate', label: 'Climate response' },
];

const REVIEW_STATUSES: Record<UssdQueueType, UssdQueueStatus[]> = {
  appointments: ['APPROVED', 'REJECTED', 'CANCELLED'],
  callbacks: ['COMPLETED', 'CANCELLED'],
  cards: ['APPROVED', 'REJECTED', 'CANCELLED'],
  programmes: ['APPROVED', 'REJECTED', 'CANCELLED'],
  deliveries: ['APPROVED', 'REJECTED', 'COMPLETED'],
  climate: ['COMPLETED', 'CANCELLED'],
};

function summary(item: UssdQueueItem) {
  const fields = ['decision', 'requestType', 'category', 'priority', 'appointmentId', 'childId'];
  return fields.filter((field) => item[field]).map((field) => `${field}: ${String(item[field])}`).join(' · ') || 'Pending caregiver request';
}

export default function UssdOperations() {
  const { organizationId } = useContext(UserContext);
  const [type, setType] = useState<UssdQueueType>('appointments');
  const [status, setStatus] = useState<UssdQueueStatus>('PENDING');
  const [items, setItems] = useState<UssdQueueItem[]>([]);
  const [facilities, setFacilities] = useState<Array<{ id: string; name: string; code: string; isActive: boolean }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [selected, setSelected] = useState<UssdQueueItem | null>(null);
  const [reviewStatus, setReviewStatus] = useState<UssdQueueStatus>('APPROVED');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [accessOpen, setAccessOpen] = useState(false);
  const [caregiverId, setCaregiverId] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [locale, setLocale] = useState<'en' | 'ha' | 'yo' | 'ig'>('en');
  const [facilityOpen, setFacilityOpen] = useState(false);
  const [facilityId, setFacilityId] = useState('');

  const load = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setError('');
    try {
      const [queue, availableFacilities] = await Promise.all([
        medfinetUssdApi.listQueue(organizationId, type, status),
        medfinetIdentityApi.listFacilities(organizationId),
      ]);
      setItems(queue);
      setFacilities(availableFacilities);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load USSD operations');
    } finally {
      setLoading(false);
    }
  }, [organizationId, status, type]);

  useEffect(() => { void load(); }, [load]);
  const allowedStatuses = useMemo(() => REVIEW_STATUSES[type], [type]);

  async function review() {
    if (!organizationId || !selected) return;
    setBusy(true);
    try {
      await medfinetUssdApi.review(organizationId, type, selected.id, { status: reviewStatus, notes: notes.trim() || undefined });
      setSelected(null);
      setNotice('The queue item was updated and audit evidence was recorded.');
      await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Review failed'); }
    finally { setBusy(false); }
  }

  async function configureAccess(event: React.FormEvent) {
    event.preventDefault();
    if (!organizationId) return;
    setBusy(true);
    try {
      await medfinetUssdApi.configureAccess(organizationId, caregiverId.trim(), { phone: phone.trim(), pin, locale });
      setAccessOpen(false); setPin(''); setNotice('USSD access was configured securely.');
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'USSD setup failed'); }
    finally { setBusy(false); }
  }

  async function publishFacility(event: React.FormEvent) {
    event.preventDefault();
    if (!organizationId) return;
    setBusy(true);
    try {
      await medfinetUssdApi.publishFacility(organizationId, facilityId);
      setFacilityOpen(false); setNotice('The facility directory entry is now available to public USSD lookup.');
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Publication failed'); }
    finally { setBusy(false); }
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div><p className="text-sm font-semibold text-cyan-700">Operations</p><h1 className="text-3xl font-bold text-slate-950">USSD service desk</h1><p className="mt-2 max-w-2xl text-sm text-slate-600">Review caregiver requests, enroll verified phones, and publish safe facility information.</p></div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setAccessOpen(true)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold"><Smartphone className="mr-2 inline h-4 w-4" />Configure access</button>
          <button type="button" onClick={() => setFacilityOpen(true)} className="rounded-lg bg-cyan-700 px-3 py-2 text-sm font-semibold text-white"><RadioTower className="mr-2 inline h-4 w-4" />Publish facility</button>
        </div>
      </div>
      {notice && <div role="status" className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"><CheckCircle2 className="h-4 w-4" />{notice}</div>}
      <div className="mt-6 flex gap-2 overflow-x-auto pb-2">{QUEUES.map((queue) => <button type="button" key={queue.type} onClick={() => { setType(queue.type); setStatus('PENDING'); }} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${type === queue.type ? 'bg-slate-950 text-white' : 'border border-slate-300 bg-white text-slate-700'}`}>{queue.label}</button>)}</div>
      <div className="mt-4 flex items-center justify-between gap-3"><select aria-label="Queue status" value={status} onChange={(event) => setStatus(event.target.value as UssdQueueStatus)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"><option>PENDING</option><option>APPROVED</option><option>REJECTED</option><option>COMPLETED</option><option>CANCELLED</option></select><button type="button" onClick={() => void load()} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label="Refresh queue"><RefreshCw className="h-5 w-5" /></button></div>
      <div className="mt-4"><PageFeedback loading={loading} error={error} empty={!items.length} onRetry={() => void load()}><div className="grid gap-3">{items.map((item) => <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-slate-900">{summary(item)}</p><p className="mt-1 text-xs text-slate-500">Received {new Date(item.createdAt).toLocaleString()}</p></div>{item.status === 'PENDING' && <button type="button" onClick={() => { setSelected(item); setReviewStatus(allowedStatuses[0]); setNotes(''); }} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Review</button>}</div></article>)}</div></PageFeedback></div>

      <Modal open={Boolean(selected)} title="Review USSD request" description="This decision is tenant-scoped and audit recorded." onClose={() => setSelected(null)}><label className="block text-sm font-medium">Decision<select value={reviewStatus} onChange={(event) => setReviewStatus(event.target.value as UssdQueueStatus)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">{allowedStatuses.map((value) => <option key={value}>{value}</option>)}</select></label><label className="mt-4 block text-sm font-medium">Notes<textarea value={notes} maxLength={500} onChange={(event) => setNotes(event.target.value)} className="mt-1 min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2" /></label><button type="button" disabled={busy} onClick={() => void review()} className="mt-5 w-full rounded-lg bg-cyan-700 px-4 py-2.5 font-semibold text-white disabled:opacity-50">{busy ? 'Saving…' : 'Save decision'}</button></Modal>
      <Modal open={accessOpen} title="Configure caregiver USSD access" description="The phone must have been identity-verified before enrollment." onClose={() => setAccessOpen(false)}><form onSubmit={configureAccess} className="space-y-4"><label className="block text-sm font-medium">Caregiver ID<input required value={caregiverId} onChange={(event) => setCaregiverId(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label><label className="block text-sm font-medium">Verified phone<input required type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+2348012345678" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label><label className="block text-sm font-medium">New 4–6 digit PIN<input required type="password" inputMode="numeric" pattern="[0-9]{4,6}" value={pin} onChange={(event) => setPin(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label><label className="block text-sm font-medium">Language<select value={locale} onChange={(event) => setLocale(event.target.value as typeof locale)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"><option value="en">English</option><option value="ha">Hausa</option><option value="yo">Yoruba</option><option value="ig">Igbo</option></select></label><button disabled={busy} className="w-full rounded-lg bg-cyan-700 px-4 py-2.5 font-semibold text-white"><Send className="mr-2 inline h-4 w-4" />{busy ? 'Configuring…' : 'Configure access'}</button></form></Modal>
      <Modal open={facilityOpen} title="Publish facility to USSD" description="Only the safe directory projection will become public." onClose={() => setFacilityOpen(false)}><form onSubmit={publishFacility}><label className="block text-sm font-medium">Facility<select required value={facilityId} onChange={(event) => setFacilityId(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"><option value="">Select a facility</option>{facilities.map((facility) => <option key={facility.id} value={facility.id}>{facility.name} ({facility.code})</option>)}</select></label><button disabled={busy || !facilityId} className="mt-5 w-full rounded-lg bg-cyan-700 px-4 py-2.5 font-semibold text-white disabled:opacity-50">{busy ? 'Publishing…' : 'Publish safe directory record'}</button></form></Modal>
    </main>
  );
}
