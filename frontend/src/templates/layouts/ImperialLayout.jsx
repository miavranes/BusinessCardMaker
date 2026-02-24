import React from 'react';
import logoIcon from '../../assets/logo.png';
import qrCode from '../../assets/qr.svg';

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
    { id: 'back-name', type: 'text', field: 'name', label: 'Full Name', fontSize: 14, fontFamily: "'Jost', sans-serif", fontWeight: '400' },
    { id: 'back-title', type: 'text', field: 'title', label: 'Job Title', fontSize: 11, fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' },
    { id: 'back-phone', type: 'text', field: 'phone', label: 'Phone', fontSize: 8, fontFamily: "'Jost', sans-serif", fontWeight: '300' },
    { id: 'back-email', type: 'text', field: 'email', label: 'Email', fontSize: 8, fontFamily: "'Jost', sans-serif", fontWeight: '300' },
    { id: 'back-linkedin', type: 'text', field: 'linkedin', label: 'LinkedIn', fontSize: 8, fontFamily: "'Jost', sans-serif", fontWeight: '300' },
    { id: 'back-instagram', type: 'text', field: 'instagram', label: 'Instagram', fontSize: 8, fontFamily: "'Jost', sans-serif", fontWeight: '300' },
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
    return (
      <div style={{
        width: '100%', height: '100%', background: t.bgBack,
        backgroundImage: `radial-gradient(ellipse at 30% 40%, rgba(255,255,255,0.03) 0%, transparent 60%)`,
        display: "flex", alignItems: "center", justifyContent: "center", position: "relative"
      }}>
        <img 
          src={data.logoUrl || logoIcon} 
          alt="Logo" 
          style={{ 
            width: `${200 * scale}px`, 
            height: 'auto', 
            filter: data.logoUrl ? 'none' : 'brightness(0) invert(1) opacity(0.25)',
            cursor: 'pointer' 
          }} 
          onClick={(e) => handleItemClick(e, 'logo')}
        />
      </div>
    );
  }

 return (
    <div style={{ 
      width: '100%', height: '100%', background: t.bg, 
      display: "flex", flexDirection: "column", justifyContent: "space-between", 
      padding: `${40 * scale}px`, boxSizing: 'border-box', position: "relative"
    }}>
      
       <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", textAlign: 'right' }}>
        <div 
          onClick={(e) => handleItemClick(e, 'name')}
          style={{ 
            fontFamily: t.fontBody, 
            letterSpacing: `${0.1 * scale}em`,
            ...getSectionStyle('back-name', t.text) 
          }}
        >
          {data.firstName} {data.lastName}
        </div>
        <div 
          onClick={(e) => handleItemClick(e, 'title')}
          style={{ 
            marginTop: `${3 * scale}px`,
            ...getSectionStyle('back-title', t.textMuted) 
          }}
        >
          {data.title}
        </div>
      </div>

     <div style={{ display: "flex", alignItems: "flex-end", gap: `${20 * scale}px` }}>
        <div style={{ 
          width: `${70 * scale}px`, height: `${70 * scale}px`, 
          border: `${1 * scale}px solid rgba(0,0,0,0.12)`, 
          padding: `${4 * scale}px`, background: 'white', flexShrink: 0
        }}>
          <img src={qrCode} alt="QR Code" style={{ width: '100%', height: '100%' }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: `${11 * scale}px` }}>
          {[
            { id: "phone",     label: "contact",   value: data.phone },
            { id: "email",     label: "email",     value: data.email },
            { id: "linkedin",  label: "linkedin",  value: data.linkedin },
            { id: "instagram", label: "instagram", value: data.instagram },
          ].map((item) => (
            <div 
              key={item.id} 
              onClick={(e) => handleItemClick(e, item.id)}
              style={{ 
                display: "flex", gap: `${4 * scale}px`, 
                letterSpacing: `${0.03 * scale}em`,
                ...getSectionStyle(`back-${item.id}`, t.text) 
              }}
            >
              <span style={{ opacity: 0.5 }}>{item.label} :</span>
              <span style={{ opacity: 0.85 }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}