import logo from '../../assets/logo.png';
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
  dividerOpacity: 0.12,
  border: "none",
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

const LinkedinIcon = ({ color, size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

const InstagramIcon = ({ color, size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <rect x="2" y="2" width="20" height="20" rx="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="0.5" fill={color}/>
  </svg>
);

export default function ImperialLayout({ template, isBack = false, containerWidth }) {
  const t = template;
  const baseWidth = 400;
  const scale = containerWidth ? containerWidth / baseWidth : 1;

  const data = {
    firstName: "MIA",
    lastName: "VRANES",
    title: "Web Designer",
    phone: "+123-456-7890",
    email: "mia@example.com",
    linkedin: "miavranes",
    instagram: "miavranes",
  };

  const baseStyle = {
    width: '100%',
    height: '100%',
    border: "none",
    borderRadius: 0,
    boxSizing: "border-box",
    position: "relative",
    overflow: "hidden",
    flexShrink: 0,
  };

  if (!isBack) {
    return (
      <div style={{
        ...baseStyle,
        background: t.bgBack,
        backgroundImage: `
          radial-gradient(ellipse at 30% 40%, rgba(255,255,255,0.03) 0%, transparent 60%),
          url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")
        `,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <img
          src={logo}
          alt="Logo"
          style={{
            width: `${200 * scale}px`,
            height: 'auto',
            filter: 'brightness(0) invert(1) opacity(0.25)',
          }}
        />
      </div>
    );
  }

  return (
    <div style={{
      ...baseStyle,
      background: t.bg,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: `${40 * scale}px ${40 * scale}px ${40 * scale}px`,
    }}>
      <div style={{ display: "flex", justifyContent: "flex-end", flexDirection: "column", alignItems: "flex-end" }}>
        <div style={{
          fontFamily: "'Jost', sans-serif",
          fontSize: `${14 * scale}px`,
          fontWeight: 400,
          color: t.text,
          letterSpacing: `${0.1 * scale}em`,
        }}>
          {data.firstName} {data.lastName}
        </div>
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: `${11 * scale}px`,
          fontWeight: 400,
          color: t.textMuted,
          letterSpacing: `${0.05 * scale}em`,
          fontStyle: "italic",
          marginTop: `${3 * scale}px`,
        }}>
          {data.title}
        </div>
      </div>

      <div style={{
        display: "flex",
        alignItems: "flex-end",
        gap: `${20 * scale}px`,
      }}>
        {/* QR kod */}
        <div style={{
          width: `${70 * scale}px`,
          height: `${70 * scale}px`,
          flexShrink: 0,
          border: `${1 * scale}px solid rgba(0,0,0,0.12)`,
          padding: `${4 * scale}px`,
        }}>
          <img src={qrCode} alt="QR Code" style={{ width: '100%', height: '100%' }} />
        </div>

        {/* Kontakt detalji */}
        <div style={{ display: "flex", flexDirection: "column", gap: `${11 * scale}px` }}>
          {[
            { label: "contact", value: data.phone },
            { label: "email", value: data.email },
            { label: "linkedin", value: data.linkedin },
            { label: "instagram", value: data.instagram },
          ].map(({ label, value }, i) => (
            <div key={i} style={{
              display: "flex",
              gap: `${4 * scale}px`,
              fontFamily: "'Jost', sans-serif",
              fontSize: `${8 * scale}px`,
              fontWeight: 300,
              color: t.text,
              letterSpacing: `${0.03 * scale}em`,
            }}>
              <span style={{ opacity: 0.5 }}>{label} :</span>
              <span style={{ opacity: 0.85 }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}