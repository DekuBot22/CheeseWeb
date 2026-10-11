import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Reglas de capas y de tamaño: ver docs/ARQUITECTURA.md.
const TESTS = ["**/*.test.ts", "**/*.test.tsx"];

const restrict = (files, patterns) => ({
  files,
  ignores: TESTS,
  rules: { "no-restricted-imports": ["error", { patterns }] },
});

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),

  // El dominio es puro: no conoce React, Next, Supabase ni el servidor.
  restrict(
    ["src/domain/**/*.{ts,tsx}"],
    [
      {
        group: [
          "@supabase/*",
          "next",
          "next/*",
          "react",
          "react/*",
          "react-dom",
          "react-dom/*",
          "server-only",
          "@/server/*",
          "@/features/*",
          "@/ui/*",
          "**/server/**",
        ],
        message: "El dominio es puro: solo puede importar de domain/ y lib/.",
      },
    ]
  ),

  // ui/ y lib/ son genéricos: no conocen el negocio ni el servidor.
  restrict(
    ["src/ui/**/*.{ts,tsx}", "src/lib/**/*.{ts,tsx}"],
    [
      {
        group: ["@supabase/*", "@/server/*", "@/features/*", "@/domain/*", "**/server/**"],
        message: "ui/ y lib/ no pueden depender del negocio ni del servidor.",
      },
    ]
  ),

  // Los componentes reciben los datos por props: nunca consultan la base.
  restrict(
    ["src/features/*/components/**/*.{ts,tsx}"],
    [
      {
        group: ["@supabase/*", "@/server/*", "**/server/**"],
        message: "Los datos llegan por props: un componente no importa código de servidor.",
      },
    ]
  ),

  // Las rutas solo orquestan: el acceso a datos vive en los repositorios.
  restrict(
    ["src/app/**/*.{ts,tsx}"],
    [
      {
        group: ["@supabase/*", "@/server/db"],
        message: "Las rutas no consultan la base: usa un repositorio o un get-*.ts de la feature.",
      },
    ]
  ),

  // Límites de tamaño y complejidad (avisos, no errores).
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: TESTS,
    rules: {
      "max-lines": ["warn", { max: 250, skipBlankLines: true, skipComments: true }],
      "max-lines-per-function": ["warn", { max: 100, skipBlankLines: true, skipComments: true }],
      "max-params": ["warn", 4],
      "max-depth": ["warn", 3],
      complexity: ["warn", 15],
      "import/order": [
        "warn",
        {
          groups: ["builtin", "external", "internal", ["parent", "sibling", "index"]],
          pathGroups: [{ pattern: "@/**", group: "internal" }],
          pathGroupsExcludedImportTypes: ["builtin"],
        },
      ],
    },
  },
]);

export default eslintConfig;
