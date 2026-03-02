import React from 'react';
import logoIcon from '../../assets/logo.png';
import { getSectionPos, getSectionTextStyle } from '../../sectionSchema';

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
    { id: 'back-name', type: 'text', field: 'name', label: 'Full Name', x: 0.05, y: 0.30, width: 0.55, height: 0.10, fontSize: 13, fontFamily: 'Jost, sans-serif', fontWeight: '400', color: '#7d1e2e', textTransform: 'uppercase' },
    { id: 'back-title', type: 'text', field: 'title', label: 'Job Title', x: 0.05, y: 0.42, width: 0.55, height: 0.08, fontSize: 9, fontFamily: 'Jost, sans-serif', fontWeight: '300', color: '#7d1e2e' },
    { id: 'back-phone', type: 'text', field: 'phone', label: 'Phone', x: 0.05, y: 0.55, width: 0.55, height: 0.08, fontSize: 9, fontFamily: 'Jost, sans-serif', fontWeight: '300', color: '#7d1e2e' },
    { id: 'back-email', type: 'text', field: 'email', label: 'Email', x: 0.05, y: 0.65, width: 0.55, height: 0.08, fontSize: 9, fontFamily: 'Jost, sans-serif', fontWeight: '300', color: '#7d1e2e' },
    { id: 'back-website', type: 'text', field: 'website', label: 'Website', x: 0.05, y: 0.75, width: 0.55, height: 0.08, fontSize: 9, fontFamily: 'Jost, sans-serif', fontWeight: '300', color: '#7d1e2e' }
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
    const logoSection = sections.find(s => s.id === 'back-logo');
    
    return (
      <div style={{ width: '100%', height: '100%', background: t.bgBack, position: "relative", overflow: "hidden", boxSizing: 'border-box' }}>
        {logoSection && (
          <img
            src={data.logoUrl || logoIcon}
            alt="Logo"
            style={{ ...getSectionPos(sections, 'back-logo'), objectFit: 'contain', cursor: 'pointer' }}
            onClick={(e) => handleItemClick(e, 'logo')}
          />
        )}

        {sections.find(s => s.id === 'back-name') && (
          <div 
            onClick={(e) => handleItemClick(e, 'name')} 
            style={{ ...getSectionPos(sections, 'back-name'), ...getSectionStyle('back-name', '#7d1e2e'), display: 'flex', alignItems: 'center' }}
          >
            {data.firstName} {data.lastName}
          </div>
        )}
        
        {sections.find(s => s.id === 'back-title') && (
          <div 
            onClick={(e) => handleItemClick(e, 'title')} 
            style={{ ...getSectionPos(sections, 'back-title'), ...getSectionStyle('back-title', '#7d1e2e'), display: 'flex', alignItems: 'center', opacity: 0.8 }}
          >
            {data.title}
          </div>
        )}

        {sections.find(s => s.id === 'back-phone') && (
          <div 
            onClick={(e) => handleItemClick(e, 'phone')} 
            style={{ ...getSectionPos(sections, 'back-phone'), ...getSectionStyle('back-phone', '#7d1e2e'), display: 'flex', alignItems: 'center' }}
          >
            {data.phone}
          </div>
        )}
        
        {sections.find(s => s.id === 'back-email') && (
          <div 
            onClick={(e) => handleItemClick(e, 'email')} 
            style={{ ...getSectionPos(sections, 'back-email'), ...getSectionStyle('back-email', '#7d1e2e'), display: 'flex', alignItems: 'center' }}
          >
            {data.email}
          </div>
        )}
        
        {sections.find(s => s.id === 'back-website') && (
          <div 
            onClick={(e) => handleItemClick(e, 'website')} 
            style={{ ...getSectionPos(sections, 'back-website'), ...getSectionStyle('back-website', '#7d1e2e'), display: 'flex', alignItems: 'center' }}
          >
            {data.website}
          </div>
        )}
      </div>
    );
  }

 const frontLogoSection = sections.find(s => s.id === 'front-logo');
 
 return (
    <div style={{ width: '100%', height: '100%', background: t.bg, position: "relative", overflow: "hidden", display: "flex", justifyContent: 'center', alignItems: 'center' }}>
      {frontLogoSection && (
        <img
          src={data.logoUrl || logoIcon}
          alt="Logo"
          style={{ 
            ...getSectionPos(sections, 'front-logo'),
            objectFit: 'contain',
            cursor: 'pointer', 
            filter: data.logoUrl ? 'none' : 'brightness(0) invert(1)',
            transition: 'transform 0.2s' 
          }}
          onClick={(e) => handleItemClick(e, 'logo')}
        />
      )}
    </div>
  );
}