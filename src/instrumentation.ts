// Next lo ejecuta una vez al arrancar el servidor. Si falta una variable de
// entorno, el servidor falla al iniciar y no a mitad de un pedido.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { env } = await import("@/server/env");
    env();
  }
}
