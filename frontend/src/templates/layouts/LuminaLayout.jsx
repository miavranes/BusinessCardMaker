import React from 'react';
import logoIcon from '../../assets/logo.png';
import { getSectionPos, getSectionTextStyle } from '../../sectionSchema';

export const luminaTemplate = {
  id: 8,
  category: "modern",
  name: "Lumina",
  bg: "#c4856a",
  bgBack: "#c4856a",
  accent: "#c4856a",
  text: "#ffffff",
  textBack: "#ffffff",
  textMuted: "#f0e6df",
  fontName: "'Playfair Display', serif",
  fontBody: "'Raleway', sans-serif",
  defaultData: {
    firstName: "Mia",
    lastName: "Vranes",
    title: "Graphic Designer",
    phone: "+123-456-7890",
    email: "mia@example.com",
    website: "www.miavranes.com",
    address: "123 Name Street",
    city: "Brooklyn, NY",
    instagram: "Instagram: mia_vranes",
    facebook: "Facebook: Mia Vranes",
  },
  sectionsFront: [
    { id: 'front-name', type: 'text', field: 'name', label: 'Name', x: 0.10, y: 0.40, width: 0.80, height: 0.20, fontSize: 28, fontFamily: "'Raleway', sans-serif", fontWeight: '700', color: '#ffffff' },
    { id: 'front-logo', type: 'logo', label: 'Logo', x: 0.25, y: 0.05, width: 0.50, height: 0.30 },
  ],
  sectionsBack: [
    { id: 'back-name',      type: 'text', field: 'name',      label: 'Name',      x: 0.05, y: 0.75, width: 0.35, height: 0.10, fontSize: 13, fontFamily: "'Raleway', sans-serif", fontWeight: '400', color: '#ffffff' },
    { id: 'back-title',     type: 'text', field: 'title',     label: 'Title',     x: 0.05, y: 0.87, width: 0.35, height: 0.08, fontSize: 10, fontFamily: "'Raleway', sans-serif", fontStyle: 'italic', color: '#f0e6df' },
    { id: 'back-address',   type: 'text', field: 'address',   label: 'Address',   x: 0.50, y: 0.18, width: 0.45, height: 0.08, fontSize: 8, fontFamily: "'Raleway', sans-serif", color: '#555555' },
    { id: 'back-city',      type: 'text', field: 'city',      label: 'City',      x: 0.50, y: 0.26, width: 0.45, height: 0.08, fontSize: 8, fontFamily: "'Raleway', sans-serif", color: '#555555' },
    { id: 'back-email',     type: 'text', field: 'email',     label: 'Email',     x: 0.50, y: 0.42, width: 0.45, height: 0.08, fontSize: 8, fontFamily: "'Raleway', sans-serif", color: '#555555' },
    { id: 'back-website',   type: 'text', field: 'website',   label: 'Website',   x: 0.50, y: 0.50, width: 0.45, height: 0.08, fontSize: 8, fontFamily: "'Raleway', sans-serif", color: '#555555' },
    { id: 'back-instagram', type: 'text', field: 'instagram', label: 'Instagram', x: 0.50, y: 0.65, width: 0.45, height: 0.08, fontSize: 8, fontFamily: "'Raleway', sans-serif", color: '#555555' },
    { id: 'back-facebook',  type: 'text', field: 'facebook',  label: 'Facebook',  x: 0.50, y: 0.73, width: 0.45, height: 0.08, fontSize: 8, fontFamily: "'Raleway', sans-serif", color: '#555555' },
  ],
};

const findSection = (sections, baseId) =>
  sections.find(s => s.id === baseId || s.id.startsWith(`${baseId}-moved-`));

const findLogoSections = (sections, isBack) => {
  const ownPrefix   = isBack ? 'back-logo'  : 'front-logo';
  const otherPrefix = isBack ? 'front-logo' : 'back-logo';
  return sections.filter(
    s => s.type === 'logo' && (
      s.id === ownPrefix ||
      s.id.startsWith(`${ownPrefix}-moved-`) ||
      s.id.startsWith(`${otherPrefix}-moved-`)
    )
  );
};

const findMovedInSections = (sections, isBack) => {
  const otherPrefix = isBack ? 'front-' : 'back-';
  return sections.filter(s => s.id.startsWith(otherPrefix) && s.id.includes('-moved-') && s.type !== 'logo');
};

