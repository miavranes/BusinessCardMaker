import React from 'react';
import logoIcon from '../../assets/logo.png';
import { getSectionPos, getSectionTextStyle } from '../../sectionSchema';

export const regentTemplate = {
  id: 9,
  category: "creative",
  name: "Regent",
  bg: "#1a2d4a",
  bgBack: "#dcc7adff",
  accent: "#c9a96e",
  text: "#c9a96e",
  textBack: "#1a2d4a",
  textMuted: "#a0b4c8",
  fontName: "'Cormorant Garamond', serif",
  fontBody: "'Jost', sans-serif",
  defaultData: {
    firstName: "Mia",
    lastName: "Vranes",
    title: "Web Designer",
    phone: "222 333 4567",
    address: "675 Anywhere Street",
    email: "mia@example.com",
    website: "www.miavranes.com",
    company: "EndCode",
    slogan: "Modern Design for Growing Brands.",
  },
  sectionsFront: [
    { id: 'front-logo',    type: 'logo', label: 'Logo',    x: 0.35, y: 0.15, width: 0.30, height: 0.30 },
    { id: 'front-company', type: 'text', field: 'company', label: 'Company', x: 0.15, y: 0.48, width: 0.70, height: 0.10, fontSize: 13, fontFamily: "'Jost', sans-serif", fontWeight: '500', color: '#c9a96e', textTransform: 'uppercase' },
    { id: 'front-slogan',  type: 'text', field: 'slogan',  label: 'Slogan',  x: 0.10, y: 0.60, width: 0.80, height: 0.10, fontSize: 10, fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', color: '#a0b4c8' },
    { id: 'front-website', type: 'text', field: 'website', label: 'Website', x: 0.20, y: 0.78, width: 0.60, height: 0.08, fontSize: 9,  fontFamily: "'Jost', sans-serif", fontWeight: '300', color: '#a0b4c8' },
  ],
  sectionsBack: [
    { id: 'back-logo',    type: 'logo', label: 'Logo',    x: 0.08, y: 0.35, width: 0.25, height: 0.30 },
    { id: 'back-name',    type: 'text', field: 'name',    label: 'Name',    x: 0.48, y: 0.15, width: 0.47, height: 0.12, fontSize: 13, fontFamily: "'Jost', sans-serif", fontWeight: '600', color: '#1a2d4a' },
    { id: 'back-title',   type: 'text', field: 'title',   label: 'Title',   x: 0.48, y: 0.28, width: 0.47, height: 0.10, fontSize: 10, fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', color: '#6b7a8d' },
    { id: 'back-phone',   type: 'text', field: 'phone',   label: 'Phone',   x: 0.48, y: 0.48, width: 0.47, height: 0.08, fontSize: 8,  color: '#1a2d4a' },
    { id: 'back-address', type: 'text', field: 'address', label: 'Address', x: 0.48, y: 0.58, width: 0.47, height: 0.08, fontSize: 8,  color: '#1a2d4a' },
    { id: 'back-email',   type: 'text', field: 'email',   label: 'Email',   x: 0.48, y: 0.68, width: 0.47, height: 0.08, fontSize: 8,  color: '#1a2d4a' },
    { id: 'back-website', type: 'text', field: 'website', label: 'Website', x: 0.48, y: 0.78, width: 0.47, height: 0.08, fontSize: 8,  color: '#1a2d4a' },
  ],
};

const PhoneIcon    = ({ color, size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg>;
const LocationIcon = ({ color, size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>;
const MailIcon     = ({ color, size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
const WebIcon      = ({ color, size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;

const FIELD_ICONS = { phone: PhoneIcon, address: LocationIcon, email: MailIcon, website: WebIcon };

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

export default function RegentLayout({ template, isBack = false, containerWidth, userData, sections = [], onSelectSection }) {
  const t = template || regentTemplate;
  const scale = (containerWidth || 400) / 400;
  const data = { ...t.defaultData, ...userData };

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

  const renderTextSection = (section) => {
    const Icon = FIELD_ICONS[section.field];
    return (
      <div
        key={section.id}
        onClick={(e) => handleClick(e, section)}
        style={{ ...getSectionPos(sections, section.id), ...getSectionStyle(section), display: 'flex', alignItems: 'center', gap: Icon ? `${7 * scale}px` : 0 }}
      >
        {Icon && <Icon color={t.textBack} size={10 * scale} />}
        <span style={{ opacity: 0.8, letterSpacing: '0.03em' }}>{getContent(section)}</span>
      </div>
    );
  };

  const logoSection = findLogoSection(sections, isBack);
  const logoEl = logoSection ? (
    <img
      src={data.logoUrl || logoIcon}
      alt="Logo"
      onClick={(e) => handleClick(e, logoSection)}
      style={{
        ...getSectionPos(sections, logoSection.id),
        objectFit: 'contain', cursor: 'pointer',
        filter: data.logoUrl ? 'none' : `brightness(0) saturate(100%) invert(75%) sepia(40%) saturate(500%) hue-rotate(5deg)`,
      }}
    />
  ) : null;

  const movedInSections = findMovedInSections(sections, isBack);

  const baseStyle = {
    width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
    display: 'flex', flexShrink: 0, boxSizing: 'border-box',
  };

  if (!isBack) {
    const frontCompany = findSection(sections, 'front-company');
    const frontSlogan  = findSection(sections, 'front-slogan');
    const frontWebsite = findSection(sections, 'front-website');

    return (
      <div style={{ ...baseStyle, background: t.bg }}>
        {logoEl}
        {frontCompany && <div onClick={(e) => handleClick(e, frontCompany)} style={{ ...getSectionPos(sections, frontCompany.id), ...getSectionStyle(frontCompany), letterSpacing: '0.2em', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{data.company}</div>}
        {frontSlogan  && <div onClick={(e) => handleClick(e, frontSlogan)}  style={{ ...getSectionPos(sections, frontSlogan.id),  ...getSectionStyle(frontSlogan),  letterSpacing: '0.05em', textAlign: 'center', opacity: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{data.slogan}</div>}
        <div style={{ position: 'absolute', left: '50%', top: '72%', transform: 'translateX(-50%)', width: `${60 * scale}px`, height: `${1 * scale}px`, background: t.accent, opacity: 0.4 }} />
        {frontWebsite && <div onClick={(e) => handleClick(e, frontWebsite)} style={{ ...getSectionPos(sections, frontWebsite.id), ...getSectionStyle(frontWebsite), letterSpacing: '0.08em', textAlign: 'center', opacity: 0.75, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{data.website}</div>}
        {movedInSections.map(s => renderTextSection(s))}
      </div>
    );
  }

  const backName    = findSection(sections, 'back-name');
  const backTitle   = findSection(sections, 'back-title');
  const backPhone   = findSection(sections, 'back-phone');
  const backAddress = findSection(sections, 'back-address');
  const backEmail   = findSection(sections, 'back-email');
  const backWebsite = findSection(sections, 'back-website');

  return (
    <div style={{ ...baseStyle, background: t.bgBack }}>
      {/* Left dark panel with logo */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '42%', height: '100%', background: t.bg, clipPath: 'polygon(0 0, 85% 0, 100% 100%, 0 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}>
        {logoEl}
        <div style={{ position: 'absolute', bottom: '15%', fontFamily: t.fontBody, fontSize: `${8 * scale}px`, fontWeight: 500, color: t.accent, letterSpacing: '0.15em', textTransform: 'uppercase', textAlign: 'center' }}>{data.company}</div>
      </div>

      {/* Right content area */}
      <div style={{ position: 'absolute', top: 0, right: 0, width: '100%', height: '100%', boxSizing: 'border-box' }}>
        {backName    && <div onClick={(e) => handleClick(e, backName)}    style={{ ...getSectionPos(sections, backName.id),    ...getSectionStyle(backName),    letterSpacing: '0.03em', display: 'flex', alignItems: 'center' }}>{data.firstName} {data.lastName}</div>}
        {backTitle   && <div onClick={(e) => handleClick(e, backTitle)}   style={{ ...getSectionPos(sections, backTitle.id),   ...getSectionStyle(backTitle),   display: 'flex', alignItems: 'center' }}>{data.title}</div>}
        <div style={{ position: 'absolute', left: '48%', top: '40%', width: '50%', height: `${1 * scale}px`, background: t.textBack, opacity: 0.15 }} />
        {backPhone   && renderTextSection(backPhone)}
        {backAddress && renderTextSection(backAddress)}
        {backEmail   && renderTextSection(backEmail)}
        {backWebsite && renderTextSection(backWebsite)}
        {movedInSections.map(s => renderTextSection(s))}
      </div>
    </div>
  );
}