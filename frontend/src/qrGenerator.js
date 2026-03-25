/**
 * qrGenerator.js  —  src/utils/qrGenerator.js (ili src/qrGenerator.js)
 *
 * Builds a vCard 3.0 string za QR kod.
 *
 * POPRAVKE:
 * 1. Transliteracija dijakritika → ASCII (š→s, č→c, ć→c, đ→dj, ž→z)
 *    UTF-8 karakteri troše 2-3 bajta svaki, ASCII 1 bajt.
 *    qrcode biblioteka baca overflow grešku kada vCard pređe limit.
 * 2. Uklonjen foldLine — RFC line wrapping kvari skeniranje na mobilnim.
 * 3. Separator \n umjesto \r\n — bolja kompatibilnost sa iOS/Android skenerima.
 */

const DIACRITIC_MAP = {
  'š':'s','Š':'S','č':'c','Č':'C','ć':'c','Ć':'C',
  'đ':'dj','Đ':'Dj','ž':'z','Ž':'Z',
  'ä':'a','Ä':'A','ö':'o','Ö':'O','ü':'u','Ü':'U','ß':'ss',
  'à':'a','á':'a','â':'a','ã':'a','å':'a',
  'À':'A','Á':'A','Â':'A','Ã':'A','Å':'A',
  'è':'e','é':'e','ê':'e','ë':'e',
  'È':'E','É':'E','Ê':'E','Ë':'E',
  'ì':'i','í':'i','î':'i','ï':'i',
  'Ì':'I','Í':'I','Î':'I','Ï':'I',
  'ò':'o','ó':'o','ô':'o','õ':'o',
  'Ò':'O','Ó':'O','Ô':'O','Õ':'O',
  'ù':'u','ú':'u','û':'u',
  'Ù':'U','Ú':'U','Û':'U',
  'ý':'y','Ý':'Y','ñ':'n','Ñ':'N','ç':'c','Ç':'C',
};

function transliterate(str) {
  if (!str) return '';
  return String(str).split('').map(c => DIACRITIC_MAP[c] ?? c).join('');
}

function escapeVCard(value) {
  if (!value) return '';
  return transliterate(String(value))
    .replace(/\\/g, '\\\\')
    .replace(/;/g,  '\\;')
    .replace(/,/g,  '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}

function findValue(userData, sections, ...keywords) {
  for (const kw of keywords) {
    for (const key of Object.keys(userData)) {
      if (key.toLowerCase().includes(kw) && userData[key]) {
        return userData[key];
      }
    }
  }
  for (const kw of keywords) {
    const sec = sections.find(s => s.field && s.field.toLowerCase().includes(kw));
    if (sec && sec.field && userData[sec.field]) {
      return userData[sec.field];
    }
  }
  return '';
}

export function buildVCard(userData, sections = []) {
  const firstName = userData.firstName || '';
  const lastName  = userData.lastName  || '';
  const fullName  = (firstName || lastName)
    ? `${firstName} ${lastName}`.trim()
    : findValue(userData, sections, 'name', 'fullname', 'ime') || '';

  const phone   = findValue(userData, sections, 'phone', 'tel', 'mobile', 'cell', 'broj', 'mobitel');
  const email   = findValue(userData, sections, 'email', 'mail', 'mejl');
  const company = findValue(userData, sections, 'company', 'org', 'firm', 'business', 'kompan', 'firma');
  const title   = findValue(userData, sections, 'title', 'job', 'position', 'role', 'pozicij', 'zvanje');
  const website = findValue(userData, sections, 'website', 'url', 'web', 'site', 'link');
  const address = findValue(userData, sections, 'address', 'addr', 'location', 'city', 'adres', 'grad');

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${escapeVCard(lastName)};${escapeVCard(firstName)};;;`,
    `FN:${escapeVCard(fullName)}`,
    company ? `ORG:${escapeVCard(company)}`         : null,
    title   ? `TITLE:${escapeVCard(title)}`         : null,
    phone   ? `TEL;TYPE=CELL:${escapeVCard(phone)}` : null,
    email   ? `EMAIL:${escapeVCard(email)}`         : null,
    website ? `URL:${escapeVCard(website)}`          : null,
    address ? `ADR;TYPE=WORK:;;${escapeVCard(address)};;;;` : null,
    'END:VCARD',
  ].filter(Boolean);

  // \n bez foldinga — ključno za mobilne skenere
  return lines.join('\n') + '\n';
}