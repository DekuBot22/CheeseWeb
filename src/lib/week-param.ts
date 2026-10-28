// Conserva la semana elegida (`?semana=`) en los enlaces del panel.
// Con `semana` null quita el parámetro (semana actual = URL limpia).
export function withWeekParam(href: string, semana: string | null | undefined): string {
  const hashAt = href.indexOf("#");
  const hash = hashAt >= 0 ? href.slice(hashAt) : "";
  const noHash = hashAt >= 0 ? href.slice(0, hashAt) : href;
  const [path, query = ""] = noHash.split("?");

  const params = new URLSearchParams(query);
  if (semana) params.set("semana", semana);
  else params.delete("semana");

  const qs = params.toString();
  return `${path}${qs ? `?${qs}` : ""}${hash}`;
}
