import {
  type FormEvent,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Link2, Plus, RefreshCw, Users } from "lucide-react";
import { Modal } from "../../components/common/Modal";
import { PageFeedback } from "../../components/common/PageFeedback";
import UserContext from "../../contexts/UserContext";
import { medfinetIdentityApi } from "../../services/medfinetIdentityApi";
import {
  medfinetOperationsApi,
  type OperationsCaregiver,
} from "../../services/medfinetOperationsApi";

const input =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm";
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
  subjectId: "",
};
const emptyLink = {
  caregiverId: "",
  childId: "",
  relationship: "GUARDIAN" as
    "MOTHER" | "FATHER" | "GUARDIAN" | "RELATIVE" | "OTHER",
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
  const [caregiverOpen, setCaregiverOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
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
          subjectId: caregiverForm.subjectId || undefined,
        },
      );
      setCaregiverForm(emptyCaregiver);
      setCaregiverOpen(false);
      setLinkForm({ ...emptyLink, caregiverId: created.id });
      setNotice(
        "Caregiver created. Link the caregiver to a child to grant relationship-based access.",
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
      <header className="flex flex-col justify-between gap-4 lg:flex-row">
        <div>
          <p className="text-sm font-semibold text-cyan-700">
            Identity relationships
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950">Caregivers</h1>
          <p className="mt-2 text-sm text-slate-600">
            Register caregiver identities and explicitly link relationship and
            consent authority to a child.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={button} onClick={() => void load()}>
            <RefreshCw className="mr-2 inline h-4 w-4" />
            Refresh
          </button>
          <button
            type="button"
            className={button}
            onClick={() => setLinkOpen(true)}
            disabled={!caregivers.length || !children.length}
          >
            <Link2 className="mr-2 inline h-4 w-4" />
            Link caregiver
          </button>
          <button
            type="button"
            className={primary}
            onClick={() => setCaregiverOpen(true)}
          >
            <Plus className="mr-2 inline h-4 w-4" />
            Register caregiver
          </button>
        </div>
      </header>
      {notice && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900"
        >
          {notice}
        </div>
      )}
      <PageFeedback
        loading={loading}
        error={error}
        empty={!caregivers.length}
        onRetry={() => void load()}
        emptyTitle="No caregivers"
        emptyDescription="Register a caregiver identity before creating child relationships."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {caregivers.map((caregiver) => (
            <article
              key={caregiver.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <Users className="h-6 w-6 text-cyan-700" />
              <h2 className="mt-4 font-bold text-slate-950">
                {caregiver.firstName} {caregiver.lastName}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {caregiver.phone ||
                  caregiver.email ||
                  "No contact channel recorded"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {caregiver.phoneVerifiedAt
                  ? "Phone verified"
                  : "Phone not verified"}{" "}
                · {caregiver._count.children} linked child record(s)
              </p>
              <button
                type="button"
                className={`${button} mt-4`}
                onClick={() => {
                  setLinkForm({ ...emptyLink, caregiverId: caregiver.id });
                  setLinkOpen(true);
                }}
              >
                Link to child
              </button>
            </article>
          ))}
        </div>
      </PageFeedback>
      <Modal
        open={caregiverOpen}
        title="Register caregiver"
        description="A portal identity can be attached only when its verified subject ID is known."
        onClose={() => !busy && setCaregiverOpen(false)}
      >
        <form
          className="space-y-4"
          onSubmit={(event) => void createCaregiver(event)}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              First name
              <input
                required
                className={input}
                value={caregiverForm.firstName}
                onChange={(event) =>
                  setCaregiverForm({
                    ...caregiverForm,
                    firstName: event.target.value,
                  })
                }
              />
            </label>
            <label className="text-sm font-semibold">
              Last name
              <input
                required
                className={input}
                value={caregiverForm.lastName}
                onChange={(event) =>
                  setCaregiverForm({
                    ...caregiverForm,
                    lastName: event.target.value,
                  })
                }
              />
            </label>
          </div>
          <label className="block text-sm font-semibold">
            Phone
            <input
              type="tel"
              className={input}
              placeholder="+234…"
              value={caregiverForm.phone}
              onChange={(event) =>
                setCaregiverForm({
                  ...caregiverForm,
                  phone: event.target.value,
                })
              }
            />
          </label>
          <label className="block text-sm font-semibold">
            Email
            <input
              type="email"
              className={input}
              value={caregiverForm.email}
              onChange={(event) =>
                setCaregiverForm({
                  ...caregiverForm,
                  email: event.target.value,
                })
              }
            />
          </label>
          <label className="block text-sm font-semibold">
            Preferred language
            <select
              className={input}
              value={caregiverForm.preferredLanguage}
              onChange={(event) =>
                setCaregiverForm({
                  ...caregiverForm,
                  preferredLanguage: event.target.value,
                })
              }
            >
              <option value="en">English</option>
              <option value="ha">Hausa</option>
              <option value="yo">Yoruba</option>
              <option value="ig">Igbo</option>
            </select>
          </label>
          <label className="block text-sm font-semibold">
            Verified portal subject ID (optional)
            <input
              className={input}
              value={caregiverForm.subjectId}
              onChange={(event) =>
                setCaregiverForm({
                  ...caregiverForm,
                  subjectId: event.target.value,
                })
              }
            />
          </label>
          <button className={primary} disabled={busy}>
            {busy ? "Registering…" : "Register caregiver"}
          </button>
        </form>
      </Modal>
      <Modal
        open={linkOpen}
        title="Link caregiver to child"
        description="Consent authority should be granted only after relationship verification."
        onClose={() => !busy && setLinkOpen(false)}
      >
        <form
          className="space-y-4"
          onSubmit={(event) => void linkCaregiver(event)}
        >
          <label className="block text-sm font-semibold">
            Caregiver
            <select
              required
              className={input}
              value={linkForm.caregiverId}
              onChange={(event) =>
                setLinkForm({ ...linkForm, caregiverId: event.target.value })
              }
            >
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
            <select
              required
              className={input}
              value={linkForm.childId}
              onChange={(event) =>
                setLinkForm({ ...linkForm, childId: event.target.value })
              }
            >
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
            <select
              className={input}
              value={linkForm.relationship}
              onChange={(event) =>
                setLinkForm({
                  ...linkForm,
                  relationship: event.target
                    .value as typeof linkForm.relationship,
                })
              }
            >
              <option>MOTHER</option>
              <option>FATHER</option>
              <option>GUARDIAN</option>
              <option>RELATIVE</option>
              <option>OTHER</option>
            </select>
          </label>
          <label className="flex gap-2 text-sm">
            <input
              type="checkbox"
              checked={linkForm.isPrimary}
              onChange={(event) =>
                setLinkForm({ ...linkForm, isPrimary: event.target.checked })
              }
            />
            Primary caregiver
          </label>
          <label className="flex gap-2 text-sm">
            <input
              type="checkbox"
              checked={linkForm.hasConsentAuthority}
              onChange={(event) =>
                setLinkForm({
                  ...linkForm,
                  hasConsentAuthority: event.target.checked,
                })
              }
            />
            Verified consent authority
          </label>
          <button
            className={primary}
            disabled={busy || !linkForm.caregiverId || !linkForm.childId}
          >
            {busy ? "Linking…" : "Link caregiver"}
          </button>
        </form>
      </Modal>
    </main>
  );
}
