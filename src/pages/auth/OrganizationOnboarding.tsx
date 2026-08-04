import { useContext, useState } from "react";
import { Buildings, ShieldCheck } from "@phosphor-icons/react";
import { Navigate, useNavigate } from "react-router-dom";
import UserContext from "../../contexts/UserContext";
import { medfinetSessionApi } from "../../services/medfinetSessionApi";

export default function OrganizationOnboarding() {
  const { user, memberships, refreshSession, logout } = useContext(UserContext);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (memberships.length) {
    return <Navigate to="/workspace" replace />;
  }

  async function submit(event: React.FormEvent) {
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

  return (
    <main className="grid min-h-screen bg-[#f7f9fb] lg:grid-cols-[.78fr_1.22fr]">
      <aside className="hidden bg-[#071d38] p-10 text-white lg:flex lg:flex-col">
        <div className="flex items-center gap-3 font-extrabold"><span className="grid h-10 w-10 place-items-center rounded-xl border border-primary-400/40 bg-primary-500/15 text-primary-200"><ShieldCheck size={24} /></span>Medfinet</div>
        <div className="my-auto max-w-md"><p className="text-xs font-bold uppercase tracking-[.16em] text-primary-300">Organization setup</p><h2 className="mt-4 text-4xl font-extrabold text-white">Create the secure boundary for your team.</h2><p className="mt-5 text-slate-300">Your organization separates membership, records, facilities, programmes and audit evidence from every other Medfinet tenant.</p></div>
      </aside>
      <section className="grid place-items-center p-4 sm:p-8">
      <form onSubmit={submit} className="w-full max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.08)] sm:p-8">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary-50 text-primary-700"><Buildings size={25} /></span>
        <p className="mf-eyebrow mt-5">
          Welcome, {user?.name}
        </p>
        <h1 className="mt-2 text-2xl font-extrabold text-slate-950">
          Create your Medfinet organization
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          You do not currently have an active organization membership.
        </p>
        {error && (
          <div
            role="alert"
            className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}
        <label className="mt-6 block text-sm font-medium text-slate-700">
          Organization name
          <input
            required
            maxLength={120}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="mt-4 block text-sm font-medium text-slate-700">
          URL identifier
          <input
            required
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            placeholder="central-clinic"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        <button
          disabled={busy}
          className="mf-button-primary mt-6 w-full"
        >
          {busy ? "Creating…" : "Create organization"}
        </button>
        <button
          type="button"
          onClick={() => void logout()}
          className="mf-button-secondary mt-3 w-full"
        >
          Sign out
        </button>
      </form></section>
    </main>
  );
}
