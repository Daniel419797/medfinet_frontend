import { FormEvent, useCallback, useContext, useEffect, useState } from 'react';
import { BarChart3, CalendarDays, LockKeyhole, Play, RefreshCw } from 'lucide-react';
import UserContext from '../../contexts/UserContext';
import { Modal } from '../../components/common/Modal';
import { PageFeedback } from '../../components/common/PageFeedback';
import { AnalyticsPolicy, LatestAnalytics, medfinetAnalyticsApi } from '../../services/medfinetAnalyticsApi';

const input = 'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm';
const button = 'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold disabled:opacity-50';
const primary = 'rounded-lg bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50';

export default function AnalyticsReports() {
  const { organizationId } = useContext(UserContext);
  const [policy, setPolicy] = useState<AnalyticsPolicy | null>(null);
  const [latest, setLatest] = useState<LatestAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [policyOpen, setPolicyOpen] = useState(false);
  const [runOpen, setRunOpen] = useState(false);
  const [policyForm, setPolicyForm] = useState({ minimumCellSize: 10, maximumGeography: 'STATE' as AnalyticsPolicy['maximumGeography'], isPublicEnabled: false, publicOrganizationName: '' });
  const today = new Date().toISOString().slice(0, 10);
  const prior = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const [period, setPeriod] = useState({ periodStart: prior, periodEnd: today });

  const load = useCallback(async () => {
    if (!organizationId) return; setLoading(true); setError(null);
    try {
      const [currentPolicy, currentLatest] = await Promise.all([medfinetAnalyticsApi.getPolicy(organizationId), medfinetAnalyticsApi.getLatest(organizationId)]);
      setPolicy(currentPolicy); setLatest(currentLatest);
      if (currentPolicy) setPolicyForm({ minimumCellSize: currentPolicy.minimumCellSize, maximumGeography: currentPolicy.maximumGeography, isPublicEnabled: currentPolicy.isPublicEnabled, publicOrganizationName: currentPolicy.publicOrganizationName || '' });
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to load analytics'); }
    finally { setLoading(false); }
  }, [organizationId]);
  useEffect(() => { void load(); }, [load]);

  const savePolicy = async (event: FormEvent) => {
    event.preventDefault(); if (!organizationId) return; setBusy(true); setError(null);
    try { await medfinetAnalyticsApi.updatePolicy(organizationId, { ...policyForm, publicOrganizationName: policyForm.publicOrganizationName || undefined }); setNotice('Disclosure policy updated with an audit record.'); setPolicyOpen(false); await load(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to update policy'); } finally { setBusy(false); }
  };
  const generate = async (event: FormEvent) => {
    event.preventDefault(); if (!organizationId) return; setBusy(true); setError(null);
    try { const result = await medfinetAnalyticsApi.requestGeneration(organizationId, { periodStart: new Date(`${period.periodStart}T00:00:00Z`).toISOString(), periodEnd: new Date(`${period.periodEnd}T23:59:59Z`).toISOString(), idempotencyKey: crypto.randomUUID() }); setNotice(`Analytics run ${result.run.id} is ${result.run.status.toLowerCase()}. Refresh after the worker completes it.`); setRunOpen(false); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to request analytics generation'); } finally { setBusy(false); }
  };
  const metrics = latest?.metrics || [];

  return <main className="space-y-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-sm font-semibold text-cyan-700">Privacy-preserving reporting</p><h1 className="text-3xl font-bold text-slate-950 dark:text-white">Analytics and disclosure</h1><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Aggregate snapshots generated from tenant data with minimum-cell suppression and controlled geography.</p></div><div className="flex flex-wrap gap-2"><button className={button} onClick={() => void load()}><RefreshCw className="mr-2 inline h-4 w-4" />Refresh</button><button className={button} onClick={() => setPolicyOpen(true)}><LockKeyhole className="mr-2 inline h-4 w-4" />Disclosure policy</button><button className={primary} onClick={() => setRunOpen(true)}><Play className="mr-2 inline h-4 w-4" />Generate snapshot</button></div></div>{notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">{notice}</div>}<PageFeedback loading={loading} error={error} empty={!latest?.run} onRetry={() => void load()}><div className="grid gap-4 md:grid-cols-3"><section className="rounded-xl border bg-white p-5"><p className="text-xs font-bold uppercase text-slate-500">Reporting period</p><p className="mt-2 font-semibold">{latest?.run ? `${new Date(latest.run.periodStart).toLocaleDateString()} – ${new Date(latest.run.periodEnd).toLocaleDateString()}` : 'No completed run'}</p></section><section className="rounded-xl border bg-white p-5"><p className="text-xs font-bold uppercase text-slate-500">Disclosure floor</p><p className="mt-2 font-semibold">{policy?.minimumCellSize ?? 10} people · {policy?.maximumGeography ?? 'STATE'}</p></section><section className="rounded-xl border bg-white p-5"><p className="text-xs font-bold uppercase text-slate-500">Public publication</p><p className="mt-2 font-semibold">{policy?.isPublicEnabled ? `Enabled as ${policy.publicOrganizationName}` : 'Disabled'}</p></section></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{metrics.map((metric) => <article key={metric.key} className="rounded-2xl border bg-white p-5"><div className="flex justify-between gap-3"><div><p className="text-xs font-bold uppercase text-slate-500">{metric.key.replaceAll('_', ' ')}</p><p className="mt-2 text-3xl font-bold text-slate-950">{metric.valueBasisPoints == null ? metric.numerator.toLocaleString() : `${(metric.valueBasisPoints / 100).toFixed(1)}%`}</p></div><BarChart3 className="h-7 w-7 text-cyan-700" /></div><p className="mt-3 text-sm text-slate-600">Cohort {metric.cohortSize.toLocaleString()} · {metric.disclosureStatus}</p>{metric.suppressionReason && <p className="mt-2 text-xs text-amber-700">{metric.suppressionReason}</p>}</article>)}</div></PageFeedback>
    <Modal open={policyOpen} onClose={() => setPolicyOpen(false)} title="Analytics disclosure policy"><form className="space-y-4" onSubmit={(event) => void savePolicy(event)}><label className="block text-sm font-semibold">Minimum cohort size<input type="number" min="10" max="1000" required className={input} value={policyForm.minimumCellSize} onChange={(e) => setPolicyForm({ ...policyForm, minimumCellSize: Number(e.target.value) })} /></label><label className="block text-sm font-semibold">Most detailed geography<select className={input} value={policyForm.maximumGeography} onChange={(e) => setPolicyForm({ ...policyForm, maximumGeography: e.target.value as AnalyticsPolicy['maximumGeography'] })}><option>NATIONAL</option><option>STATE</option><option>LGA</option></select></label><label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={policyForm.isPublicEnabled} onChange={(e) => setPolicyForm({ ...policyForm, isPublicEnabled: e.target.checked })} />Allow publication of eligible aggregate metrics</label>{policyForm.isPublicEnabled && <label className="block text-sm font-semibold">Approved public organization name<input required className={input} value={policyForm.publicOrganizationName} onChange={(e) => setPolicyForm({ ...policyForm, publicOrganizationName: e.target.value })} /></label>}<button className={primary} disabled={busy}>Save policy</button></form></Modal>
    <Modal open={runOpen} onClose={() => setRunOpen(false)} title="Generate aggregate snapshot"><form className="space-y-4" onSubmit={(event) => void generate(event)}><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">Period start<input required type="date" max={today} className={input} value={period.periodStart} onChange={(e) => setPeriod({ ...period, periodStart: e.target.value })} /></label><label className="text-sm font-semibold">Period end<input required type="date" max={today} className={input} value={period.periodEnd} onChange={(e) => setPeriod({ ...period, periodEnd: e.target.value })} /></label></div><p className="text-sm text-slate-600"><CalendarDays className="mr-2 inline h-4 w-4" />Periods must be complete, in the past, and no longer than 366 days.</p><button className={primary} disabled={busy}>Queue generation</button></form></Modal></main>;
}
