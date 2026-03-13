/**
 * qrGenerator.js  —  src/utils/qrGenerator.js
 *
 * Builds a vCard 3.0 string from userData.
 * userData dolazi iz OnboardingModal forme sa poljima:
 *   name, title, company, email, phone, website, address
 * Editor splituje 'name' na firstName/lastName.
 */

export function buildVCard(userData, sections = []) {
  // Ime — Editor splituje 'name' na firstName/lastName
  const firstName = userData.firstName || '';
  const lastName  = userData.lastName  || '';
  // Fallback: ako splitovanje nije uradjeno, uzmi direktno name polje
  const fullName  = firstName || lastName
    ? `${firstName} ${lastName}`.trim()
    : (userData.name || '');

  // Sva ostala polja — čitaj direktno iz userData (forma ih šalje pod ovim imenima)
  // Plus skenira sekcije kao backup za custom template field nazive
  const find = (...keywords) => {
    const sec = sections.find(s =>
      s.field && keywords.some(kw => s.field.toLowerCase().includes(kw))
    );
    if (!sec) return '';
    if (sec.field === 'name') return fullName;
    return userData[sec.field] || '';
  };

  const phone   = userData.phone    || userData.phoneNumber || userData.mobile || find('phone','mobile','tel','cell') || '';
  const email   = userData.email    || find('email','mail') || '';
  const company = userData.company  || userData.organization || find('company','org','business') || '';
  const title   = userData.title    || userData.jobTitle    || find('title','job','position','role') || '';
  const website = userData.website  || find('website','url','web') || '';
  const address = userData.address  || find('address','location','city') || '';

  // Splituj fullName za N polje
  const parts = fullName.split(/\s+/);
  const fn    = parts[0] || '';
  const ln    = parts.slice(1).join(' ') || '';

  const vcardFirstName = firstName || fn;
  const vcardLastName  = lastName  || ln;

  return [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${vcardLastName};${vcardFirstName};;;`,
    `FN:${fullName}`,
    company ? `ORG:${company}`           : null,
    title   ? `TITLE:${title}`           : null,
    phone   ? `TEL;TYPE=CELL:${phone}`   : null,
    email   ? `EMAIL;TYPE=WORK:${email}` : null,
    website ? `URL:${website}`           : null,
    address ? `ADR;TYPE=WORK:;;${address};;;;` : null,
    'END:VCARD',
  ].filter(Boolean).join('\r\n');
}