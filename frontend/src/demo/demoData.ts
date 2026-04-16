import type { DriveItem } from "../types";

/*
 * Demo/offline data that allows the app to run fully on GitHub Pages
 * without a backend. Simulates a decorator's portfolio structure.
 */

const now = new Date().toISOString();

const ROOT_ITEMS: DriveItem[] = [
  {
    id: "demo-folder-facades",
    name: "Facciate Decorative",
    mimeType: "application/vnd.google-apps.folder",
    webViewLink: null,
    thumbnailLink: null,
    createdTime: now,
    modifiedTime: now,
    parents: ["demo-root"],
    itemType: "folder",
  },
  {
    id: "demo-folder-roofing",
    name: "Coperture e Tetti",
    mimeType: "application/vnd.google-apps.folder",
    webViewLink: null,
    thumbnailLink: null,
    createdTime: now,
    modifiedTime: now,
    parents: ["demo-root"],
    itemType: "folder",
  },
  {
    id: "demo-folder-interiors",
    name: "Interni e Finiture",
    mimeType: "application/vnd.google-apps.folder",
    webViewLink: null,
    thumbnailLink: null,
    createdTime: now,
    modifiedTime: now,
    parents: ["demo-root"],
    itemType: "folder",
  },
];

function placeholder(seed: number, w = 400, h = 300): string {
  const hue = (seed * 137) % 360;
  return `https://placehold.co/${w}x${h}/${hslHex(hue, 45, 65)}/${hslHex(hue, 20, 95)}?text=Project+${seed}`;
}

function hslHex(h: number, s: number, l: number): string {
  const a = (s * Math.min(l, 100 - l)) / 10000;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l / 100 - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `${f(0)}${f(8)}${f(4)}`;
}

function makeFile(id: string, name: string, parentId: string, seed: number): DriveItem {
  return {
    id,
    name,
    mimeType: "image/jpeg",
    webViewLink: null,
    thumbnailLink: placeholder(seed),
    createdTime: now,
    modifiedTime: now,
    parents: [parentId],
    itemType: "file",
  };
}

const FACADES_ITEMS: DriveItem[] = [
  makeFile("demo-f1", "Villa Moderna - Intonaco Decorativo.jpg", "demo-folder-facades", 1),
  makeFile("demo-f2", "Palazzo Storico - Restauro Facciata.jpg", "demo-folder-facades", 2),
  makeFile("demo-f3", "Residenza Lago - Rivestimento Pietra.jpg", "demo-folder-facades", 3),
  makeFile("demo-f4", "Condominio Centro - Cappotto Termico.jpg", "demo-folder-facades", 4),
  makeFile("demo-f5", "Edificio Commerciale - Facciata Ventilata.jpg", "demo-folder-facades", 5),
  makeFile("demo-f6", "Casa Colonica - Intonaco a Calce.jpg", "demo-folder-facades", 6),
];

const ROOFING_ITEMS: DriveItem[] = [
  makeFile("demo-r1", "Tetto in Ardesia - Villa Toscana.jpg", "demo-folder-roofing", 7),
  makeFile("demo-r2", "Copertura Tegole Marsigliesi.jpg", "demo-folder-roofing", 8),
  makeFile("demo-r3", "Mansarda - Isolamento e Rifinitura.jpg", "demo-folder-roofing", 9),
  makeFile("demo-r4", "Tetto Piano - Impermeabilizzazione.jpg", "demo-folder-roofing", 10),
  makeFile("demo-r5", "Lucernario e Abbaino.jpg", "demo-folder-roofing", 11),
];

const INTERIORS_ITEMS: DriveItem[] = [
  makeFile("demo-i1", "Salone - Stucco Veneziano.jpg", "demo-folder-interiors", 12),
  makeFile("demo-i2", "Bagno - Microcemento.jpg", "demo-folder-interiors", 13),
  makeFile("demo-i3", "Cucina - Resina Decorativa.jpg", "demo-folder-interiors", 14),
  makeFile("demo-i4", "Camera - Carta da Parati Artistica.jpg", "demo-folder-interiors", 15),
];

const FOLDER_CONTENTS: Record<string, DriveItem[]> = {
  "demo-folder-facades": FACADES_ITEMS,
  "demo-folder-roofing": ROOFING_ITEMS,
  "demo-folder-interiors": INTERIORS_ITEMS,
};

export function getDemoItems(folderId?: string, search?: string): DriveItem[] {
  const base = folderId && FOLDER_CONTENTS[folderId]
    ? FOLDER_CONTENTS[folderId]
    : ROOT_ITEMS;

  if (!search) return base;

  const lower = search.toLowerCase();
  return base.filter((item) => item.name.toLowerCase().includes(lower));
}

export const DEMO_ADMIN_USERNAME = "admin";
export const DEMO_ADMIN_PASSWORD = "demo";
export const DEMO_TOKEN = "demo-offline-token";
