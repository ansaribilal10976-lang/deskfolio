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

import { IPOD_SUBMENUS } from "./ipod-menus";

const IPOD_SELECTOR = ".ipod";
const MENU_ITEM_SELECTOR = ".ipod .menu li";
const WHEEL_BUTTON_SELECTOR = ".ipod .clickwheel-button";
const ZOOM_CLONE_CLASS = "df-ipod-zoom-clone";
const TRACK_SRC = "audio/ipod-track.mp3";
const HINT_SEEN_KEY = "df-ipod-hint-seen";
const HINT_SEEN_CLASS = "df-ipod-seen";

// The "tap me" bubble on the desk sticker (pure CSS, see App.css) disappears
// for good once the visitor has opened the iPod once.
function markHintSeen() {
  document.documentElement.classList.add(HINT_SEEN_CLASS);
  try {
    localStorage.setItem(HINT_SEEN_KEY, "1");
  } catch {
    /* storage unavailable: hint just returns next visit */
  }
}

function getMenuItems(root: ParentNode): HTMLLIElement[] {
  return Array.from(root.querySelectorAll<HTMLLIElement>(".menu li"));
}

function setActiveIndex(items: HTMLLIElement[], index: number) {
  items.forEach((li, i) => li.classList.toggle("active", i === index));
  if (items[index]) scrollActiveIntoView(items[index]);
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
  // The button must contain exactly ONE glyph. Drop any stray text nodes so a
  // second icon can never render next to it.
  Array.from(button.childNodes).forEach((n) => {
    if (n.nodeType === Node.TEXT_NODE) n.remove();
  });
  let glyph = button.querySelector("span");
  if (!glyph) {
    glyph = document.createElement("span");
    button.appendChild(glyph);
  }
  glyph.textContent = playing ? "\u275A\u275A" : "\u25B6";
  button.closest(IPOD_SELECTOR)?.classList.toggle("df-ipod-playing", playing);
}

// --- Menu scrolling ---------------------------------------------------------
// The screen is a fixed-height, overflow:hidden box, so the menu <ul> is moved
// with translateY. Works with wheel, touch-drag and the rw/ff buttons.

function getMenuParts(screen: HTMLElement) {
  const ul = screen.querySelector<HTMLElement>(".menu");
  if (!ul) return null;
  const visible = screen.clientHeight - ul.offsetTop;
  const max = Math.max(0, ul.offsetHeight - visible);
  return { ul, visible, max };
}

function getOffset(ul: HTMLElement): number {
  return Number(ul.dataset.dfScroll ?? 0);
}

function setOffset(screen: HTMLElement, value: number) {
  const parts = getMenuParts(screen);
  if (!parts) return;
  const next = Math.min(parts.max, Math.max(0, value));
  parts.ul.dataset.dfScroll = String(next);
  parts.ul.style.transform = `translateY(${-next}px)`;
}

function scrollActiveIntoView(li: HTMLLIElement) {
  const screen = li.closest<HTMLElement>(".screen");
  const parts = screen ? getMenuParts(screen) : null;
  if (!screen || !parts) return;
  const offset = getOffset(parts.ul);
  const top = li.offsetTop;
  const bottom = top + li.offsetHeight;
  if (top < offset) setOffset(screen, top);
  else if (bottom > offset + parts.visible) setOffset(screen, bottom - parts.visible);
}

function screenScale(screen: HTMLElement): number {
  // The zoom clone is CSS-scaled; convert screen px to the screen's own px.
  return screen.offsetHeight ? screen.getBoundingClientRect().height / screen.offsetHeight : 1;
}

function onWheel(e: WheelEvent) {
  const screen = (e.target as HTMLElement).closest<HTMLElement>(`.${ZOOM_CLONE_CLASS} .screen`);
  if (!screen) return;
  const parts = getMenuParts(screen);
  if (!parts) return;
  e.preventDefault();
  setOffset(screen, getOffset(parts.ul) + e.deltaY / screenScale(screen));
}

let dragScreen: HTMLElement | null = null;
let dragLastY = 0;
let dragMoved = false;

function onTouchStart(e: TouchEvent) {
  const screen = (e.target as HTMLElement).closest<HTMLElement>(`.${ZOOM_CLONE_CLASS} .screen`);
  if (!screen) return;
  dragScreen = screen;
  dragLastY = e.touches[0].clientY;
  dragMoved = false;
}

