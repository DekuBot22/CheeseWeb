// ¿El gesto empezó en algo que ya usa el deslizar horizontal (campos, tablas con scroll, ventanas)?
export function startsInSwipeBlocker(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  if (target.closest("input, textarea, select, dialog, [contenteditable], [data-no-swipe]")) return true;
  for (let el: Element | null = target; el; el = el.parentElement) {
    const overflowX = getComputedStyle(el).overflowX;
    if ((overflowX === "auto" || overflowX === "scroll") && el.scrollWidth > el.clientWidth) return true;
  }
  return false;
}
