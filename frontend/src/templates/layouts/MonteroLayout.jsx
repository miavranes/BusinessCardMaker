import React from 'react';
import logoIcon from '../../assets/logo.png';
import { getSectionPos, getSectionTextStyle } from '../../sectionSchema';

export const monteroTemplate = {
  id: 4,
  category: "modern",
  name: "Montero",
  bg: "#f5f1ebff",
  bgBack: "#f5f1ebff",
  accent: "#c9b896ff",
  text: "#4a4a4aff",
  textBack: "#4a4a4aff",
  textMuted: "#8a8a8aff",
  fontName: "Cormorant Garamond, serif",
  fontBody: "Montserrat, sans-serif",
  defaultData: {
    firstName: "MIA",
    lastName: "VRANES",
    title: "Web Designer",
    phone: "+123-456-7890",
    email: "mia@example.com",
    website: "www.miavranes.com",
  },
  sectionsFront: [
    { id: 'front-logo',  type: 'logo', label: 'Logo',    x: 0.35, y: 0.10, width: 0.30, height: 0.30 },
    { id: 'front-name',  type: 'text', field: 'name',  label: 'Name',    x: 0.10, y: 0.48, width: 0.80, height: 0.18, fontSize: 32, fontFamily: 'Cormorant Garamond, serif', fontWeight: '400', color: '#4a4a4a' },
    { id: 'front-title', type: 'text', field: 'title', label: 'Tagline', x: 0.10, y: 0.68, width: 0.80, height: 0.10, fontSize: 8,  fontFamily: 'Montserrat, sans-serif', color: '#8a8a8a' },
  ],
  sectionsBack: [
    { id: 'back-name',    type: 'text', field: 'name',    label: 'Name',    x: 0.10, y: 0.08, width: 0.80, height: 0.16, fontSize: 22, fontFamily: 'Montserrat, sans-serif', fontWeight: '400', color: '#4a4a4a' },
    { id: 'back-title',   type: 'text', field: 'title',   label: 'Title',   x: 0.10, y: 0.25, width: 0.80, height: 0.10, fontSize: 12, fontFamily: 'Montserrat, sans-serif', fontStyle: 'italic', color: '#8a8a8a' },
    { id: 'back-phone',   type: 'text', field: 'phone',   label: 'Phone',   x: 0.10, y: 0.55, width: 0.80, height: 0.10, fontSize: 10, fontFamily: 'Montserrat, sans-serif', color: '#4a4a4a' },
    { id: 'back-website', type: 'text', field: 'website', label: 'Website', x: 0.10, y: 0.67, width: 0.80, height: 0.10, fontSize: 10, fontFamily: 'Montserrat, sans-serif', color: '#4a4a4a' },
    { id: 'back-email',   type: 'text', field: 'email',   label: 'Email',   x: 0.10, y: 0.79, width: 0.80, height: 0.10, fontSize: 10, fontFamily: 'Montserrat, sans-serif', color: '#4a4a4a' },
  ],
};

const VerticalLines = ({ color, scale }) => (
  <svg width={60 * scale} height={200 * scale} viewBox="0 0 60 200" fill="none">
    <line x1="10" y1="0" x2="10" y2="200" stroke={color} strokeWidth="1.5" opacity="0.3" />
    <line x1="25" y1="20" x2="25" y2="180" stroke={color} strokeWidth="1.5" opacity="0.5" />
    <line x1="40" y1="40" x2="40" y2="160" stroke={color} strokeWidth="1.5" opacity="0.4" />
    <line x1="50" y1="60" x2="50" y2="140" stroke={color} strokeWidth="1.5" opacity="0.3" />
  </svg>
);

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

export default function MonteroLayout({
  template, isBack = false, containerWidth, userData, sections = [], onSelectSection, backgroundColor,
}) {
  const t = template || monteroTemplate;
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

  const baseStyle = {
    width: '100%', height: '100%', background: resolvedBg,
    position: 'relative', overflow: 'hidden',
    flexShrink: 0, boxSizing: 'border-box',
  };

  if (isBack) {
    const backName    = findSection(sections, 'back-name');
    const backTitle   = findSection(sections, 'back-title');
    const backPhone   = findSection(sections, 'back-phone');
    const backWebsite = findSection(sections, 'back-website');
    const backEmail   = findSection(sections, 'back-email');

    return (
      <div style={baseStyle}>
        <div style={{ position: 'absolute', top: `${50 * scale}px`, right: `${20 * scale}px`, opacity: 0.9, pointerEvents: 'none' }}>
          <VerticalLines color={t.text} scale={scale} />
        </div>
        {logoEls}
        {backName    && renderTextSection(backName)}
        {backTitle   && renderTextSection(backTitle)}
        {backPhone   && renderTextSection(backPhone)}
        {backWebsite && renderTextSection(backWebsite)}
        {backEmail   && renderTextSection(backEmail)}
        {movedInSections.map(s => renderTextSection(s))}
      </div>
    );
  }

  const frontName  = findSection(sections, 'front-name');
  const frontTitle = findSection(sections, 'front-title');

  return (
    <div style={baseStyle}>
      {logoEls}
      {frontName && (
        <div onClick={(e) => handleClick(e, frontName)}
          style={{ ...getSectionPos(sections, frontName.id), ...getSectionStyle(frontName), display: 'flex', alignItems: 'center', letterSpacing: `${0.08 * scale}em` }}>
          {data.firstName} {data.lastName}
        </div>
      )}
      {frontTitle && (
        <div onClick={(e) => handleClick(e, frontTitle)}
          style={{ ...getSectionPos(sections, frontTitle.id), ...getSectionStyle(frontTitle), display: 'flex', alignItems: 'center', letterSpacing: `${0.15 * scale}em` }}>
          {data.title}
        </div>
      )}
      {movedInSections.map(s => renderTextSection(s))}
    </div>
  );
}