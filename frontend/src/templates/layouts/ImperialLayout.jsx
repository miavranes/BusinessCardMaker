import React from 'react';
import logoIcon from '../../assets/logo.png';
import qrCode from '../../assets/qr.svg';
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
    { id: 'front-logo', type: 'logo', label: 'Logo', x: 0.25, y: 0.20, width: 0.50, height: 0.60 }
  ],
  sectionsBack: [
    { id: 'back-name', type: 'text', field: 'name', label: 'Full Name', x: 0.55, y: 0.08, width: 0.40, height: 0.12, fontSize: 14, fontFamily: "'Jost', sans-serif", fontWeight: '400' },
    { id: 'back-title', type: 'text', field: 'title', label: 'Job Title', x: 0.55, y: 0.22, width: 0.40, height: 0.10, fontSize: 11, fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' },
    { id: 'back-phone', type: 'text', field: 'phone', label: 'Phone', x: 0.06, y: 0.60, width: 0.40, height: 0.08, fontSize: 8, fontFamily: "'Jost', sans-serif", fontWeight: '300' },
    { id: 'back-email', type: 'text', field: 'email', label: 'Email', x: 0.06, y: 0.70, width: 0.40, height: 0.08, fontSize: 8, fontFamily: "'Jost', sans-serif", fontWeight: '300' },
    { id: 'back-linkedin', type: 'text', field: 'linkedin', label: 'LinkedIn', x: 0.06, y: 0.80, width: 0.40, height: 0.08, fontSize: 8, fontFamily: "'Jost', sans-serif", fontWeight: '300' },
    { id: 'back-instagram', type: 'text', field: 'instagram', label: 'Instagram', x: 0.06, y: 0.90, width: 0.40, height: 0.08, fontSize: 8, fontFamily: "'Jost', sans-serif", fontWeight: '300' },
  ],
};

export default function ImperialLayout({ 
  template, 
  isBack = false, 
  containerWidth, 
  userData, 
  sections = [], 
  onSelectSection 
}) {
  const t = template || imperialTemplate;
  const scale = (containerWidth || 400) / 400;
  const data = { ...t.defaultData, ...userData };

  const getSectionStyle = (id, fallbackColor) => {
    const s = sections.find(sec => sec.id === id);
    if (!s) return { color: fallbackColor };

    return {
      color: s.color || fallbackColor,
      fontFamily: s.fontFamily, 
      fontSize: s.fontSize ? `${s.fontSize * scale}px` : undefined,
      fontWeight: s.fontWeight,
      fontStyle: s.fontStyle,
      textTransform: s.textTransform || 'none',
      textDecoration: s.textDecoration || 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
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

  if (!isBack) {
    const frontLogoSection = sections.find(s => s.id === 'front-logo');
    
    return (
      <div style={{
        width: '100%', height: '100%', background: t.bgBack,
        backgroundImage: `radial-gradient(ellipse at 30% 40%, rgba(255,255,255,0.03) 0%, transparent 60%)`,
        display: "flex", alignItems: "center", justifyContent: "center", position: "relative"
      }}>
        {frontLogoSection && (
          <img 
            src={data.logoUrl || logoIcon} 
            alt="Logo" 
            style={{ 
              ...getSectionPos(sections, 'front-logo'),
              objectFit: 'contain',
              filter: data.logoUrl ? 'none' : 'brightness(0) invert(1) opacity(0.25)',
              cursor: 'pointer' 
            }} 
            onClick={(e) => handleItemClick(e, 'logo')}
          />
        )}
      </div>
    );
  }

 return (
    <div style={{ 
      width: '100%', height: '100%', background: t.bg, 
      position: "relative", boxSizing: 'border-box'
    }}>
      
      {sections.find(s => s.id === 'back-name') && (
        <div 
          onClick={(e) => handleItemClick(e, 'name')}
          style={{ 
            ...getSectionPos(sections, 'back-name'),
            ...getSectionStyle('back-name', t.text),
            display: 'flex',
            alignItems: 'flex-end',
            textAlign: 'right',
            justifyContent: 'flex-end',
            fontFamily: t.fontBody, 
            letterSpacing: `${0.1 * scale}em`,
          }}
        >
          {data.firstName} {data.lastName}
        </div>
      )}
      
      {sections.find(s => s.id === 'back-title') && (
        <div 
          onClick={(e) => handleItemClick(e, 'title')}
          style={{ 
            ...getSectionPos(sections, 'back-title'),
            ...getSectionStyle('back-title', t.textMuted),
            display: 'flex',
            alignItems: 'flex-start',
            textAlign: 'right',
            justifyContent: 'flex-end',
          }}
        >
          {data.title}
        </div>
      )}

      {[
        { id: "back-phone", label: "contact", value: data.phone },
        { id: "back-email", label: "email", value: data.email },
        { id: "back-linkedin", label: "linkedin", value: data.linkedin },
        { id: "back-instagram", label: "instagram", value: data.instagram },
      ].map((item) => {
        const section = sections.find(s => s.id === item.id);
        if (!section) return null;
        
        return (
          <div 
            key={item.id} 
            onClick={(e) => handleItemClick(e, item.id.replace('back-', ''))}
            style={{ 
              ...getSectionPos(sections, item.id),
              ...getSectionStyle(item.id, t.text),
              display: 'flex',
              alignItems: 'center',
              gap: `${4 * scale}px`, 
              letterSpacing: `${0.03 * scale}em`,
            }}
          >
            <span style={{ opacity: 0.5 }}>{item.label} :</span>
            <span style={{ opacity: 0.85 }}>{item.value}</span>
          </div>
        );
      })}

      <div style={{ 
        position: 'absolute', 
        right: `${5 * scale}%`, 
        bottom: `${5 * scale}%`, 
        width: `${70 * scale}px`, 
        height: `${70 * scale}px`, 
        border: `${1 * scale}px solid rgba(0,0,0,0.12)`, 
        padding: `${4 * scale}px`, 
        background: 'white', 
        flexShrink: 0
      }}>
        <img src={qrCode} alt="QR Code" style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  );
}