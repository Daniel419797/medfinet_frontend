import { type FormEvent, useState } from "react";
import { CheckCircle, EnvelopeSimple, LockKey, User } from "@phosphor-icons/react";
import { Link, useNavigate } from "react-router-dom";
import { medfinetAuthApi } from "../../services/medfinetAuthApi";

const input =
  "w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    accepted: false,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (form.password.length < 12) {
      setError("Use at least 12 characters for your password.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("The passwords do not match.");
      return;
    }
    if (!form.accepted) {
      setError("You must accept the privacy and acceptable-use notice.");
      return;
    }
    setBusy(true);
    try {
      const result = await medfinetAuthApi.register({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        name: form.name.trim(),
      });
      if (result.accessToken) navigate("/onboarding", { replace: true });
      else setConfirmationSent(true);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to create your account",
      );
    } finally {
      setBusy(false);
    }
  }

  if (confirmationSent)
    return (
      <div className="p-8 text-center">
        <CheckCircle className="mx-auto text-emerald-600" size={48} />
        <h1 className="mt-4 text-2xl font-bold text-slate-950">
          Check your email
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          We sent a secure confirmation link to {form.email}. Confirm the
          address, then continue into organization onboarding.
        </p>
        <Link
          to="/login"
          className="mf-button-primary mt-6"
        >
          Return to sign in
        </Link>
      </div>
    );

  return (
    <div className="p-6 sm:p-8">
      <p className="mf-eyebrow">Create secure identity</p>
      <h1 className="mt-2 text-2xl font-extrabold text-slate-950 dark:text-white">
        Create a Medfinet identity
      </h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        Roles are assigned through verified organization membership—not
        self-selected during registration.
      </p>
      {error && (
        <div
          role="alert"
          className="mt-5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"
        >
          {error}
        </div>
      )}
      <form className="mt-6 space-y-4" onSubmit={(event) => void submit(event)}>
        <Field icon={User} label="Full name">
          <input
            required
            autoComplete="name"
            className={input}
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
        </Field>
        <Field icon={EnvelopeSimple} label="Email">
          <input
            required
            type="email"
            autoComplete="email"
            className={input}
            value={form.email}
            onChange={(event) =>
              setForm({ ...form, email: event.target.value })
            }
          />
        </Field>
        <Field icon={LockKey} label="Password">
          <input
            required
            type="password"
            minLength={12}
            autoComplete="new-password"
            className={input}
            value={form.password}
            onChange={(event) =>
              setForm({ ...form, password: event.target.value })
            }
          />
          <span className="mt-1 block text-xs text-slate-500">
            At least 12 characters. A password manager is recommended.
          </span>
        </Field>
        <Field icon={LockKey} label="Confirm password">
          <input
            required
            type="password"
            minLength={12}
            autoComplete="new-password"
            className={input}
            value={form.confirmPassword}
            onChange={(event) =>
              setForm({ ...form, confirmPassword: event.target.value })
            }
          />
        </Field>
        <label className="flex items-start gap-3 text-sm text-slate-600">
          <input
            required
            type="checkbox"
            className="mt-1"
            checked={form.accepted}
            onChange={(event) =>
              setForm({ ...form, accepted: event.target.checked })
            }
          />
          <span>
            I understand that Medfinet processes health information only under
            organization authorization, purpose limitation and applicable
            privacy policy.
          </span>
        </label>
        <button
          disabled={busy}
          className="mf-button-primary w-full"
        >
          {busy ? "Creating secure identity…" : "Create account"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">
        Already registered?{" "}
        <Link to="/login" className="font-bold text-primary-700">
          Sign in
        </Link>
      </p>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof User;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-semibold text-slate-800">
      {label}
      <div className="relative mt-1">
        <Icon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        {children}
      </div>
    </label>
  );
}
