import { useCallback, useContext, useEffect, useState } from "react";
import { FileLock2, Plus, RefreshCw } from "lucide-react";
import UserContext from "../../contexts/UserContext";
import { Modal } from "../../components/common/Modal";
import { PageFeedback } from "../../components/common/PageFeedback";
import { medfinetGovernanceApi } from "../../services/medfinetGovernanceApi";
import { medfinetIdentityApi } from "../../services/medfinetIdentityApi";

type Profile = Awaited<
  ReturnType<typeof medfinetIdentityApi.getMyCaregiverProfile>
>;
type Request = Awaited<
  ReturnType<typeof medfinetGovernanceApi.listSubjectRequests>
>[number];
type RequestType =
  | "ACCESS"
  | "RECTIFICATION"
  | "ERASURE"
  | "RESTRICTION"
  | "PORTABILITY"
  | "OBJECTION";
const input = "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5";

export default function CaregiverPrivacy() {
  const { organizationId } = useContext(UserContext);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    requestType: "ACCESS" as RequestType,
    childId: "",
    requestDetails: "",
  });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setError("");
    try {
      const [caregiver, rows] = await Promise.all([
        medfinetIdentityApi.getMyCaregiverProfile(organizationId),
        medfinetGovernanceApi.listSubjectRequests(organizationId),
      ]);
      setProfile(caregiver);
      setRequests(rows);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to load privacy requests",
      );
    } finally {
      setLoading(false);
    }
  }, [organizationId]);
  useEffect(() => {
    void load();
  }, [load]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!organizationId || !profile) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await medfinetGovernanceApi.submitSubjectRequest(organizationId, {
        requestType: form.requestType,
        caregiverId: profile.id,
        ...(form.childId ? { childId: form.childId } : {}),
        requestDetails: form.requestDetails.trim(),
      });
      setOpen(false);
      setForm({ requestType: "ACCESS", childId: "", requestDetails: "" });
      setNotice(
        "Privacy request submitted. The organization must respond within its recorded due date.",
      );
      await load();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to submit privacy request",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-cyan-700">
            Your information rights
          </p>
          <h1 className="text-3xl font-bold">Privacy requests</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Request access, correction, portability, restriction, erasure
            review, or object to processing for yourself and children where you
            hold consent authority.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-lg border bg-white px-3 py-2 text-sm font-semibold"
          >
            <RefreshCw className="mr-2 inline h-4 w-4" />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => setOpen(true)}
            disabled={!profile}
            className="rounded-lg bg-cyan-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            <Plus className="mr-2 inline h-4 w-4" />
            New request
          </button>
        </div>
      </div>
      {notice && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"
        >
          {notice}
        </div>
      )}
      <PageFeedback
        loading={loading}
        error={error}
        empty={!requests.length}
        emptyTitle="No privacy requests"
        emptyDescription="Requests you submit will appear here with their due date and status."
        onRetry={() => void load()}
      >
        <div className="space-y-3">
          {requests.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col justify-between gap-3 sm:flex-row">
                <div className="flex gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-50 text-cyan-700">
                    <FileLock2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-bold">
                      {item.requestType.replaceAll("_", " ")}
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      {item.requestDetails}
                    </p>
                  </div>
                </div>
                <span className="h-fit rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold">
                  {item.status}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 border-t pt-4 text-xs text-slate-500">
                <span>
                  Submitted {new Date(item.submittedAt).toLocaleDateString()}
                </span>
                <span>
                  Response due {new Date(item.dueAt).toLocaleDateString()}
                </span>
                {item.childId && <span>Child request</span>}
              </div>
            </article>
          ))}
        </div>
      </PageFeedback>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Submit privacy request"
        description="Requests affecting a child require an active caregiver link with consent authority."
      >
        <form onSubmit={(event) => void submit(event)} className="space-y-4">
          <label className="block text-sm font-semibold">
            Request type
            <select
              className={input}
              value={form.requestType}
              onChange={(event) =>
                setForm({
                  ...form,
                  requestType: event.target.value as RequestType,
                })
              }
            >
              <option>ACCESS</option>
              <option>RECTIFICATION</option>
              <option>PORTABILITY</option>
              <option>RESTRICTION</option>
              <option>ERASURE</option>
              <option>OBJECTION</option>
            </select>
          </label>
          <label className="block text-sm font-semibold">
            Person concerned
            <select
              className={input}
              value={form.childId}
              onChange={(event) =>
                setForm({ ...form, childId: event.target.value })
              }
            >
              <option value="">My caregiver profile</option>
              {profile?.children
                .filter((link) => link.hasConsentAuthority)
                .map((link) => (
                  <option key={link.child.id} value={link.child.id}>
                    {link.child.firstName} {link.child.lastName} ·{" "}
                    {link.child.medfinetId}
                  </option>
                ))}
            </select>
          </label>
          <label className="block text-sm font-semibold">
            Request details
            <textarea
              required
              minLength={10}
              maxLength={2000}
              rows={5}
              className={input}
              value={form.requestDetails}
              onChange={(event) =>
                setForm({ ...form, requestDetails: event.target.value })
              }
            />
          </label>
          <button
            disabled={busy}
            className="w-full rounded-lg bg-cyan-700 px-4 py-2.5 font-semibold text-white disabled:opacity-50"
          >
            {busy ? "Submitting…" : "Submit request"}
          </button>
        </form>
      </Modal>
    </main>
  );
}