function onTouchMove(e: TouchEvent) {
  if (!dragScreen) return;
  const parts = getMenuParts(dragScreen);
  if (!parts) return;
  const y = e.touches[0].clientY;
  const dy = (dragLastY - y) / screenScale(dragScreen);
  if (Math.abs(dy) > 0.5) dragMoved = true;
  dragLastY = y;
  e.preventDefault();
  setOffset(dragScreen, getOffset(parts.ul) + dy);
}

function onTouchEnd() {
  dragScreen = null;
  // A drag shouldn't also count as a tap on whatever item was underneath.
  if (dragMoved) window.setTimeout(() => (dragMoved = false), 0);
}

function stopPlayback(wheelButton: HTMLButtonElement) {
  getAudio().pause();
  const playButton =
    wheelButton.closest(IPOD_SELECTOR)?.querySelector<HTMLButtonElement>(".pp") ??
    null;
  if (playButton) setPlayGlyph(playButton, false);
}

// --- Sub-menus (Music -> projects, Extras -> links) ------------------------

const rootMenuHtml = new WeakMap<HTMLElement, string>();

function enterSubmenu(ul: HTMLElement, label: string) {
  const sub = IPOD_SUBMENUS[label];
  const screen = ul.closest<HTMLElement>(".screen");
  if (!sub || !screen) return;

  rootMenuHtml.set(ul, ul.innerHTML);
  ul.dataset.dfView = "sub";
  ul.dataset.dfParent = label;
  ul.replaceChildren(
    ...sub.items.map((entry, i) => {
      const li = document.createElement("li");
      li.textContent = entry.label;
      if (entry.url) li.dataset.url = entry.url;
      else li.classList.add("df-ipod-nolink");
      if (i === 0) li.classList.add("active");
      return li;
    }),
  );
  screen.dataset.title = sub.title;
  setOffset(screen, 0);
}

function exitSubmenu(ul: HTMLElement) {
  const screen = ul.closest<HTMLElement>(".screen");
  const html = rootMenuHtml.get(ul);
  if (!screen || html === undefined) return;
  const parent = ul.dataset.dfParent;
  ul.innerHTML = html;
  delete ul.dataset.dfView;
  delete ul.dataset.dfParent;
  delete screen.dataset.title;
  setOffset(screen, 0);
  const items = getMenuItems(ul);
  const idx = items.findIndex((li) => li.textContent?.trim() === parent);
  setActiveIndex(items, idx === -1 ? 0 : idx);
}

// --- Zoom overlay ---------------------------------------------------------

let overlay: HTMLDivElement | null = null;

function openZoom(sourceIpod: HTMLElement) {
  if (overlay) return;
  markHintSeen();

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

  if (dragMoved) return;

  const menuItem = target.closest<HTMLLIElement>(MENU_ITEM_SELECTOR);
  if (menuItem) {
    const ul = menuItem.closest<HTMLElement>(".menu");
    if (ul?.dataset.dfView === "sub") {
      const url = menuItem.dataset.url;
      if (url) window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
    const label = menuItem.textContent?.trim() ?? "";
    if (ul && label in IPOD_SUBMENUS) {
      enterSubmenu(ul, label);
      return;
    }
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
    const ul = ipodRoot.querySelector<HTMLElement>(".menu");
    if (ul?.dataset.dfView === "sub") {
      exitSubmenu(ul); // Menu = back, like a real iPod; music keeps playing
      return;
    }
    setActiveIndex(items, 0);
    stopPlayback(wheelButton);
  }
}

let initialized = false;

export function initIpodSticker() {
  if (initialized) return;
  initialized = true;
  try {
    if (localStorage.getItem(HINT_SEEN_KEY)) {
      document.documentElement.classList.add(HINT_SEEN_CLASS);
    }
  } catch {
    /* ignore */
  }
  document.addEventListener("click", handleClick);
  document.addEventListener("wheel", onWheel, { passive: false });
  document.addEventListener("touchstart", onTouchStart, { passive: true });
  document.addEventListener("touchmove", onTouchMove, { passive: false });
  document.addEventListener("touchend", onTouchEnd);
  document.addEventListener("touchcancel", onTouchEnd);
}
