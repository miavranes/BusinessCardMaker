import logo from '../../assets/logo.png';

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
  dividerOpacity: 0.2,
  border: "none",
};

const PhoneIcon = ({ color, size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/>
  </svg>
);

const LocationIcon = ({ color, size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
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

export default function RegentLayout({ template, isBack = false, containerWidth }) {
  const t = template;
  const baseWidth = 400;
  const scale = containerWidth ? containerWidth / baseWidth : 1;

  const data = {
    firstName: "Mia",
    lastName: "Vranes",
    title: "Web Designer",
    phone: "222 333 4567",
    address: "675 Anywhere Street",
    email: "mia@example.com",
    website: "www.miavranes.com",
    slogan: "Modern Design for Growing Brands.",
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
        background: t.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: `${10 * scale}px`,
        padding: `${30 * scale}px`,
      }}>
        <img
          src={logo}
          alt="Logo"
          style={{
            width: `${70 * scale}px`,
            height: 'auto',
            filter: `brightness(0) saturate(100%) invert(75%) sepia(40%) saturate(500%) hue-rotate(5deg)`,
            marginBottom: `${6 * scale}px`,
          }}
        />

        <div style={{
          fontFamily: "'Jost', sans-serif",
          fontSize: `${13 * scale}px`,
          fontWeight: 500,
          color: t.accent,
          letterSpacing: `${0.2 * scale}em`,
          textTransform: "uppercase",
          textAlign: "center",
        }}>
          EndCode
        </div>

        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: `${10 * scale}px`,
          fontStyle: "italic",
          color: t.textMuted,
          letterSpacing: `${0.05 * scale}em`,
          textAlign: "center",
          opacity: 0.8,
        }}>
          {data.slogan}
        </div>

        <div style={{
          width: `${60 * scale}px`,
          height: `${1 * scale}px`,
          background: t.accent,
          opacity: 0.4,
          margin: `${4 * scale}px 0`,
        }} />

        <div style={{
          fontFamily: "'Jost', sans-serif",
          fontSize: `${9 * scale}px`,
          fontWeight: 300,
          color: t.textMuted,
          letterSpacing: `${0.08 * scale}em`,
          textAlign: "center",
          opacity: 0.75,
        }}>
          {data.website}
        </div>
      </div>
    );
  }

return (
    <div style={{
      ...baseStyle,
      background: t.bgBack,
    }}>
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: '42%',
        height: '100%',
        background: t.bg,
        clipPath: "polygon(0 0, 85% 0, 100% 100%, 0 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingRight: `${20 * scale}px`,
        gap: `${10 * scale}px`,
      }}>
        <img
          src={logo}
          alt="Logo"
          style={{
            width: `${50 * scale}px`,
            height: 'auto',
            filter: `brightness(0) saturate(100%) invert(75%) sepia(40%) saturate(500%) hue-rotate(5deg)`,
          }}
        />
        <div style={{
          fontFamily: "'Jost', sans-serif",
          fontSize: `${8 * scale}px`,
          fontWeight: 500,
          color: t.accent,
          letterSpacing: `${0.15 * scale}em`,
          textTransform: "uppercase",
          textAlign: "center",
        }}>
          Endcode<br/>
        </div>
      </div>

      <div style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: '62%',
        height: '100%',
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: `${20 * scale}px ${24 * scale}px`,
        gap: `${12 * scale}px`,
      }}>
        <div>
          <div style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: `${13 * scale}px`,
            fontWeight: 600,
            color: t.textBack,
            letterSpacing: `${0.03 * scale}em`,
          }}>
            {data.firstName} {data.lastName}
          </div>
          <div style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: `${10 * scale}px`,
            fontStyle: "italic",
            color: '#6b7a8d',
            marginTop: `${2 * scale}px`,
          }}>
            {data.title}
          </div>
        </div>

        <div style={{
          width: '100%',
          height: `${1 * scale}px`,
          background: t.textBack,
          opacity: 0.15,
        }} />

        <div style={{ display: "flex", flexDirection: "column", gap: `${7 * scale}px` }}>
          {[
            { Icon: PhoneIcon, text: data.phone },
            { Icon: LocationIcon, text: data.address },
            { Icon: MailIcon, text: data.email },
            { Icon: WebIcon, text: data.website },
          ].map(({ Icon, text }, i) => (
            <div key={i} style={{
              display: "flex",
              alignItems: "center",
              gap: `${7 * scale}px`,
            }}>
              <Icon color={t.textBack} size={10 * scale} />
              <span style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: `${8 * scale}px`,
                fontWeight: 300,
                color: t.textBack,
                opacity: 0.8,
                letterSpacing: `${0.03 * scale}em`,
              }}>
                {text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}