// Zones proposées dans le CMS pour situer un article sur le globe de l'accueil.
// Le champ est facultatif. Pour ajouter une zone : une ligne ici, et la même valeur
// dans la liste « zone » de .pages.yml.
export const ZONES: Record<string, { fr: string; en: string; lat: number; lon: number }> = {
  europe: { fr: 'Europe', en: 'Europe', lat: 49, lon: 10 },
  'russie-eurasie': { fr: 'Russie et Eurasie', en: 'Russia and Eurasia', lat: 56, lon: 62 },
  'moyen-orient': { fr: 'Moyen-Orient', en: 'Middle East', lat: 29, lon: 45 },
  'afrique-nord-sahel': { fr: 'Afrique du Nord et Sahel', en: 'North Africa and Sahel', lat: 19, lon: 6 },
  'afrique-subsaharienne': { fr: 'Afrique subsaharienne', en: 'Sub-Saharan Africa', lat: -6, lon: 23 },
  'asie-est': { fr: "Asie de l'Est", en: 'East Asia', lat: 34, lon: 118 },
  'asie-sud': { fr: 'Asie du Sud', en: 'South Asia', lat: 22, lon: 78 },
  'asie-sud-est': { fr: 'Asie du Sud-Est', en: 'South-East Asia', lat: 4, lon: 108 },
  oceanie: { fr: 'Océanie et Pacifique', en: 'Oceania and Pacific', lat: -24, lon: 140 },
  'amerique-nord': { fr: 'Amérique du Nord', en: 'North America', lat: 41, lon: -96 },
  'amerique-latine': { fr: 'Amérique latine', en: 'Latin America', lat: -12, lon: -58 },
  arctique: { fr: 'Arctique', en: 'Arctic', lat: 76, lon: 10 },
};
