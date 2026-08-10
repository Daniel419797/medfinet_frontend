import { useContext, useState } from "react";
import {
  Building2,
  CheckCircle2,
  ClipboardCopy,
  LogOut,
  Plus,
  RefreshCw,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import UserContext from "../../contexts/UserContext";
import { medfinetSessionApi } from "../../services/medfinetSessionApi";

export default function OrganizationOnboarding() {
  const { user, memberships, refreshSession, logout } = useContext(UserContext);
  const navigate = useNavigate();
  const [showCreateOrganization, setShowCreateOrganization] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  if (memberships.length) {
    return <Navigate to="/workspace" replace />;
  }

  async function checkAccess() {
    setChecking(true);
    setError("");
    try {
      await refreshSession();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to check organization access",
      );
    } finally {
      setChecking(false);
    }
  }

  async function copyAccountId() {
    if (!user?.id) return;
    try {
      await navigator.clipboard.writeText(user.id);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Your browser could not copy the account ID. Select it manually below.");
    }
  }

  async function createOrganization(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await medfinetSessionApi.createOrganization({
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
      });
      await refreshSession();
      navigate("/workspace", { replace: true });
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to create the organization",
      );
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <main className="min-h-screen bg-[#f7f9fb] text-slate-900 lg:grid lg:grid-cols-[.72fr_1.28fr]">
      <aside className="hidden bg-[#071d38] p-10 text-white lg:flex lg:flex-col">
        <div className="flex items-center gap-3 font-extrabold">
          <span className="grid h-10 w-10 place-items-center rounded-xl border border-primary-400/40 bg-primary-500/15 text-primary-200">
            <ShieldCheck size={24} />
          </span>
          Medfinet
        </div>
        <div className="my-auto max-w-md">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-primary-300">
            Verified identity
          </p>
          <h2 className="mt-4 text-4xl font-extrabold leading-tight text-white">
            Your account is ready. Access comes from an organization.
          </h2>
          <p className="mt-5 leading-7 text-slate-300">
            Medfinet keeps health, identity and operational data inside secure
            organization boundaries. A verified account does not receive a
            clinical or administrative role automatically.
          </p>
        </div>
      </aside>

      <section className="grid place-items-center p-4 sm:p-8">
        <div className="w-full max-w-2xl space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.08)] sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                  <CheckCircle2 size={15} /> Account verified
                </span>
                <h1 className="mt-4 text-2xl font-extrabold text-slate-950 sm:text-3xl">
                  Waiting for organization access
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                  You are signed in, but no active Medfinet organization has
                  assigned this account a role yet. You will not see clinical,
                  family, merchant or administration data until that happens.
                </p>
              </div>
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-700">
                <UserRoundCheck size={25} />
              </span>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"
              >
                {error}
              </div>
            )}

            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[.12em] text-slate-500">
                Give this account ID to your Medfinet administrator
              </p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                <code className="min-w-0 flex-1 break-all rounded-lg bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 ring-1 ring-slate-200">
                  {user?.id || "Account ID unavailable"}
                </code>
                <button
                  type="button"
                  onClick={() => void copyAccountId()}
                  disabled={!user?.id}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 disabled:opacity-50"
                >
                  <ClipboardCopy size={17} />
                  {copied ? "Copied" : "Copy ID"}
                </button>
              </div>
              {user?.email && (
                <p className="mt-3 text-xs text-slate-500">
                  Signed in as <span className="font-semibold">{user.email}</span>
                </p>
              )}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => void checkAccess()}
                disabled={checking}
                className="mf-button-primary w-full"
              >
                <RefreshCw
                  className={`mr-2 inline h-4 w-4 ${checking ? "animate-spin" : ""}`}
                />
                {checking ? "Checking access…" : "Check for access"}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateOrganization((current) => !current)}
                className="mf-button-secondary w-full"
              >
                <Plus className="mr-2 inline h-4 w-4" />
                {showCreateOrganization
                  ? "Hide organization setup"
                  : "Create a new organization"}
              </button>
            </div>

            <p className="mt-4 text-xs leading-5 text-slate-500">
              If an administrator has just assigned your role, choose
              <strong> Check for access</strong>. You can also sign out and sign
              back in. Creating an organization is optional and is intended only
              for someone starting a new Medfinet tenant.
            </p>
          </section>

          {showCreateOrganization && (
            <section className="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-700">
                  <Building2 size={23} />
                </span>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-950">
                    Start a new Medfinet organization
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Use this only if you are responsible for creating a new
                    organization. The account that creates it becomes its
                    <strong> OWNER</strong> automatically.
                  </p>
                </div>
              </div>

              <form onSubmit={(event) => void createOrganization(event)} className="mt-6">
                <label className="block text-sm font-semibold text-slate-700">
                  Organization name
                  <input
                    required
                    maxLength={120}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5"
                  />
                </label>
                <label className="mt-4 block text-sm font-semibold text-slate-700">
                  URL identifier
                  <input
                    required
                    pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                    value={slug}
                    onChange={(event) => setSlug(event.target.value)}
                    placeholder="central-clinic"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5"
                  />
                </label>
                <button disabled={busy} className="mf-button-primary mt-6 w-full">
                  <Building2 className="mr-2 inline h-4 w-4" />
                  {busy ? "Creating organization…" : "Create organization and become owner"}
                </button>
              </form>
            </section>
          )}

          <button
            type="button"
            onClick={() => void signOut()}
            className="mx-auto flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-800"
          >
            <LogOut size={17} /> Sign out
          </button>
        </div>
      </section>
    </main>
  );
}
