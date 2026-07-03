// Custom pointer-based drag-and-drop. Replaces native HTML5 DnD, which is
// unreliable here: dragging an <img> inside a draggable container can trigger
// the browser's native image-drag instead of our drag, and native DnD has no
// touch support at all. Pointer Events avoid both problems and let us drive
// our own auto-scroll near the viewport edges.

const DRAG_THRESHOLD = 6;
const AUTO_SCROLL_EDGE = 70;
const AUTO_SCROLL_SPEED = 14;

let autoScrollFrame = null;
let lastPointerY = 0;

function startAutoScroll() {
  if (autoScrollFrame) return;
  const tick = () => {
    if (lastPointerY < AUTO_SCROLL_EDGE) {
      window.scrollBy(0, -AUTO_SCROLL_SPEED);
    } else if (lastPointerY > window.innerHeight - AUTO_SCROLL_EDGE) {
      window.scrollBy(0, AUTO_SCROLL_SPEED);
    }
    autoScrollFrame = requestAnimationFrame(tick);
  };
  autoScrollFrame = requestAnimationFrame(tick);
}

function stopAutoScroll() {
  if (autoScrollFrame) cancelAnimationFrame(autoScrollFrame);
  autoScrollFrame = null;
}

function createGhost(sourceEl) {
  const rect = sourceEl.getBoundingClientRect();
  const ghost = sourceEl.cloneNode(true);
  ghost.classList.add("drag-ghost");
  ghost.style.width = `${rect.width}px`;
  ghost.style.height = `${rect.height}px`;
  document.body.append(ghost);
  return ghost;
}

function positionGhost(ghost, x, y) {
  ghost.style.left = `${x - ghost.offsetWidth / 2}px`;
  ghost.style.top = `${y - ghost.offsetHeight / 2}px`;
}

/**
 * Makes `sourceEl` draggable via Pointer Events. On a successful drop over an
 * element matching `dropTargetSelector`, calls `onDrop(payload, targetEl)`.
 * Plain taps (movement under the threshold) are left alone so a normal
 * `click` listener on `sourceEl` keeps working.
 */
export function makeDraggable(sourceEl, { getPayload, dropTargetSelector, onDrop, ignoreSelector }) {
  sourceEl.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    if (ignoreSelector && e.target.closest(ignoreSelector)) return;
    const startX = e.clientX;
    const startY = e.clientY;
    let dragging = false;
    let ghost = null;
    let currentTarget = null;
    sourceEl.setPointerCapture(e.pointerId);

    const onMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      if (!dragging && Math.hypot(dx, dy) > DRAG_THRESHOLD) {
        dragging = true;
        sourceEl.classList.add("is-drag-source");
        ghost = createGhost(sourceEl);
        startAutoScroll();
      }
      if (!dragging) return;

      moveEvent.preventDefault();
      lastPointerY = moveEvent.clientY;
      positionGhost(ghost, moveEvent.clientX, moveEvent.clientY);

      ghost.style.visibility = "hidden";
      const under = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY);
      ghost.style.visibility = "";
      const target = under?.closest(dropTargetSelector) ?? null;

      if (target !== currentTarget) {
        currentTarget?.classList.remove("is-drag-over");
        currentTarget = target;
        currentTarget?.classList.add("is-drag-over");
      }
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      stopAutoScroll();
      sourceEl.classList.remove("is-drag-source");
      currentTarget?.classList.remove("is-drag-over");
      ghost?.remove();

      if (dragging && currentTarget) {
        onDrop(getPayload(), currentTarget);
      }
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  });
}
