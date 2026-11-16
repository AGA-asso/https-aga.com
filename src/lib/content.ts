// Accès aux contenus et règle de publication.
//
// Règle centrale : un contenu n'apparaît sur le site public que s'il est au
// statut « Publié » (ou « Annulé » pour un événement) ET complet dans les deux
// langues. Sinon il est simplement écarté ; il ne fait jamais échouer le site.
// Sur le site d'aperçu (SHOW_DRAFTS=true), tout est affiché avec son état.
import { getCollection, type CollectionEntry } from 'astro:content';
import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';
import { marked } from 'marked';
import { parisDate, type Lang } from './dates';
import { ZONES } from './zones';

export type { Lang };
export const LANGS: Lang[] = ['fr', 'en'];
export const APERCU = process.env.SHOW_DRAFTS === 'true';
const NOM_LANGUE = { fr: 'français', en: 'anglais' };

// --- Outils -----------------------------------------------------------------

const rempli = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;
/** Une référence du CMS est un chemin de fichier : on n'en garde que l'identifiant. */
const idDeRef = (v: string) => v.split('/').pop()!.replace(/\.\w+$/, '');

const fichiersImages = import.meta.glob<ImageMetadata>('/src/media/**/*.{png,jpg,jpeg,webp,avif}', {
  eager: true,
  import: 'default',
});
export const image = (chemin?: string | null) =>
  rempli(chemin) ? fichiersImages[chemin.startsWith('/') ? chemin : `/${chemin}`] : undefined;

const ancre = (t: string) =>
  t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/<[^>]+>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Texte riche du CMS (Markdown) vers HTML, images du dépôt comprises. Les intertitres reçoivent une ancre. */
export async function html(md?: string | null) {
  if (!rempli(md)) return '';
  let out = await marked.parse(md);
  for (const [, src] of out.matchAll(/src="(\/?src\/media\/[^"]+)"/g)) {
    const meta = image(src);
    if (meta) out = out.replaceAll(`src="${src}"`, `src="${(await getImage({ src: meta, width: 1200 })).src}" loading="lazy"`);
  }
  return out.replace(/<h2>(.*?)<\/h2>/g, (_, t) => `<h2 id="${ancre(t)}">${t}</h2>`);
}

/** Sommaire d'un texte : ses intertitres de premier niveau. */
export const sommaire = (contenu: string) =>
  [...contenu.matchAll(/<h2 id="([^"]+)">(.*?)<\/h2>/g)].map(([, id, titre]) => ({ id, titre: titre.replace(/<[^>]+>/g, '') }));

export const minutesDeLecture = (md?: string | null) =>
  Math.max(1, Math.round((md ?? '').split(/\s+/).filter(Boolean).length / 220));

export const lien = (lang: Lang, chemin = '') => `/${lang}/${chemin}`.replace(/\/?$/, '/');

// --- État d'un contenu ------------------------------------------------------

export interface Etat {
  statut: 'brouillon' | 'a-relire' | 'publie' | 'annule';
  /** Raisons qui empêchent la publication. */
  blocages: string[];
  /** Défauts qui masquent seulement une partie (compte rendu, par exemple). */
  avertissements: string[];
  enLigne: boolean;
}

function deuxLangues(data: any, champ: string, libelle: string, liste: string[]) {
  for (const l of LANGS) if (!rempli(data[l]?.[champ])) liste.push(`${libelle} manquant en ${NOM_LANGUE[l]}`);
}

function etat(statut: unknown, blocages: string[], avertissements: string[] = []): Etat {
  const s = (['brouillon', 'a-relire', 'publie', 'annule'] as const).find((x) => x === statut) ?? 'brouillon';
  return { statut: s, blocages, avertissements, enLigne: (s === 'publie' || s === 'annule') && blocages.length === 0 };
}

// --- Référentiels -----------------------------------------------------------

export async function getThematiques() {
  return (await getCollection('thematiques'))
    .filter((t) => rempli(t.data.fr?.nom) && rempli(t.data.en?.nom))
    .sort((a, b) => (a.data.ordre ?? 99) - (b.data.ordre ?? 99));
}

export async function getReglages() {
  return (await getCollection('reglages'))[0]?.data ?? {};
}

export async function getPage(id: string, lang: Lang) {
  const p = (await getCollection('pages')).find((x) => x.id === id);
  return { titre: p?.data[lang]?.titre ?? '', texte: await html(p?.data[lang]?.texte) };
}

export async function getMandats() {
  return (await getCollection('mandats')).sort((a, b) => (b.data.annee ?? '').localeCompare(a.data.annee ?? ''));
}

// --- Articles ---------------------------------------------------------------

export type Article = CollectionEntry<'articles'> & {
  etat: Etat;
  date: Date | null;
  auteurs: { nom: string; promotion?: string | null }[];
  themes: CollectionEntry<'thematiques'>[];
  couverture?: ImageMetadata;
  /** Zone du globe, si elle est renseignée et connue. */
  zone?: { id: string; fr: string; en: string; lat: number; lon: number };
};

