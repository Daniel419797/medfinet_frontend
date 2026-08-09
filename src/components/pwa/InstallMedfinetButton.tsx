import { CheckCircle2, Download, MoreVertical, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Modal } from "../common/Modal";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  const iosNavigator = navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    iosNavigator.standalone === true
  );
}

export function InstallMedfinetButton({
  className = "rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white",
}: {
  className?: string;
}) {
  const [promptEvent, setPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(isStandalone);
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const capturePrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };
    const confirmInstallation = () => {
      setInstalled(true);
      setPromptEvent(null);
      setMessage("Medfinet was installed successfully.");
    };

    window.addEventListener("beforeinstallprompt", capturePrompt);
    window.addEventListener("appinstalled", confirmInstallation);
    return () => {
      window.removeEventListener("beforeinstallprompt", capturePrompt);
      window.removeEventListener("appinstalled", confirmInstallation);
    };
  }, []);

  async function install() {
    setMessage("");
    if (!promptEvent) {
      setInstructionsOpen(true);
      return;
    }

    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    setPromptEvent(null);
    if (choice.outcome === "dismissed") {
      setMessage("Installation was cancelled. You can try again at any time.");
    }
  }

  if (installed) {
    return (
      <a className={className} href="/nfc/scanner">
        <CheckCircle2 aria-hidden="true" size={17} /> Open NFC scanner
      </a>
    );
  }

  return (
    <>
      <button type="button" className={className} onClick={() => void install()}>
        <Download aria-hidden="true" size={17} /> Install Medfinet
      </button>
      <span className="sr-only" aria-live="polite">
        {message}
      </span>
      <Modal
        open={instructionsOpen}
        onClose={() => setInstructionsOpen(false)}
        title="Install Medfinet"
        description="Install the NFC field app from your browser and open it from your home screen."
      >
        <div className="space-y-4 text-sm leading-6 text-slate-700">
          <div className="rounded-xl bg-cyan-50 p-4 text-cyan-950">
            The NFC scanner is intended for Chrome on an NFC-enabled Android
            device. Install prompts are only available over HTTPS in a supported
            browser.
          </div>
          <ol className="space-y-3">
            <li className="flex gap-3">
              <MoreVertical className="mt-0.5 shrink-0" size={19} />
              <span>
                <strong>Android Chrome:</strong> open the browser menu and choose
                <em> Install app</em> or <em>Add to Home screen</em>.
              </span>
            </li>
            <li className="flex gap-3">
              <Download className="mt-0.5 shrink-0" size={19} />
              <span>
                <strong>Chrome or Edge desktop:</strong> select the install icon
                in the address bar.
              </span>
            </li>
            <li className="flex gap-3">
              <Share2 className="mt-0.5 shrink-0" size={19} />
              <span>
                <strong>iPhone or iPad:</strong> use Share, then Add to Home
                Screen. Web NFC scanning is not available in this mode.
              </span>
            </li>
          </ol>
          <button
            type="button"
            className="mf-button-secondary w-full"
            onClick={() => setInstructionsOpen(false)}
          >
            Done
          </button>
        </div>
      </Modal>
    </>
  );
}
