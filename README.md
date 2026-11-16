# Site d'Audencia Global Affairs

Site statique bilingue (français / anglais) : articles, conférences, sessions MUN.
Le cahier des charges est dans [`SPEC.md`](SPEC.md).

**Vous voulez publier un article ou ajouter une session ?** Vous n'avez rien à faire ici :
tout se passe dans le CMS. Voir [`docs/guide-redacteur.md`](docs/guide-redacteur.md)
et [`docs/guide-bureau.md`](docs/guide-bureau.md). Passation annuelle : [`docs/passation.md`](docs/passation.md).

Le reste de ce fichier s'adresse à la personne qui modifie le code.

## Comment ça marche

| Élément | Rôle |
|---|---|
| `src/content/` | Les contenus, un fichier YAML par article, session, conférence… écrits par le CMS. |
| `src/media/`, `public/documents/` | Images et PDF déposés depuis le CMS. |
| `.pages.yml` | Les formulaires de Pages CMS. |
| `src/content.config.ts` | Les schémas des contenus. Tout champ de `.pages.yml` doit y figurer. |
| `src/lib/content.ts` | Lecture des contenus et **règle de publication**. |
| `src/i18n/ui.ts` | Textes d'interface dans les deux langues. |
| `src/pages/[lang]/` | Les pages, générées pour `/fr/` et `/en/`. |
| `src/styles/global.css` | Tout le style ; couleurs et typographies en variables en tête de fichier. |

Règle de publication : un contenu n'est en ligne que s'il est au statut « Publié » et complet
dans les deux langues. Sinon il est écarté sans faire échouer la construction. Sur le site
d'aperçu, tout est visible et `/apercu/etat/` liste ce qui manque.

## Commandes

```bash
npm install
```

```bash
npm run dev
```

```bash
npm run build && npm run preview
```

```bash
npm run build:apercu && npm run preview:apercu
```

`dev` sert au développement. `build` produit le site public dans `dist/` ; `build:apercu` produit
le site d'aperçu dans `dist-apercu/`, brouillons compris. Les deux commandes `preview` les servent
avec le moteur de Cloudflare, comme en ligne (mot de passe de l'aperçu en local : `essai`).

## Hébergement : deux Workers Cloudflare sur le même dépôt

Cloudflare recommande de créer les nouveaux projets sur Workers plutôt que sur Pages. Chaque
Worker est relié au dépôt GitHub (Workers Builds) et se redéploie à chaque enregistrement du CMS.

| Worker | Configuration | Commande de construction | Commande de déploiement |
|---|---|---|---|
| `aga-site` (public) | `wrangler.jsonc` | `npm run build` | `npx wrangler deploy` |
| `aga-apercu` (brouillons) | `wrangler.apercu.jsonc` | `npm run build:apercu` | `npx wrangler deploy -c wrangler.apercu.jsonc` |

Variables de construction : `SITE_URL` (adresse publique) sur les deux. Secret du Worker d'aperçu :
`APERCU_MOT_DE_PASSE`. Sur l'aperçu, le navigateur demande un identifiant et un mot de passe :
l'identifiant est libre, seul le mot de passe compte.

Le site public ne contient aucun code serveur : `public/_redirects` envoie `/` vers `/fr/`, et
`404.html` sert de page d'erreur.
