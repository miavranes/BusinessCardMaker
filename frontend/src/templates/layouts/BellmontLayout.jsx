import React from 'react';
import logoIcon from '../../assets/logo.png';
import { getSectionPos, getSectionTextStyle } from '../../sectionSchema';

export const bellmontTemplate = {
  id: 6,
  category: "minimal",
  name: "Bellmont",
  bg: "#7d1e2e",
  bgBack: "#f5f0e8",
  accent: "#7d1e2e",
  text: "#7d1e2e",
  defaultData: {
    firstName: "MIA",
    lastName: "VRANES",
    title: "Web Designer",
    phone: "+123-456-7890",
    email: "mia@example.com",
    website: "www.miavranes.com",
  },
  sectionsFront: [
    { id: 'front-logo', type: 'logo', label: 'Logo', x: 0.15, y: 0.15, width: 0.70, height: 0.70 }
  ],
  sectionsBack: [
    { id: 'back-logo',    type: 'logo', label: 'Logo',     x: 0.64, y: 0.05, width: 0.31, height: 0.26 },
    { id: 'back-name',    type: 'text', field: 'name',    label: 'Full Name', x: 0.05, y: 0.30, width: 0.55, height: 0.10, fontSize: 13, fontFamily: 'Jost, sans-serif', fontWeight: '400', color: '#7d1e2e', textTransform: 'uppercase' },
    { id: 'back-title',   type: 'text', field: 'title',   label: 'Job Title', x: 0.05, y: 0.42, width: 0.55, height: 0.08, fontSize: 9,  fontFamily: 'Jost, sans-serif', fontWeight: '300', color: '#7d1e2e' },
    { id: 'back-phone',   type: 'text', field: 'phone',   label: 'Phone',     x: 0.05, y: 0.55, width: 0.55, height: 0.08, fontSize: 9,  fontFamily: 'Jost, sans-serif', fontWeight: '300', color: '#7d1e2e' },
    { id: 'back-email',   type: 'text', field: 'email',   label: 'Email',     x: 0.05, y: 0.65, width: 0.55, height: 0.08, fontSize: 9,  fontFamily: 'Jost, sans-serif', fontWeight: '300', color: '#7d1e2e' },
    { id: 'back-website', type: 'text', field: 'website', label: 'Website',   x: 0.05, y: 0.75, width: 0.55, height: 0.08, fontSize: 9,  fontFamily: 'Jost, sans-serif', fontWeight: '300', color: '#7d1e2e' },
  ]
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

export default function BellmontLayout({
  template, isBack = false, containerWidth, userData, sections = [], onSelectSection, backgroundColor,
}) {
  const t = template || bellmontTemplate;
  const scale = (containerWidth || 400) / 400;
  const data = { ...t.defaultData, ...userData };

  const resolvedBg = backgroundColor || (isBack ? t.bgBack : t.bg) || t.bg;

  const getSectionStyle = (section) => ({
    ...getSectionTextStyle(section, scale, { color: t.text, fontFamily: 'Jost, sans-serif' }),
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

  if (isBack) {
    const backName    = findSection(sections, 'back-name');
    const backTitle   = findSection(sections, 'back-title');
    const backPhone   = findSection(sections, 'back-phone');
    const backEmail   = findSection(sections, 'back-email');
    const backWebsite = findSection(sections, 'back-website');

    return (
      <div style={{ width: '100%', height: '100%', background: resolvedBg, position: 'relative', overflow: 'hidden', boxSizing: 'border-box' }}>
        {logoEls}
        {backName && (
          <div onClick={(e) => handleClick(e, backName)}
            style={{ ...getSectionPos(sections, backName.id), ...getSectionStyle(backName), display: 'flex', alignItems: 'center' }}>
            {data.firstName} {data.lastName}
          </div>
        )}
        {backTitle && (
          <div onClick={(e) => handleClick(e, backTitle)}
            style={{ ...getSectionPos(sections, backTitle.id), ...getSectionStyle(backTitle), display: 'flex', alignItems: 'center', opacity: 0.8 }}>
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

  return (
    <div style={{ width: '100%', height: '100%', background: resolvedBg, position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', boxSizing: 'border-box' }}>
      {logoEls}
      {movedInSections.map(s => renderTextSection(s))}
    </div>
  );
}