export async function getArticles({ tous = APERCU } = {}): Promise<Article[]> {
  const [bruts, auteurs, themes] = await Promise.all([getCollection('articles'), getCollection('auteurs'), getThematiques()]);
  return bruts
    .map((a) => {
      const d = a.data;
      const b: string[] = [];
      deuxLangues(d, 'titre', 'Titre', b);
      deuxLangues(d, 'chapo', 'Chapô', b);
      deuxLangues(d, 'corps', 'Corps', b);
      const sign = d.auteurs.map((r) => auteurs.find((x) => x.id === idDeRef(r))).filter((x) => x && rempli(x.data.nom));
      if (!sign.length) b.push('Aucun auteur');
      const th = d.thematiques.map((r) => themes.find((x) => x.id === idDeRef(r))).filter((x) => !!x);
      if (!th.length) b.push('Aucune thématique');
      const date = parisDate(d.date);
      if (!date) b.push('Date de publication manquante');
      const couverture = image(d.image?.fichier);
      if (!couverture) b.push('Image de couverture manquante');
      if (!rempli(d.image?.alt_fr)) b.push("Texte alternatif de l'image manquant en français");
      if (!rempli(d.image?.alt_en)) b.push("Texte alternatif de l'image manquant en anglais");
      if (!rempli(d.image?.credit)) b.push("Crédit de l'image manquant");
      if (!rempli(d.image?.source)) b.push("Source de l'image manquante");
      if (!rempli(d.image?.licence)) b.push("Licence de l'image manquante");
      return {
        ...a,
        etat: etat(d.statut, b),
        date,
        auteurs: sign.map((x) => ({ nom: x!.data.nom!, promotion: x!.data.promotion })),
        themes: th as CollectionEntry<'thematiques'>[],
        couverture,
        zone: d.zone && ZONES[d.zone] ? { id: d.zone, ...ZONES[d.zone] } : undefined,
      };
    })
    .filter((a) => tous || a.etat.enLigne)
    .sort((a, b) => (b.date?.getTime() ?? Infinity) - (a.date?.getTime() ?? Infinity));
}

// --- Événements (sessions MUN et conférences) -------------------------------

type Brut = CollectionEntry<'sessions'> | CollectionEntry<'conferences'>;
export type Evenement = {
  type: 'mun' | 'conference';
  id: string;
  data: any;
  etat: Etat;
  debut: Date | null;
  /** Fin réelle, ou trois heures après le début si elle n'est pas saisie. */
  fin: Date | null;
  /** Fin du jour de la date limite d'inscription. */
  limite: Date | null;
  /** Le compte rendu n'est affiché que s'il existe dans les deux langues. */
  compteRenduComplet: boolean;
  chemin: string;
};

function evenement(type: Evenement['type'], e: Brut): Evenement {
  const d: any = e.data;
  const b: string[] = [];
  const av: string[] = [];
  deuxLangues(d, 'titre', 'Titre', b);
  deuxLangues(d, 'presentation', 'Présentation', b);
  const debut = parisDate(d.debut);
  if (!debut) b.push('Date de début manquante');
  if (!rempli(d.lieu)) b.push('Lieu manquant');
  if (type === 'mun') {
    deuxLangues(d, 'comite', 'Comité', b);
    for (const [k, l] of [['langue', 'Langue de la session'], ['niveau', 'Niveau'], ['public', 'Public']])
      if (!rempli(d[k])) b.push(`${l} manquant`);
  } else {
    if (!d.intervenants.some((i: any) => rempli(i.nom))) b.push('Aucun intervenant');
    for (const i of d.intervenants)
      if (rempli(i.nom) && !(rempli(i.qualite_fr) && rempli(i.qualite_en)))
        b.push(`Qualité de ${i.nom} à renseigner dans les deux langues`);
  }
  const cr = LANGS.map((l) => rempli(d[l]?.compte_rendu));
  if (cr[0] !== cr[1]) av.push(`Compte rendu masqué : version ${cr[0] ? 'anglaise' : 'française'} manquante`);
  const limite = parisDate(d.date_limite);
  return {
    type,
    id: e.id,
    data: d,
    etat: etat(d.statut, b, av),
    debut,
    fin: parisDate(d.fin) ?? (debut ? new Date(debut.getTime() + 3 * 3600e3) : null),
    limite: limite ? new Date(limite.getTime() + 24 * 3600e3) : null,
    compteRenduComplet: cr[0] && cr[1],
    chemin: `${type === 'mun' ? 'mun' : 'conferences'}/${e.id}`,
  };
}

export async function getEvenements({ type, tous = APERCU }: { type?: Evenement['type']; tous?: boolean } = {}) {
  const [s, c] = await Promise.all([getCollection('sessions'), getCollection('conferences')]);
  return [...s.map((e) => evenement('mun', e)), ...c.map((e) => evenement('conference', e))]
    .filter((e) => (!type || e.type === type) && (tous || e.etat.enLigne))
    .sort((a, b) => (a.debut?.getTime() ?? Infinity) - (b.debut?.getTime() ?? Infinity));
}

/** Sépare à venir (du plus proche au plus lointain) et passés (du plus récent au plus ancien). */
export function partager(evts: Evenement[], maintenant = Date.now()) {
  const aVenir = evts.filter((e) => !e.fin || e.fin.getTime() >= maintenant);
  const passes = evts.filter((e) => e.fin && e.fin.getTime() < maintenant).reverse();
  return { aVenir, passes };
}
