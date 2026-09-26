// Content for the zoomed iPod's sub-menus. Edit this file only.
//  - "Music"  -> your projects, shown as tracks
//  - "Extras" -> links (GitHub, contact, resume)
//  - "Shuffle Songs" -> real audio tracks (each has its own `src`)
// An entry WITHOUT a url is shown dimmed and does nothing when tapped,
// so unfinished links never send people to a dead page.
// Keep labels short (~12 chars): the iPod screen is tiny.
//
// Kept in sync with the "selected work" pages in the notebook
// (deskfolio/deskfolio.js) — same 3 projects, same URLs. Update both
// places if a project is added, removed, or its URL changes.

export type IpodEntry = { label: string; url?: string; src?: string };
export type IpodSubmenu = { title: string; items: IpodEntry[] };

export const IPOD_SUBMENUS: Record<string, IpodSubmenu> = {
  Music: {
    title: "Projects",
    items: [
      { label: "Stone Mount", url: "https://stonemountgroup.in" },
    ],
  },
  Extras: {
    title: "Extras",
    items: [
      { label: "GitHub", url: "https://github.com/ansaribilal10976-lang" },
      { label: "Email me", url: "mailto:ansari.bilal10976@gmail.com" },
    ],
  },
  "Shuffle Songs": {
    // Each track has its OWN src, so tapping a different song actually
    // switches audio instead of replaying the same loop. See the
    // "Shuffle Songs" special-case in deskfolio-ipod-interactive.ts.
    title: "Shuffle Songs",
    items: [
      { label: "A Beautiful Garden", src: "audio/aventure-a-beautiful-garden.mp3" },
      { label: "Carefree", src: "audio/carefree.mp3" },
      { label: "Evening Improv", src: "audio/evening-improvisation.mp3" },
    ],
  },
  Settings: {
    title: "Terminal",
    items: [
      { label: "$ whoami" },
      { label: "bilal_ansari" },
      { label: "$ cat stack.txt" },
      { label: "Next.js / React / Supabase" },
      { label: "$ ls clients/" },
      { label: "stonemountgroup.in ..." },
      { label: "$ open instagram", url: "https://instagram.com/obsidian.studio.web" },
      { label: "$ _" },
    ],
  },
};
