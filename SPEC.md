# SPEC — Site d'Audencia Global Affairs (v1)

Version du 12 novembre 2026. Rédigée à partir de l'entretien de cadrage ; aucune ligne de code n'existe encore.

## 1. Objectif

Un site public, bilingue français/anglais, pour l'association étudiante Audencia Global Affairs (AGA, Nantes), qui montre trois activités :

1. **Articles de décryptage géopolitique** écrits par les membres : le cœur du site.
2. **Conférences** avec intervenants (surtout des professeurs aujourd'hui).
3. **Sessions de simulation MUN** sur des thèmes précis, avec un agenda.

**Contrainte non négociable.** Rédacteurs et bureau ne sont pas développeurs. Publier un article, ajouter une session, changer le bureau ou le directeur de publication se fait depuis une interface web, sans toucher au code. Le site doit continuer à fonctionner sans intervention technique quand le bureau change chaque année.

## 2. Décisions issues de l'entretien

| Sujet | Décision |
|---|---|
| Relecture | Le rédacteur enregistre en brouillon dans le CMS ; le rédacteur en chef publie. |
| Verrou de publication | Règle de confiance (moins de 10 rédacteurs). Pas de blocage technique ; l'historique montre qui a publié (réglage `commit.identity: user` du CMS). |
| Langue | Site entièrement bilingue, sélecteur FR/EN visible sur toutes les pages. |
| Traduction | Obligatoire, faite par les membres, pour les articles **et** les événements, comptes rendus compris. |
| Volume | Moins de 10 rédacteurs, 1 à 4 articles par mois. |
| Auteurs | Nom et promotion seulement : pas de fiche, pas de photo, pas de page auteur. |
| Classement des articles | Thématiques uniquement (liste fermée gérée par le bureau). |
| Images | Crédit, source et licence obligatoires ; texte alternatif exigé. |
| Session MUN | Comité, délégations, documents de préparation, niveau et public, compte rendu après session. |
| Conférences | Annonce des conférences à venir, archive avec compte rendu écrit. Pas de vidéo, pas de fiches intervenants. |
| Agenda | Agenda commun, plus une page par activité qui filtre son type. |
| Inscriptions | Lien vers un formulaire externe, saisi pour chaque session. Le site ne collecte rien. |
| Statut | Association loi 1901 déclarée : elle est l'éditeur, son président est directeur de publication. |
| Accord d'Audencia | Pas encore demandé : prérequis bloquant (voir §3). |
| Domaine | Domaine propre en .fr ou .org, environ 10 à 15 € par an. |
| Comptes techniques | Tous créés sur la boîte mail générique de l'association. |
| Annexes v1 | Page bureau par mandat, newsletter (envoi manuel), formulaires contact et recrutement, mesure d'audience sans cookies. |
| Existant | Logo et charte à fournir ; événements passés à archiver au lancement. Aucun article à importer. |

## 3. Prérequis non techniques, bloquants avant la mise en ligne

Ces points ne dépendent pas du développement et doivent démarrer tout de suite.

1. **Accord écrit d'Audencia** sur l'usage du nom « Audencia » dans le nom du site, dans le nom de domaine et sur le logo. « Audencia » est une marque : ne pas acheter de domaine qui la contient avant cet accord. Demander en même temps si l'école impose une mention ou une charte.
2. **Choix et achat du domaine**, une fois l'accord obtenu.
3. **Boîte mail générique** qui possédera tous les comptes. Elle ne doit pas être hébergée sur le domaine du site : si le domaine expire, la boîte qui permet de le renouveler disparaît avec lui.
4. **Informations légales** : numéro RNA, adresse du siège, nom du président en exercice.
5. **Fichiers de la charte** : logo en SVG, couleurs, typographies et leurs licences.
6. **Liste des événements passés** à archiver, avec leurs comptes rendus dans les deux langues.

## 4. Architecture

### 4.1 Verdict sur l'hypothèse de départ

**Astro en statique + Pages CMS est retenu**, avec deux réserves à lever dans un prototype avant tout le reste (§11, étape 1).

Pourquoi ça tient :

- Un site statique n'a ni serveur, ni base de données, ni mises à jour de sécurité. Sans personne pour s'en occuper pendant un an, il reste en ligne. C'est l'argument décisif pour une association dont le bureau tourne.
- Le contenu vit dans des fichiers texte du dépôt : aucun enfermement chez un fournisseur, historique complet de qui a modifié quoi.
- Coût récurrent : le domaine seulement.

Les deux réserves de la première version de cette spec ont été levées le 15 novembre 2026 (détail au §14) : l'invitation par e-mail sans compte GitHub est documentée, et les formulaires acceptent plusieurs textes riches par fiche, ce qui permet la saisie bilingue dans un seul formulaire. Elles restent à confirmer en conditions réelles, sur le vrai dépôt, à l'étape 1.

Solution de repli si l'essai réel échoue : **Sveltia CMS** (même principe de fichiers dans le dépôt, gestion native du bilingue), au prix d'un compte GitHub par rédacteur.

Alternatives écartées :

| Option | Raison du rejet |
|---|---|
| WordPress, Ghost | Vrais rôles et vrai circuit de validation, mais hébergement payant, mises à jour et extensions à suivre : c'est ce qui casse quand le bureau change. |
| CMS hébergé (Sanity, Contentful…) | Rôles solides, mais quotas, dépendance à un fournisseur et intégration plus lourde, pour un besoin de validation réglé ici par la confiance. |
| Decap CMS avec workflow éditorial | Bloque techniquement la publication, ce qui n'est pas demandé, et impose un compte GitHub à chacun. |
| Constructeur de site (Squarespace, Wix…) | Abonnement annuel ; bilingue et agenda structuré médiocres. |

**Limite assumée.** Le contenu est modifiable sans développeur ; la mise en page et les fonctions ne le sont pas. Toute évolution de structure demandera quelqu'un qui sait coder. Le dépôt doit donc être compréhensible par un inconnu (§10).

### 4.2 Composants

| Rôle | Choix | Coût |
|---|---|---|
| Générateur | Astro, sortie 100 % statique, collections de contenu validées par schéma | 0 |
| CMS | Pages CMS (version hébergée), configuré par `.pages.yml` | 0 |
| Dépôt | GitHub, organisation au nom de l'association, **dépôt privé** (les brouillons y sont stockés) | 0 |
| Hébergement | Cloudflare Workers (fichiers statiques), déploiement automatique à chaque enregistrement dans le CMS. Cloudflare recommande désormais Workers plutôt que Pages pour les nouveaux projets. | 0 |
| Domaine | .fr ou .org chez un registrar français, renouvellement automatique | 10–15 €/an |
| Audience | Cloudflare Web Analytics (sans cookies, donc sans bandeau) | 0 |
| Newsletter | Brevo : formulaire avec double confirmation, campagnes envoyées à la main | 0 (300 e-mails/jour) |
| Formulaires | Tally (hébergé en UE) pour contact et recrutement, notification vers la boîte générique | 0 (formulaires et réponses illimités) |

### 4.3 Deux sites à partir du même dépôt

- **Production** (`domaine`) : n'affiche que les contenus au statut « Publié » et complets.
- **Aperçu** (`apercu.domaine`) : affiche aussi les brouillons, avec un bandeau « Brouillon ». Non indexé, protégé par un mot de passe partagé rangé dans le gestionnaire de mots de passe. C'est là que le rédacteur en chef relit la page réelle avant de publier.

Le site d'aperçu contient une page **« État des contenus »** : liste des brouillons, des contenus « À relire » et des contenus bloqués, avec la raison en clair (« traduction anglaise du corps manquante », « crédit de l'image manquant »).

