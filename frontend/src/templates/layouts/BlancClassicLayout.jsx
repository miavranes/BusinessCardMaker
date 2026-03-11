import React from 'react';
import logoIcon from '../../assets/logo.png';
import { getSectionPos, getSectionTextStyle } from '../../sectionSchema';

export const blancClassicTemplate = {
  id: 1,
  category: "minimal",
  name: "Blanc Classic",
  bg: "#ffffff",
  accent: "#111111",
  text: "#111111",
  textMuted: "#999999",
  border: "2px solid #111111",
  fontName: "Georgia, serif",
  fontBody: "Arial, sans-serif",
  dividerOpacity: 0.25,
  defaultData: {
    firstName: "MIA",
    lastName: "VRANES",
    title: "WEB DESIGNER",
    phone: "+123-456-7890",
    email: "mia@example.com",
    website: "www.miavranes.com",
  },
  sectionsFront: [
    { id: 'front-logo',  type: 'logo', label: 'Logo',      x: 0.60, y: 0.10, width: 0.32, height: 0.45 },
    { id: 'front-name',  type: 'text', field: 'name',  label: 'Full Name',  x: 0.08, y: 0.30, width: 0.55, height: 0.22, fontSize: 28, fontFamily: 'Georgia, serif', fontWeight: '700', color: '#111111' },
    { id: 'front-title', type: 'text', field: 'title', label: 'Job Title',  x: 0.08, y: 0.55, width: 0.55, height: 0.15, fontSize: 12, fontFamily: 'Arial, sans-serif', color: '#999999', letterSpacing: 0.2, textTransform: 'uppercase' },
  ],
  sectionsBack: [
    { id: 'back-name',    type: 'text', field: 'name',    label: 'Full Name',     x: 0.05, y: 0.25, width: 0.38, height: 0.30, fontSize: 20, fontFamily: 'Georgia, serif', fontWeight: '700', color: '#111111' },
    { id: 'back-title',   type: 'text', field: 'title',   label: 'Job Title',     x: 0.05, y: 0.56, width: 0.38, height: 0.14, fontSize: 10, fontFamily: 'Arial, sans-serif', color: '#999999', letterSpacing: 0.18, textTransform: 'uppercase' },
    { id: 'back-phone',   type: 'text', field: 'phone',   label: 'Phone Number',  x: 0.52, y: 0.28, width: 0.44, height: 0.14, fontSize: 11, fontFamily: 'Arial, sans-serif', color: '#111111' },
    { id: 'back-email',   type: 'text', field: 'email',   label: 'Email Address', x: 0.52, y: 0.44, width: 0.44, height: 0.14, fontSize: 11, fontFamily: 'Arial, sans-serif', color: '#111111' },
    { id: 'back-website', type: 'text', field: 'website', label: 'Website',       x: 0.52, y: 0.60, width: 0.44, height: 0.14, fontSize: 11, fontFamily: 'Arial, sans-serif', color: '#111111' },
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

// Map field name → icon component
const FIELD_ICONS = {
  phone:   PhoneIcon,
  email:   MailIcon,
  website: WebIcon,
};

// Find a section by base ID, also matching moved copies (e.g. "back-name-moved-1234")
const findSection = (sections, baseId) =>
  sections.find(s => s.id === baseId || s.id.startsWith(`${baseId}-moved-`));

// Find any logo section present on this canvas side — own original or moved from other side
const findLogoSection = (sections, isBack) => {
  const ownPrefix   = isBack ? 'back-logo'  : 'front-logo';
  const otherPrefix = isBack ? 'front-logo' : 'back-logo';
  return (
    sections.find(s => s.id === ownPrefix || s.id.startsWith(`${ownPrefix}-moved-`)) ||
    sections.find(s => s.id.startsWith(`${otherPrefix}-moved-`))
  );
};

// Find all sections that were moved FROM the other canvas TO this one
// e.g. on the front canvas, find any "back-xxx-moved-" sections
const findMovedInSections = (sections, isBack) => {
  const otherPrefix = isBack ? 'front-' : 'back-';
  return sections.filter(s => s.id.startsWith(otherPrefix) && s.id.includes('-moved-') && s.type !== 'logo');
};

export default function BlancClassicLayout({ template, isBack = false, containerWidth, userData, sections = [], onSelectSection }) {
  const t = template || blancClassicTemplate;
  const scale = (containerWidth || 400) / 400;
  const data = { ...t.defaultData, ...userData };

  const getSectionStyle = (section) => ({
    ...getSectionTextStyle(section, scale, { color: t.text, fontFamily: t.fontName }),
    cursor: 'pointer',
  });

  const handleClick = (e, section) => {
    e.stopPropagation();
    if (section && onSelectSection) {
      onSelectSection(section, e.currentTarget.getBoundingClientRect());
    }
  };

  const getContent = (section) => {
    if (section.field === 'name') return `${data.firstName || ''} ${data.lastName || ''}`.trim();
    return data[section.field] || '';
  };

  // Render a contact section (phone/email/website) with its icon if applicable
  const renderTextSection = (section) => {
    const Icon = FIELD_ICONS[section.field];
    return (
      <div
        key={section.id}
        onClick={(e) => handleClick(e, section)}
        style={{ ...getSectionPos(sections, section.id), ...getSectionStyle(section), display: 'flex', alignItems: 'center', gap: Icon ? '6px' : 0 }}
      >
        {Icon && <Icon color={t.accent} size={11 * scale} />}
        <span>{getContent(section)}</span>
      </div>
    );
  };

  const base = {
    width: '100%', height: '100%', background: t.bg,
    border: t.border || 'none', position: 'relative',
    overflow: 'hidden', boxSizing: 'border-box',
  };

  // Logo renders on whichever canvas it currently lives on
  const logoSection = findLogoSection(sections, isBack);
  const logoEl = logoSection ? (
    <img
      src={data.logoUrl || logoIcon}
      alt="Logo"
      onClick={(e) => handleClick(e, logoSection)}
      style={{ ...getSectionPos(sections, logoSection.id), objectFit: 'contain', cursor: 'pointer' }}
    />
  ) : null;

  // Sections moved from the other canvas onto this one — rendered generically with icons
  const movedInSections = findMovedInSections(sections, isBack);

  if (isBack) {
    const backName    = findSection(sections, 'back-name');
    const backTitle   = findSection(sections, 'back-title');
    const backPhone   = findSection(sections, 'back-phone');
    const backEmail   = findSection(sections, 'back-email');
    const backWebsite = findSection(sections, 'back-website');

    return (
      <div style={base}>
        {logoEl}

        {backName && (
          <div onClick={(e) => handleClick(e, backName)}
            style={{ ...getSectionPos(sections, backName.id), ...getSectionStyle(backName), display: 'flex', alignItems: 'center' }}>
            {data.firstName} {data.lastName}
          </div>
        )}

        {backTitle && (
          <div onClick={(e) => handleClick(e, backTitle)}
            style={{ ...getSectionPos(sections, backTitle.id), ...getSectionStyle(backTitle), display: 'flex', alignItems: 'center' }}>
            {data.title}
          </div>
        )}

        <div style={{ position: 'absolute', left: '46%', top: '20%', width: '1px', height: '60%', background: t.accent, opacity: t.dividerOpacity }} />

        {backPhone   && renderTextSection(backPhone)}
        {backEmail   && renderTextSection(backEmail)}
        {backWebsite && renderTextSection(backWebsite)}

        {/* Render any front sections that were moved onto the back canvas */}
        {movedInSections.map(s => renderTextSection(s))}
      </div>
    );
  }

  const frontName  = findSection(sections, 'front-name');
  const frontTitle = findSection(sections, 'front-title');

  return (
    <div style={base}>
      {logoEl}

      {frontName && (
        <div onClick={(e) => handleClick(e, frontName)}
          style={{ ...getSectionPos(sections, frontName.id), ...getSectionStyle(frontName), display: 'flex', alignItems: 'center' }}>
          {data.firstName} {data.lastName}
        </div>
      )}

      {frontTitle && (
        <div onClick={(e) => handleClick(e, frontTitle)}
          style={{ ...getSectionPos(sections, frontTitle.id), ...getSectionStyle(frontTitle), display: 'flex', alignItems: 'center' }}>
          {data.title}
        </div>
      )}

      {movedInSections.map(s => renderTextSection(s))}
    </div>
  );
}