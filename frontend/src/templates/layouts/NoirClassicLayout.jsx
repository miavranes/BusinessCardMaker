import logo from '../../assets/logo.png';

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
  dividerOpacity: 0.25,
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

const WebIcon = ({ color, size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);


export default function NoirClassicLayout({ template, isBack = false, containerWidth }) {
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

  if (isBack) {
    return (
      <div style={{ 
        ...baseStyle, 
        background: t.bgBack,
        display: "flex", 
        flexDirection: "column", 
        justifyContent: "center", 
        alignItems: "flex-start",
        padding: `${40 * scale}px`,
        gap: `${20 * scale}px`
      }}>
        <div style={{ 
          position: 'absolute', 
          top: `${30 * scale}px`, 
          right: `${30 * scale}px`,
          width: `${60 * scale}px`,
          height: `${60 * scale}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <img src={logo} alt="Logo" style={{ 
            height: `${50 * scale}px`, 
            width: 'auto',
            filter: 'brightness(0) invert(1)'
          }} />
        </div>

        <div style={{ 
          color: t.textBack, 
          fontFamily: t.fontName,
          fontSize: `${32 * scale}px`,
          fontWeight: 300,
          letterSpacing: `${0.05 * scale}em`,
          lineHeight: 1.2
        }}>
          {data.firstName}<br/>{data.lastName}
        </div>

        <div style={{ 
          color: t.textMuted, 
          fontFamily: t.fontBody,
          fontSize: `${11 * scale}px`,
          letterSpacing: `${0.25 * scale}em`,
          textTransform: "uppercase",
          fontWeight: 400
        }}>
          {data.title}
        </div>

        <div style={{ 
          marginTop: `${15 * scale}px`,
          display: "flex", 
          flexDirection: "column", 
          gap: `${10 * scale}px`
        }}>
          {[
            { Icon: PhoneIcon, text: data.phone },
            { Icon: MailIcon, text: data.email },
            { Icon: WebIcon, text: data.website }
          ].map(({ Icon, text }, i) => (
            <div key={i} style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: `${8 * scale}px`, 
              color: t.textBack, 
              fontFamily: t.fontBody, 
              fontSize: `${10 * scale}px`,
              fontWeight: 300
            }}>
              <Icon color={t.textMuted} size={12 * scale} />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      ...baseStyle, 
      display: "flex", 
      flexDirection: "column",
      justifyContent: "center", 
      alignItems: "center",
      padding: `${50 * scale}px`
    }}>
      <div style={{
        width: `${80 * scale}px`,
        height: `${80 * scale}px`,
        marginBottom: `${25 * scale}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <img src={logo} alt="Logo" style={{ 
          height: `${70 * scale}px`, 
          width: 'auto'
        }} />
      </div>

      <div style={{ 
        color: t.text, 
        fontFamily: t.fontName,
        fontSize: `${14 * scale}px`,
        letterSpacing: `${0.15 * scale}em`,
        textTransform: "uppercase",
        textAlign: "center",
        fontWeight: 400
      }}>
        Mia Vranes
      </div>

      <div style={{ 
        color: t.textMuted, 
        fontFamily: t.fontBody,
        fontSize: `${9 * scale}px`,
        letterSpacing: `${0.2 * scale}em`,
        textAlign: "center",
        marginTop: `${5 * scale}px`,
        fontWeight: 300
      }}>
        Web Designer
      </div>
    </div>
  );
}