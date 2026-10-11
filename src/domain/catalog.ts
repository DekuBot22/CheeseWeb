export type CheeseType = "duro" | "semi" | "blando";
export type SaltLevel = "alto" | "intermedio" | "bajo";

export const CHEESE_TYPE_LABELS: Record<CheeseType, string> = {
  duro: "Duro",
  semi: "Semi-duro",
  blando: "Blando",
};

export const SALT_LEVEL_LABELS: Record<SaltLevel, string> = {
  alto: "Alto en sal",
  intermedio: "Sal intermedia",
  bajo: "Bajo en sal",
};
