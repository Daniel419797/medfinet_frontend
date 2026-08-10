import { type FormEvent, useContext, useState } from "react";
import { EnvelopeSimple, LockKey } from "@phosphor-icons/react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import UserContext from "../../contexts/UserContext";
import { medfinetAuthApi } from "../../services/medfinetAuthApi";

function safeReturnPath(search: string, state: unknown) {
  const queryNext = new URLSearchParams(search).get("next");
  const stateFrom =
    state && typeof state === "object" && "from" in state
      ? (state as { from?: unknown }).from
      : null;
  const candidate =
    queryNext || (typeof stateFrom === "string" ? stateFrom : "");
  return candidate.startsWith("/") && !candidate.startsWith("//")
    ? candidate
    : "/workspace";
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshSession } = useContext(UserContext);
  const [form, setForm] = useState({ email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await medfinetAuthApi.login({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      try {
        await refreshSession();
      } catch {
        setError(
          "You are signed in, but Medfinet could not load your organization access. Retry or contact your administrator.",
        );
        return;
      }
      navigate(safeReturnPath(location.search, location.state), {
        replace: true,
      });
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Sign-in failed. Check your credentials or confirm your email, then try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="p-6 sm:p-8">
      <p className="mf-eyebrow">Secure workspace</p>
      <h1 className="mt-2 text-2xl font-extrabold text-slate-950 dark:text-white">
        Welcome back
      </h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        Enter your verified Medfinet identity credentials.
      </p>
      {error && (
        <div
          role="alert"
          className="mt-5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"
        >
          {error}
        </div>
      )}
      <form className="mt-6 space-y-5" onSubmit={(event) => void submit(event)}>
        <label className="block text-sm font-semibold">
          Email
          <div className="relative mt-1">
            <EnvelopeSimple
              className="absolute left-3 top-3.5 text-slate-400"
              size={17}
            />
            <input
              required
              type="email"
              autoComplete="email"
              className="w-full rounded-lg border py-2.5 pl-10 pr-3"
              value={form.email}
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
            />
          </div>
        </label>
        <label className="block text-sm font-semibold">
          Password
          <div className="relative mt-1">
            <LockKey
              className="absolute left-3 top-3.5 text-slate-400"
              size={17}
            />
            <input
              required
              type="password"
              autoComplete="current-password"
              className="w-full rounded-lg border py-2.5 pl-10 pr-3"
              value={form.password}
              onChange={(event) =>
                setForm({ ...form, password: event.target.value })
              }
            />
          </div>
        </label>
        <div className="text-right">
          <Link
            to="/forgot-password"
            className="text-sm font-bold text-primary-700"
          >
            Forgot password?
          </Link>
        </div>
        <button disabled={busy} className="mf-button-primary w-full">
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">
        Need an identity?{" "}
        <Link to="/register" className="font-bold text-primary-700">
          Create account
        </Link>
      </p>
    </div>
  );
}
