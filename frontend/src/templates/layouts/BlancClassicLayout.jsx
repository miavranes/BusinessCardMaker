import React from 'react';
import logoIcon from '../../assets/logo.png';
import { getSectionPos } from '../../sectionSchema';

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

export default function BlancClassicLayout({ template, isBack = false, containerWidth, userData, sections = [], onSelectSection }) {
  const t = template || blancClassicTemplate;
  const scale = (containerWidth || 400) / 400;
  const data = { ...t.defaultData, ...userData };

  const getSectionStyle = (id) => {
    const s = sections.find(sec => sec.id === id);
    if (!s) return {};
    return {
      color: s.color || t.text,
      fontFamily: s.fontFamily || t.fontName,
      fontSize: `${(s.fontSize || 12) * scale}px`,
      fontWeight: s.fontWeight || 'normal',
      fontStyle: s.fontStyle || 'normal',
      textTransform: s.textTransform || 'none',
      textDecoration: s.textDecoration || 'none',
      letterSpacing: s.letterSpacing ? `${s.letterSpacing}em` : 'normal',
      lineHeight: 1.1,
      cursor: 'pointer',
    };
  };

  const handleItemClick = (e, id) => {
    e.stopPropagation();
    const section = sections.find(s => s.id === id);
    if (section && onSelectSection) onSelectSection(section, e.currentTarget.getBoundingClientRect());
  };

  const base = {
    width: '100%', height: '100%', background: t.bg,
    border: t.border || 'none', position: 'relative',
    overflow: 'hidden', boxSizing: 'border-box',
  };

  if (isBack) {
    return (
      <div style={base}>
        {/* Name */}
        <div
          onClick={(e) => handleItemClick(e, 'back-name')}
          style={{ ...getSectionPos(sections, 'back-name'), ...getSectionStyle('back-name'), display: 'flex', alignItems: 'center' }}
        >
          {data.firstName} {data.lastName}
        </div>

        {/* Title */}
        <div
          onClick={(e) => handleItemClick(e, 'back-title')}
          style={{ ...getSectionPos(sections, 'back-title'), ...getSectionStyle('back-title'), display: 'flex', alignItems: 'center' }}
        >
          {data.title}
        </div>

        {/* Divider */}
        <div style={{ position: 'absolute', left: '46%', top: '20%', width: '1px', height: '60%', background: t.accent, opacity: t.dividerOpacity }} />

        {/* Phone */}
        <div onClick={(e) => handleItemClick(e, 'back-phone')}
          style={{ ...getSectionPos(sections, 'back-phone'), ...getSectionStyle('back-phone'), display: 'flex', alignItems: 'center', gap: '6px' }}>
          <PhoneIcon color={t.accent} size={11 * scale} /><span>{data.phone}</span>
        </div>

        {/* Email */}
        <div onClick={(e) => handleItemClick(e, 'back-email')}
          style={{ ...getSectionPos(sections, 'back-email'), ...getSectionStyle('back-email'), display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MailIcon color={t.accent} size={11 * scale} /><span>{data.email}</span>
        </div>

        {/* Website */}
        <div onClick={(e) => handleItemClick(e, 'back-website')}
          style={{ ...getSectionPos(sections, 'back-website'), ...getSectionStyle('back-website'), display: 'flex', alignItems: 'center', gap: '6px' }}>
          <WebIcon color={t.accent} size={11 * scale} /><span>{data.website}</span>
        </div>
      </div>
    );
  }

  return (
    <div style={base}>
      {/* Logo */}
      <img
        src={data.logoUrl || logoIcon}
        alt="Logo"
        onClick={(e) => handleItemClick(e, 'front-logo')}
        style={{ ...getSectionPos(sections, 'front-logo'), objectFit: 'contain', cursor: 'pointer' }}
      />
      {/* Name */}
      <div
        onClick={(e) => handleItemClick(e, 'front-name')}
        style={{ ...getSectionPos(sections, 'front-name'), ...getSectionStyle('front-name'), display: 'flex', alignItems: 'center' }}
      >
        {data.firstName} {data.lastName}
      </div>
      {/* Title */}
      <div
        onClick={(e) => handleItemClick(e, 'front-title')}
        style={{ ...getSectionPos(sections, 'front-title'), ...getSectionStyle('front-title'), display: 'flex', alignItems: 'center' }}
      >
        {data.title}
      </div>
    </div>
  );
}