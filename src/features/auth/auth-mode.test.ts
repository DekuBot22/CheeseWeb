import { describe, expect, it } from "vitest";
import {
  SESSION_MAX_AGE_S,
  areLoopbackHosts,
  hostnameFromHostHeader,
  isAuthDisabled,
  isLoopbackHost,
  sessionCookieOptions,
  shouldBypassAuth,
  timingSafeEqualStr,
} from "./auth-mode";

describe("isAuthDisabled", () => {
  it("solo con ADMIN_AUTH exactamente 'off' fuera de producción y de Vercel", () => {
    expect(isAuthDisabled({ ADMIN_AUTH: "off", NODE_ENV: "development" })).toBe(true);
    expect(isAuthDisabled({ ADMIN_AUTH: "off" })).toBe(true);
  });

  it.each(["OFF", "false", "0", "", "on", " off"])("falso con ADMIN_AUTH=%j", (value) => {
    expect(isAuthDisabled({ ADMIN_AUTH: value, NODE_ENV: "development" })).toBe(false);
  });

  it("falso sin definir la variable", () => {
    expect(isAuthDisabled({ NODE_ENV: "development" })).toBe(false);
  });

  it("falso en producción aunque ADMIN_AUTH sea 'off'", () => {
    expect(isAuthDisabled({ ADMIN_AUTH: "off", NODE_ENV: "production" })).toBe(false);
  });

  it("falso en Vercel (también en las vistas previas)", () => {
    expect(isAuthDisabled({ ADMIN_AUTH: "off", NODE_ENV: "development", VERCEL: "1" })).toBe(false);
  });
});

describe("isLoopbackHost", () => {
  it.each(["localhost", "127.0.0.1", "::1", "[::1]"])("%s es loopback", (host) => {
    expect(isLoopbackHost(host)).toBe(true);
  });

  it.each(["192.168.1.5", "cheese-web-phi.vercel.app", "0.0.0.0", ""])("%j no es loopback", (host) => {
    expect(isLoopbackHost(host)).toBe(false);
  });
});

describe("hostnameFromHostHeader", () => {
  it.each([
    ["localhost:3100", "localhost"],
    ["127.0.0.1:3000", "127.0.0.1"],
    ["[::1]:3000", "[::1]"],
    ["192.168.1.5:3100", "192.168.1.5"],
    ["Cheese-Web-Phi.vercel.app", "cheese-web-phi.vercel.app"],
    ["", ""],
  ])("%j → %j", (header, expected) => {
    expect(hostnameFromHostHeader(header)).toBe(expected);
  });

  it("sin cabecera devuelve vacío", () => {
    expect(hostnameFromHostHeader(null)).toBe("");
    expect(hostnameFromHostHeader(undefined)).toBe("");
  });
});

describe("areLoopbackHosts", () => {
  it("todas las cabeceras deben ser loopback", () => {
    expect(areLoopbackHosts(["localhost:3100", null])).toBe(true);
    expect(areLoopbackHosts(["localhost:3100", "[::1]:3100"])).toBe(true);
    expect(areLoopbackHosts(["localhost:3100", "192.168.1.5"])).toBe(false);
    expect(areLoopbackHosts(["localhost:3100", "evil.com, localhost"])).toBe(false);
  });

  it("sin ninguna cabecera no se confía", () => {
    expect(areLoopbackHosts([null, undefined])).toBe(false);
    expect(areLoopbackHosts([])).toBe(false);
  });

  it("entrar por la IP de la red local no es loopback", () => {
    expect(areLoopbackHosts(["172.29.48.1:3100"])).toBe(false);
  });
});

describe("shouldBypassAuth", () => {
  const dev = { ADMIN_AUTH: "off", NODE_ENV: "development" };
  const local = ["localhost:3100"];

  it("solo con las 4 condiciones a la vez", () => {
    expect(shouldBypassAuth(dev, local)).toBe(true);
    expect(shouldBypassAuth(dev, ["192.168.1.5:3100"])).toBe(false);
    expect(shouldBypassAuth({ ...dev, NODE_ENV: "production" }, local)).toBe(false);
    expect(shouldBypassAuth({ ...dev, VERCEL: "1" }, local)).toBe(false);
    expect(shouldBypassAuth({ NODE_ENV: "development" }, local)).toBe(false);
  });
});

describe("sessionCookieOptions", () => {
  it("dura 400 días y es httpOnly + sameSite lax", () => {
    const opts = sessionCookieOptions(false);
    expect(opts.maxAge).toBe(34_560_000);
    expect(SESSION_MAX_AGE_S).toBe(34_560_000);
    expect(opts.httpOnly).toBe(true);
    expect(opts.sameSite).toBe("lax");
    expect(opts.path).toBe("/");
  });

  it("secure sigue a isProd", () => {
    expect(sessionCookieOptions(true).secure).toBe(true);
    expect(sessionCookieOptions(false).secure).toBe(false);
  });
});

describe("timingSafeEqualStr", () => {
  it("iguales", () => {
    expect(timingSafeEqualStr("abc", "abc")).toBe(true);
    expect(timingSafeEqualStr("", "")).toBe(true);
  });

  it("distintas", () => {
    expect(timingSafeEqualStr("abc", "abd")).toBe(false);
  });

  it("de distinta longitud", () => {
    expect(timingSafeEqualStr("abc", "abcd")).toBe(false);
    expect(timingSafeEqualStr("abcd", "abc")).toBe(false);
    expect(timingSafeEqualStr("", "a")).toBe(false);
  });
});
