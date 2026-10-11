"use client";

import { useSyncExternalStore } from "react";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Card, CardBody, CardHeader } from "@/ui/Card";
import {
  getPromptServerSnapshot,
  getPromptSnapshot,
  promptInstall,
  subscribePrompt,
} from "../install-prompt-store";
import { detectPlatform, type Platform } from "../platform";

const noopSubscribe = () => () => {};

function subscribeStandalone(onChange: () => void) {
  const media = window.matchMedia("(display-mode: standalone)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

// iOS usa `navigator.standalone`; el resto, el modo de visualización.
function readStandalone() {
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return iosStandalone || window.matchMedia("(display-mode: standalone)").matches;
}

function Steps({ items }: { items: string[] }) {
  return (
    <ol className="list-decimal space-y-1.5 pl-5 text-sm text-tinta-2">
      {items.map((step) => (
        <li key={step}>{step}</li>
      ))}
    </ol>
  );
}

const IOS_STEPS = [
  "Abre esta página en Safari.",
  "Toca Compartir (el cuadrado con una flecha hacia arriba).",
  "Toca «Agregar a pantalla de inicio».",
  "Toca Agregar y abre «Cuaderno» desde el ícono.",
  "Inicia sesión una sola vez dentro de la app.",
];

const OTHER_STEPS = [
  "Abre esta página en Chrome.",
  "Toca el menú ⋮ y elige «Instalar app» o «Agregar a la pantalla principal».",
  "Abre «Cuaderno» desde el ícono e inicia sesión una sola vez.",
];

function InstallBody({ platform, canPrompt }: { platform: Platform; canPrompt: boolean }) {
  if (canPrompt) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-sm text-tinta-2">Se instala como una app más, sin pasar por ninguna tienda.</p>
        <Button onClick={() => void promptInstall()}>Instalar Cuaderno</Button>
      </div>
    );
  }
  return <Steps items={platform === "ios" ? IOS_STEPS : OTHER_STEPS} />;
}

export function InstallCard() {
  const prompt = useSyncExternalStore(subscribePrompt, getPromptSnapshot, getPromptServerSnapshot);
  const standalone = useSyncExternalStore(subscribeStandalone, readStandalone, () => false);
  const platform = useSyncExternalStore(
    noopSubscribe,
    () => detectPlatform(navigator.userAgent, navigator.maxTouchPoints),
    (): Platform => "other"
  );

  return (
    <Card>
      <CardHeader
        title="Instalar en el teléfono"
        subtitle="Úsalo como una app: ícono propio, pantalla completa y sesión abierta."
        action={standalone ? <Badge tone="pagado">Instalada</Badge> : undefined}
      />
      <CardBody>
        {standalone ? (
          <p className="text-sm text-tinta-2">Estás usando la app instalada.</p>
        ) : (
          <InstallBody platform={platform} canPrompt={prompt !== null} />
        )}
      </CardBody>
    </Card>
  );
}
