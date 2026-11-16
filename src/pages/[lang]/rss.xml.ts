// Flux RSS des articles, un par langue.
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { t } from '../../i18n/ui';
import { LANGS, getArticles, lien, type Lang } from '../../lib/content';

export const getStaticPaths = () => LANGS.map((lang) => ({ params: { lang } }));

export async function GET(context: APIContext) {
  const lang = context.params.lang as Lang;
  const articles = await getArticles({ tous: false });
  return rss({
    title: t(lang)('site'),
    description: t(lang)('description'),
    site: context.site!,
    customData: `<language>${lang}</language>`,
    items: articles.map((a) => ({
      title: a.data[lang]!.titre!,
      description: a.data[lang]!.chapo!,
      pubDate: a.date!,
      link: lien(lang, `articles/${a.id}`),
      author: a.auteurs.map((x) => x.nom).join(', '),
    })),
  });
}
