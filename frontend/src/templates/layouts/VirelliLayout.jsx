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
    { id: 'back-name',    type: 'text', field: 'name',    label: 'Name',    x: 0.06, y: 0.08, width: 0.60, height: 0.22, fontSize: 16, fontFamily: 'Nunito, sans-serif', fontWeight: '300', color: '#3d483b', letterSpacing: 0.5 },
    { id: 'back-phone',   type: 'text', field: 'phone',   label: 'Phone',   x: 0.06, y: 0.38, width: 0.68, height: 0.14, fontSize: 9,  fontFamily: 'Nunito, sans-serif', fontWeight: '300', color: '#3d483b' },
    { id: 'back-email',   type: 'text', field: 'email',   label: 'Email',   x: 0.06, y: 0.52, width: 0.68, height: 0.14, fontSize: 9,  fontFamily: 'Nunito, sans-serif', fontWeight: '300', color: '#3d483b' },
    { id: 'back-website', type: 'text', field: 'website', label: 'Website', x: 0.06, y: 0.66, width: 0.68, height: 0.14, fontSize: 9,  fontFamily: 'Nunito, sans-serif', fontWeight: '300', color: '#3d483b' },
  ],
};

const PhoneIcon = ({ color, size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg>;
const MailIcon  = ({ color, size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
const WebIcon   = ({ color, size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;

export default function VirelliLayout({ template, isBack = false, containerWidth, userData, sections = [], onSelectSection }) {
  const t = template || virelliTemplate;
  const scale = (containerWidth || 400) / 400;
  const data = { ...t.defaultData, ...userData };

  const getSectionStyle = (id) => {
    const s = sections.find(sec => sec.id === id);
    return {
      ...getSectionTextStyle(s, scale),
      cursor: 'pointer',
    };
  };

  const handleItemClick = (e, id) => {
    e.stopPropagation();
    const section = sections.find(s => s.id === id);
    if (section && onSelectSection) onSelectSection(section, e.currentTarget.getBoundingClientRect());
  };

  const base = { width: '100%', height: '100%', position: 'relative', overflow: 'hidden', boxSizing: 'border-box' };

  if (isBack) {
    return (
      <div style={{ ...base, background: t.bg }}>
       <div style={{ position: 'absolute', top: `${20 * scale}px`, right: `${20 * scale}px`, width: `${60 * scale}px`, height: `${60 * scale}px` }}>
          <img src={qrCode} alt="QR" style={{ width: '100%', height: '100%' }} />
        </div>

        <div onClick={(e) => handleItemClick(e, 'back-name')}
          style={{ ...getSectionPos(sections, 'back-name'), ...getSectionStyle('back-name'), display: 'flex', alignItems: 'center' }}>
          {data.firstName}<br />{data.lastName}
        </div>

        <div onClick={(e) => handleItemClick(e, 'back-phone')}
          style={{ ...getSectionPos(sections, 'back-phone'), ...getSectionStyle('back-phone'), display: 'flex', alignItems: 'center', gap: `${6 * scale}px` }}>
          <PhoneIcon color={t.text} size={10 * scale} /><span>{data.phone}</span>
        </div>

        <div onClick={(e) => handleItemClick(e, 'back-email')}
          style={{ ...getSectionPos(sections, 'back-email'), ...getSectionStyle('back-email'), display: 'flex', alignItems: 'center', gap: `${6 * scale}px` }}>
          <MailIcon color={t.text} size={10 * scale} /><span>{data.email}</span>
        </div>

        <div onClick={(e) => handleItemClick(e, 'back-website')}
          style={{ ...getSectionPos(sections, 'back-website'), ...getSectionStyle('back-website'), display: 'flex', alignItems: 'center', gap: `${6 * scale}px` }}>
          <WebIcon color={t.text} size={10 * scale} /><span>{data.website}</span>
        </div>

        <div style={{ position: 'absolute', bottom: `${10 * scale}px`, left: `${10 * scale}px`, opacity: 0.3 }}>
          <img src={data.logoUrl || logo} alt="Logo" style={{ height: `${50 * scale}px`, width: 'auto' }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...base, background: t.bgBack }}>
      <img src={data.logoUrl || logo} alt="Logo"
        onClick={(e) => handleItemClick(e, 'front-logo')}
        style={{ ...getSectionPos(sections, 'front-logo'), objectFit: 'contain', filter: 'brightness(0) invert(1)', cursor: 'pointer' }}
      />

      <div onClick={(e) => handleItemClick(e, 'front-name')}
        style={{ ...getSectionPos(sections, 'front-name'), ...getSectionStyle('front-name'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {data.firstName} {data.lastName}
      </div>

      <div onClick={(e) => handleItemClick(e, 'front-title')}
        style={{ ...getSectionPos(sections, 'front-title'), ...getSectionStyle('front-title'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {data.title}
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${3 * scale}px`, background: t.accent }} />
    </div>
  );
}