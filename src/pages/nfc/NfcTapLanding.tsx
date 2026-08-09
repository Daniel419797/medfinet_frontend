import { useEffect, useState } from "react";
import { ShieldCheck, ShieldX, Smartphone } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { medfinetNfcApi } from "../../services/medfinetNfcApi";

type State =
  | { kind: "loading" }
  | {
      kind: "verified";
      message: string;
      status: string;
      scannerRequired: boolean;
      tagWriterDemo: boolean;
    }
  | { kind: "error"; message: string };

export default function NfcTapLanding() {
  const { publicId = "" } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    const fragment = new URLSearchParams(
      window.location.hash.replace(/^#/, ""),
    );
    const uc = fragment.get("uc") || "";
    const token = fragment.get("t") || "";
    window.history.replaceState(null, "", window.location.pathname);
    medfinetNfcApi
      .verifyPublicTap(publicId, uc, token)
      .then((result) =>
        setState({
          kind: "verified",
          message: result.message,
          status: result.status,
          scannerRequired: result.scannerRequired,
          tagWriterDemo: result.assurance === "BASIC_STATIC_NDEF_DEMO",
        }),
      )
      .catch((error: unknown) =>
        setState({
          kind: "error",
          message:
            error instanceof Error ? error.message : "Card verification failed",
        }),
      );
  }, [publicId]);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100">
      <section className="mx-auto max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
            <Smartphone aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium text-cyan-300">Medfinet NFC</p>
            <h1 className="text-2xl font-semibold">Secure child card</h1>
          </div>
        </div>

        {state.kind === "loading" && (
          <div role="status" className="rounded-2xl bg-slate-800 p-5">
            Checking the card status…
          </div>
        )}

        {state.kind === "verified" && (
          <div className="space-y-5">
            <div className="flex gap-3 rounded-2xl border border-emerald-700/50 bg-emerald-950/40 p-5">
              <ShieldCheck className="mt-0.5 shrink-0 text-emerald-300" />
              <div>
                <h2 className="font-semibold text-emerald-200">
                  {state.status === "ACTIVE"
                    ? state.tagWriterDemo
                      ? "Demo card link recognized"
                      : "Card recognized"
                    : `Card ${state.status.toLowerCase()}`}
                </h2>
                <p className="mt-1 text-sm text-emerald-100/80">
                  {state.message}
                </p>
              </div>
            </div>
            <p className="text-sm leading-6 text-slate-300">
              This public page never shows a child’s name or medical record. An
              authorized health worker must use a registered Medfinet Scanner
              before any permitted record can be retrieved.
            </p>
            {state.tagWriterDemo && (
              <p className="rounded-xl border border-amber-500/40 bg-amber-950/40 p-3 text-sm leading-6 text-amber-100">
                Demonstration mode: NXP TagWriter stores a static link that can
                be copied, so this card is not proof that the original physical
                card is present.
              </p>
            )}
            {state.scannerRequired && (
              <button
                type="button"
                onClick={() => navigate("/nfc/scanner")}
                className="block w-full rounded-xl bg-cyan-400 px-4 py-3 text-center font-semibold text-slate-950 hover:bg-cyan-300"
              >
                Open scanner and tap again
              </button>
            )}
            {!state.scannerRequired && (
              <a
                href="/login"
                className="block rounded-xl border border-slate-600 px-4 py-3 text-center font-semibold text-slate-100 hover:bg-slate-800"
              >
                Open Medfinet securely
              </a>
            )}
          </div>
        )}

        {state.kind === "error" && (
          <div className="flex gap-3 rounded-2xl border border-rose-700/50 bg-rose-950/40 p-5">
            <ShieldX className="mt-0.5 shrink-0 text-rose-300" />
            <div>
              <h2 className="font-semibold text-rose-200">Card unavailable</h2>
              <p className="mt-1 text-sm text-rose-100/80">{state.message}</p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
