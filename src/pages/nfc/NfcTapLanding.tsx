import { useContext, useEffect, useState } from "react";
import {
  Loader2,
  LockKeyhole,
  ShieldCheck,
  ShieldX,
  Smartphone,
  Syringe,
} from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { medfinetNfcApi } from "../../services/medfinetNfcApi";
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

type StoredTapCard = TapCard & { savedAt: number };

type State =
  | { kind: "loading" }
  | { kind: "verified"; message: string; status: string }
  | { kind: "resolving" }
  | { kind: "error"; message: string };

const TAP_CACHE_TTL_MS = 15 * 60 * 1000;
const VACCINE_ACCESS_QUERY = "vaccines";

function tapCacheKey(publicId: string) {
  return `medfinet.nfc.pending-tap.${publicId}`;
}

function readTapCard(publicId: string): TapCard | null {
  const fragment = new URLSearchParams(
    window.location.hash.replace(/^#/, ""),
  );
  const token = fragment.get("t") || "";
  const uc = fragment.get("uc") || "";

  if (token) {
    const card: TapCard = {
      publicId,
      cardToken: token,
      uc,
      scanMode: uc ? "PWA_NDEF" : "TAGWRITER_NDEF",
    };
    try {
      sessionStorage.setItem(
        tapCacheKey(publicId),
        JSON.stringify({ ...card, savedAt: Date.now() } satisfies StoredTapCard),
      );
    } catch {
      // The current tap can still continue when browser session storage is blocked.
    }

    // Keep the opaque card credential out of browser history and shared URLs.
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${window.location.search}`,
    );
    return card;
  }

  try {
    const raw = sessionStorage.getItem(tapCacheKey(publicId));
    if (!raw) return null;
    const stored = JSON.parse(raw) as StoredTapCard;
    if (
      stored.publicId !== publicId ||
      !stored.cardToken ||
      Date.now() - stored.savedAt > TAP_CACHE_TTL_MS
    ) {
      sessionStorage.removeItem(tapCacheKey(publicId));
      return null;
    }
    return {
      publicId: stored.publicId,
      cardToken: stored.cardToken,
      uc: stored.uc || "",
      scanMode: stored.uc ? "PWA_NDEF" : "TAGWRITER_NDEF",
    };
  } catch {
    return null;
  }
}

export default function NfcTapLanding() {
  const { publicId = "" } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    user,
    sessionReady,
    setOrganizationId,
  } = useContext(UserContext);
  const [card, setCard] = useState<TapCard | null>(null);
  const [state, setState] = useState<State>({ kind: "loading" });

  const requestedAccess =
    new URLSearchParams(location.search).get("access") === VACCINE_ACCESS_QUERY;

  useEffect(() => {
    let active = true;
    let requestNumber = 0;

    const recognizeCurrentTap = async () => {
      const currentRequest = ++requestNumber;
      const currentCard = readTapCard(publicId);
      if (!currentCard) {
        if (active) {
          setCard(null);
          setState({
            kind: "error",
            message:
              "The secure card token was not received. Tap the NFC card again to continue.",
          });
        }
        return;
      }

      setCard(currentCard);
      setState({ kind: "loading" });
      try {
        const result = await medfinetNfcApi.verifyPublicTap(
          publicId,
          currentCard.uc,
          currentCard.cardToken,
        );
        if (!active || currentRequest !== requestNumber) return;
        setState({
          kind: "verified",
          message: result.message,
          status: result.status,
        });
      } catch (error) {
        if (!active || currentRequest !== requestNumber) return;
        setState({
          kind: "error",
          message:
            error instanceof Error ? error.message : "Card verification failed",
        });
      }
    };

    void recognizeCurrentTap();
    const onHashChange = () => void recognizeCurrentTap();
    window.addEventListener("hashchange", onHashChange);
    return () => {
      active = false;
      window.removeEventListener("hashchange", onHashChange);
    };
  }, [publicId]);

  useEffect(() => {
    if (!requestedAccess || !sessionReady || state.kind !== "verified") return;

    if (!user) {
      const next = `/nfc/tap/${encodeURIComponent(publicId)}?access=${VACCINE_ACCESS_QUERY}`;
      navigate(`/login?next=${encodeURIComponent(next)}`, { replace: true });
      return;
    }

    if (state.status !== "ACTIVE" || !card) return;

    setState({ kind: "resolving" });
    void (async () => {
      try {
        const challenge = await medfinetNfcApi.createChallenge(card.publicId, {
          deviceIdentifier: `${stableDeviceIdentifier()}:${user.id}`,
          displayName: `NFC PWA · ${navigator.platform || "Browser"}`,
          platform: "Web NFC PWA",
          appVersion: "1.0.0",
          publicKey: await devicePublicKeyPem(),
        });
        const payload = scannerPayload({
          ...card,
          challengeToken: challenge.challengeToken,
        });
        const deviceSignature = await signNfcPayload(payload);
        const result = await medfinetNfcApi.resolveScan({
          ...card,
          challengeToken: challenge.challengeToken,
          deviceSignature,
          accessIntent: "IMMUNIZATION_CERTIFICATES",
        });

        if (result.clinicalSummary.clinicalAccess !== "ALLOWED") {
          setState({
            kind: "error",
            message:
              "Your account is signed in, but the required vaccination disclosure consent is not available for this card.",
          });
          return;
        }

        setOrganizationId(result.organizationId);
        const childName = `${result.child.firstName || ""} ${result.child.lastName || ""}`.trim();
        navigate(`/nfc/tap/${encodeURIComponent(publicId)}/vaccines`, {
          replace: true,
          state: {
            organizationId: result.organizationId,
            childId: result.child.id,
            childName: childName || undefined,
            immunizations: result.clinicalSummary.vaccination.records || [],
          },
        });
      } catch (error) {
        setState({
          kind: "error",
          message:
            error instanceof Error
              ? error.message
              : "Could not open the permitted vaccination records",
        });
      }
    })();
  }, [
    card,
    navigate,
    publicId,
    requestedAccess,
    sessionReady,
    setOrganizationId,
    state,
    user,
  ]);

  function requestVaccinationAccess() {
    const next = `/nfc/tap/${encodeURIComponent(publicId)}?access=${VACCINE_ACCESS_QUERY}`;
    navigate(`/login?next=${encodeURIComponent(next)}`);
  }

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

        {(state.kind === "loading" || state.kind === "resolving") && (
          <div
            role="status"
            className="flex items-center gap-3 rounded-2xl bg-slate-800 p-5"
          >
            <Loader2 className="animate-spin text-cyan-300" />
            <span>
              {state.kind === "resolving"
                ? "Verifying your credentials and opening vaccination records…"
                : "Checking the card status…"}
            </span>
          </div>
        )}

        {state.kind === "verified" && (
          <div className="space-y-5">
            <div className="flex gap-3 rounded-2xl border border-emerald-700/50 bg-emerald-950/40 p-5">
              <ShieldCheck className="mt-0.5 shrink-0 text-emerald-300" />
              <div>
                <h2 className="font-semibold text-emerald-200">
                  {state.status === "ACTIVE"
                    ? "Card recognized"
                    : `Card ${state.status.toLowerCase()}`}
                </h2>
                <p className="mt-1 text-sm leading-6 text-emerald-100/80">
                  {state.message}
                </p>
              </div>
            </div>

            {state.status === "ACTIVE" && !requestedAccess && (
              <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-5">
                <div className="flex items-start gap-3">
                  <LockKeyhole className="mt-0.5 shrink-0 text-cyan-300" />
                  <div>
                    <h2 className="font-semibold text-white">
                      Vaccination records are protected
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-slate-300">
                      Anyone can tap and verify that this is an active Medfinet
                      card. Vaccines and certificates only appear after you
                      choose to view them and sign in with an authorized account.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={requestVaccinationAccess}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 hover:bg-cyan-300"
                >
                  <Syringe size={18} /> View vaccines &amp; certificates
                </button>
              </div>
            )}

            {state.status !== "ACTIVE" && (
              <p className="rounded-2xl border border-slate-700 bg-slate-800/70 p-4 text-sm leading-6 text-slate-300">
                Protected records cannot be opened from an inactive card.
              </p>
            )}
          </div>
        )}

        {state.kind === "error" && (
          <div className="flex gap-3 rounded-2xl border border-rose-700/50 bg-rose-950/40 p-5">
            <ShieldX className="mt-0.5 shrink-0 text-rose-300" />
            <div>
              <h2 className="font-semibold text-rose-200">
                Card access unavailable
              </h2>
              <p className="mt-1 text-sm leading-6 text-rose-100/80">
                {state.message}
              </p>
              <button
                type="button"
                onClick={() => navigate(`/nfc/tap/${encodeURIComponent(publicId)}`, { replace: true })}
                className="mt-4 rounded-xl border border-rose-300/40 px-4 py-2.5 text-sm font-semibold text-rose-100 hover:bg-rose-500/10"
              >
                Back to card
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
