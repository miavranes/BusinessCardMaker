import React from 'react';
import logoIcon from '../../assets/logo.png';
import { getSectionTextStyle } from '../../sectionSchema';

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
    { id: 'front-logo',    type: 'logo', label: 'Logo' },
    { id: 'front-company', type: 'text', field: 'company', label: 'Company', fontSize: 13, fontFamily: "'Jost', sans-serif", fontWeight: '500', color: '#c9a96e', textTransform: 'uppercase' },
    { id: 'front-slogan',  type: 'text', field: 'slogan',  label: 'Slogan',  fontSize: 10, fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', color: '#a0b4c8' },
    { id: 'front-website', type: 'text', field: 'website', label: 'Website', fontSize: 9, fontFamily: "'Jost', sans-serif", fontWeight: '300', color: '#a0b4c8' },
  ],
  sectionsBack: [
    { id: 'back-logo',    type: 'logo', label: 'Logo' },
    { id: 'back-name',    type: 'text', field: 'name',    label: 'Name',    fontSize: 13, fontFamily: "'Jost', sans-serif", fontWeight: '600', color: '#1a2d4a' },
    { id: 'back-title',   type: 'text', field: 'title',   label: 'Title',   fontSize: 10, fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', color: '#6b7a8d' },
    { id: 'back-phone',   type: 'text', field: 'phone',   label: 'Phone',   fontSize: 8, color: '#1a2d4a' },
    { id: 'back-address', type: 'text', field: 'address', label: 'Address', fontSize: 8, color: '#1a2d4a' },
    { id: 'back-email',   type: 'text', field: 'email',   label: 'Email',   fontSize: 8, color: '#1a2d4a' },
    { id: 'back-website', type: 'text', field: 'website', label: 'Website', fontSize: 8, color: '#1a2d4a' },
  ],
};

const PhoneIcon    = ({ color, size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg>;
const LocationIcon = ({ color, size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>;
const MailIcon     = ({ color, size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
const WebIcon      = ({ color, size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;

export default function RegentLayout({ 
  template, 
  isBack = false, 
  containerWidth, 
  userData, 
  sections = [], 
  onSelectSection 
}) {
  const t = template || regentTemplate;
  const scale = (containerWidth || 400) / 400;
  const data = { ...t.defaultData, ...userData };

  const getSectionStyle = (id, fallbackColor, fallbackFontSize) => {
    const s = sections.find(sec => sec.id === id);
    if (!s) return { color: fallbackColor };

    return {
      color: s.color || fallbackColor,
      fontFamily: s.fontFamily || t.fontBody,
      fontSize: s.fontSize ? `${s.fontSize * scale}px` : `${fallbackFontSize * scale}px`,
      fontWeight: s.fontWeight,
      fontStyle: s.fontStyle,
      textTransform: s.textTransform || 'none',
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
    width: '100%', height: '100%', position: "relative", overflow: "hidden", display: "flex", flexShrink: 0, boxSizing: "border-box",
  };

  if (!isBack) {
    return (
      <div style={{ ...baseStyle, background: t.bg, flexDirection: "column", alignItems: "center", justifyContent: "center", gap: `${10 * scale}px`, padding: `${30 * scale}px` }}>
        <img 
          src={data.logoUrl || logoIcon} 
          alt="Logo" 
          style={{ 
            width: `${70 * scale}px`, height: 'auto', 
            filter: data.logoUrl ? 'none' : `brightness(0) saturate(100%) invert(75%) sepia(40%) saturate(500%) hue-rotate(5deg)`, 
            marginBottom: `${6 * scale}px`,
            cursor: 'pointer'
          }} 
          onClick={(e) => handleItemClick(e, 'logo')}
        />
        <div 
          onClick={(e) => handleItemClick(e, 'company')}
          style={{ ...getSectionStyle('front-company', t.accent, 13), letterSpacing: '0.2em', textAlign: "center" }}
        >
          {data.company}
        </div>
        <div 
          onClick={(e) => handleItemClick(e, 'slogan')}
          style={{ ...getSectionStyle('front-slogan', t.textMuted, 10), letterSpacing: '0.05em', textAlign: "center", opacity: 0.8 }}
        >
          {data.slogan}
        </div>
        <div style={{ width: `${60 * scale}px`, height: `${1 * scale}px`, background: t.accent, opacity: 0.4, margin: `${4 * scale}px 0` }} />
        <div 
          onClick={(e) => handleItemClick(e, 'website')}
          style={{ ...getSectionStyle('front-website', t.textMuted, 9), letterSpacing: '0.08em', textAlign: "center", opacity: 0.75 }}
        >
          {data.website}
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...baseStyle, background: t.bgBack }}>
      <div style={{ 
        position: "absolute", top: 0, left: 0, width: '42%', height: '100%', 
        background: t.bg, clipPath: "polygon(0 0, 85% 0, 100% 100%, 0 100%)", 
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", 
        paddingRight: `${20 * scale}px`, gap: `${10 * scale}px`, boxSizing: 'border-box' 
      }}>
        <img 
          src={data.logoUrl || logoIcon} 
          alt="Logo" 
          style={{ 
            width: `${50 * scale}px`, height: 'auto', 
            filter: data.logoUrl ? 'none' : `brightness(0) saturate(100%) invert(75%) sepia(40%) saturate(500%) hue-rotate(5deg)`,
            cursor: 'pointer'
          }} 
          onClick={(e) => handleItemClick(e, 'logo')}
        />
        <div style={{ fontFamily: t.fontBody, fontSize: `${8 * scale}px`, fontWeight: 500, color: t.accent, letterSpacing: '0.15em', textTransform: "uppercase", textAlign: "center" }}>
          {data.company}
        </div>
      </div>

      <div style={{ 
        position: "absolute", top: 0, right: 0, width: '62%', height: '100%', 
        display: "flex", flexDirection: "column", justifyContent: "center", 
        padding: `${20 * scale}px ${24 * scale}px`, gap: `${12 * scale}px`, boxSizing: 'border-box'
      }}>
        <div>
          <div 
            onClick={(e) => handleItemClick(e, 'name')}
            style={{ ...getSectionStyle('back-name', t.textBack, 13), letterSpacing: '0.03em' }}
          >
            {data.firstName} {data.lastName}
          </div>
          <div 
            onClick={(e) => handleItemClick(e, 'title')}
            style={{ ...getSectionStyle('back-title', '#6b7a8d', 10), marginTop: `${2 * scale}px` }}
          >
            {data.title}
          </div>
        </div>

        <div style={{ width: '100%', height: `${1 * scale}px`, background: t.textBack, opacity: 0.15 }} />

        <div style={{ display: "flex", flexDirection: "column", gap: `${7 * scale}px` }}>
          {[
            { id: 'phone',   Icon: PhoneIcon,    text: data.phone },
            { id: 'address', Icon: LocationIcon, text: data.address },
            { id: 'email',   Icon: MailIcon,     text: data.email },
            { id: 'website', Icon: WebIcon,      text: data.website }
          ].map((item) => (
            <div 
              key={item.id} 
              onClick={(e) => handleItemClick(e, item.id)}
              style={{ display: "flex", alignItems: "center", gap: `${7 * scale}px`, cursor: 'pointer' }}
            >
              <item.Icon color={t.textBack} size={10 * scale} />
              <span style={{ ...getSectionStyle(`back-${item.id}`, t.textBack, 8), opacity: 0.8, letterSpacing: '0.03em' }}>
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}