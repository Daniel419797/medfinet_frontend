import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "@fontsource-variable/manrope";
import "./index.css";

async function bootstrap() {
  const nfcSurface = window.location.pathname.startsWith("/nfc/");
  const module = nfcSurface ? await import("./NfcApp") : await import("./App");
  const Root = module.default;
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <BrowserRouter>
        <Root />
      </BrowserRouter>
    </StrictMode>,
  );
}

void bootstrap();

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/nfc-service-worker.js", {
      scope: "/",
    });
  });
}
