import logo from '../../assets/logo.png';
import qrCode from '../../assets/qr.svg';

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
  renderMode: "normal", 
  defaultData: {
    firstName: "MIA",
    lastName: "VRANES",
    title: "WEB DESIGNER",
    phone: "+123-456-7890",
    email: "mia@example.com",
    website: "www.miavranes.com",
  },
  sectionsFront: [
    { id: 'logo',  type: 'logo', label: 'Logo',  x: 0.25, y: 0.08, width: 0.50, height: 0.55, filter: 'brightness(0) invert(1)' },
    { id: 'name',  type: 'text', field: 'name',  label: 'Name',  x: 0.08, y: 0.66, width: 0.84, height: 0.16, fontSize: 16, fontFamily: 'Nunito, sans-serif', fontWeight: '300', color: '#ffffff', letterSpacing: 0.1, align: 'center' },
    { id: 'title', type: 'text', field: 'title', label: 'Title', x: 0.08, y: 0.82, width: 0.84, height: 0.12, fontSize: 9, fontFamily: 'Nunito, sans-serif', color: '#C4A574', letterSpacing: 0.15, textTransform: 'uppercase', align: 'center' },
  ],
  sectionsBack: [
    { id: 'name',    type: 'text', field: 'name',    label: 'Name',    x: 0.06, y: 0.08, width: 0.60, height: 0.22, fontSize: 16, fontFamily: 'Nunito, sans-serif', fontWeight: '300', color: '#3d483b', letterSpacing: 0.5 },
    { id: 'phone',   type: 'text', field: 'phone',   label: 'Phone',   x: 0.06, y: 0.38, width: 0.68, height: 0.12, fontSize: 9, fontFamily: 'Nunito, sans-serif', fontWeight: '300', color: '#3d483b' },
    { id: 'email',   type: 'text', field: 'email',   label: 'Email',   x: 0.06, y: 0.52, width: 0.68, height: 0.12, fontSize: 9, fontFamily: 'Nunito, sans-serif', fontWeight: '300', color: '#3d483b' },
    { id: 'website', type: 'text', field: 'website', label: 'Website', x: 0.06, y: 0.66, width: 0.68, height: 0.12, fontSize: 9, fontFamily: 'Nunito, sans-serif', fontWeight: '300', color: '#3d483b' },
  ],
};

const PhoneIcon = ({ color, size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/>
  </svg>
);
const MailIcon = ({ color, size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);
const WebIcon = ({ color, size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

export default function VirelliLayout({ template, isBack = false, containerWidth, userData }) {
  const t = template;
  const scale = (containerWidth || 400) / 400;
  const data = { ...t.defaultData, ...userData };

  const baseStyle = {
    width: '100%', height: '100%', background: t.bg,
    border: t.border || "none", borderRadius: 0,
    padding: `0 ${40 * scale}px`, boxSizing: "border-box",
    position: "relative", overflow: "hidden", flexShrink: 0,
  };

  if (isBack) {
    return (
      <div style={{ ...baseStyle, background: t.bg, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: `${40 * scale}px` }}>
        <div style={{ position: 'absolute', top: `${20 * scale}px`, right: `${20 * scale}px`, width: `${60 * scale}px`, height: `${60 * scale}px` }}>
          <img src={qrCode} alt="QR Code" style={{ width: '100%', height: '100%' }} />
        </div>
        <div style={{ color: t.text, fontFamily: t.fontName, fontSize: `${16 * scale}px`, fontWeight: 300, letterSpacing: `${0.5 * scale}em`, lineHeight: 1.3 }}>
          {data.firstName}<br/>{data.lastName}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: `${10 * scale}px`, marginBottom: `${20 * scale}px`, marginTop: `${15 * scale}px` }}>
          {[{ Icon: PhoneIcon, text: data.phone }, { Icon: MailIcon, text: data.email }, { Icon: WebIcon, text: data.website }].map(({ Icon, text }, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: `${8 * scale}px`, color: t.text, fontFamily: t.fontBody, fontSize: `${9 * scale}px`, fontWeight: 300 }}>
              <Icon color={t.text} size={14 * scale} />
              <span>{text}</span>
            </div>
          ))}
        </div>
        <div style={{ position: 'absolute', bottom: `${10 * scale}px`, left: `${10 * scale}px`, opacity: 0.3 }}>
          <img src={data.logoUrl || logo} alt="Logo" style={{ height: `${50 * scale}px`, width: 'auto' }} />
        </div>
        <div style={{ height: `${100 * scale}px` }} />
      </div>
    );
  }

  return (
    <div style={{ ...baseStyle, background: t.bgBack, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: `${50 * scale}px`, position: 'relative' }}>
      <img src={data.logoUrl || logo} alt="Logo" style={{ height: `${150 * scale}px`, width: 'auto', filter: 'brightness(0) invert(1)', marginBottom: `${20 * scale}px` }} />
      <div style={{ color: t.textBack, fontFamily: t.fontName, fontSize: `${16 * scale}px`, letterSpacing: `${0.1 * scale}em`, textAlign: "center", fontWeight: 300, marginBottom: `${8 * scale}px` }}>
        {data.firstName} {data.lastName}
      </div>
      <div style={{ color: t.textMuted, fontFamily: t.fontBody, fontSize: `${9 * scale}px`, letterSpacing: `${0.15 * scale}em`, textAlign: "center", textTransform: "uppercase", fontWeight: 300 }}>
        {data.title}
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${3 * scale}px`, background: t.accent }} />
    </div>
  );
}