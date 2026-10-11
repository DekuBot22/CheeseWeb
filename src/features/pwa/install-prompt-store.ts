// Guarda el aviso de instalación del navegador (`beforeinstallprompt`, solo Android/Chrome).
// El evento puede dispararse ANTES de que el usuario llegue a Ajustes, así que lo
// captura el registro del service worker (montado en todo /admin) y la tarjeta
// de instalación lo lee de aquí con useSyncExternalStore.

export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferred: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function setDeferredPrompt(event: BeforeInstallPromptEvent | null) {
  deferred = event;
  emit();
}

export function subscribePrompt(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const getPromptSnapshot = () => deferred;
export const getPromptServerSnapshot = () => null;

// Muestra el diálogo nativo de instalación. El evento solo sirve una vez.
export async function promptInstall(): Promise<"accepted" | "dismissed" | "unavailable"> {
  if (!deferred) return "unavailable";
  const event = deferred;
  await event.prompt();
  const { outcome } = await event.userChoice;
  setDeferredPrompt(null);
  return outcome;
}
