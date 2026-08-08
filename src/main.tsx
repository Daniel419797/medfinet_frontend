import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "@fontsource-variable/manrope";
import "./index.css";

function renderStartupFailure() {
  const root = document.getElementById("root");
  if (!root) return;

  root.innerHTML = `
    <main style="min-height:100vh;display:grid;place-items:center;background:#f8fafc;padding:24px;font-family:Manrope,system-ui,sans-serif;color:#0f172a">
      <section style="width:min(100%,560px);border:1px solid #cbd5e1;background:white;padding:32px">
        <p style="margin:0;font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#0e7490">Medfinet startup error</p>
        <h1 style="margin:12px 0 0;font-size:28px;line-height:1.2">The application could not start.</h1>
        <p style="margin:14px 0 0;line-height:1.7;color:#475569">Refresh the page to load the latest deployment. If the problem continues, the deployment needs investigation.</p>
        <button id="medfinet-reload" type="button" style="margin-top:22px;border:0;background:#0e7490;color:white;padding:11px 16px;font:inherit;font-size:14px;font-weight:800;cursor:pointer">Reload application</button>
      </section>
    </main>
  `;
  document
    .getElementById("medfinet-reload")
    ?.addEventListener("click", () => window.location.reload());
}

async function bootstrap() {
  const nfcSurface = window.location.pathname.startsWith("/nfc/");
  const module = nfcSurface ? await import("./NfcApp") : await import("./App");
  const Root = module.default;
  const rootElement = document.getElementById("root");
  if (!rootElement) throw new Error("Missing application root element");

  createRoot(rootElement).render(
    <StrictMode>
      <BrowserRouter>
        <Root />
      </BrowserRouter>
    </StrictMode>,
  );
}

void bootstrap().catch((error: unknown) => {
  console.error("Medfinet failed to bootstrap", error);
  renderStartupFailure();
});

async function configureNfcServiceWorker() {
  if (!("serviceWorker" in navigator) || !import.meta.env.PROD) return;

  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(
    registrations.map(async (registration) => {
      const worker =
        registration.active || registration.waiting || registration.installing;
      const isMedfinetNfcWorker = worker?.scriptURL.endsWith(
        "/nfc-service-worker.js",
      );
      const isLegacyRootScope = new URL(registration.scope).pathname === "/";
      if (isMedfinetNfcWorker && isLegacyRootScope) {
        await registration.unregister();
      }
    }),
  );

  if (window.location.pathname.startsWith("/nfc/")) {
    await navigator.serviceWorker.register("/nfc-service-worker.js", {
      scope: "/nfc/",
    });
  }
}

window.addEventListener("load", () => {
  void configureNfcServiceWorker().catch((error: unknown) => {
    console.warn("Unable to configure NFC offline support", error);
  });
});
