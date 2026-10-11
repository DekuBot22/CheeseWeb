import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  AVISO_SALIDA_MS,
  AVISO_VISIBLE_MS,
  avisar,
  descartarAviso,
  getAvisoSnapshot,
  subscribeAviso,
} from "./toast-store";

describe("toast-store", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    descartarAviso();
    vi.useRealTimers();
  });

  it("muestra el aviso y lo marca como saliendo antes de quitarlo", () => {
    avisar("Abono registrado");
    expect(getAvisoSnapshot()).toMatchObject({ texto: "Abono registrado", saliendo: false });

    vi.advanceTimersByTime(AVISO_VISIBLE_MS);
    expect(getAvisoSnapshot()).toMatchObject({ texto: "Abono registrado", saliendo: true });

    vi.advanceTimersByTime(AVISO_SALIDA_MS);
    expect(getAvisoSnapshot()).toBeNull();
  });

  it("un aviso nuevo reemplaza al anterior y reinicia el tiempo", () => {
    avisar("Primero");
    const primero = getAvisoSnapshot();
    vi.advanceTimersByTime(AVISO_VISIBLE_MS - 100);

    avisar("Segundo");
    const segundo = getAvisoSnapshot();
    expect(segundo?.texto).toBe("Segundo");
    expect(segundo?.id).not.toBe(primero?.id);

    // El temporizador del primero ya no debe afectar al segundo.
    vi.advanceTimersByTime(200);
    expect(getAvisoSnapshot()).toMatchObject({ texto: "Segundo", saliendo: false });
  });

  it("avisa a los suscriptores y deja de avisar al desuscribirse", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeAviso(listener);

    avisar("Guardado");
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    avisar("Otro");
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("descartarAviso lo quita de inmediato y cancela los temporizadores", () => {
    avisar("Hola");
    descartarAviso();
    expect(getAvisoSnapshot()).toBeNull();

    vi.advanceTimersByTime(AVISO_VISIBLE_MS + AVISO_SALIDA_MS);
    expect(getAvisoSnapshot()).toBeNull();
  });
});
