import { type FormEvent, useState } from "react";
import { Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { medfinetAuthApi } from "../../services/medfinetAuthApi";

export default function PasswordReset() {
  const [form, setForm] = useState({ password: "", confirmation: "" });
  const [busy, setBusy] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (form.password.length < 12) {
      setError("Use at least 12 characters.");
      return;
    }
    if (form.password !== form.confirmation) {
      setError("The passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await medfinetAuthApi.resetPassword(form.password);
      setComplete(true);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to update password. The recovery link may have expired.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="p-8">
      {complete ? (
        <div className="text-center">
          <h1 className="text-2xl font-bold">Password updated</h1>
          <p className="mt-2 text-sm text-slate-600">
            Your new password is active.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-block rounded-lg bg-cyan-700 px-4 py-2.5 font-semibold text-white"
          >
            Continue to sign in
          </Link>
        </div>
      ) : (
        <>
          <h1 className="text-center text-2xl font-bold">Set a new password</h1>
          {error && (
            <div
              role="alert"
              className="mt-5 rounded-lg bg-rose-50 p-3 text-sm text-rose-800"
            >
              {error}
            </div>
          )}
          <form
            className="mt-6 space-y-5"
            onSubmit={(event) => void submit(event)}
          >
            {(["password", "confirmation"] as const).map((field) => (
              <label key={field} className="block text-sm font-semibold">
                {field === "password" ? "New password" : "Confirm new password"}
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    required
                    type="password"
                    minLength={12}
                    autoComplete="new-password"
                    className="w-full rounded-lg border py-2.5 pl-10 pr-3"
                    value={form[field]}
                    onChange={(event) =>
                      setForm({ ...form, [field]: event.target.value })
                    }
                  />
                </div>
              </label>
            ))}
            <button
              disabled={busy}
              className="w-full rounded-lg bg-cyan-700 px-4 py-2.5 font-semibold text-white disabled:opacity-50"
            >
              {busy ? "Updating…" : "Update password"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