### 4.4 Règle de robustesse

**Un contenu incomplet ou invalide n'est jamais publié, et ne casse jamais le site.** Il est écarté de la production et signalé sur la page « État des contenus ». Seule une erreur de code peut faire échouer une construction ; dans ce cas la version précédente reste en ligne. L'alerte par e-mail en cas d'échec est à configurer et à tester à l'étape 2 (§14).

### 4.5 Dates

Un site statique ne sait pas qu'une session est passée tant qu'il n'est pas reconstruit. Le classement « à venir / passé » est fait à la construction, puis corrigé dans le navigateur par un court script qui compare chaque date à la date du jour (fuseau Europe/Paris) et retire le bouton d'inscription une fois la date limite dépassée. Pas de tâche planifiée à surveiller ni à transmettre d'un bureau à l'autre.

## 5. Modèle de contenu

### 5.1 Principe bilingue

Chaque contenu est **une seule fiche** avec ses champs textuels en double (`fr` et `en`), pas deux fiches à apparier. Le rédacteur ne peut pas oublier une langue sans le voir, et le sélecteur de langue trouve toujours l'équivalent.

Les champs traduits ne sont pas obligatoires pour enregistrer un brouillon : on doit pouvoir sauvegarder un article à moitié traduit. Ils le sont pour publier, et c'est la construction du site qui l'applique (§4.4).

