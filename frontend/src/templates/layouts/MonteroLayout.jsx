import React from 'react';
import logoIcon from '../../assets/logo.png';
import { getSectionTextStyle } from '../../sectionSchema';

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
    { id: 'front-name',  type: 'text', field: 'name',  label: 'Name',  fontSize: 32, fontFamily: 'Cormorant Garamond, serif', fontWeight: '400', color: '#4a4a4a' },
    { id: 'front-title', type: 'text', field: 'title', label: 'Tagline', fontSize: 8, fontFamily: 'Montserrat, sans-serif', color: '#8a8a8a' },
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

export default function MonteroLayout({ 
  template, 
  isBack = false, 
  containerWidth, 
  userData, 
  sections = [], 
  onSelectSection 
}) {
  const t = template || monteroTemplate;
  const scale = (containerWidth || 400) / 400;
  const data = { ...t.defaultData, ...userData };

  const getSectionStyle = (id, fallbackColor, fallbackFont) => {
    const s = sections.find(sec => sec.id === id);
    if (!s) return { color: fallbackColor, fontFamily: fallbackFont };

    return {
      color: s.color || fallbackColor,
      fontFamily: s.fontFamily || fallbackFont,
      fontSize: s.fontSize ? `${s.fontSize * scale}px` : undefined,
      fontWeight: s.fontWeight || '400',
      fontStyle: s.fontStyle || 'normal',
      textTransform: s.textTransform || 'none',
      textDecoration: s.textDecoration || 'none',
      letterSpacing: s.letterSpacing ? `${s.letterSpacing * scale}em` : undefined,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      lineHeight: 1.3
    };
  };

  const handleItemClick = (e, baseId) => {
    e.stopPropagation();
    const fullId = isBack ? `back-${baseId}` : `front-${baseId}`;
    const sectionList = isBack ? t.sectionsBack : t.sectionsFront;
    const section = sectionList.find(s => s.id === fullId);
    if (section && onSelectSection) {
      onSelectSection(section, e.currentTarget.getBoundingClientRect());
    }
  };

  const baseStyle = {
    width: '100%', height: '100%', background: t.bg,
    padding: `${50 * scale}px`, boxSizing: "border-box",
    position: "relative", overflow: "hidden", display: "flex", flexShrink: 0,
  };

  if (isBack) {
    return (
      <div style={{ ...baseStyle, flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div 
            onClick={(e) => handleItemClick(e, 'name')}
            style={{ ...getSectionStyle('back-name', t.text, t.fontBody), marginBottom: `${4 * scale}px` }}
          >
            {data.firstName} {data.lastName}
          </div>
          <div 
            onClick={(e) => handleItemClick(e, 'title')}
            style={getSectionStyle('back-title', t.textMuted, t.fontBody)}
          >
            {data.title}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: `${8 * scale}px`, ...getSectionStyle('back-phone', t.text, t.fontBody), fontSize: `${10 * scale}px`, fontWeight: 300 }}>
          <div onClick={(e) => handleItemClick(e, 'phone')}>{data.phone}</div>
          <div onClick={(e) => handleItemClick(e, 'website')}>{data.website}</div>
          <div onClick={(e) => handleItemClick(e, 'email')}>{data.email}</div>
        </div>

        <div style={{ position: 'absolute', top: `${50 * scale}px`, right: `${20 * scale}px`, opacity: 0.9 }}>
          <VerticalLines color={t.text} scale={scale} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...baseStyle, flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
      <div style={{ marginBottom: `${25 * scale}px` }}>
        <img 
          src={data.logoUrl || logoIcon} 
          alt="Logo" 
          style={{ width: `${80 * scale}px`, height: 'auto', objectFit: 'contain', cursor: 'pointer' }} 
          onClick={(e) => handleItemClick(e, 'logo')}
        />
      </div>
      <div 
        onClick={(e) => handleItemClick(e, 'name')}
        style={{ 
          letterSpacing: `${0.08 * scale}em`, 
          ...getSectionStyle('front-name', t.text, t.fontName) 
        }}
      >
        {data.firstName} {data.lastName}
      </div>
      <div 
        onClick={(e) => handleItemClick(e, 'title')}
        style={{ 
          marginTop: `${8 * scale}px`,
          letterSpacing: `${0.15 * scale}em`,
          ...getSectionStyle('front-title', t.textMuted, t.fontBody) 
        }}
      >
        {data.title}
      </div>
    </div>
  );
}