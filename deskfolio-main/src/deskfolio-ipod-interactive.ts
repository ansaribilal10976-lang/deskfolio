// Makes the decorative iPod sticker interactive:
//  - the sticker on the desk is tiny, so the first tap on it "pops it out"
//    into a large, centered overlay instead of trying to hit its buttons
//    at their real (drag-position) size
//  - inside the overlay, tapping a menu item selects it, and the clickwheel
//    (Menu / rw / ff / play-pause) moves the selection and plays/pauses a
//    background track
//  - tapping the dark backdrop closes the overlay
//
// Uses event delegation on `document`, so it doesn't need to touch the
// minified deskfolio.js engine and keeps working even if the sticker's own
// DOM nodes get re-rendered (e.g. when it's dragged or the page flips).

const IPOD_SELECTOR = ".ipod";
const MENU_ITEM_SELECTOR = ".ipod .menu li";
const WHEEL_BUTTON_SELECTOR = ".ipod .clickwheel-button";
const ZOOM_CLONE_CLASS = "df-ipod-zoom-clone";
const TRACK_SRC = "audio/ipod-track.mp3";

function getMenuItems(root: ParentNode): HTMLLIElement[] {
  return Array.from(root.querySelectorAll<HTMLLIElement>(".menu li"));
}

function setActiveIndex(items: HTMLLIElement[], index: number) {
  items.forEach((li, i) => li.classList.toggle("active", i === index));
}

function getActiveIndex(items: HTMLLIElement[]): number {
  const i = items.findIndex((li) => li.classList.contains("active"));
  return i === -1 ? 0 : i;
}

let audio: HTMLAudioElement | null = null;

function getAudio(): HTMLAudioElement {
  if (!audio) {
    audio = new Audio(TRACK_SRC);
    audio.loop = true;
    audio.volume = 0.55;
  }
  return audio;
}

function setPlayGlyph(button: HTMLButtonElement, playing: boolean) {
  const glyph = button.querySelector("span");
  if (glyph) glyph.textContent = playing ? "\u275A\u275A" : "\u25B6";
  button.closest(IPOD_SELECTOR)?.classList.toggle("df-ipod-playing", playing);
}

function stopPlayback(wheelButton: HTMLButtonElement) {
  getAudio().pause();
  const playButton =
    wheelButton.closest(IPOD_SELECTOR)?.querySelector<HTMLButtonElement>(".pp") ??
    null;
  if (playButton) setPlayGlyph(playButton, false);
}

// --- Zoom overlay ---------------------------------------------------------

let overlay: HTMLDivElement | null = null;

function openZoom(sourceIpod: HTMLElement) {
  if (overlay) return;

  const backdrop = document.createElement("div");
  backdrop.className = "df-ipod-zoom-backdrop";

  const wrap = document.createElement("div");
  wrap.className = "df-mipod df-ipod-zoom-wrap";

  const clone = sourceIpod.cloneNode(true) as HTMLElement;
  clone.classList.add(ZOOM_CLONE_CLASS);

  wrap.appendChild(clone);
  backdrop.appendChild(wrap);
  document.body.appendChild(backdrop);
  overlay = backdrop;

  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) closeZoom();
  });
}

function closeZoom() {
  overlay?.remove();
  overlay = null;
}

// --- Click handling ---------------------------------------------------------

function handleClick(e: MouseEvent) {
  const target = e.target as HTMLElement;

  const clickedIpod = target.closest<HTMLElement>(IPOD_SELECTOR);

  // Tapping the small sticker (outside the zoom overlay) just pops it out;
  // it doesn't also trigger whatever button happened to be under the tap.
  if (clickedIpod && !clickedIpod.closest(`.${ZOOM_CLONE_CLASS}`) && !overlay) {
    e.preventDefault();
    openZoom(clickedIpod);
    return;
  }

  const menuItem = target.closest<HTMLLIElement>(MENU_ITEM_SELECTOR);
  if (menuItem) {
    const items = getMenuItems(menuItem.closest(IPOD_SELECTOR) ?? document);
    setActiveIndex(items, items.indexOf(menuItem));
    return;
  }

  const wheelButton = target.closest<HTMLButtonElement>(WHEEL_BUTTON_SELECTOR);
  if (!wheelButton) return;

  const ipodRoot = wheelButton.closest(IPOD_SELECTOR) ?? document;
  const items = getMenuItems(ipodRoot);
  if (items.length === 0) return;
  const activeIndex = getActiveIndex(items);

  if (wheelButton.classList.contains("ff")) {
    setActiveIndex(items, (activeIndex + 1) % items.length);
  } else if (wheelButton.classList.contains("rw")) {
    setActiveIndex(items, (activeIndex - 1 + items.length) % items.length);
  } else if (wheelButton.classList.contains("pp")) {
    const el = getAudio();
    if (el.paused) {
      el.play().catch(() => {
        // Autoplay can be blocked until the user has interacted with the
        // page at all; clicking the button itself counts, so this should
        // only ever fail silently in edge cases.
      });
      setPlayGlyph(wheelButton, true);
    } else {
      el.pause();
      setPlayGlyph(wheelButton, false);
    }
  } else if (wheelButton.classList.contains("menu-button")) {
    setActiveIndex(items, 0);
    stopPlayback(wheelButton);
  }
}

let initialized = false;

export function initIpodSticker() {
  if (initialized) return;
  initialized = true;
  document.addEventListener("click", handleClick);
}
