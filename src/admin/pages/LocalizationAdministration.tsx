import { FormEvent, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Languages, Plus, RefreshCw, ShieldCheck } from 'lucide-react';
import UserContext from '../../contexts/UserContext';
import { Modal } from '../../components/common/Modal';
import { PageFeedback } from '../../components/common/PageFeedback';
import { LocalizationCatalog, LocalizationContent, medfinetLocalizationApi } from '../../services/medfinetLocalizationApi';

const locales = [{ code: 'en', label: 'English' }, { code: 'ha', label: 'Hausa' }, { code: 'yo', label: 'Yoruba' }, { code: 'ig', label: 'Igbo' }] as const;
const input = 'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm';
const button = 'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold disabled:opacity-50';
const primary = 'rounded-lg bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50';

export default function LocalizationAdministration() {
  const { organizationId, user } = useContext(UserContext);
  const [items, setItems] = useState<LocalizationContent[]>([]);
  const [catalog, setCatalog] = useState<LocalizationCatalog | null>(null);
  const [locale, setLocale] = useState('ha');
  const [status, setStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ contentKey: '', locale: 'ha', value: '', translatorNote: '' });

  const load = useCallback(async () => {
    if (!organizationId) return; setLoading(true); setError(null);
    try { const [content, activeCatalog] = await Promise.all([medfinetLocalizationApi.listContent(organizationId), medfinetLocalizationApi.getCatalog(organizationId, locale)]); setItems(content.items); setCatalog(activeCatalog); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to load localization content'); } finally { setLoading(false); }
  }, [locale, organizationId]);
  useEffect(() => { void load(); }, [load]);

  const create = async (event: FormEvent) => {
    event.preventDefault(); if (!organizationId) return; setBusy(true); setError(null);
    try { await medfinetLocalizationApi.createDraft(organizationId, { ...form, translatorNote: form.translatorNote || undefined }); setNotice('Translation draft created. A different administrator must approve it.'); setOpen(false); setForm({ contentKey: '', locale, value: '', translatorNote: '' }); await load(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to create translation'); } finally { setBusy(false); }
  };
  const activate = async (item: LocalizationContent) => {
    if (!organizationId) return; setBusy(true); setError(null);
    try { await medfinetLocalizationApi.activate(organizationId, item.id); setNotice(`${item.contentKey} v${item.version} activated; the previous version was retired.`); await load(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to activate translation'); } finally { setBusy(false); }
  };
  const filtered = useMemo(() => items.filter((item) => item.locale === locale && (status === 'ALL' || item.status === status)), [items, locale, status]);

  return <main className="space-y-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-sm font-semibold text-cyan-700">Nigeria-first language operations</p><h1 className="text-3xl font-bold text-slate-950 dark:text-white">Localization catalog</h1><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Versioned English, Hausa, Yoruba and Igbo content with English fallback and maker-checker approval.</p></div><div className="flex gap-2"><button className={button} onClick={() => void load()}><RefreshCw className="mr-2 inline h-4 w-4" />Refresh</button><button className={primary} onClick={() => { setForm({ ...form, locale }); setOpen(true); }}><Plus className="mr-2 inline h-4 w-4" />New translation</button></div></div><div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><ShieldCheck className="mr-2 inline h-5 w-5" />Activation requires recent MFA and must be performed by an administrator other than the draft author.</div>{notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">{notice}</div>}<div className="flex flex-col gap-3 rounded-xl border bg-white p-4 sm:flex-row"><label className="text-sm font-semibold">Language<select className={input} value={locale} onChange={(e) => setLocale(e.target.value)}>{locales.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}</select></label><label className="text-sm font-semibold">Lifecycle<select className={input} value={status} onChange={(e) => setStatus(e.target.value)}><option>ALL</option><option>DRAFT</option><option>ACTIVE</option><option>RETIRED</option></select></label></div><PageFeedback loading={loading} error={error} empty={!filtered.length} onRetry={() => void load()}><div className="space-y-3">{filtered.map((item) => <article key={item.id} className="rounded-xl border bg-white p-4"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><p className="font-semibold text-slate-950">{item.contentKey}</p><p className="text-xs text-slate-500">{item.locale} · v{item.version} · {item.status}</p><p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{item.value}</p>{item.translatorNote && <p className="mt-2 text-xs italic text-slate-500">Translator note: {item.translatorNote}</p>}</div>{item.status === 'DRAFT' && <button className={primary} disabled={busy || item.createdBySubjectId === user?.id} title={item.createdBySubjectId === user?.id ? 'A different administrator must approve this draft' : undefined} onClick={() => void activate(item)}>Activate</button>}</div></article>)}</div></PageFeedback>{catalog && <section className="rounded-xl border bg-slate-950 p-5 text-slate-100"><div className="flex items-center gap-2"><Languages className="h-5 w-5" /><h2 className="font-bold">Active merged catalog preview</h2></div><p className="mt-1 text-xs text-slate-400">{Object.keys(catalog.messages).length} keys · English fallback enabled</p><pre className="mt-4 max-h-80 overflow-auto text-xs">{JSON.stringify(catalog.messages, null, 2)}</pre></section>}
    <Modal open={open} onClose={() => setOpen(false)} title="Create translation draft"><form className="space-y-4" onSubmit={(event) => void create(event)}><label className="block text-sm font-semibold">Catalog key<input required pattern="[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+" className={input} placeholder="navigation.appointments" value={form.contentKey} onChange={(e) => setForm({ ...form, contentKey: e.target.value })} /></label><label className="block text-sm font-semibold">Language<select className={input} value={form.locale} onChange={(e) => setForm({ ...form, locale: e.target.value })}>{locales.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}</select></label><label className="block text-sm font-semibold">Translated value<textarea required maxLength={4000} rows={5} className={input} value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} /></label><label className="block text-sm font-semibold">Translator note (optional)<textarea maxLength={1000} rows={3} className={input} value={form.translatorNote} onChange={(e) => setForm({ ...form, translatorNote: e.target.value })} /></label><button className={primary} disabled={busy}>Create draft</button></form></Modal></main>;
}
