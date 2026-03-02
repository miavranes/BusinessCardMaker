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
    { id: 'back-name', type: 'text', field: 'name', label: 'Name', x: 0.05, y: 0.75, width: 0.35, height: 0.10, fontSize: 13, fontFamily: "'Raleway', sans-serif", fontWeight: '400', color: '#ffffff' },
    { id: 'back-title', type: 'text', field: 'title', label: 'Title', x: 0.05, y: 0.87, width: 0.35, height: 0.08, fontSize: 10, fontFamily: "'Raleway', sans-serif", fontStyle: 'italic', color: '#f0e6df' },
    { id: 'back-address', type: 'text', field: 'address', label: 'Address', x: 0.50, y: 0.15, width: 0.45, height: 0.08, fontSize: 8, color: '#555555' },
    { id: 'back-city', type: 'text', field: 'city', label: 'City', x: 0.50, y: 0.23, width: 0.45, height: 0.08, fontSize: 8, color: '#555555' },
    { id: 'back-email', type: 'text', field: 'email', label: 'Email', x: 0.50, y: 0.40, width: 0.45, height: 0.08, fontSize: 8, color: '#555555' },
    { id: 'back-website', type: 'text', field: 'website', label: 'Website', x: 0.50, y: 0.48, width: 0.45, height: 0.08, fontSize: 8, color: '#555555' },
    { id: 'back-instagram', type: 'text', field: 'instagram', label: 'Instagram', x: 0.50, y: 0.65, width: 0.45, height: 0.08, fontSize: 8, color: '#555555' },
    { id: 'back-facebook', type: 'text', field: 'facebook', label: 'Facebook', x: 0.50, y: 0.73, width: 0.45, height: 0.08, fontSize: 8, color: '#555555' },
  ],
};

export default function LuminaLayout({ 
  template, 
  isBack = false, 
  containerWidth, 
  userData, 
  sections = [], 
  onSelectSection 
}) {
  const t = template || luminaTemplate;
  const scale = (containerWidth || 400) / 400;
  const data = { ...t.defaultData, ...userData };

  const getSectionStyle = (id, fallbackColor) => {
    const s = sections.find(sec => sec.id === id);
    if (!s) return { color: fallbackColor };

    return {
      color: s.color || fallbackColor,
      fontFamily: s.fontFamily || t.fontBody,
      fontSize: s.fontSize ? `${s.fontSize * scale}px` : undefined,
      fontWeight: s.fontWeight,
      fontStyle: s.fontStyle,
      textTransform: s.textTransform || 'none',
      textDecoration: s.textDecoration || 'none',
      letterSpacing: s.letterSpacing ? `${s.letterSpacing * scale}em` : undefined,
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

  const baseStyle = {
    width: '100%', height: '100%', position: "relative", overflow: "hidden", display: "flex", flexShrink: 0,
  };

  if (!isBack) {
    const frontLogoSection = sections.find(s => s.id === 'front-logo');
    
    return (
      <div style={{ ...baseStyle, background: t.bg, alignItems: "center", justifyContent: "center" }}>
        {frontLogoSection && (
          <img 
            src={data.logoUrl || logoIcon} 
            alt="Logo" 
            style={{ 
              ...getSectionPos(sections, 'front-logo'),
              objectFit: 'contain',
              filter: data.logoUrl ? 'none' : 'brightness(0) invert(1)', 
              opacity: 0.2,
              cursor: 'pointer'
            }} 
            onClick={(e) => handleItemClick(e, 'logo')}
          />
        )}
        <div 
          onClick={(e) => handleItemClick(e, 'name')}
          style={{ 
            position: "relative", 
            textAlign: "center", 
            letterSpacing: '0.3em',
            ...getSectionStyle('front-name', '#ffffff') 
          }}
        >
          {data.firstName} {data.lastName}
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...baseStyle }}>
      <div style={{ 
        width: '45%', height: '100%', background: t.bg, 
        display: "flex", flexDirection: "column", justifyContent: "flex-end", 
        padding: `${28 * scale}px ${24 * scale}px`, boxSizing: 'border-box' 
      }}>
        <div 
          onClick={(e) => handleItemClick(e, 'name')}
          style={getSectionStyle('back-name', '#ffffff')}
        >
          {data.firstName} {data.lastName}
        </div>
        <div 
          onClick={(e) => handleItemClick(e, 'title')}
          style={{ ...getSectionStyle('back-title', '#f0e6df'), marginTop: `${4 * scale}px` }}
        >
          {data.title}
        </div>
      </div>

      <div style={{ 
        width: '55%', height: '100%', background: '#ffffff', 
        display: "flex", flexDirection: "column", justifyContent: "center", 
        padding: `${24 * scale}px ${22 * scale}px`, gap: `${14 * scale}px`, boxSizing: 'border-box' 
      }}>
        
        <div>
           <div style={{ fontFamily: t.fontBody, fontSize: `${9 * scale}px`, fontWeight: 500, color: '#1a1a1a', letterSpacing: '0.08em', marginBottom: '4px' }}>Postal Address</div>
           <div onClick={(e) => handleItemClick(e, 'address')} style={getSectionStyle('back-address', '#555555')}>{data.address}</div>
           <div onClick={(e) => handleItemClick(e, 'city')} style={getSectionStyle('back-city', '#555555')}>{data.city}</div>
        </div>

        <div>
           <div style={{ fontFamily: t.fontBody, fontSize: `${9 * scale}px`, fontWeight: 500, color: '#1a1a1a', letterSpacing: '0.08em', marginBottom: '4px' }}>Online</div>
           <div onClick={(e) => handleItemClick(e, 'email')} style={getSectionStyle('back-email', '#555555')}>{data.email}</div>
           <div onClick={(e) => handleItemClick(e, 'website')} style={getSectionStyle('back-website', '#555555')}>{data.website}</div>
        </div>

        <div>
           <div style={{ fontFamily: t.fontBody, fontSize: `${9 * scale}px`, fontWeight: 500, color: '#1a1a1a', letterSpacing: '0.08em', marginBottom: '4px' }}>Social</div>
           <div onClick={(e) => handleItemClick(e, 'instagram')} style={getSectionStyle('back-instagram', '#555555')}>{data.instagram}</div>
           <div onClick={(e) => handleItemClick(e, 'facebook')} style={getSectionStyle('back-facebook', '#555555')}>{data.facebook}</div>
        </div>

      </div>
    </div>
  );
}