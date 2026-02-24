import React from 'react';
import logoIcon from '../../assets/logo.png';

export const bellmontTemplate = {
  id: 6,
  category: "minimal",
  name: "Bellmont",
  bg: "#7d1e2e",      
  bgBack: "#f5f0e8", 
  accent: "#f5f0e8", 
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
    { id: 'back-logo', type: 'logo', label: 'Logo', x: 0.64, y: 0.05, width: 0.31, height: 0.26 },
    { id: 'back-name', type: 'text', field: 'name', label: 'Full Name', fontSize: 13, fontFamily: 'Jost, sans-serif', fontWeight: '400', color: '#7d1e2e', textTransform: 'uppercase' },
    { id: 'back-title', type: 'text', field: 'title', label: 'Job Title', fontSize: 9, fontFamily: 'Jost, sans-serif', fontWeight: '300', color: '#7d1e2e' },
    { id: 'back-phone', type: 'text', field: 'phone', label: 'Phone', fontSize: 9, fontFamily: 'Jost, sans-serif', fontWeight: '300', color: '#7d1e2e' },
    { id: 'back-email', type: 'text', field: 'email', label: 'Email', fontSize: 9, fontFamily: 'Jost, sans-serif', fontWeight: '300', color: '#7d1e2e' },
    { id: 'back-website', type: 'text', field: 'website', label: 'Website', fontSize: 9, fontFamily: 'Jost, sans-serif', fontWeight: '300', color: '#7d1e2e' }
  ]
};

export default function BellmontLayout({ 
  template, 
  isBack = false, 
  containerWidth, 
  userData, 
  sections = [], 
  onSelectSection 
}) {
  const t = template || bellmontTemplate;
  const scale = (containerWidth || 400) / 400;
  const data = { ...t.defaultData, ...userData };

  const getSectionStyle = (id, defaultColor) => {
    const s = sections.find(sec => sec.id === id);
    if (!s) return { color: defaultColor };
    return {
      color: s.color || defaultColor,
      fontFamily: s.fontFamily || 'Jost, sans-serif',
      fontSize: `${(s.fontSize || 10) * scale}px`,
      fontWeight: s.fontWeight || '400',
      fontStyle: s.fontStyle || 'normal',
      textTransform: s.textTransform || 'none',
      textDecoration: s.textDecoration || 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      lineHeight: 1.2
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

 if (isBack) {
    return (
      <div style={{ width: '100%', height: '100%', background: t.bgBack, position: "relative", overflow: "hidden", display: "flex", padding: `${40 * scale}px`, boxSizing: 'border-box' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          
          <img
            src={data.logoUrl || logoIcon}
            alt="Logo"
            style={{ position: 'absolute', top: `${30 * scale}px`, right: `${30 * scale}px`, height: `${45 * scale}px`, cursor: 'pointer' }}
            onClick={(e) => handleItemClick(e, 'logo')}
          />

          <div onClick={(e) => handleItemClick(e, 'name')} style={{ ...getSectionStyle('back-name', '#7d1e2e'), marginBottom: `${4 * scale}px` }}>
            {data.firstName} {data.lastName}
          </div>
          
          <div onClick={(e) => handleItemClick(e, 'title')} style={{ ...getSectionStyle('back-title', '#7d1e2e'), marginBottom: `${25 * scale}px`, opacity: 0.8 }}>
            {data.title}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: `${6 * scale}px` }}>
            <div onClick={(e) => handleItemClick(e, 'phone')} style={getSectionStyle('back-phone', '#7d1e2e')}>{data.phone}</div>
            <div onClick={(e) => handleItemClick(e, 'email')} style={getSectionStyle('back-email', '#7d1e2e')}>{data.email}</div>
            <div onClick={(e) => handleItemClick(e, 'website')} style={getSectionStyle('back-website', '#7d1e2e')}>{data.website}</div>
          </div>
        </div>
      </div>
    );
  }

 return (
    <div style={{ width: '100%', height: '100%', background: t.bg, position: "relative", overflow: "hidden", display: "flex", justifyContent: 'center', alignItems: 'center' }}>
      <img
        src={data.logoUrl || logoIcon}
        alt="Logo"
        style={{ 
            width: '60%', 
            height: 'auto', 
            cursor: 'pointer', 
            filter: data.logoUrl ? 'none' : 'brightness(0) invert(1)', // Ako je default logo, pretvori ga u bijeli
            transition: 'transform 0.2s' 
        }}
        onClick={(e) => handleItemClick(e, 'logo')}
      />
    </div>
  );
}