Dans les tableaux ci-dessous, « FR+EN » désigne un champ en double.

### 5.2 Article

| Champ | Type | Règle |
|---|---|---|
| Titre | texte, FR+EN | requis pour publier |
| Chapô | texte court, FR+EN | requis, 300 caractères au plus ; sert aussi d'extrait et de description pour les moteurs de recherche |
| Corps | texte riche, FR+EN | requis ; intertitres, listes, citations, liens, images dans le texte |
| Auteur(s) | référence vers Auteurs, 1 à 3 | requis |
| Thématique(s) | référence vers Thématiques, 1 à 2 | requis |
| Date de publication | date | requise ; une date future ne retarde pas la mise en ligne |
| Image de couverture | image | requise |
| Texte alternatif | texte, FR+EN | requis |
| Crédit | texte | requis (auteur ou organisme) |
| Source de l'image | URL | requise |
| Licence | liste : CC BY, CC BY-SA, CC0 / domaine public, Unsplash, création AGA, autorisation écrite | requise |
| Sources | texte riche | facultatif, affiché en fin d'article |
| À la une | case à cocher | l'article coché le plus récent ouvre la page d'accueil |
| Statut | Brouillon / À relire / Publié | Brouillon par défaut |

L'adresse d'un article est fixée à sa création et identique dans les deux langues (`/fr/articles/<identifiant>/`, `/en/articles/<identifiant>/`). Elle ne change plus ensuite, pour ne pas casser les liens partagés.

Sont affichés automatiquement : temps de lecture, date, articles de la même thématique, et l'avertissement « Les opinions exprimées n'engagent que leur auteur et non l'association ni Audencia ».

### 5.3 Auteur

Nom affiché, promotion ou programme. Rien d'autre. La fiche sert à éviter les fautes de frappe d'un article à l'autre ; elle ne produit aucune page. Sur demande d'un ancien, le nom est remplacé par des initiales en un seul endroit.

### 5.4 Thématique

Nom FR+EN, courte description FR+EN, ordre d'affichage. Liste fermée de 6 à 8 entrées au plus, arrêtée par le bureau. Chaque thématique a une page qui liste ses articles.

### 5.5 Session MUN

| Champ | Type | Règle |
|---|---|---|
| Titre | texte, FR+EN | requis |
| Thème et présentation | texte riche, FR+EN | requis |
| Comité simulé | texte, FR+EN | requis |
| Début, fin | date et heure | début requis |
| Lieu | texte (campus, salle) | requis |
| Langue de la session | Français / Anglais / Les deux | requise |
| Niveau | Débutant / Intermédiaire / Confirmé / Tous niveaux | requis |
| Public | Membres / Étudiants Audencia / Ouvert à tous | requis |
| Délégations | liste de pays ou d'entités, FR+EN | facultatif ; liste informative, l'attribution se fait dans le formulaire d'inscription |
| Documents de préparation | liste : intitulé FR+EN, fichier PDF | facultatif |
| Lien d'inscription | URL | facultatif |
| Date limite d'inscription | date | facultative |
| Statut | Brouillon / Publié / Annulé | une session annulée reste visible, marquée comme telle |
| Compte rendu | texte riche, FR+EN | rempli après la session |
| Résolution adoptée | PDF | facultatif |
| Distinctions | liste : intitulé FR+EN, nom | facultatif |
| Photos | liste : image, texte alternatif FR+EN, crédit | facultatif |

