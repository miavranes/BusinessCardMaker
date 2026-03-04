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
    { id: 'front-logo', type: 'logo', label: 'Logo', x: 0.25, y: 0.25, width: 0.50, height: 0.50 },
  ],
  sectionsBack: [
    { id: 'back-name',      type: 'text', field: 'name',      label: 'Name',      x: 0.05, y: 0.75, width: 0.35, height: 0.10, fontSize: 13, fontFamily: "'Raleway', sans-serif", fontWeight: '400', color: '#ffffff' },
    { id: 'back-title',     type: 'text', field: 'title',     label: 'Title',     x: 0.05, y: 0.87, width: 0.35, height: 0.08, fontSize: 10, fontFamily: "'Raleway', sans-serif", fontStyle: 'italic', color: '#f0e6df' },
    { id: 'back-address',   type: 'text', field: 'address',   label: 'Address',   x: 0.50, y: 0.15, width: 0.45, height: 0.08, fontSize: 8, color: '#555555' },
    { id: 'back-city',      type: 'text', field: 'city',      label: 'City',      x: 0.50, y: 0.23, width: 0.45, height: 0.08, fontSize: 8, color: '#555555' },
    { id: 'back-email',     type: 'text', field: 'email',     label: 'Email',     x: 0.50, y: 0.40, width: 0.45, height: 0.08, fontSize: 8, color: '#555555' },
    { id: 'back-website',   type: 'text', field: 'website',   label: 'Website',   x: 0.50, y: 0.48, width: 0.45, height: 0.08, fontSize: 8, color: '#555555' },
    { id: 'back-instagram', type: 'text', field: 'instagram', label: 'Instagram', x: 0.50, y: 0.65, width: 0.45, height: 0.08, fontSize: 8, color: '#555555' },
    { id: 'back-facebook',  type: 'text', field: 'facebook',  label: 'Facebook',  x: 0.50, y: 0.73, width: 0.45, height: 0.08, fontSize: 8, color: '#555555' },
  ],
};

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

export default function LuminaLayout({ template, isBack = false, containerWidth, userData, sections = [], onSelectSection }) {
  const t = template || luminaTemplate;
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
      style={{
        ...getSectionPos(sections, logoSection.id),
        objectFit: 'contain', cursor: 'pointer',
        filter: data.logoUrl ? 'none' : 'brightness(0) invert(1)',
        opacity: 0.2,
      }}
    />
  ) : null;

  const movedInSections = findMovedInSections(sections, isBack);

  if (!isBack) {
    const frontName = findSection(sections, 'front-name');

    return (
      <div style={{ width: '100%', height: '100%', background: t.bg, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxSizing: 'border-box' }}>
        {logoEl}
        {frontName && (
          <div onClick={(e) => handleClick(e, frontName)}
            style={{ ...getSectionPos(sections, frontName.id), ...getSectionStyle(frontName), position: 'relative', textAlign: 'center', letterSpacing: '0.3em' }}>
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
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', display: 'flex', flexShrink: 0, boxSizing: 'border-box' }}>
      {/* Left coloured panel */}
      <div style={{ width: '45%', height: '100%', background: t.bg, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: `${28 * scale}px ${24 * scale}px`, boxSizing: 'border-box' }}>
        {backName  && <div onClick={(e) => handleClick(e, backName)}  style={{ ...getSectionStyle(backName) }}>{data.firstName} {data.lastName}</div>}
        {backTitle && <div onClick={(e) => handleClick(e, backTitle)} style={{ ...getSectionStyle(backTitle), marginTop: `${4 * scale}px` }}>{data.title}</div>}
      </div>

      {/* Right white panel */}
      <div style={{ width: '55%', height: '100%', background: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: `${24 * scale}px ${22 * scale}px`, gap: `${14 * scale}px`, boxSizing: 'border-box' }}>
        <div>
          <div style={{ fontFamily: t.fontBody, fontSize: `${9 * scale}px`, fontWeight: 500, color: '#1a1a1a', letterSpacing: '0.08em', marginBottom: '4px' }}>Postal Address</div>
          {backAddress && <div onClick={(e) => handleClick(e, backAddress)} style={getSectionStyle(backAddress)}>{data.address}</div>}
          {backCity    && <div onClick={(e) => handleClick(e, backCity)}    style={getSectionStyle(backCity)}>{data.city}</div>}
        </div>
        <div>
          <div style={{ fontFamily: t.fontBody, fontSize: `${9 * scale}px`, fontWeight: 500, color: '#1a1a1a', letterSpacing: '0.08em', marginBottom: '4px' }}>Online</div>
          {backEmail   && <div onClick={(e) => handleClick(e, backEmail)}   style={getSectionStyle(backEmail)}>{data.email}</div>}
          {backWebsite && <div onClick={(e) => handleClick(e, backWebsite)} style={getSectionStyle(backWebsite)}>{data.website}</div>}
        </div>
        <div>
          <div style={{ fontFamily: t.fontBody, fontSize: `${9 * scale}px`, fontWeight: 500, color: '#1a1a1a', letterSpacing: '0.08em', marginBottom: '4px' }}>Social</div>
          {backInstagram && <div onClick={(e) => handleClick(e, backInstagram)} style={getSectionStyle(backInstagram)}>{data.instagram}</div>}
          {backFacebook  && <div onClick={(e) => handleClick(e, backFacebook)}  style={getSectionStyle(backFacebook)}>{data.facebook}</div>}
        </div>
      </div>

      {/* Absolutely positioned sections that were dragged across */}
      {movedInSections.map(s => renderTextSection(s))}
    </div>
  );
}