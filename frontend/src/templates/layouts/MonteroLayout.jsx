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
    { id: 'front-logo',  type: 'logo', label: 'Logo' },
    { id: 'front-name',  type: 'text', field: 'name',  label: 'Name',    fontSize: 32, fontFamily: 'Cormorant Garamond, serif', fontWeight: '400', color: '#4a4a4a' },
    { id: 'front-title', type: 'text', field: 'title', label: 'Tagline', fontSize: 8,  fontFamily: 'Montserrat, sans-serif', color: '#8a8a8a' },
  ],
  sectionsBack: [
    { id: 'back-name',    type: 'text', field: 'name',    label: 'Name',    fontSize: 22, fontFamily: 'Montserrat, sans-serif', fontWeight: '400', color: '#4a4a4a' },
    { id: 'back-title',   type: 'text', field: 'title',   label: 'Title',   fontSize: 12, fontFamily: 'Montserrat, sans-serif', fontStyle: 'italic', color: '#8a8a8a' },
    { id: 'back-phone',   type: 'text', field: 'phone',   label: 'Phone',   fontSize: 10, color: '#4a4a4a' },
    { id: 'back-website', type: 'text', field: 'website', label: 'Website', fontSize: 10, color: '#4a4a4a' },
    { id: 'back-email',   type: 'text', field: 'email',   label: 'Email',   fontSize: 10, color: '#4a4a4a' },
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

const findLogoSection = (sections, isBack) => {
  const ownPrefix   = isBack ? 'back-logo'  : 'front-logo';
  const otherPrefix = isBack ? 'front-logo' : 'back-logo';
  return (
    sections.find(s => s.id === ownPrefix || s.id.startsWith(`${ownPrefix}-moved-`)) ||
    sections.find(s => s.id.startsWith(`${otherPrefix}-moved-`))
  );
};

const findMovedInSections = (sections, isBack) => {
  const otherPrefix = isBack ? 'front-' : 'back-';
  return sections.filter(s => s.id.startsWith(otherPrefix) && s.id.includes('-moved-') && s.type !== 'logo');
};

export default function MonteroLayout({ template, isBack = false, containerWidth, userData, sections = [], onSelectSection }) {
  const t = template || monteroTemplate;
  const scale = (containerWidth || 400) / 400;
  const data = { ...t.defaultData, ...userData };

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

  const logoSection = findLogoSection(sections, isBack);
  const logoEl = logoSection ? (
    <img
      src={data.logoUrl || logoIcon}
      alt="Logo"
      onClick={(e) => handleClick(e, logoSection)}
      style={{ ...getSectionPos(sections, logoSection.id), objectFit: 'contain', cursor: 'pointer' }}
    />
  ) : null;

  const movedInSections = findMovedInSections(sections, isBack);

  const baseStyle = {
    width: '100%', height: '100%', background: t.bg,
    padding: `${50 * scale}px`, boxSizing: 'border-box',
    position: 'relative', overflow: 'hidden', display: 'flex', flexShrink: 0,
  };

  if (isBack) {
    const backName    = findSection(sections, 'back-name');
    const backTitle   = findSection(sections, 'back-title');
    const backPhone   = findSection(sections, 'back-phone');
    const backWebsite = findSection(sections, 'back-website');
    const backEmail   = findSection(sections, 'back-email');

    return (
      <div style={{ ...baseStyle, flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          {backName  && <div onClick={(e) => handleClick(e, backName)}  style={{ ...getSectionStyle(backName),  marginBottom: `${4 * scale}px` }}>{data.firstName} {data.lastName}</div>}
          {backTitle && <div onClick={(e) => handleClick(e, backTitle)} style={getSectionStyle(backTitle)}>{data.title}</div>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${8 * scale}px` }}>
          {backPhone   && <div onClick={(e) => handleClick(e, backPhone)}   style={getSectionStyle(backPhone)}>{data.phone}</div>}
          {backWebsite && <div onClick={(e) => handleClick(e, backWebsite)} style={getSectionStyle(backWebsite)}>{data.website}</div>}
          {backEmail   && <div onClick={(e) => handleClick(e, backEmail)}   style={getSectionStyle(backEmail)}>{data.email}</div>}
        </div>
        <div style={{ position: 'absolute', top: `${50 * scale}px`, right: `${20 * scale}px`, opacity: 0.9 }}>
          <VerticalLines color={t.text} scale={scale} />
        </div>
        {movedInSections.map(s => renderTextSection(s))}
      </div>
    );
  }

  const frontName  = findSection(sections, 'front-name');
  const frontTitle = findSection(sections, 'front-title');

  return (
    <div style={{ ...baseStyle, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
      {logoEl && <div style={{ marginBottom: `${25 * scale}px` }}>{logoEl}</div>}
      {frontName  && <div onClick={(e) => handleClick(e, frontName)}  style={{ letterSpacing: `${0.08 * scale}em`, ...getSectionStyle(frontName)  }}>{data.firstName} {data.lastName}</div>}
      {frontTitle && <div onClick={(e) => handleClick(e, frontTitle)} style={{ marginTop: `${8 * scale}px`, letterSpacing: `${0.15 * scale}em`, ...getSectionStyle(frontTitle) }}>{data.title}</div>}
      {movedInSections.map(s => renderTextSection(s))}
    </div>
  );
}