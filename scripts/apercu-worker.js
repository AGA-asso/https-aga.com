// Worker du site d'aperçu : demande un mot de passe partagé avant de servir les pages.
// Le site public n'utilise pas ce fichier (voir wrangler.jsonc et wrangler.apercu.jsonc).
// Le mot de passe est le secret APERCU_MOT_DE_PASSE du Worker d'aperçu ; l'identifiant est libre.
export default {
  async fetch(request, env) {
    const attendu = env.APERCU_MOT_DE_PASSE;
    const recu = (request.headers.get('Authorization') || '').replace(/^Basic /, '');
    let ok = false;
    try {
      ok = !!attendu && atob(recu).split(':').slice(1).join(':') === attendu;
    } catch {}
    if (!ok) {
      return new Response('Accès réservé au bureau.', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Apercu AGA", charset="UTF-8"', 'X-Robots-Tag': 'noindex' },
      });
    }
    if (new URL(request.url).pathname === '/robots.txt') return new Response('User-agent: *\nDisallow: /\n');
    return env.ASSETS.fetch(request);
  },
};
