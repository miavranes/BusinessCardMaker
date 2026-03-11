import React from 'react';
import logoIcon from '../../assets/logo.png';
import { getSectionPos, getSectionTextStyle } from '../../sectionSchema';

export const noirClassicTemplate = {
  id: 2,
  category: "elegant",
  name: "Noir Classic",
  bg: "#ffffff",
  bgBack: "#5a5a5a",
  accent: "#C4A574",
  text: "#111111",
  textBack: "#ffffff",
  textMuted: "#C4A574",
  fontName: "Montserrat, sans-serif",
  fontBody: "Montserrat, sans-serif",
  defaultData: {
    firstName: "MIA",
    lastName: "VRANES",
    title: "WEB DESIGNER",
    phone: "+123-456-7890",
    email: "mia@example.com",
    website: "www.miavranes.com",
  },
  sectionsFront: [
    { id: 'front-logo',  type: 'logo', label: 'Logo',  x: 0.35, y: 0.20, width: 0.30, height: 0.30 },
    { id: 'front-name',  type: 'text', field: 'name',  label: 'Name',  x: 0.10, y: 0.55, width: 0.80, height: 0.15, fontSize: 14, fontFamily: 'Montserrat, sans-serif', fontWeight: '400', color: '#111111', textTransform: 'uppercase' },
    { id: 'front-title', type: 'text', field: 'title', label: 'Title', x: 0.10, y: 0.72, width: 0.80, height: 0.10, fontSize: 9,  fontFamily: 'Montserrat, sans-serif', color: '#C4A574', textTransform: 'uppercase' },
  ],
  sectionsBack: [
    { id: 'back-logo',    type: 'logo', label: 'Logo',    x: 0.70, y: 0.08, width: 0.25, height: 0.20 },
    { id: 'back-name',    type: 'text', field: 'name',    label: 'Name',    x: 0.08, y: 0.30, width: 0.60, height: 0.20, fontSize: 32, fontFamily: 'Montserrat, sans-serif', fontWeight: '300', color: '#ffffff' },
    { id: 'back-title',   type: 'text', field: 'title',   label: 'Title',   x: 0.08, y: 0.52, width: 0.60, height: 0.10, fontSize: 11, fontFamily: 'Montserrat, sans-serif', color: '#C4A574', textTransform: 'uppercase' },
    { id: 'back-phone',   type: 'text', field: 'phone',   label: 'Phone',   x: 0.08, y: 0.68, width: 0.60, height: 0.08, fontSize: 10, color: '#ffffff' },
    { id: 'back-email',   type: 'text', field: 'email',   label: 'Email',   x: 0.08, y: 0.78, width: 0.60, height: 0.08, fontSize: 10, color: '#ffffff' },
    { id: 'back-website', type: 'text', field: 'website', label: 'Website', x: 0.08, y: 0.88, width: 0.60, height: 0.08, fontSize: 10, color: '#ffffff' },
  ],
};

const PhoneIcon = ({ color, size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg>
);
const MailIcon = ({ color, size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
);
const WebIcon = ({ color, size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
);

const FIELD_ICONS = { phone: PhoneIcon, email: MailIcon, website: WebIcon };

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

export default function NoirClassicLayout({ template, isBack = false, containerWidth, userData, sections = [], onSelectSection }) {
  const t = template || noirClassicTemplate;
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

  const renderTextSection = (section) => {
    const Icon = FIELD_ICONS[section.field];
    return (
      <div
        key={section.id}
        onClick={(e) => handleClick(e, section)}
        style={{ ...getSectionPos(sections, section.id), ...getSectionStyle(section), display: 'flex', alignItems: 'center', gap: Icon ? `${8 * scale}px` : 0 }}
      >
        {Icon && <Icon color={t.textMuted} size={12 * scale} />}
        <span>{getContent(section)}</span>
      </div>
    );
  };

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
    width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
    flexShrink: 0, boxSizing: 'border-box',
  };

  if (isBack) {
    const backName    = findSection(sections, 'back-name');
    const backTitle   = findSection(sections, 'back-title');
    const backPhone   = findSection(sections, 'back-phone');
    const backEmail   = findSection(sections, 'back-email');
    const backWebsite = findSection(sections, 'back-website');

    return (
      <div style={{ ...baseStyle, background: t.bgBack }}>
        {logoEls}
        {backName && (
          <div onClick={(e) => handleClick(e, backName)}
            style={{ ...getSectionPos(sections, backName.id), ...getSectionStyle(backName), letterSpacing: '0.05em', lineHeight: 1.2, display: 'flex', alignItems: 'center' }}>
            {data.firstName}<br />{data.lastName}
          </div>
        )}
        {backTitle && (
          <div onClick={(e) => handleClick(e, backTitle)}
            style={{ ...getSectionPos(sections, backTitle.id), ...getSectionStyle(backTitle), letterSpacing: '0.25em', display: 'flex', alignItems: 'center' }}>
            {data.title}
          </div>
        )}
        {backPhone   && renderTextSection(backPhone)}
        {backEmail   && renderTextSection(backEmail)}
        {backWebsite && renderTextSection(backWebsite)}
        {movedInSections.map(s => renderTextSection(s))}
      </div>
    );
  }

  const frontName  = findSection(sections, 'front-name');
  const frontTitle = findSection(sections, 'front-title');

  return (
    <div style={{ ...baseStyle, background: t.bg }}>
      {logoEls}
      {frontName && (
        <div onClick={(e) => handleClick(e, frontName)}
          style={{ ...getSectionPos(sections, frontName.id), ...getSectionStyle(frontName), letterSpacing: '0.15em', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {data.firstName} {data.lastName}
        </div>
      )}
      {frontTitle && (
        <div onClick={(e) => handleClick(e, frontTitle)}
          style={{ ...getSectionPos(sections, frontTitle.id), ...getSectionStyle(frontTitle), letterSpacing: '0.2em', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {data.title}
        </div>
      )}
      {movedInSections.map(s => renderTextSection(s))}
    </div>
  );
}