import { useContext, useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileHeart,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  ShieldX,
  Smartphone,
  Syringe,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  medfinetNfcApi,
  type NfcScanResult,
} from "../../services/medfinetNfcApi";
import UserContext from "../../contexts/UserContext";
import {
  devicePublicKeyPem,
  scannerPayload,
  signNfcPayload,
  stableDeviceIdentifier,
} from "../../services/nfcDeviceKeyStore";

type TapCard = {
  publicId: string;
  cardToken: string;
  uc: string;
  scanMode: "PWA_NDEF" | "TAGWRITER_NDEF";
};

type State =
  | { kind: "loading" }
  | {
      kind: "verified";
      message: string;
      status: string;
      scannerRequired: boolean;
      staticNdef: boolean;
    }
  | { kind: "resolving" }
  | { kind: "resolved"; result: NfcScanResult }
  | { kind: "error"; message: string };

export default function NfcTapLanding() {
  const { publicId = "" } = useParams();
  const navigate = useNavigate();
  const { user, organizationId, sessionReady } = useContext(UserContext);
  const [card, setCard] = useState<TapCard | null>(null);
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    const fragment = new URLSearchParams(
      window.location.hash.replace(/^#/, ""),
    );
    const uc = fragment.get("uc") || "";
    const token = fragment.get("t") || "";
    const currentCard: TapCard = {
      publicId,
      cardToken: token,
      uc,
      scanMode: uc ? "PWA_NDEF" : "TAGWRITER_NDEF",
    };

    setCard(currentCard);
    window.history.replaceState(null, "", window.location.pathname);

    medfinetNfcApi
      .verifyPublicTap(publicId, uc, token)
      .then((result) =>
        setState({
          kind: "verified",
          message: result.message,
          status: result.status,
          scannerRequired: result.scannerRequired,
          staticNdef:
            result.hardwareFamily === "NTAG_215_TAGWRITER_DEMO" ||
            result.assurance === "BASIC_STATIC_NDEF_DEMO",
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

  useEffect(() => {
    if (
      state.kind !== "verified" ||
      state.status !== "ACTIVE" ||
      !state.staticNdef ||
      !state.scannerRequired ||
      !sessionReady ||
      !user ||
      !organizationId ||
      !card
    ) {
      return;
    }

    setState({ kind: "resolving" });
    void (async () => {
      try {
        let deviceId =
          localStorage.getItem("medfinet.nfc.device-record-id") || "";
        if (!deviceId) {
          const registration = await medfinetNfcApi.registerDevice(
            organizationId,
            {
              deviceIdentifier: stableDeviceIdentifier(),
              displayName: `NFC Web · ${navigator.platform || "Browser"}`,
              platform: "Web NFC",
              appVersion: "1.0.0",
              publicKey: await devicePublicKeyPem(),
            },
          );
          deviceId = registration.device.id;
          localStorage.setItem("medfinet.nfc.device-record-id", deviceId);
        }

        const challenge = await medfinetNfcApi.createChallenge(
          card.publicId,
          deviceId,
        );
        const payload = scannerPayload({
          ...card,
          challengeToken: challenge.challengeToken,
        });
        const deviceSignature = await signNfcPayload(payload);
        const result = await medfinetNfcApi.resolveScan({
          ...card,
          challengeToken: challenge.challengeToken,
          deviceSignature,
        });
        setState({ kind: "resolved", result });
      } catch (error) {
        setState({
          kind: "error",
          message:
            error instanceof Error
              ? error.message
              : "Could not open the permitted child record",
        });
      }
    })();
  }, [card, organizationId, sessionReady, state, user]);

  const resolved = state.kind === "resolved" ? state.result : null;
  const clinicalAllowed =
    resolved?.clinicalSummary.clinicalAccess === "ALLOWED";
  const childBase = resolved
    ? `/health-worker/nfc/children/${resolved.child.id}`
    : "";

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:py-12">
      <section className="mx-auto max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
            <Smartphone aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium text-cyan-300">Medfinet NFC</p>
            <h1 className="text-2xl font-semibold">Secure child card</h1>
          </div>
        </div>

        {(state.kind === "loading" ||
          state.kind === "resolving" ||
          (state.kind === "verified" && !sessionReady)) && (
          <div
            role="status"
            className="flex items-center gap-3 rounded-2xl bg-slate-800 p-5"
          >
            <Loader2 className="animate-spin text-cyan-300" />
            <span>
              {state.kind === "resolving"
                ? "Authenticating this card and loading permitted records…"
                : state.kind === "verified"
                  ? "Restoring your secure Medfinet session…"
                  : "Checking the card status…"}
            </span>
          </div>
        )}

        {state.kind === "verified" && sessionReady && (
          <div className="space-y-5">
            <div className="flex gap-3 rounded-2xl border border-emerald-700/50 bg-emerald-950/40 p-5">
              <ShieldCheck className="mt-0.5 shrink-0 text-emerald-300" />
              <div>
                <h2 className="font-semibold text-emerald-200">
                  {state.status === "ACTIVE"
                    ? "Card recognized"
                    : `Card ${state.status.toLowerCase()}`}
                </h2>
                <p className="mt-1 text-sm text-emerald-100/80">
                  {state.message}
                </p>
              </div>
            </div>

            {state.status === "ACTIVE" && !user && (
              <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-5">
                <p className="text-sm leading-6 text-slate-300">
                  Sign in with an authorized Medfinet account, then tap the card
                  again. Child and clinical information is never returned from
                  the public NFC link.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="mt-4 w-full rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 hover:bg-cyan-300"
                >
                  Sign in to Medfinet
                </button>
              </div>
            )}

            {state.status === "ACTIVE" && user && !state.staticNdef && (
              <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-5">
                <p className="text-sm leading-6 text-slate-300">
                  This protected card requires the secure scanner to verify its
                  chip UID and counter before records can be opened.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/health-worker/nfc")}
                  className="mt-4 w-full rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 hover:bg-cyan-300"
                >
                  Open secure scanner
                </button>
              </div>
            )}
          </div>
        )}

        {resolved && (
          <div className="space-y-5">
            <div className="flex gap-3 rounded-2xl border border-emerald-700/50 bg-emerald-950/40 p-5">
              <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-300" />
              <div>
                <h2 className="font-semibold text-emerald-200">
                  Authenticated NFC access
                </h2>
                <p className="mt-1 text-sm text-emerald-100/80">
                  Your account, organization, registered browser key, card token
                  and card lifecycle were verified before these records were
                  returned.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white">
                {clinicalAllowed
                  ? `${resolved.child.firstName || ""} ${resolved.child.lastName || ""}`.trim()
                  : "Identity hidden until consent"}
              </h2>
              {clinicalAllowed && resolved.child.medfinetId && (
                <p className="mt-1 text-sm text-slate-400">
                  Child ID: {resolved.child.medfinetId}
                </p>
              )}
            </div>

            {clinicalAllowed &&
              resolved.clinicalSummary.allergies.length > 0 && (
                <div className="rounded-2xl border border-amber-500/40 bg-amber-950/40 p-4">
                  <p className="flex items-center gap-2 font-semibold text-amber-200">
                    <AlertTriangle size={18} /> Active allergies
                  </p>
                  <p className="mt-2 text-sm text-amber-100">
                    {resolved.clinicalSummary.allergies
                      .map((item) => item.substanceDisplay)
                      .join(", ")}
                  </p>
                </div>
              )}

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Recorded doses
                </p>
                <p className="mt-1 text-xl font-bold text-white">
                  {clinicalAllowed
                    ? resolved.clinicalSummary.vaccination.recordedDoses
                    : "—"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Due / overdue
                </p>
                <p className="mt-1 text-xl font-bold text-white">
                  {clinicalAllowed
                    ? `${resolved.clinicalSummary.vaccination.dueCount} / ${resolved.clinicalSummary.vaccination.overdueCount}`
                    : "—"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Consent
                </p>
                <p className="mt-1 text-xl font-bold text-white">
                  {resolved.clinicalSummary.consent.status === "GRANTED"
                    ? "Granted"
                    : "Required"}
                </p>
              </div>
            </div>

            {!clinicalAllowed && (
              <div className="rounded-2xl border border-amber-500/40 bg-amber-950/40 p-4 text-sm leading-6 text-amber-100">
                Routine clinical details are hidden because Medfinet did not find
                an applicable active consent. Record or verify consent before
                routine care, or use the audited emergency workflow when
                clinically justified.
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              {clinicalAllowed && (
                <>
                  <Link
                    to={`${childBase}/clinical`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 hover:bg-cyan-300"
                  >
                    <FileHeart size={18} /> Vaccinations &amp; certificates
                  </Link>
                  <Link
                    to={`${childBase}/vaccination`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-400/50 px-4 py-3 font-semibold text-cyan-200 hover:bg-cyan-400/10"
                  >
                    <Syringe size={18} /> Record vaccination
                  </Link>
                </>
              )}
              <Link
                to={`${childBase}/emergency`}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-500/50 px-4 py-3 font-semibold text-rose-200 hover:bg-rose-500/10"
              >
                <LockKeyhole size={18} /> Emergency access
              </Link>
            </div>

            <p className="text-xs leading-5 text-slate-400">
              Standard static NFC links are permission checked and audited, but
              the link itself can be copied and does not prove chip originality.
              Use protected NTAG215 provisioning where chip-level anti-cloning
              assurance is required.
            </p>
          </div>
        )}

        {state.kind === "error" && (
          <div className="flex gap-3 rounded-2xl border border-rose-700/50 bg-rose-950/40 p-5">
            <ShieldX className="mt-0.5 shrink-0 text-rose-300" />
            <div>
              <h2 className="font-semibold text-rose-200">
                Card access unavailable
              </h2>
              <p className="mt-1 text-sm text-rose-100/80">{state.message}</p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
