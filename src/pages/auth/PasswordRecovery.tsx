import { type FormEvent, useState } from "react";
import { CheckCircle2, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { medfinetAuthApi } from "../../services/medfinetAuthApi";

export default function PasswordRecovery() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await medfinetAuthApi.recoverPassword(
        email.trim().toLowerCase(),
        `${window.location.origin}/reset-password`,
      );
      setSent(true);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to request password recovery",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="p-8">
      {sent ? (
        <div className="text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
          <h1 className="mt-4 text-2xl font-bold">Check your email</h1>
          <p className="mt-2 text-sm text-slate-600">
            If the address belongs to a Medfinet identity, a time-limited
            recovery link has been sent.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-block font-semibold text-cyan-700"
          >
            Return to sign in
          </Link>
        </div>
      ) : (
        <>
          <h1 className="text-center text-2xl font-bold">Recover password</h1>
          <p className="mt-2 text-center text-sm text-slate-600">
            Request a time-limited recovery link.
          </p>
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
            <label className="block text-sm font-semibold">
              Email
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  required
                  type="email"
                  autoComplete="email"
                  className="w-full rounded-lg border py-2.5 pl-10 pr-3"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
            </label>
            <button
              disabled={busy}
              className="w-full rounded-lg bg-cyan-700 px-4 py-2.5 font-semibold text-white disabled:opacity-50"
            >
              {busy ? "Requesting…" : "Send recovery link"}
            </button>
          </form>
          <p className="mt-6 text-center">
            <Link to="/login" className="text-sm font-semibold text-cyan-700">
              Back to sign in
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
