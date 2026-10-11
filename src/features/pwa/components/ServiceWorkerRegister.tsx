"use client";

import { useEffect } from "react";
import { setDeferredPrompt, type BeforeInstallPromptEvent } from "../install-prompt-store";

// Monta en todo /admin: captura el aviso de instalación y registra el service worker.
// El service worker solo se registra en producción para no estorbar la recarga en caliente.
export function ServiceWorkerRegister() {
  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setDeferredPrompt(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      // Alcance "/" porque start_url es /admin; el SW solo intercepta navegaciones de /admin.
      navigator.serviceWorker
        .register("/sw.js", { scope: "/", updateViaCache: "none" })
        .catch((err) => console.error("No se pudo registrar el service worker", err));
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  return null;
}