export default function LuminaLayout({
  template, isBack = false, containerWidth, userData, sections = [], onSelectSection, backgroundColor,
}) {
  const t = template || luminaTemplate;
  const scale = (containerWidth || 400) / 400;
  const data = { ...t.defaultData, ...userData };

  const resolvedBg = backgroundColor || (isBack ? t.bgBack : t.bg) || t.bg;

  const getSectionStyle = (section) => ({
    ...getSectionTextStyle(section, scale, { color: t.text, fontFamily: t.fontBody }),
    cursor: 'pointer',
  });

  const handleClick = (e, section) => {
    e.stopPropagation();
    if (section && onSelectSection) onSelectSection(section, e.currentTarget.getBoundingClientRect());
  };

  const getContent = (section) => {
    if (section.field === 'name') return `${data.firstName || ''} ${data.lastName || ''}`.trim();
    return data[section.field] || '';
  };

  const renderTextSection = (section) => (
    <div
      key={section.id}
      onClick={(e) => handleClick(e, section)}
      style={{ ...getSectionPos(sections, section.id), ...getSectionStyle(section), display: 'flex', alignItems: 'center' }}
    >
      {getContent(section)}
    </div>
  );

  const logoSections = findLogoSections(sections, isBack);
  const logoEls = logoSections.map(logoSection => (
    <img
      key={logoSection.id}
      src={data.logoUrl || logoIcon}
      alt="Logo"
      onClick={(e) => handleClick(e, logoSection)}
      style={{ ...getSectionPos(sections, logoSection.id), objectFit: 'contain', cursor: 'pointer' }}
    />
  ));

  const movedInSections = findMovedInSections(sections, isBack);

  if (!isBack) {
    const frontName = findSection(sections, 'front-name');

    return (
      <div style={{ width: '100%', height: '100%', background: resolvedBg, position: 'relative', overflow: 'hidden', flexShrink: 0, boxSizing: 'border-box' }}>
        {logoEls}
        {frontName && (
          <div onClick={(e) => handleClick(e, frontName)}
            style={{ ...getSectionPos(sections, frontName.id), ...getSectionStyle(frontName), display: 'flex', alignItems: 'center', letterSpacing: '0.3em' }}>
            {data.firstName} {data.lastName}
          </div>
        )}
        {movedInSections.map(s => renderTextSection(s))}
      </div>
    );
  }

  const backName      = findSection(sections, 'back-name');
  const backTitle     = findSection(sections, 'back-title');
  const backAddress   = findSection(sections, 'back-address');
  const backCity      = findSection(sections, 'back-city');
  const backEmail     = findSection(sections, 'back-email');
  const backWebsite   = findSection(sections, 'back-website');
  const backInstagram = findSection(sections, 'back-instagram');
  const backFacebook  = findSection(sections, 'back-facebook');

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', flexShrink: 0, boxSizing: 'border-box' }}>
      {/* Left panel uses resolvedBg, right panel stays white */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '45%', height: '100%', background: resolvedBg, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 0, left: '45%', width: '55%', height: '100%', background: '#ffffff', pointerEvents: 'none' }} />

      <div style={{ position: 'absolute', left: '50%', top: '10%', fontFamily: t.fontBody, fontSize: `${9 * scale}px`, fontWeight: 500, color: '#1a1a1a', letterSpacing: '0.08em', pointerEvents: 'none' }}>Postal Address</div>
      <div style={{ position: 'absolute', left: '50%', top: '36%', fontFamily: t.fontBody, fontSize: `${9 * scale}px`, fontWeight: 500, color: '#1a1a1a', letterSpacing: '0.08em', pointerEvents: 'none' }}>Online</div>
      <div style={{ position: 'absolute', left: '50%', top: '59%', fontFamily: t.fontBody, fontSize: `${9 * scale}px`, fontWeight: 500, color: '#1a1a1a', letterSpacing: '0.08em', pointerEvents: 'none' }}>Social</div>

      {logoEls}
      {backName      && renderTextSection(backName)}
      {backTitle     && renderTextSection(backTitle)}
      {backAddress   && renderTextSection(backAddress)}
      {backCity      && renderTextSection(backCity)}
      {backEmail     && renderTextSection(backEmail)}
      {backWebsite   && renderTextSection(backWebsite)}
      {backInstagram && renderTextSection(backInstagram)}
      {backFacebook  && renderTextSection(backFacebook)}
      {movedInSections.map(s => renderTextSection(s))}
    </div>
  );
}