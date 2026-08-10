import {
  type FormEvent,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  KeyRound,
  Link2,
  Mail,
  Plus,
  RefreshCw,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { Modal } from "../../components/common/Modal";
import { PageFeedback } from "../../components/common/PageFeedback";
import UserContext from "../../contexts/UserContext";
import { medfinetIdentityApi } from "../../services/medfinetIdentityApi";
import {
  medfinetCaregiverPortalApi,
  type ParentRelationship,
} from "../../services/medfinetCaregiverPortalApi";
import {
  medfinetOperationsApi,
  type OperationsCaregiver,
} from "../../services/medfinetOperationsApi";

const input =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100";
const button =
  "rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold disabled:opacity-50";
const primary =
  "rounded-lg bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50";

const emptyCaregiver = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  preferredLanguage: "en",
};

const emptyLink = {
  caregiverId: "",
  childId: "",
  relationship: "GUARDIAN" as ParentRelationship,
  isPrimary: false,
  hasConsentAuthority: false,
};

const emptyConnect = {
  lookupMode: "email" as "email" | "accountId",
  accountEmail: "",
  accountId: "",
  firstName: "",
  lastName: "",
  phone: "",
  preferredLanguage: "en",
  childId: "",
  relationship: "GUARDIAN" as ParentRelationship,
  isPrimary: false,
  hasConsentAuthority: false,
};

