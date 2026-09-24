// Makes the decorative iPod sticker interactive: tap a menu item to select
// it, or use the clickwheel (Menu / rw / ff / play-pause) to move the
// selection and play/pause a background track.
//
// Uses event delegation on `document`, so it doesn't need to touch the
// minified deskfolio.js engine and keeps working even if the sticker's
// DOM nodes get re-rendered (e.g. when it's dragged or the page flips).

const MENU_ITEM_SELECTOR = ".ipod .menu li";
const WHEEL_BUTTON_SELECTOR = ".ipod .clickwheel-button";
const TRACK_SRC = "/audio/ipod-track.mp3";

function getMenuItems(): HTMLLIElement[] {
  return Array.from(document.querySelectorAll<HTMLLIElement>(MENU_ITEM_SELECTOR));
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
  button.closest(".ipod")?.classList.toggle("df-ipod-playing", playing);
}

function stopPlayback(wheelButton: HTMLButtonElement) {
  getAudio().pause();
  const playButton =
    wheelButton.closest(".ipod")?.querySelector<HTMLButtonElement>(".pp") ??
    null;
  if (playButton) setPlayGlyph(playButton, false);
}

function handleClick(e: MouseEvent) {
  const target = e.target as HTMLElement;

  const menuItem = target.closest<HTMLLIElement>(MENU_ITEM_SELECTOR);
  if (menuItem) {
    const items = getMenuItems();
    setActiveIndex(items, items.indexOf(menuItem));
    return;
  }

  const wheelButton = target.closest<HTMLButtonElement>(WHEEL_BUTTON_SELECTOR);
  if (!wheelButton) return;

  const items = getMenuItems();
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
