#!/usr/bin/env node
/*
  Generate VS Code extensions metadata JSON for the site.
  - Reads identifiers from extra/vscode/extensions.txt (lines like: publisher.extension)
  - Queries VS Marketplace API and reshapes the result
  - Writes to public/generated/vscode-extensions.json (ignored by git)
*/

import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const INPUT_FILE = path.join(root, 'extra', 'vscode', 'extensions.txt');
const OUT_DIR = path.join(root, 'public', 'generated');
const OUT_FILE = path.join(OUT_DIR, 'vscode-extensions.json');

const API_URL = 'https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery?api-version=3.0-preview.1';

async function readExtensionsList() {
  try {
    const text = await fs.readFile(INPUT_FILE, 'utf8');
    return text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#'));
  } catch (e) {
    console.error('[extensions] Failed to read extensions.txt:', e?.message || e);
    return [];
  }
}

async function queryMarketplace(ids) {
  if (!ids || ids.length === 0) {
    return { results: [{ extensions: [] }] };
  }
  const criteria = [
    { filterType: 8, value: 'Microsoft.VisualStudio.Code' },
    ...ids.map((id) => ({ filterType: 7, value: id }))
  ];
  const body = {
    filters: [
      {
        criteria,
        pageNumber: 1,
        pageSize: 100,
        sortBy: 3,
        sortOrder: 1,
      },
    ],
    assetTypes: [],
    flags: 914,
  };
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Marketplace query failed (${res.status}) ${txt}`);
  }
  return await res.json();
}

function reshapeResponse(json) {
  const list = json?.results?.[0]?.extensions || [];
  const cards = list.map((ext) => {
    const version = Array.isArray(ext?.versions) ? ext.versions[0] : undefined;
    const files = Array.isArray(version?.files) ? version.files : [];
    const iconFile = files.find((f) => f?.assetType === 'Microsoft.VisualStudio.Services.Icons.Default');
    const statMap = Object.fromEntries(
      (Array.isArray(ext?.statistics) ? ext.statistics : []).map((s) => [s?.statisticName, s?.value])
    );
    const rating = Number(statMap.weightedRating ?? statMap.averagerating ?? 0) || 0;
    const ratingCount = Number(statMap.ratingcount ?? 0) || 0;
    const install = Number(statMap.install ?? 0) || 0;

    return {
      displayName: ext?.displayName || ext?.extensionName || '',
      extensionName: ext?.extensionName || '',
      shortDescription: ext?.shortDescription || '',
      icon: iconFile?.source || '',
      publisherDisplayName: ext?.publisher?.displayName || ext?.publisher?.publisherName || '',
      publisherName: ext?.publisher?.publisherName || '',
      publisherLink: ext?.publisher?.publisherName
        ? `https://marketplace.visualstudio.com/publishers/${ext.publisher.publisherName}`
        : '',
      install,
      rating,
      ratingCount,
      lastUpdated: ext?.lastUpdated || '',
    };
  });
  // Optional: keep input order by ids where possible
  return cards;
}

async function main() {
  const ids = await readExtensionsList();
  await fs.mkdir(OUT_DIR, { recursive: true });

  try {
    const data = await queryMarketplace(ids);
    const cards = reshapeResponse(data);
    const payload = {
      generatedAt: new Date().toISOString(),
      count: cards.length,
      extensions: cards,
    };
    await fs.writeFile(OUT_FILE, JSON.stringify(payload, null, 2));
    console.log(`[extensions] Wrote ${cards.length} items to ${path.relative(root, OUT_FILE)}`);
  } catch (e) {
    console.error('[extensions] Failed to generate JSON:', e?.message || e);
    const payload = { generatedAt: new Date().toISOString(), error: String(e?.message || e), count: 0, extensions: [] };
    await fs.writeFile(OUT_FILE, JSON.stringify(payload, null, 2));
    process.exitCode = 1;
  }
}

main();
