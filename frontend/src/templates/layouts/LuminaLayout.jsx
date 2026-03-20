import React from 'react';
import logoIcon from '../../assets/logo.png';
import { getSectionPos, getSectionTextStyle } from '../../sectionSchema';

export const luminaTemplate = {
  id: 8,
  category: "modern",
  name: "Lumina",
  bg: "#0a0a0a",
  bgBack: "#0f0f0f",
  accent: "#c9a84c",
  text: "#ffffff",
  textBack: "#ffffff",
  textMuted: "#c9a84c",
  fontName: "'Montserrat', sans-serif",
  fontBody: "'Montserrat', sans-serif",
  defaultData: {
    firstName: "Mia",
    lastName: "Vranes",
    title: "Graphic Designer",
    phone: "+123-456-7890",
    email: "mia@example.com",
    website: "www.miavranes.com",
    address: "123 Name Street",
    city: "Brooklyn, NY",
    instagram: "mia_vranes",
    facebook: "Mia Vranes",
  },
  sectionsFront: [
    { id: 'front-logo', type: 'logo', label: 'Logo', x: 0.04, y: 0.08, width: 0.22, height: 0.45 },
    { id: 'front-name', type: 'text', field: 'name', label: 'Name', x: 0.04, y: 0.60, width: 0.92, height: 0.22, fontSize: 22, fontFamily: "'Montserrat', sans-serif", fontWeight: '800', color: '#ffffff' },
    { id: 'front-title', type: 'text', field: 'title', label: 'Title', x: 0.04, y: 0.83, width: 0.92, height: 0.12, fontSize: 9, fontFamily: "'Montserrat', sans-serif", fontWeight: '400', color: '#c9a84c', textTransform: 'uppercase', letterSpacing: 0.2 },
  ],
  sectionsBack: [
    { id: 'back-name',      type: 'text', field: 'name',      label: 'Name',      x: 0.06, y: 0.08, width: 0.88, height: 0.14, fontSize: 15, fontFamily: "'Montserrat', sans-serif", fontWeight: '700', color: '#ffffff' },
    { id: 'back-title',     type: 'text', field: 'title',     label: 'Title',     x: 0.06, y: 0.23, width: 0.88, height: 0.09, fontSize: 8,  fontFamily: "'Montserrat', sans-serif", fontWeight: '400', color: '#c9a84c', textTransform: 'uppercase', letterSpacing: 0.15 },
    { id: 'back-phone',     type: 'text', field: 'phone',     label: 'Phone',     x: 0.06, y: 0.45, width: 0.55, height: 0.09, fontSize: 8,  fontFamily: "'Montserrat', sans-serif", fontWeight: '300', color: '#e0e0e0' },
    { id: 'back-email',     type: 'text', field: 'email',     label: 'Email',     x: 0.06, y: 0.56, width: 0.55, height: 0.09, fontSize: 8,  fontFamily: "'Montserrat', sans-serif", fontWeight: '300', color: '#e0e0e0' },
    { id: 'back-website',   type: 'text', field: 'website',   label: 'Website',   x: 0.06, y: 0.67, width: 0.55, height: 0.09, fontSize: 8,  fontFamily: "'Montserrat', sans-serif", fontWeight: '300', color: '#e0e0e0' },
    { id: 'back-instagram', type: 'text', field: 'instagram', label: 'Instagram', x: 0.06, y: 0.78, width: 0.55, height: 0.09, fontSize: 8,  fontFamily: "'Montserrat', sans-serif", fontWeight: '300', color: '#e0e0e0' },
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
  return sections.filter(s => s.id.startsWith(otherPrefix) && s.id.includes('-moved-') && s.type !== 'logo' && s.type !== 'qr');
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
    <div key={section.id} onClick={(e) => handleClick(e, section)}
      style={{ ...getSectionPos(sections, section.id), ...getSectionStyle(section), display: 'flex', alignItems: 'center' }}>
      {getContent(section)}
    </div>
  );

  const logoSections = findLogoSections(sections, isBack);
  const logoEls = logoSections.map(logoSection => (
    <img key={logoSection.id} src={data.logoUrl || logoIcon} alt="Logo"
      onClick={(e) => handleClick(e, logoSection)}
      style={{ ...getSectionPos(sections, logoSection.id), objectFit: 'contain', cursor: 'pointer' }}
    />
  ));

  const movedInSections = findMovedInSections(sections, isBack);

  // ── FRONT ──
  if (!isBack) {
    const frontName  = findSection(sections, 'front-name');
    const frontTitle = findSection(sections, 'front-title');

    return (
      <div style={{ width: '100%', height: '100%', background: resolvedBg, position: 'relative', overflow: 'hidden', boxSizing: 'border-box' }}>

        {/* Zlatna vertikalna linija lijevo */}
        <div style={{ position: 'absolute', left: `${28 * scale}px`, top: `${12 * scale}px`, bottom: `${12 * scale}px`, width: `${1.5 * scale}px`, background: '#c9a84c', pointerEvents: 'none' }} />

        {/* Zlatna horizontalna linija ispod naziva */}
        <div style={{ position: 'absolute', left: `${36 * scale}px`, right: `${16 * scale}px`, top: `${74 * scale}px`, height: `${1 * scale}px`, background: 'rgba(201,168,76,0.25)', pointerEvents: 'none' }} />

        {/* Zlatna tačka gore lijevo */}
        <div style={{ position: 'absolute', left: `${22 * scale}px`, top: `${10 * scale}px`, width: `${9 * scale}px`, height: `${9 * scale}px`, borderRadius: '50%', background: '#c9a84c', pointerEvents: 'none' }} />

        {/* Zlatna tačka dolje lijevo */}
        <div style={{ position: 'absolute', left: `${22 * scale}px`, bottom: `${10 * scale}px`, width: `${9 * scale}px`, height: `${9 * scale}px`, borderRadius: '50%', background: '#c9a84c', pointerEvents: 'none' }} />

        {logoEls}

        {frontName && (
          <div onClick={(e) => handleClick(e, frontName)}
            style={{ ...getSectionPos(sections, frontName.id), ...getSectionStyle(frontName), display: 'flex', alignItems: 'center' }}>
            {data.firstName} {data.lastName}
          </div>
        )}

        {frontTitle && renderTextSection(frontTitle)}
        {movedInSections.map(s => renderTextSection(s))}
      </div>
    );
  }

  // ── BACK ──
  const backName      = findSection(sections, 'back-name');
  const backTitle     = findSection(sections, 'back-title');
  const backPhone     = findSection(sections, 'back-phone');
  const backEmail     = findSection(sections, 'back-email');
  const backWebsite   = findSection(sections, 'back-website');
  const backInstagram = findSection(sections, 'back-instagram');

  const iconSize = 7 * scale;
  const iconColor = '#c9a84c';

  const PhoneIcon = () => (
    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill={iconColor} style={{ flexShrink: 0, marginRight: `${4 * scale}px` }}>
      <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/>
    </svg>
  );
  const MailIcon = () => (
    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" style={{ flexShrink: 0, marginRight: `${4 * scale}px` }}>
      <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  );
  const WebIcon = () => (
    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" style={{ flexShrink: 0, marginRight: `${4 * scale}px` }}>
      <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  );
  const IGIcon = () => (
    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" style={{ flexShrink: 0, marginRight: `${4 * scale}px` }}>
      <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill={iconColor}/>
    </svg>
  );

  const renderContactRow = (section, Icon) => {
    if (!section) return null;
    return (
      <div key={section.id} onClick={(e) => handleClick(e, section)}
        style={{ ...getSectionPos(sections, section.id), ...getSectionStyle(section), display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
        <Icon />
        {getContent(section)}
      </div>
    );
  };

  return (
    <div style={{ width: '100%', height: '100%', background: resolvedBg, position: 'relative', overflow: 'hidden', boxSizing: 'border-box' }}>

      {/* Zlatna horizontalna linija ispod naslova */}
      <div style={{ position: 'absolute', left: `${16 * scale}px`, right: `${16 * scale}px`, top: `${39 * scale}px`, height: `${1 * scale}px`, background: '#c9a84c', pointerEvents: 'none' }} />

      {/* Dekorativni zlatni kvadrat gore desno */}
      <div style={{ position: 'absolute', right: `${14 * scale}px`, top: `${14 * scale}px`, width: `${22 * scale}px`, height: `${22 * scale}px`, border: `${1.5 * scale}px solid rgba(201,168,76,0.4)`, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', right: `${19 * scale}px`, top: `${19 * scale}px`, width: `${12 * scale}px`, height: `${12 * scale}px`, background: 'rgba(201,168,76,0.15)', pointerEvents: 'none' }} />

      {/* Tanka zlatna linija lijevo (vertikalna akcentna) */}
      <div style={{ position: 'absolute', left: `${10 * scale}px`, top: `${45 * scale}px`, bottom: `${10 * scale}px`, width: `${1 * scale}px`, background: 'rgba(201,168,76,0.3)', pointerEvents: 'none' }} />

      {logoEls}

      {backName && (
        <div onClick={(e) => handleClick(e, backName)}
          style={{ ...getSectionPos(sections, backName.id), ...getSectionStyle(backName), display: 'flex', alignItems: 'center' }}>
          {data.firstName} {data.lastName}
        </div>
      )}
      {backTitle && renderTextSection(backTitle)}

      {renderContactRow(backPhone,     PhoneIcon)}
      {renderContactRow(backEmail,     MailIcon)}
      {renderContactRow(backWebsite,   WebIcon)}
      {renderContactRow(backInstagram, IGIcon)}

      {movedInSections.map(s => renderTextSection(s))}
    </div>
  );
}