import React from 'react';
import logoIcon from '../../assets/logo.png';
import { getSectionPos, getSectionTextStyle } from '../../sectionSchema';

export const imperialTemplate = {
  id: 7,
  category: "elegant",
  name: "Imperial",
  bg: "#f2efe9",
  bgBack: "#1a1a1a",
  accent: "#1a1a1a",
  text: "#1a1a1a",
  textBack: "#c8c2b8",
  textMuted: "#888888",
  fontName: "'Cormorant Garamond', serif",
  fontBody: "'Jost', sans-serif",
  defaultData: {
    firstName: "MIA",
    lastName: "VRANES",
    title: "Web Designer",
    phone: "+123-456-7890",
    email: "mia@example.com",
    linkedin: "miavranes",
    instagram: "miavranes",
  },
  sectionsFront: [
    { id: 'front-logo', type: 'logo', label: 'Logo', x: 0.25, y: 0.20, width: 0.50, height: 0.60 },
  ],
  sectionsBack: [
    { id: 'back-name',      type: 'text', field: 'name',      label: 'Full Name', x: 0.55, y: 0.08, width: 0.40, height: 0.12, fontSize: 14, fontFamily: "'Jost', sans-serif", fontWeight: '400', color: '#c8c2b8' },
    { id: 'back-title',     type: 'text', field: 'title',     label: 'Job Title', x: 0.55, y: 0.22, width: 0.40, height: 0.10, fontSize: 11, fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', color: '#888888' },
    { id: 'back-phone',     type: 'text', field: 'phone',     label: 'Phone',     x: 0.06, y: 0.60, width: 0.40, height: 0.08, fontSize: 8,  fontFamily: "'Jost', sans-serif", fontWeight: '300', color: '#c8c2b8' },
    { id: 'back-email',     type: 'text', field: 'email',     label: 'Email',     x: 0.06, y: 0.70, width: 0.40, height: 0.08, fontSize: 8,  fontFamily: "'Jost', sans-serif", fontWeight: '300', color: '#c8c2b8' },
    { id: 'back-linkedin',  type: 'text', field: 'linkedin',  label: 'LinkedIn',  x: 0.06, y: 0.80, width: 0.40, height: 0.08, fontSize: 8,  fontFamily: "'Jost', sans-serif", fontWeight: '300', color: '#c8c2b8' },
    { id: 'back-instagram', type: 'text', field: 'instagram', label: 'Instagram', x: 0.06, y: 0.90, width: 0.40, height: 0.08, fontSize: 8,  fontFamily: "'Jost', sans-serif", fontWeight: '300', color: '#c8c2b8' },

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

export default function ImperialLayout({
  template, isBack = false, containerWidth, userData, sections = [], onSelectSection, backgroundColor,
}) {
  const t = template || imperialTemplate;
  const scale = (containerWidth || 400) / 400;
  const data = { ...t.defaultData, ...userData };
  const resolvedBg = backgroundColor || (isBack ? t.bgBack : t.bg) || t.bg;

  const getSectionStyle = (section) => ({
    ...getSectionTextStyle(section, scale, { color: t.textBack, fontFamily: t.fontBody }),
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

  const renderLabeledSection = (section) => (
    <div key={section.id} onClick={(e) => handleClick(e, section)}
      style={{ ...getSectionPos(sections, section.id), ...getSectionStyle(section), display: 'flex', alignItems: 'center', gap: `${4 * scale}px`, letterSpacing: `${0.03 * scale}em` }}>
      <span style={{ opacity: 0.5 }}>{section.label?.toLowerCase()} :</span>
      <span style={{ opacity: 0.85 }}>{getContent(section)}</span>
    </div>
  );

  const renderTextSection = (section) => (
    <div key={section.id} onClick={(e) => handleClick(e, section)}
      style={{ ...getSectionPos(sections, section.id), ...getSectionStyle(section), display: 'flex', alignItems: 'center', letterSpacing: `${0.03 * scale}em` }}>
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

  if (!isBack) {
    return (
      <div style={{
        width: '100%', height: '100%', background: resolvedBg,
        backgroundImage: `radial-gradient(ellipse at 30% 40%, rgba(255,255,255,0.03) 0%, transparent 60%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', boxSizing: 'border-box',
      }}>
        {logoEls}
        {movedInSections.map(s => renderTextSection(s))}
      </div>
    );
  }

  const backName      = findSection(sections, 'back-name');
  const backTitle     = findSection(sections, 'back-title');
  const backPhone     = findSection(sections, 'back-phone');
  const backEmail     = findSection(sections, 'back-email');
  const backLinkedin  = findSection(sections, 'back-linkedin');
  const backInstagram = findSection(sections, 'back-instagram');

  return (
    <div style={{ width: '100%', height: '100%', background: resolvedBg, position: 'relative', boxSizing: 'border-box' }}>
      {logoEls}

      {backName && (
        <div onClick={(e) => handleClick(e, backName)}
          style={{ ...getSectionPos(sections, backName.id), ...getSectionStyle(backName), display: 'flex', alignItems: 'flex-end', textAlign: 'right', justifyContent: 'flex-end', letterSpacing: `${0.1 * scale}em` }}>
          {data.firstName} {data.lastName}
        </div>
      )}
      {backTitle && (
        <div onClick={(e) => handleClick(e, backTitle)}
          style={{ ...getSectionPos(sections, backTitle.id), ...getSectionStyle(backTitle), display: 'flex', alignItems: 'flex-start', textAlign: 'right', justifyContent: 'flex-end' }}>
          {data.title}
        </div>
      )}

      {backPhone     && renderLabeledSection(backPhone)}
      {backEmail     && renderLabeledSection(backEmail)}
      {backLinkedin  && renderLabeledSection(backLinkedin)}
      {backInstagram && renderLabeledSection(backInstagram)}

      {movedInSections.map(s => renderTextSection(s))}


    </div>
  );
}