export default function CaregiverAdministration() {
  const { organizationId } = useContext(UserContext);
  const [caregivers, setCaregivers] = useState<OperationsCaregiver[]>([]);
  const [children, setChildren] = useState<
    Awaited<ReturnType<typeof medfinetIdentityApi.listChildren>>["items"]
  >([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [connectOpen, setConnectOpen] = useState(false);
  const [caregiverOpen, setCaregiverOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [connectForm, setConnectForm] = useState(emptyConnect);
  const [caregiverForm, setCaregiverForm] = useState(emptyCaregiver);
  const [linkForm, setLinkForm] = useState(emptyLink);

  const load = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setError(null);
    try {
      const [caregiverRows, childPage] = await Promise.all([
        medfinetOperationsApi.caregivers(organizationId),
        medfinetIdentityApi.listChildren(organizationId, { limit: 100 }),
      ]);
      setCaregivers(caregiverRows);
      setChildren(childPage.items);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to load caregivers",
      );
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function connectParent(event: FormEvent) {
    event.preventDefault();
    if (!organizationId) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const connected = await medfinetCaregiverPortalApi.connectParent(
        organizationId,
        {
          ...(connectForm.lookupMode === "email"
            ? { accountEmail: connectForm.accountEmail.trim().toLowerCase() }
            : { accountId: connectForm.accountId.trim() }),
          firstName: connectForm.firstName.trim(),
          lastName: connectForm.lastName.trim(),
          phone: connectForm.phone.trim() || undefined,
          preferredLanguage: connectForm.preferredLanguage,
          childId: connectForm.childId,
          relationship: connectForm.relationship,
          isPrimary: connectForm.isPrimary,
          hasConsentAuthority: connectForm.hasConsentAuthority,
        },
      );
      setConnectOpen(false);
      setConnectForm(emptyConnect);
      setNotice(
        `${connected.caregiver.firstName} ${connected.caregiver.lastName} is now connected as a caregiver for ${connected.child.firstName} ${connected.child.lastName}. They can press “Check for access” on their Medfinet waiting screen.`,
      );
      await load();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to connect the parent account",
      );
    } finally {
      setBusy(false);
    }
  }

  async function createCaregiver(event: FormEvent) {
    event.preventDefault();
    if (!organizationId) return;
    setBusy(true);
    setError(null);
    try {
      const created = await medfinetIdentityApi.createCaregiver(
        organizationId,
        {
          ...caregiverForm,
          phone: caregiverForm.phone || undefined,
          email: caregiverForm.email || undefined,
        },
      );
      setCaregiverForm(emptyCaregiver);
      setCaregiverOpen(false);
      setLinkForm({ ...emptyLink, caregiverId: created.id });
      setNotice(
        "Caregiver record created. This does not create portal access; use Connect parent account when the caregiver has a verified Medfinet login.",
      );
      await load();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to create caregiver",
      );
    } finally {
      setBusy(false);
    }
  }

  async function linkCaregiver(event: FormEvent) {
    event.preventDefault();
    if (!organizationId) return;
    setBusy(true);
    setError(null);
    try {
      await medfinetIdentityApi.linkCaregiver(
        organizationId,
        linkForm.childId,
        {
          caregiverId: linkForm.caregiverId,
          relationship: linkForm.relationship,
          isPrimary: linkForm.isPrimary,
          hasConsentAuthority: linkForm.hasConsentAuthority,
        },
      );
      setLinkForm(emptyLink);
      setLinkOpen(false);
      setNotice("Caregiver relationship linked and audit recorded.");
      await load();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to link caregiver",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="space-y-6">
      <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <p className="text-sm font-semibold text-cyan-700">Family access</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950">
            Parents & caregivers
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Connect a verified parent account, create caregiver records for
            offline/assisted workflows, and explicitly control which children
            each caregiver can access.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={button} onClick={() => void load()}>
            <RefreshCw className="mr-2 inline h-4 w-4" /> Refresh
          </button>
          <button
            type="button"
            className={button}
            onClick={() => setLinkOpen(true)}
            disabled={!caregivers.length || !children.length}
          >
            <Link2 className="mr-2 inline h-4 w-4" /> Link existing caregiver
          </button>
          <button
            type="button"
            className={button}
            onClick={() => setCaregiverOpen(true)}
          >
            <Plus className="mr-2 inline h-4 w-4" /> Caregiver record only
          </button>
          <button
            type="button"
            className={primary}
            onClick={() => setConnectOpen(true)}
            disabled={!children.length}
          >
            <UserPlus className="mr-2 inline h-4 w-4" /> Connect parent account
          </button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5">
          <Mail className="h-5 w-5 text-cyan-700" />
          <h2 className="mt-3 font-bold text-slate-950">1. Parent registers</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            The parent creates and verifies a Medfinet account. They can give you
            either their verified email or the Account ID shown on the waiting
            screen.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <ShieldCheck className="h-5 w-5 text-cyan-700" />
          <h2 className="mt-3 font-bold text-slate-950">2. You connect access</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Medfinet verifies the account, assigns CAREGIVER, creates or reuses
            the caregiver profile, and links the selected child in one audited
            operation.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <Users className="h-5 w-5 text-cyan-700" />
          <h2 className="mt-3 font-bold text-slate-950">3. Parent gets Family Health</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            After they check for access, the parent sees only children explicitly
            linked to their caregiver identity.
          </p>
        </div>
      </section>

      {notice && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"
        >
          {notice}
        </div>
      )}

      <PageFeedback
        loading={loading}
        error={error}
        empty={!caregivers.length}
        onRetry={() => void load()}
        emptyTitle="No caregivers yet"
        emptyDescription="Connect a verified parent account or create a caregiver record for assisted/offline use."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {caregivers.map((caregiver) => (
            <article
              key={caregiver.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-50 text-cyan-700">
                  <Users className="h-5 w-5" />
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                    caregiver.subjectId
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {caregiver.subjectId ? "Portal connected" : "Record only"}
                </span>
              </div>
              <h2 className="mt-4 font-bold text-slate-950">
                {caregiver.firstName} {caregiver.lastName}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {caregiver.email || caregiver.phone || "No contact channel recorded"}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                {caregiver._count.children} linked child record(s) · {caregiver.preferredLanguage.toUpperCase()}
              </p>
              <button
                type="button"
                className={`${button} mt-4`}
                onClick={() => {
                  setLinkForm({ ...emptyLink, caregiverId: caregiver.id });
                  setLinkOpen(true);
                }}
              >
                <Link2 className="mr-2 inline h-4 w-4" /> Link another child
              </button>
            </article>
          ))}
        </div>
      </PageFeedback>

      <Modal
        open={connectOpen}
        title="Connect parent account"
        description="Use a verified Medfinet email or the Account ID shown on the parent's waiting-for-access screen. The account is verified server-side before access is granted."
        onClose={() => !busy && setConnectOpen(false)}
      >
        <form className="space-y-4" onSubmit={(event) => void connectParent(event)}>
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setConnectForm({ ...connectForm, lookupMode: "email", accountId: "" })}
              className={`rounded-lg px-3 py-2 text-sm font-bold ${connectForm.lookupMode === "email" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"}`}
            >
              <Mail className="mr-2 inline h-4 w-4" /> Verified email
            </button>
            <button
              type="button"
              onClick={() => setConnectForm({ ...connectForm, lookupMode: "accountId", accountEmail: "" })}
              className={`rounded-lg px-3 py-2 text-sm font-bold ${connectForm.lookupMode === "accountId" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"}`}
            >
              <KeyRound className="mr-2 inline h-4 w-4" /> Account ID
            </button>
          </div>

          {connectForm.lookupMode === "email" ? (
            <label className="block text-sm font-semibold">
              Parent's verified Medfinet email
              <input
                required
                type="email"
                autoComplete="off"
                className={input}
                placeholder="parent@example.com"
                value={connectForm.accountEmail}
                onChange={(event) => setConnectForm({ ...connectForm, accountEmail: event.target.value })}
              />
            </label>
          ) : (
            <label className="block text-sm font-semibold">
              Parent's Medfinet Account ID
              <input
                required
                autoComplete="off"
                className={input}
                placeholder="Paste the ID from their waiting screen"
                value={connectForm.accountId}
                onChange={(event) => setConnectForm({ ...connectForm, accountId: event.target.value })}
              />
            </label>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              First name
              <input
                required
                className={input}
                value={connectForm.firstName}
                onChange={(event) => setConnectForm({ ...connectForm, firstName: event.target.value })}
              />
            </label>
            <label className="text-sm font-semibold">
              Last name
              <input
                required
                className={input}
                value={connectForm.lastName}
                onChange={(event) => setConnectForm({ ...connectForm, lastName: event.target.value })}
              />
            </label>
          </div>

          <label className="block text-sm font-semibold">
            Child
            <select
              required
              className={input}
              value={connectForm.childId}
              onChange={(event) => setConnectForm({ ...connectForm, childId: event.target.value })}
            >
              <option value="">Select child</option>
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.firstName} {child.lastName} · {child.medfinetId}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              Relationship
              <select
                className={input}
                value={connectForm.relationship}
                onChange={(event) => setConnectForm({ ...connectForm, relationship: event.target.value as ParentRelationship })}
              >
                <option value="MOTHER">Mother</option>
                <option value="FATHER">Father</option>
                <option value="GUARDIAN">Guardian</option>
                <option value="RELATIVE">Relative</option>
                <option value="OTHER">Other</option>
              </select>
            </label>
            <label className="text-sm font-semibold">
              Preferred language
              <select
                className={input}
                value={connectForm.preferredLanguage}
                onChange={(event) => setConnectForm({ ...connectForm, preferredLanguage: event.target.value })}
              >
                <option value="en">English</option>
                <option value="ha">Hausa</option>
                <option value="yo">Yoruba</option>
                <option value="ig">Igbo</option>
              </select>
            </label>
          </div>

          <label className="block text-sm font-semibold">
            Phone (optional)
            <input
              type="tel"
              className={input}
              placeholder="+234…"
              value={connectForm.phone}
              onChange={(event) => setConnectForm({ ...connectForm, phone: event.target.value })}
            />
          </label>

          <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <label className="flex gap-3 text-sm">
              <input
                type="checkbox"
                checked={connectForm.isPrimary}
                onChange={(event) => setConnectForm({ ...connectForm, isPrimary: event.target.checked })}
              />
              <span><strong>Primary caregiver.</strong> Mark this person as the main caregiver for the selected child.</span>
            </label>
            <label className="flex gap-3 text-sm">
              <input
                type="checkbox"
                checked={connectForm.hasConsentAuthority}
                onChange={(event) => setConnectForm({ ...connectForm, hasConsentAuthority: event.target.checked })}
              />
              <span><strong>Verified consent authority.</strong> Enable only after the organization has verified that this person is legally authorized to grant consent for the child.</span>
            </label>
          </div>

          <button
            className={`${primary} w-full`}
            disabled={
              busy ||
              !connectForm.childId ||
              !connectForm.firstName.trim() ||
              !connectForm.lastName.trim() ||
              (connectForm.lookupMode === "email"
                ? !connectForm.accountEmail.trim()
                : !connectForm.accountId.trim())
            }
          >
            <UserPlus className="mr-2 inline h-4 w-4" />
            {busy ? "Connecting parent…" : "Verify account & connect parent"}
          </button>
        </form>
      </Modal>

      <Modal
        open={caregiverOpen}
        title="Create caregiver record only"
        description="Use this for assisted, offline or USSD workflows when the caregiver does not yet have a Medfinet portal login. Portal access is granted only through Connect parent account."
        onClose={() => !busy && setCaregiverOpen(false)}
      >
        <form className="space-y-4" onSubmit={(event) => void createCaregiver(event)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              First name
              <input required className={input} value={caregiverForm.firstName} onChange={(event) => setCaregiverForm({ ...caregiverForm, firstName: event.target.value })} />
            </label>
            <label className="text-sm font-semibold">
              Last name
              <input required className={input} value={caregiverForm.lastName} onChange={(event) => setCaregiverForm({ ...caregiverForm, lastName: event.target.value })} />
            </label>
          </div>
          <label className="block text-sm font-semibold">
            Phone
            <input type="tel" className={input} placeholder="+234…" value={caregiverForm.phone} onChange={(event) => setCaregiverForm({ ...caregiverForm, phone: event.target.value })} />
          </label>
          <label className="block text-sm font-semibold">
            Email
            <input type="email" className={input} value={caregiverForm.email} onChange={(event) => setCaregiverForm({ ...caregiverForm, email: event.target.value })} />
          </label>
          <label className="block text-sm font-semibold">
            Preferred language
            <select className={input} value={caregiverForm.preferredLanguage} onChange={(event) => setCaregiverForm({ ...caregiverForm, preferredLanguage: event.target.value })}>
              <option value="en">English</option>
              <option value="ha">Hausa</option>
              <option value="yo">Yoruba</option>
              <option value="ig">Igbo</option>
            </select>
          </label>
          <button className={`${primary} w-full`} disabled={busy}>
            {busy ? "Creating…" : "Create caregiver record"}
          </button>
        </form>
      </Modal>

      <Modal
        open={linkOpen}
        title="Link caregiver to child"
        description="This controls relationship-based access. Consent authority should be enabled only after verification."
        onClose={() => !busy && setLinkOpen(false)}
      >
        <form className="space-y-4" onSubmit={(event) => void linkCaregiver(event)}>
          <label className="block text-sm font-semibold">
            Caregiver
            <select required className={input} value={linkForm.caregiverId} onChange={(event) => setLinkForm({ ...linkForm, caregiverId: event.target.value })}>
              <option value="">Select caregiver</option>
              {caregivers.map((caregiver) => (
                <option key={caregiver.id} value={caregiver.id}>
                  {caregiver.firstName} {caregiver.lastName}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold">
            Child
            <select required className={input} value={linkForm.childId} onChange={(event) => setLinkForm({ ...linkForm, childId: event.target.value })}>
              <option value="">Select child</option>
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.firstName} {child.lastName} · {child.medfinetId}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold">
            Relationship
            <select className={input} value={linkForm.relationship} onChange={(event) => setLinkForm({ ...linkForm, relationship: event.target.value as ParentRelationship })}>
              <option value="MOTHER">Mother</option>
              <option value="FATHER">Father</option>
              <option value="GUARDIAN">Guardian</option>
              <option value="RELATIVE">Relative</option>
              <option value="OTHER">Other</option>
            </select>
          </label>
          <label className="flex gap-2 text-sm">
            <input type="checkbox" checked={linkForm.isPrimary} onChange={(event) => setLinkForm({ ...linkForm, isPrimary: event.target.checked })} />
            Primary caregiver
          </label>
          <label className="flex gap-2 text-sm">
            <input type="checkbox" checked={linkForm.hasConsentAuthority} onChange={(event) => setLinkForm({ ...linkForm, hasConsentAuthority: event.target.checked })} />
            Verified consent authority
          </label>
          <button className={`${primary} w-full`} disabled={busy || !linkForm.caregiverId || !linkForm.childId}>
            {busy ? "Linking…" : "Link caregiver"}
          </button>
        </form>
      </Modal>
    </main>
  );
}
