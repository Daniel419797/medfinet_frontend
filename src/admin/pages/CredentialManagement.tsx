import { FormEvent, useCallback, useContext, useEffect, useState } from "react";
import { CreditCard, Eye, List, Plus } from "lucide-react";
import UserContext from "../../contexts/UserContext";
import { Modal } from "../../components/common/Modal";
import { PageFeedback } from "../../components/common/PageFeedback";
import { medfinetIdentityApi } from "../../services/medfinetIdentityApi";

type Child = { id: string; firstName: string; lastName: string; medfinetId: string };
type Credential = Awaited<ReturnType<typeof medfinetIdentityApi.listCredentials>>[number];
const input = "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm";
const button = "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold disabled:opacity-50";
const primary = "rounded-lg bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50";

export default function CredentialManagement() {
  const { organizationId } = useContext(UserContext);
  const [children, setChildren] = useState<Child[]>([]);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [selectedChildId, setSelectedChildId] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [detailCredential, setDetailCredential] = useState<Credential | null>(null);
  const [bulkForm, setBulkForm] = useState<Array<{ childId: string; kind: string; expiresAt: string }>>([
    { childId: "", kind: "QR", expiresAt: "" },
  ]);
  const [singleKind, setSingleKind] = useState("QR");
  const [singleExpires, setSingleExpires] = useState("");

  const load = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setError(null);
    try {
      const [childResult, credResult] = await Promise.all([
        medfinetIdentityApi.listChildren(organizationId, { limit: 200 }),
        medfinetIdentityApi.listCredentials(organizationId, selectedChildId || undefined),
      ]);
      setChildren(childResult.items);
      setCredentials(credResult);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [organizationId, selectedChildId]);

  useEffect(() => { load(); }, [load]);

  const handleIssueSingle = async (childId: string) => {
    if (!organizationId || busy) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const result = await medfinetIdentityApi.issueCredential(organizationId, childId, {
        kind: singleKind,
        expiresAt: singleExpires || undefined,
      });
      setNotice(`Credential issued. Token: ${result.token.slice(0, 20)}...`);
      load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Issuance failed");
    } finally {
      setBusy(false);
    }
  };

  const handleBulkIssue = async (e: FormEvent) => {
    e.preventDefault();
    if (!organizationId || busy) return;
    const valid = bulkForm.filter((r) => r.childId && r.kind);
    if (valid.length === 0) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const result = await medfinetIdentityApi.issueCredentialsBulk(organizationId, {
        credentials: valid.map((r) => ({
          childId: r.childId,
          kind: r.kind,
          expiresAt: r.expiresAt || undefined,
        })),
      });
      setNotice(`Bulk issuance complete. ${result.length} credential(s) issued.`);
      setBulkOpen(false);
      setBulkForm([{ childId: "", kind: "QR", expiresAt: "" }]);
      load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Bulk issuance failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CreditCard className="h-6 w-6 text-cyan-700" />
          <div>
            <h1 className="text-xl font-bold">Credential Management</h1>
            <p className="text-sm text-slate-600">Issue, view, and manage QR/NFC credentials.</p>
          </div>
        </div>
        <button onClick={() => setBulkOpen(true)} className={`${primary} flex items-center gap-2`}>
          <Plus className="h-4 w-4" /> Bulk Issue
        </button>
      </header>

      {notice && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">{notice}</div>}
      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">{error}</div>}

      <PageFeedback loading={loading} error={error} onRetry={load}>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600">Filter by child</label>
              <select value={selectedChildId} onChange={(e) => setSelectedChildId(e.target.value)} className={input}>
                <option value="">All children</option>
                {children.map((c) => (
                  <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600">Credential kind</label>
              <select value={singleKind} onChange={(e) => setSingleKind(e.target.value)} className={input}>
                <option value="QR">QR</option>
                <option value="RECOVERY">Recovery</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600">Expires at (optional)</label>
              <input type="datetime-local" value={singleExpires} onChange={(e) => setSingleExpires(e.target.value)} className={input} />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-800">Credentials ({credentials.length})</h2>
          {credentials.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500">
              No credentials found. Issue one to get started.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800">
                  <tr>
                    <th className="px-4 py-3">Kind</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Issued</th>
                    <th className="px-4 py-3">Expires</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {credentials.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                      <td className="px-4 py-3 font-medium">{c.kind}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                          c.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                        }`}>{c.status}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{new Date(c.issuedAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-slate-600">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "—"}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => setDetailCredential(c)} className="text-cyan-700 hover:underline">
                          <Eye className="inline h-4 w-4" />
                        </button>
                        <button onClick={() => handleIssueSingle(c.childId)} disabled={busy} className="ml-2 text-cyan-700 hover:underline">
                          Replace
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </PageFeedback>

      {/* Bulk issuance modal */}
      <Modal open={bulkOpen} onClose={() => setBulkOpen(false)}>
        <form onSubmit={handleBulkIssue} className="space-y-4">
          <h2 className="text-lg font-bold">Bulk Credential Issuance</h2>
          {bulkForm.map((row, idx) => (
            <div key={idx} className="grid grid-cols-3 gap-2">
              <select value={row.childId} onChange={(e) => {
                const next = [...bulkForm]; next[idx] = { ...next[idx], childId: e.target.value }; setBulkForm(next);
              }} className={input}>
                <option value="">Select child</option>
                {children.map((c) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
              </select>
              <select value={row.kind} onChange={(e) => {
                const next = [...bulkForm]; next[idx] = { ...next[idx], kind: e.target.value }; setBulkForm(next);
              }} className={input}>
                <option value="QR">QR</option>
                <option value="RECOVERY">Recovery</option>
              </select>
              <input type="datetime-local" value={row.expiresAt} onChange={(e) => {
                const next = [...bulkForm]; next[idx] = { ...next[idx], expiresAt: e.target.value }; setBulkForm(next);
              }} className={input} />
            </div>
          ))}
          <button type="button" onClick={() => setBulkForm([...bulkForm, { childId: "", kind: "QR", expiresAt: "" }])} className={button}>
            Add row
          </button>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setBulkOpen(false)} className={button}>Cancel</button>
            <button type="submit" disabled={busy || bulkForm.every((r) => !r.childId)} className={primary}>
              {busy ? "Issuing..." : `Issue ${bulkForm.filter((r) => r.childId).length} credential(s)`}
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail modal */}
      <Modal open={!!detailCredential} onClose={() => setDetailCredential(null)}>
        {detailCredential && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold">Credential Detail</h2>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <dt className="font-semibold text-slate-600">ID</dt>
              <dd className="break-all">{detailCredential.id}</dd>
              <dt className="font-semibold text-slate-600">Kind</dt>
              <dd>{detailCredential.kind}</dd>
              <dt className="font-semibold text-slate-600">Status</dt>
              <dd>{detailCredential.status}</dd>
              <dt className="font-semibold text-slate-600">Issued</dt>
              <dd>{new Date(detailCredential.issuedAt).toLocaleString()}</dd>
              <dt className="font-semibold text-slate-600">Expires</dt>
              <dd>{detailCredential.expiresAt ? new Date(detailCredential.expiresAt).toLocaleString() : "Never"}</dd>
              <dt className="font-semibold text-slate-600">Issued by</dt>
              <dd className="break-all">{detailCredential.issuedBySubjectId}</dd>
            </dl>
            <button onClick={() => setDetailCredential(null)} className={primary}>Close</button>
          </div>
        )}
      </Modal>
    </main>
  );
}
