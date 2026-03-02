import React from 'react';
import logoIcon from '../../assets/logo.png';
import { getSectionPos, getSectionTextStyle } from '../../sectionSchema';

export const noirClassicTemplate = {
  id: 2,
  category: "elegant",
  name: "Noir Classic",
  bg: "#ffffff",
  bgBack: "#5a5a5a",
  accent: "#C4A574",
  text: "#111111",
  textBack: "#ffffff",
  textMuted: "#C4A574",
  fontName: "Montserrat, sans-serif",
  fontBody: "Montserrat, sans-serif",
  defaultData: {
    firstName: "MIA",
    lastName: "VRANES",
    title: "WEB DESIGNER",
    phone: "+123-456-7890",
    email: "mia@example.com",
    website: "www.miavranes.com",
  },
  sectionsFront: [
    { id: 'front-logo',  type: 'logo', label: 'Logo', x: 0.35, y: 0.20, width: 0.30, height: 0.30 },
    { id: 'front-name',  type: 'text', field: 'name',  label: 'Name',  x: 0.10, y: 0.55, width: 0.80, height: 0.15, fontSize: 14, fontFamily: 'Montserrat, sans-serif', fontWeight: '400', color: '#111111', textTransform: 'uppercase' },
    { id: 'front-title', type: 'text', field: 'title', label: 'Title', x: 0.10, y: 0.72, width: 0.80, height: 0.10, fontSize: 9, fontFamily: 'Montserrat, sans-serif', color: '#C4A574', textTransform: 'uppercase' },
  ],
  sectionsBack: [
    { id: 'back-logo',    type: 'logo', label: 'Logo', x: 0.70, y: 0.08, width: 0.25, height: 0.20 },
    { id: 'back-name',    type: 'text', field: 'name',    label: 'Name',    x: 0.08, y: 0.30, width: 0.60, height: 0.20, fontSize: 32, fontFamily: 'Montserrat, sans-serif', fontWeight: '300', color: '#ffffff' },
    { id: 'back-title',   type: 'text', field: 'title',   label: 'Title',   x: 0.08, y: 0.52, width: 0.60, height: 0.10, fontSize: 11, fontFamily: 'Montserrat, sans-serif', color: '#C4A574', textTransform: 'uppercase' },
    { id: 'back-phone',   type: 'text', field: 'phone',   label: 'Phone',   x: 0.08, y: 0.68, width: 0.60, height: 0.08, fontSize: 10, color: '#ffffff' },
    { id: 'back-email',   type: 'text', field: 'email',   label: 'Email',   x: 0.08, y: 0.78, width: 0.60, height: 0.08, fontSize: 10, color: '#ffffff' },
    { id: 'back-website', type: 'text', field: 'website', label: 'Website', x: 0.08, y: 0.88, width: 0.60, height: 0.08, fontSize: 10, color: '#ffffff' },
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

export default function NoirClassicLayout({ 
  template, 
  isBack = false, 
  containerWidth, 
  userData, 
  sections = [], 
  onSelectSection 
}) {
  const t = template || noirClassicTemplate;
  const scale = (containerWidth || 400) / 400;
  const data = { ...t.defaultData, ...userData };

  const getSectionStyle = (id, fallbackColor, fallbackFontSize) => {
    const s = sections.find(sec => sec.id === id);
    return {
      ...getSectionTextStyle(s, scale, {
        color: fallbackColor,
        fontFamily: t.fontBody,
        fontSize: `${fallbackFontSize * scale}px`,
      }),
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

  if (isBack) {
    const backLogoSection = sections.find(s => s.id === 'back-logo');
    
    return (
      <div style={{ ...baseStyle, background: t.bgBack, position: "relative", boxSizing: 'border-box' }}>
        {backLogoSection && (
          <img 
            src={data.logoUrl || logoIcon} 
            alt="Logo" 
            style={{ ...getSectionPos(sections, 'back-logo'), objectFit: 'contain', filter: 'brightness(0) invert(1)', cursor: 'pointer' }} 
            onClick={(e) => handleItemClick(e, 'logo')}
          />
        )}
        
        {sections.find(s => s.id === 'back-name') && (
          <div 
            onClick={(e) => handleItemClick(e, 'name')}
            style={{ ...getSectionPos(sections, 'back-name'), ...getSectionStyle('back-name', t.textBack, 32), letterSpacing: '0.05em', lineHeight: 1.2, display: 'flex', alignItems: 'center' }}
          >
            {data.firstName}<br/>{data.lastName}
          </div>
        )}
        
        {sections.find(s => s.id === 'back-title') && (
          <div 
            onClick={(e) => handleItemClick(e, 'title')}
            style={{ ...getSectionPos(sections, 'back-title'), ...getSectionStyle('back-title', t.textMuted, 11), letterSpacing: '0.25em', display: 'flex', alignItems: 'center' }}
          >
            {data.title}
          </div>
        )}

        {[
          { id: 'back-phone', Icon: PhoneIcon, text: data.phone },
          { id: 'back-email', Icon: MailIcon, text: data.email },
          { id: 'back-website', Icon: WebIcon, text: data.website }
        ].map((item) => {
          const section = sections.find(s => s.id === item.id);
          if (!section) return null;
          
          return (
            <div 
              key={item.id} 
              onClick={(e) => handleItemClick(e, item.id.replace('back-', ''))}
              style={{ ...getSectionPos(sections, item.id), display: "flex", alignItems: "center", gap: `${8 * scale}px`, ...getSectionStyle(item.id, t.textBack, 10), fontWeight: 300 }}
            >
              <item.Icon color={t.textMuted} size={12 * scale} />
              <span>{item.text}</span>
            </div>
          );
        })}
      </div>
    );
  }

  const frontLogoSection = sections.find(s => s.id === 'front-logo');

  return (
    <div style={{ ...baseStyle, background: t.bg, position: "relative", boxSizing: 'border-box' }}>
      {frontLogoSection && (
        <img 
          src={data.logoUrl || logoIcon} 
          alt="Logo" 
          style={{ ...getSectionPos(sections, 'front-logo'), objectFit: 'contain', cursor: 'pointer' }} 
          onClick={(e) => handleItemClick(e, 'logo')}
        />
      )}
      
      {sections.find(s => s.id === 'front-name') && (
        <div 
          onClick={(e) => handleItemClick(e, 'name')}
          style={{ ...getSectionPos(sections, 'front-name'), ...getSectionStyle('front-name', t.text, 14), letterSpacing: '0.15em', textAlign: "center", display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {data.firstName} {data.lastName}
        </div>
      )}
      
      {sections.find(s => s.id === 'front-title') && (
        <div 
          onClick={(e) => handleItemClick(e, 'title')}
          style={{ ...getSectionPos(sections, 'front-title'), ...getSectionStyle('front-title', t.textMuted, 9), letterSpacing: '0.2em', textAlign: "center", display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {data.title}
        </div>
      )}
    </div>
  );
}