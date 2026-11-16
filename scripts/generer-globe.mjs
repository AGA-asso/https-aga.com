// Produit src/data/terres.json : la liste des points de terre ferme dessinés sur le globe
// de la page d'accueil. À relancer uniquement si l'on veut changer la densité des points :
//   node scripts/generer-globe.mjs
import { writeFileSync, readFileSync } from 'node:fs';
import { feature } from 'topojson-client';
import { geoContains } from 'd3-geo';

const monde = JSON.parse(readFileSync(new URL('../node_modules/world-atlas/land-110m.json', import.meta.url)));
const terres = feature(monde, monde.objects.land);
const PAS = 1.9; // degrés entre deux points ; plus petit = globe plus dense et fichier plus lourd
const points = [];
for (let lat = -84; lat <= 84; lat += PAS) {
  const n = Math.max(1, Math.round((360 / PAS) * Math.cos((lat * Math.PI) / 180)));
  for (let i = 0; i < n; i++) {
    const lon = -180 + (360 * (i + (Math.round(lat / PAS) % 2) / 2)) / n;
    if (geoContains(terres, [lon, lat])) points.push(Math.round(lon * 10), Math.round(lat * 10));
  }
}
writeFileSync(new URL('../src/data/terres.json', import.meta.url), JSON.stringify(points));
console.log(points.length / 2, 'points de terre');
