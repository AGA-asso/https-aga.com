// Schémas des contenus. Ils sont volontairement tolérants : un contenu incomplet
// ne doit jamais faire échouer la construction du site. La règle « incomplet =
// non publié » est appliquée dans src/lib/content.ts.
// Chaque collection correspond à une entrée de .pages.yml (le formulaire du CMS).
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const texte = z.string().nullish();
// Le YAML transforme les dates non citées en objets Date : on les ramène à du texte.
const date = z.preprocess(
  (v) => (v instanceof Date ? v.toISOString().slice(0, 16) : v),
  z.string().nullish(),
);
const liste = <T extends z.ZodTypeAny>(t: T) =>
  z.preprocess((v) => (v == null ? [] : Array.isArray(v) ? v : [v]), z.array(t));
const langue = (champs: Record<string, z.ZodTypeAny>) => z.object(champs).partial().nullish();
const yaml = (dossier: string) => glob({ pattern: '*.{yaml,yml}', base: `./src/content/${dossier}` });

const image = z
  .object({ fichier: texte, alt_fr: texte, alt_en: texte, credit: texte, source: texte, licence: texte })
  .partial()
  .nullish();
const photos = liste(z.object({ fichier: texte, alt_fr: texte, alt_en: texte, credit: texte }).partial());

const articles = defineCollection({
  loader: yaml('articles'),
  schema: z.object({
    statut: texte,
    a_la_une: z.boolean().nullish(),
    date,
    auteurs: liste(z.string()),
    thematiques: liste(z.string()),
    fr: langue({ titre: texte, chapo: texte, corps: texte }),
    en: langue({ titre: texte, chapo: texte, corps: texte }),
    image,
    sources: texte,
  }),
});

const evenement = { titre: texte, presentation: texte, compte_rendu: texte };

const sessions = defineCollection({
  loader: yaml('sessions'),
  schema: z.object({
    statut: texte,
    debut: date,
    fin: date,
    lieu: texte,
    langue: texte,
    niveau: texte,
    public: texte,
    fr: langue({ ...evenement, comite: texte }),
    en: langue({ ...evenement, comite: texte }),
    delegations: liste(z.object({ fr: texte, en: texte }).partial()),
    documents: liste(z.object({ intitule_fr: texte, intitule_en: texte, fichier: texte }).partial()),
    inscription: texte,
    date_limite: date,
    resolution: texte,
    distinctions: liste(z.object({ intitule_fr: texte, intitule_en: texte, nom: texte }).partial()),
    photos,
  }),
});

const conferences = defineCollection({
  loader: yaml('conferences'),
  schema: z.object({
    statut: texte,
    debut: date,
    fin: date,
    lieu: texte,
    fr: langue(evenement),
    en: langue(evenement),
    intervenants: liste(z.object({ nom: texte, qualite_fr: texte, qualite_en: texte }).partial()),
    inscription: texte,
    date_limite: date,
    auteur_compte_rendu: texte,
    photos,
  }),
});

const auteurs = defineCollection({
  loader: yaml('auteurs'),
  schema: z.object({ nom: texte, promotion: texte }),
});

const thematiques = defineCollection({
  loader: yaml('thematiques'),
  schema: z.object({
    ordre: z.number().nullish(),
    fr: langue({ nom: texte, description: texte }),
    en: langue({ nom: texte, description: texte }),
  }),
});

const mandats = defineCollection({
  loader: yaml('mandats'),
  schema: z.object({
    annee: texte,
    en_cours: z.boolean().nullish(),
    membres: liste(
      z.object({ nom: texte, fonction_fr: texte, fonction_en: texte, photo: texte, linkedin: texte }).partial(),
    ),
  }),
});

const pages = defineCollection({
  loader: yaml('pages'),
  schema: z.object({
    fr: langue({ titre: texte, texte: texte }),
    en: langue({ titre: texte, texte: texte }),
  }),
});

const reglages = defineCollection({
  loader: yaml('reglages'),
  schema: z
    .object({
      directeur_publication: texte,
      siege: texte,
      rna: texte,
      email: texte,
      instagram: texte,
      linkedin: texte,
      brevo_formulaire: texte,
      tally_contact: texte,
      tally_recrutement: texte,
      cloudflare_analytics: texte,
    })
    .partial(),
});

export const collections = { articles, sessions, conferences, auteurs, thematiques, mandats, pages, reglages };
