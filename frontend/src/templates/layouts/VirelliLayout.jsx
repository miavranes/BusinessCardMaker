import React from 'react';
import logo from '../../assets/logo.png';
import qrCode from '../../assets/qr.svg';
import { getSectionPos, getSectionTextStyle } from '../../sectionSchema';

export const virelliTemplate = {
  id: 3,
  category: "creative",
  name: "Virelli",
  bg: "#eae6d2ff",
  bgBack: "#3d483bff",
  accent: "#C4A574",
  text: "#3d483bff",
  textBack: "#ffffff",
  textMuted: "#C4A574",
  fontName: "Nunito, sans-serif",
  fontBody: "Nunito, sans-serif",
  dividerOpacity: 0.25,
  border: "none",
  defaultData: {
    firstName: "MIA",
    lastName: "VRANES",
    title: "WEB DESIGNER",
    phone: "+123-456-7890",
    email: "mia@example.com",
    website: "www.miavranes.com",
  },
  sectionsFront: [
    { id: 'front-logo',  type: 'logo', label: 'Logo',  x: 0.25, y: 0.05, width: 0.50, height: 0.50 },
    { id: 'front-name',  type: 'text', field: 'name',  label: 'Name',  x: 0.05, y: 0.60, width: 0.90, height: 0.20, fontSize: 16, fontFamily: 'Nunito, sans-serif', fontWeight: '300', color: '#ffffff', letterSpacing: 0.1, align: 'center' },
    { id: 'front-title', type: 'text', field: 'title', label: 'Title', x: 0.05, y: 0.80, width: 0.90, height: 0.14, fontSize: 9,  fontFamily: 'Nunito, sans-serif', color: '#C4A574', letterSpacing: 0.15, textTransform: 'uppercase', align: 'center' },
  ],
  sectionsBack: [
    { id: 'back-name',    type: 'text', field: 'name',    label: 'Name',    x: 0.06, y: 0.08, width: 0.60, height: 0.20, fontSize: 16, fontFamily: 'Nunito, sans-serif', fontWeight: '300', color: '#3d483b', letterSpacing: 0.5 },
    { id: 'back-phone',   type: 'text', field: 'phone',   label: 'Phone',   x: 0.06, y: 0.36, width: 0.68, height: 0.12, fontSize: 9,  fontFamily: 'Nunito, sans-serif', fontWeight: '300', color: '#3d483b' },
    { id: 'back-email',   type: 'text', field: 'email',   label: 'Email',   x: 0.06, y: 0.50, width: 0.68, height: 0.12, fontSize: 9,  fontFamily: 'Nunito, sans-serif', fontWeight: '300', color: '#3d483b' },
    { id: 'back-website', type: 'text', field: 'website', label: 'Website', x: 0.06, y: 0.64, width: 0.68, height: 0.12, fontSize: 9,  fontFamily: 'Nunito, sans-serif', fontWeight: '300', color: '#3d483b' },
  ],
};

const PhoneIcon = ({ color, size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg>;
const MailIcon  = ({ color, size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
const WebIcon   = ({ color, size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;

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

export default function VirelliLayout({ template, isBack = false, containerWidth, userData, sections = [], onSelectSection }) {
  const t = template || virelliTemplate;
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
        style={{ ...getSectionPos(sections, section.id), ...getSectionStyle(section), display: 'flex', alignItems: 'center', gap: Icon ? `${6 * scale}px` : 0 }}
      >
        {Icon && <Icon color={t.text} size={10 * scale} />}
        <span>{getContent(section)}</span>
      </div>
    );
  };

  const logoSections = findLogoSections(sections, isBack);
  const logoEls = logoSections.map(logoSection => (
    <img
      key={logoSection.id}
      src={data.logoUrl || logo}
      alt="Logo"
      onClick={(e) => handleClick(e, logoSection)}
      style={{ ...getSectionPos(sections, logoSection.id), objectFit: 'contain', cursor: 'pointer' }}
    />
  ));

  const movedInSections = findMovedInSections(sections, isBack);

  const base = { width: '100%', height: '100%', position: 'relative', overflow: 'hidden', boxSizing: 'border-box' };

  if (isBack) {
    const backName    = findSection(sections, 'back-name');
    const backPhone   = findSection(sections, 'back-phone');
    const backEmail   = findSection(sections, 'back-email');
    const backWebsite = findSection(sections, 'back-website');

    return (
      <div style={{ ...base, background: t.bg }}>
        <div style={{ position: 'absolute', top: `${20 * scale}px`, right: `${20 * scale}px`, width: `${60 * scale}px`, height: `${60 * scale}px`, pointerEvents: 'none', zIndex: 0 }}>
          <img src={qrCode} alt="QR" style={{ width: '100%', height: '100%' }} />
        </div>

        {logoEls}
        {backName    && renderTextSection(backName)}
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
    <div style={{ ...base, background: t.bgBack }}>
      {logoEls}
      {frontName && (
        <div onClick={(e) => handleClick(e, frontName)}
          style={{ ...getSectionPos(sections, frontName.id), ...getSectionStyle(frontName), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {data.firstName} {data.lastName}
        </div>
      )}
      {frontTitle && (
        <div onClick={(e) => handleClick(e, frontTitle)}
          style={{ ...getSectionPos(sections, frontTitle.id), ...getSectionStyle(frontTitle), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {data.title}
        </div>
      )}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${3 * scale}px`, background: t.accent, pointerEvents: 'none' }} />
      {movedInSections.map(s => renderTextSection(s))}
    </div>
  );
}