Une session passée sans compte rendu reste dans l'archive avec ses informations pratiques. Un compte rendu traduit dans une seule langue n'est pas affiché et apparaît sur la page « État des contenus ».

### 5.6 Conférence

Titre FR+EN ; intervenant(s) saisis directement dans la fiche (nom, qualité FR+EN) ; début ; lieu ; présentation FR+EN ; lien d'inscription facultatif ; statut ; après coup, compte rendu FR+EN, son auteur et des photos créditées.

### 5.7 Mandat (bureau)

Année (par exemple 2026-2027) ; liste de membres : nom, fonction FR+EN, photo et lien LinkedIn facultatifs ; case « mandat en cours ». La page de l'association montre le mandat en cours et, repliés dessous, les précédents.

### 5.8 Pages et réglages

Modifiables dans le CMS, en FR+EN : texte de présentation de l'association, présentation du MUN, texte « Nous rejoindre ». Une fiche **Réglages** unique : nom du directeur de publication, adresse du siège, RNA, e-mail de contact, liens des réseaux sociaux, adresses des formulaires Tally et Brevo. Les mentions légales se composent à partir de ces réglages : au changement de président, une seule ligne est à modifier.

## 6. Arborescence

Toutes les pages existent sous `/fr/` et `/en/`, avec les mêmes segments d'adresse dans les deux langues. La racine `/` redirige vers `/fr/`. Le sélecteur de langue mène à la même page dans l'autre langue, jamais à l'accueil.

```
/                          → redirection vers /fr/
/fr/                       Accueil : article à la une, derniers articles, prochains événements, newsletter
/fr/articles/              Liste paginée, filtre par thématique
/fr/articles/<id>/         Article
/fr/thematiques/<id>/      Articles d'une thématique
/fr/mun/                   Présentation du MUN, sessions à venir, archive
/fr/mun/<id>/              Session
/fr/conferences/           Conférences à venir, archive
/fr/conferences/<id>/      Conférence
/fr/agenda/                Tous les événements : à venir, puis passés par année
/fr/association/           Présentation, bureau en cours, anciens bureaux
/fr/nous-rejoindre/        Recrutement et « proposer un article » (formulaire Tally)
/fr/contact/               Formulaire Tally, e-mail, réseaux
/fr/mentions-legales/
/fr/confidentialite/
/fr/rss.xml                Flux des articles (un par langue)
/404
```

Menu principal : Articles · Conférences · MUN · Agenda · L'association · sélecteur FR/EN. Pied de page : newsletter, contact, nous rejoindre, réseaux, mentions légales, confidentialité.

## 7. Rôles et circuit de publication

| Rôle | Personnes | Accès |
|---|---|---|
| Rédacteur | moins de 10 | Pages CMS (invitation par e-mail) ; crée et modifie, laisse en « Brouillon » ou passe en « À relire » |
| Rédacteur en chef | 1 ou 2 | Même accès ; seul à passer un contenu en « Publié » |
| Bureau | 2 ou 3 | Même accès ; événements, mandats, réglages |
| Administrateurs | 2, jamais 1 | Propriétaires de l'organisation GitHub, de Cloudflare, du registrar, de Brevo, de Tally |

Circuit d'un article :

1. Le rédacteur crée l'article dans le CMS, écrit les deux versions, enregistre en « Brouillon ».
2. Il vérifie le rendu sur le site d'aperçu, puis passe en « À relire ».
3. Le rédacteur en chef relit sur l'aperçu, corrige, passe en « Publié ».
4. L'article est en ligne dans les cinq minutes, dans les deux langues, et dans le flux RSS.
5. Une correction après publication se fait de la même façon ; une correction de fond est signalée par une ligne datée en fin d'article.

