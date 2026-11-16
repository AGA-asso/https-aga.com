// Toutes les dates saisies dans le CMS sont des heures de Paris, sans fuseau.
export type Lang = 'fr' | 'en';
const LOCALE = { fr: 'fr-FR', en: 'en-GB' } as const;
const TZ = 'Europe/Paris';

export function parisDate(s?: string | null): Date | null {
  const m = s ? String(s).match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/) : null;
  if (!m) return null;
  const utc = Date.UTC(+m[1], +m[2] - 1, +m[3], +(m[4] ?? 0), +(m[5] ?? 0));
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ, hourCycle: 'h23',
    year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric',
  }).formatToParts(new Date(utc));
  const g = (t: string) => +parts.find((p) => p.type === t)!.value;
  const vuDeParis = Date.UTC(g('year'), g('month') - 1, g('day'), g('hour'), g('minute'));
  return new Date(utc - (vuDeParis - utc));
}

export const aUneHeure = (s?: string | null) => !!s && /[T ]\d{2}:\d{2}/.test(String(s));

const fmt = (d: Date, lang: Lang, o: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat(LOCALE[lang], { timeZone: TZ, ...o }).format(d);

export const jourLong = (d: Date, lang: Lang) =>
  fmt(d, lang, { day: 'numeric', month: 'long', year: 'numeric' });
export const jourComplet = (d: Date, lang: Lang) =>
  fmt(d, lang, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
export const heure = (d: Date, lang: Lang) =>
  fmt(d, lang, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).replace(':', lang === 'fr' ? ' h ' : ':');
export const jourDuMois = (d: Date) => fmt(d, 'fr', { day: '2-digit' });
export const moisCourt = (d: Date, lang: Lang) => fmt(d, lang, { month: 'short' }).replace('.', '');
export const annee = (d: Date) => fmt(d, 'fr', { year: 'numeric' });
