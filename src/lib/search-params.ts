// Lee un parámetro de la URL aceptando solo valores conocidos; si no es uno de
// ellos devuelve el primero de la lista (el valor por defecto).
export function pickParam<T extends readonly string[]>(value: string | undefined, allowed: T): T[number] {
  return (allowed as readonly string[]).includes(value ?? "") ? (value as T[number]) : allowed[0];
}