Tous les accès au CMS ont techniquement les mêmes droits. La séparation des rôles est une règle écrite dans le guide, pas un verrou : c'est le choix fait à l'entretien.

## 8. Légal et données personnelles

- **Mentions légales** : association éditrice, RNA, siège, contact, directeur de publication (président en exercice), hébergeur avec ses coordonnées.
- **Politique de confidentialité** : ce qui est collecté et par qui (Brevo pour la newsletter, Tally pour les formulaires, Cloudflare pour l'audience anonyme), durées de conservation, droits d'accès et de suppression, adresse de contact.
- **Pas de bandeau cookies**, à condition qu'aucun composant n'en dépose. À vérifier pour les formulaires Brevo et Tally intégrés ; si l'un d'eux en dépose, il est remplacé par un bouton qui ouvre le formulaire dans un nouvel onglet.
- **Auteurs** : nom et promotion publiés avec leur accord ; remplacement par des initiales sur simple demande.
- **Intervenants** : accord écrit avant de publier un compte rendu de leurs propos.
- **Photos d'événements** : uniquement avec l'accord des personnes reconnaissables ; retrait sur demande.
- **Images** : la règle crédit, source, licence du §5.2 ; aucune photo d'agence de presse sans licence.
- **Droits sur les articles** : l'auteur garde ses droits et autorise l'association à publier ; une phrase à ce sujet figure dans le guide du rédacteur.
- **Droit de réponse** : la page contact indique comment l'exercer.
- **Formulaires d'inscription externes** : les données restent chez l'outil choisi par le bureau ; le guide rappelle de purger les listes après chaque session.

## 9. Exigences transverses

- **Identité** : couleurs, typographies et logo tirés de la charte fournie. Typographies hébergées avec le site, pas chargées depuis un tiers.
- **Mobile d'abord** : la plupart des lecteurs arriveront depuis Instagram ou LinkedIn.
- **Accessibilité** : contraste suffisant, navigation au clavier, attribut de langue correct sur chaque page, textes alternatifs.
- **Performance** : images redimensionnées et compressées à la construction ; score Lighthouse de 90 ou plus sur mobile pour la performance, l'accessibilité et le référencement.
- **Référencement et partage** : balises de langue alternée entre les versions FR et EN, plan du site, aperçu de partage avec image de couverture, titre et chapô.
- **Fichiers** : images de 2 Mo au plus, PDF de 10 Mo au plus, rappelés dans le CMS.

## 10. Pérennité et passation

Trois documents en français font partie de la livraison, dans le dépôt et en PDF dans l'espace partagé du bureau :

1. **Guide du rédacteur** (2 pages) : écrire, illustrer légalement, traduire, soumettre.
2. **Guide du bureau** : publier, ajouter une session ou une conférence, saisir un compte rendu, mettre à jour le bureau et les réglages, envoyer une newsletter, quoi faire quand un e-mail d'échec arrive.
3. **Fiche de passation annuelle**, une liste à cocher :
   - transmettre le gestionnaire de mots de passe et changer le mot de passe de la boîte générique ;
   - retirer du CMS les membres sortants, inviter les nouveaux ;
   - nommer les deux nouveaux administrateurs, retirer les anciens ;
   - créer le nouveau mandat, changer le directeur de publication ;
   - vérifier la date d'expiration du domaine et le moyen de paiement ;
   - changer le mot de passe du site d'aperçu ;
   - faire publier un article d'essai par le nouveau rédacteur en chef.

Règles de comptes :

- Tous les comptes sont au nom de la boîte générique. Aucun compte personnel n'est propriétaire de quoi que ce soit.
- La double authentification utilise une application de codes dont le secret est rangé dans le gestionnaire de mots de passe partagé, jamais le téléphone d'une personne. Les codes de secours y sont aussi.
- Domaine en renouvellement automatique, payé si possible pour plusieurs années.

Pour le futur développeur : un `README` qui explique la structure, les commandes et le lien entre `.pages.yml` et les schémas ; versions de Node et des dépendances figées ; aucune dépendance qui ne soit pas indispensable.

## 11. Étapes de réalisation

1. **Essai réel du CMS.** Le site et `.pages.yml` existent (§14). Les pousser sur le dépôt GitHub, installer Pages CMS et vérifier : invitation d'un rédacteur par e-mail sans compte GitHub ; confort de la saisie bilingue ; envoi d'image avec champs de crédit obligatoires ; déploiement Cloudflare déclenché par un enregistrement. En cas d'échec, basculer sur Sveltia CMS avant d'aller plus loin.
2. **Comptes et socle.** Organisation GitHub, dépôt privé, deux Workers Cloudflare (public et aperçu) reliés au dépôt, domaine, alerte en cas d'échec de construction.
3. **Modèle de contenu.** Schémas des collections, configuration du CMS avec libellés et aides en français, règle « incomplet = non publié », page « État des contenus ».
4. **Gabarits et identité.** Toutes les pages du §6 dans les deux langues, sélecteur de langue, charte appliquée.
5. **Intégrations.** Brevo, Tally, audience, flux RSS, plan du site, aperçus de partage.
6. **Pages légales** générées à partir des réglages.
7. **Documentation** du §10.
8. **Chargement du contenu initial** par le bureau lui-même, à partir des guides : thématiques, mandat en cours, événements passés, deux ou trois premiers articles. C'est le premier test des guides.
9. **Vérification de bout en bout** (§13).
10. **Mise en ligne**, une fois les prérequis du §3 levés.

## 12. Hors périmètre de la v1

- Blocage technique de la publication, rôles différenciés dans le CMS, alerte e-mail à chaque publication.
- Pages auteur, biographies, photos des rédacteurs.
- Classement par zone géographique, formats d'articles distincts, dossiers ou séries.
- Traduction automatique, sous quelque forme que ce soit.
- Fiches intervenants, vidéos ou replays de conférences.
- Inscription, jauge, liste d'attente ou paiement gérés par le site.
- Envoi automatique de la newsletter à partir des articles.
- Abonnement à l'agenda (.ics) et bouton « ajouter à mon calendrier ».
- Publication programmée à une date future.
- Recherche dans le site, commentaires, espace membre.
- Page partenaires ou sponsors.
- Import d'articles publiés ailleurs.
- Création d'une identité visuelle : la charte existante est appliquée telle quelle.

## 13. Vérification de bout en bout

À réaliser sur le vrai domaine, avant annonce publique, **par deux membres non développeurs munis uniquement des guides**, pendant que le développeur observe sans intervenir. Chaque ligne est notée réussie ou échouée ; tout échec est corrigé (dans le site ou dans le guide) puis rejoué.

**A. Circuit d'un article**

1. Un nouveau rédacteur reçoit son invitation et entre dans le CMS sans créer de compte GitHub.
2. Il crée un article avec la seule version française et enregistre : l'enregistrement réussit, l'article apparaît sur l'aperçu avec le bandeau « Brouillon » et sur « État des contenus » avec la mention de la traduction manquante. Il est absent de la production, y compris par son adresse directe.
3. Quelqu'un passe cet article incomplet en « Publié » : il reste absent de la production, et le reste du site est intact.
4. Le rédacteur ajoute une image sans crédit : même résultat, raison affichée.
5. Il complète tout et passe en « À relire » ; le rédacteur en chef publie : l'article est en ligne en moins de cinq minutes sous `/fr/` et `/en/`, dans la liste, sur la page de sa thématique, dans les deux flux RSS, avec crédit d'image, avertissement et temps de lecture.
6. Depuis l'article en français, le sélecteur mène au même article en anglais, et inversement.
7. Le lien, collé dans LinkedIn et WhatsApp, affiche titre, chapô et image.
8. Le rédacteur en chef repasse l'article en « Brouillon » : il disparaît de la production.

**B. Événements**

9. Le bureau crée une session MUN à venir avec délégations, un PDF et un lien d'inscription : elle apparaît dans l'agenda, sur la page MUN et sur l'accueil ; le PDF se télécharge ; le bouton ouvre le formulaire.
10. Une session dont la date limite d'inscription est hier n'affiche plus de bouton. Une session datée d'hier figure dans les sessions passées **sans nouvelle construction du site**.
11. Le bureau ajoute le compte rendu d'une session passée en français seulement : rien ne s'affiche et l'état le signale. Une fois la version anglaise ajoutée, le compte rendu paraît dans les deux langues.
12. Une session passée en « Annulé » reste visible, marquée annulée, sans bouton d'inscription.
13. Mêmes vérifications 9 et 11 pour une conférence.

**C. Vie de l'association**

14. Le bureau crée un nouveau mandat et le marque en cours : la page de l'association change, l'ancien mandat passe dans l'archive.
15. Le nom du directeur de publication est modifié dans les réglages : les mentions légales changent dans les deux langues.
16. Inscription à la newsletter avec une adresse réelle : e-mail de confirmation reçu, contact visible dans Brevo après confirmation, désinscription fonctionnelle.
17. Les formulaires de contact et de recrutement arrivent dans la boîte générique.

**D. Contrôles techniques, faits par le développeur**

18. Aucun cookie déposé et aucune requête vers un tiers non déclaré, sur l'accueil, un article et la page contact.
19. Lighthouse mobile à 90 ou plus sur l'accueil, un article et une session.
20. Parcours complet au clavier ; attribut de langue correct sur une page de chaque langue.
21. Une adresse inexistante affiche la page 404 ; `/` redirige vers `/fr/` ; le site d'aperçu demande son mot de passe et n'est pas indexable.
22. Une erreur de code volontaire sur une branche d'essai fait échouer la construction : la production reste inchangée et l'e-mail d'échec arrive.
23. Les visites de la journée apparaissent dans la mesure d'audience.

**E. Répétition de passation**

24. Un membre qui n'a pas participé au projet déroule la fiche de passation avec le gestionnaire de mots de passe pour seul point de départ : il se connecte à chaque service, retire un accès, en ajoute un et publie un article d'essai. Tout blocage est une anomalie de la documentation, à corriger avant le lancement.

**F. Conformité**

25. Mentions légales et politique de confidentialité relues par le président ; accord d'Audencia archivé dans l'espace du bureau ; domaine en renouvellement automatique, enregistré au nom de l'association.

La v1 est terminée quand les 25 points sont réussis.

## 14. État au 16 novembre 2026

### Vérifié sur les documentations officielles

| Point | Résultat | Source |
|---|---|---|
| Rédacteurs sans compte GitHub | **Confirmé.** « Collaborators are invited by email. Use them when someone needs to edit content or media but does not have a GitHub account. » | Pages CMS, Collaborators |
| Rôles dans le CMS | Aucun rôle rédacteur / publieur. Les collaborateurs ne peuvent ni modifier `.pages.yml` ni gérer les collaborateurs. Conforme à la règle de confiance. | idem |
| Qui a publié quoi | Par défaut, les enregistrements d'un collaborateur ne portent **pas** son nom. Corrigé par `settings.commit.identity: user` dans `.pages.yml`. | idem |
| Saisie bilingue en une fiche | Champs `object` imbriqués et plusieurs `rich-text` par fiche : confirmé. Pas de gestion multilingue native, d'où les champs en double. | Pages CMS, Fields, Object, Rich-text |
| Références, listes, médias, PDF | Confirmé. Aucune limite de poids de fichier n'est documentée : les 2 Mo restent une consigne du guide. | Pages CMS, Reference, List, Media |
| **Pages ou Workers** | **Changement.** La page d'accueil de Cloudflare Pages dit : « Start new projects with Workers. » Pages fonctionne toujours, mais l'hébergement est spécifié et configuré sur Workers. Redirections, en-têtes, domaines personnalisés, déploiement depuis Git et code exécuté avant les fichiers statiques y sont pris en charge. | Cloudflare, Pages et guide « Migrate from Pages to Workers » |
| Limites gratuites (Pages) | 500 constructions par mois, une à la fois, 20 000 fichiers, 25 Mio par fichier. Celles de Workers Builds n'ont pas été lues. | Cloudflare, Pages Limits |
| Alerte de déploiement | Pour Pages, l'alerte « Project updates » (déploiement démarré, échoué, réussi) est incluse dans toutes les offres. L'équivalent pour Workers Builds n'a pas été trouvé : à configurer et tester. | Cloudflare, Notifications |
| Tâches planifiées GitHub | « In a public repository, scheduled workflows are automatically disabled when no repository activity has occurred in 60 days. » Ne concerne donc pas un dépôt privé ; l'argument de la première version de cette spec était faux. Le script dans le navigateur est conservé pour sa simplicité. | GitHub Docs |
| Tally gratuit | Formulaires et réponses illimités « within our fair use guidelines », notifications par e-mail au propriétaire incluses. La suppression automatique des réponses est réservée à l'offre Business : la purge se fait à la main. Données stockées en Europe, accord de sous-traitance inclus dans les conditions. | Tally, Pricing et GDPR |
| Brevo gratuit | 300 e-mails par jour. Les e-mails portent la mention « Sent with Brevo ». | Brevo, Pricing |

### Non vérifié : à contrôler à la main avant la mise en ligne

- **Cookies des formulaires Tally intégrés.** La politique de Tally ne parle que de « cookies essentiels » pour son propre site et ne dit rien des formulaires intégrés. À mesurer sur le site réel (§13, point 18). Repli prévu : un bouton vers le formulaire.
- **Formulaire Brevo** : cookies, CAPTCHA, double confirmation sur l'offre gratuite. Le centre d'aide de Brevo refuse les lectures automatiques ; seule une réponse de la communauté Brevo indique que la double confirmation fonctionne sur l'offre gratuite.
- **Cloudflare Web Analytics sans cookie** : la documentation lue ne le dit pas explicitement. À mesurer aussi.
- **Workers Builds** : dépôt privé, deux Workers sur un même dépôt, quota gratuit de constructions, alerte d'échec.
- **Nom de fichier d'un nouvel article** (`{fields.fr.titre}` dans `.pages.yml`) : écrit d'après la documentation, à essayer dans le vrai CMS.

### Construit et testé

Les étapes 3, 4, 6 et 7 du §11 sont réalisées, avec un contenu et une identité visuelle de démonstration.

Testé sur le site construit, servi par le moteur de Cloudflare en local (`wrangler dev`) :

- `/` redirige vers `/fr/` ; une adresse inexistante affiche la page 404 ;
- le site d'aperçu répond 401 sans mot de passe ou avec un mauvais, 200 avec le bon, et interdit l'indexation ;
- le sélecteur de langue mène à la même page ; brouillon et article « Publié » incomplet sont absents du site public, y compris par leur adresse ;
- avec l'horloge avancée, une session passée change de liste et perd son bouton sans reconstruction ; le bouton disparaît après la date limite ;
- aucun cookie, aucune requête vers un tiers ;
- Lighthouse mobile sur l'accueil, un article, une session et l'agenda : 99 à 100 en performance, 100 en accessibilité, bonnes pratiques et référencement (après correction d'un contraste insuffisant sur les événements annulés) ;
- au clavier, tous les liens et boutons sont atteignables avec un contour visible, et le lien d'évitement fonctionne.

Les points 18 à 21 du §13 sont donc passés sur le contenu de démonstration ; ils seront à repasser sur le vrai domaine, formulaires branchés.

Reste à faire : étapes 1, 2, 5 (brancher Brevo, Tally, l'audience), 8, 9 et 10, plus l'application de la vraie charte. Rien n'a encore été déployé sur Cloudflare ni relié à un vrai dépôt GitHub.
