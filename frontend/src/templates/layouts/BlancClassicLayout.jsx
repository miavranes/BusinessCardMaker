import logo from '../../assets/logo.png';

export const blancClassicTemplate = {
  id: 1,
  category: "minimal",
  name: "Blanc Classic",
  bg: "#ffffff",
  accent: "#111111",
  text: "#111111",
  textMuted: "#999999",
  border: "2px solid #111111",
  fontName: "Georgia, serif",
  fontBody: "Arial, sans-serif",
  dividerOpacity: 0.25,
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

export default function BlancClassicLayout({ template, isBack = false, containerWidth }) {
  const t = template;
  const baseWidth = 400;
  const scale = containerWidth ? containerWidth / baseWidth : 1;

  const data = {
    firstName: "MIA",
    lastName: "VRANES",
    title: "WEB DESIGNER",
    phone: "+123-456-7890",
    email: "mia@example.com",
    website: "www.miavranes.com",
  };

  const baseStyle = {
    width: '100%',
    height: '100%',
    background: t.bg,
    border: t.border || "none",
    borderRadius: 0,
    padding: `0 ${40 * scale}px`,
    boxSizing: "border-box",
    position: "relative",
    overflow: "hidden",
    flexShrink: 0,
  };

  const nameStyle = {
    color: t.text,
    fontFamily: t.fontName,
    lineHeight: 1.1,
    whiteSpace: "nowrap",
  };

  const titleStyle = {
    color: t.textMuted,
    fontFamily: t.fontBody,
    letterSpacing: `${0.18 * scale}em`,
    textTransform: "uppercase",
  };

  if (isBack) {
    return (
      <div style={{ ...baseStyle, display: "flex", alignItems: "center", gap: `${28 * scale}px` }}>
        {t.glowAccent && (
          <div style={{
            position: "absolute", top: "-40%", right: "-5%",
            width: `${180 * scale}px`, height: `${180 * scale}px`,
            background: `radial-gradient(circle, ${t.glowAccent}33 0%, transparent 70%)`,
            pointerEvents: "none",
          }} />
        )}

        <div style={{ flex: 1 }}>
          <div style={{ ...nameStyle, fontSize: `${20 * scale}px` }}>
            <span style={{ fontWeight: 700 }}>{data.firstName}</span>{" "}
            <span style={{ fontWeight: 700 }}>{data.lastName}</span>
          </div>
          <div style={{ ...titleStyle, fontSize: `${10 * scale}px`, marginTop: `${5 * scale}px`, textAlign: "center" }}>
            {data.title}
          </div>
        </div>

        <div style={{ width: `${1.5 * scale}px`, height: `${70 * scale}px`, background: t.accent, opacity: t.dividerOpacity, flexShrink: 0 }} />

        <div style={{ flex: 1.3, display: "flex", flexDirection: "column", gap: `${8 * scale}px`, minWidth: 0 }}>
          {[
            { Icon: PhoneIcon, text: data.phone },
            { Icon: MailIcon, text: data.email },
            { Icon: WebIcon, text: data.website }
          ].map(({ Icon, text }, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: `${6 * scale}px`, color: t.text, fontFamily: t.fontBody, fontSize: `${11 * scale}px`, opacity: 0.9 }}>
              <Icon color={t.accent} size={10 * scale} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{text}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...baseStyle, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", paddingTop: `${50 * scale}px` }}>
      <img src={logo} alt="Logo" style={{ position: 'absolute', top: `${20 * scale}px`, right: `${20 * scale}px`, height: `${80 * scale}px`, width: 'auto' }} />
      <div style={{ ...nameStyle, fontSize: `${28 * scale}px` }}>
        <span style={{ fontWeight: 700 }}>{data.firstName}</span>{" "}
        <span style={{ fontWeight: 700 }}>{data.lastName}</span>
      </div>
      <div style={{ ...titleStyle, fontSize: `${12 * scale}px`, letterSpacing: `${0.2 * scale}em`, marginTop: `${8 * scale}px` }}>
        {data.title}
      </div>
    </div>
  );
}
