// Content for the zoomed iPod's sub-menus. Edit this file only.
//  - "Music"  -> your projects, shown as tracks
//  - "Extras" -> links (GitHub, contact, resume)
// An entry WITHOUT a url is shown dimmed and does nothing when tapped,
// so unfinished links never send people to a dead page.
// Keep labels short (~12 chars): the iPod screen is tiny.
//
// Kept in sync with the "selected work" pages in the notebook
// (deskfolio/deskfolio.js) — same 3 projects, same URLs. Update both
// places if a project is added, removed, or its URL changes.

export type IpodEntry = { label: string; url?: string };
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
      { label: "Email me" }, // TODO: e.g. "mailto:you@example.com"
      { label: "Resume" }, // TODO: add PDF/Drive link
    ],
  },
};
