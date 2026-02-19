import logo from '../../assets/logo.png';

export const bellmontTemplate = {
  id: 6,
  category: "minimal",
  name: "Bellmont",
  bg: "#f5f0e8",
  bgBack: "#7d1e2e",
  accent: "#7d1e2e",
  text: "#7d1e2e",
  textBack: "#f5f0e8",
  textMuted: "#7d1e2e",
  fontName: "'Cormorant Garamond', serif",
  fontBody: "'Jost', sans-serif",
  dividerOpacity: 0.15,
  border: "none",

  defaultData: {
    firstName: "MIA",
    lastName: "VRANES",
    title: "Web Designer",
    phone: "+123-456-7890",
    email: "mia@example.com",
    website: "www.miavranes.com",
  },

sectionsBack: [
  { id: 'logo',    type: 'logo',                  x: 0.62, y: 0.04, width: 0.30, height: 0.26 },
  { id: 'name',    type: 'text', field: 'name',    x: 0.05, y: 0.38, width: 0.58, height: 0.12 },
  { id: 'title',   type: 'text', field: 'title',   x: 0.05, y: 0.50, width: 0.58, height: 0.10 },
  { id: 'phone',   type: 'text', field: 'phone',   x: 0.05, y: 0.60, width: 0.58, height: 0.10 },
  { id: 'email',   type: 'text', field: 'email',   x: 0.05, y: 0.70, width: 0.58, height: 0.10 },
  { id: 'website', type: 'text', field: 'website', x: 0.05, y: 0.80, width: 0.58, height: 0.10 },
],

  sectionsFront: [
    { id: 'logo', type: 'logo', x: 0.10, y: 0.20, width: 0.80, height: 0.60 },
  ],
};

export default function BellmontLayout({ template, isBack = false, containerWidth, userData }) {
  const t = template;
  const baseWidth = 400;
  const scale = containerWidth ? containerWidth / baseWidth : 1;

  const data = { ...t.defaultData, ...userData };

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
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <img
          src={logo}
          alt="Logo"
          style={{
            width: `${300 * scale}px`,
            height: 'auto',
            filter: 'brightness(0) invert(1)',
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ ...baseStyle, background: t.bg }}>

      <img
        src={logo}
        alt="Logo"
        style={{
          position: 'absolute',
          top: `${12 * scale}px`,
          right: `${16 * scale}px`,
          width: `${80 * scale}px`,
          height: 'auto',
        }}
      />

      <div style={{
        position: 'absolute',
        top: `${110 * scale}px`,
        left: `${20 * scale}px`,
        fontFamily: "'Jost', sans-serif",
        fontSize: `${13 * scale}px`,
        fontWeight: 400,
        color: t.text,
        letterSpacing: `${0.12 * scale}em`,
        whiteSpace: 'nowrap',
      }}>
        {data.firstName} {data.lastName}
      </div>
      <div style={{
        position: 'absolute',
        top: `${133 * scale}px`,
        left: `${20 * scale}px`,
        fontFamily: "'Jost', sans-serif",
        fontSize: `${9 * scale}px`,
        fontWeight: 300,
        color: t.text,
        letterSpacing: `${0.04 * scale}em`,
        opacity: 0.85,
      }}>
        {data.title}
      </div>

      <div style={{
        position: 'absolute',
        top: `${151 * scale}px`,
        left: `${20 * scale}px`,
        fontFamily: "'Jost', sans-serif",
        fontSize: `${9 * scale}px`,
        fontWeight: 300,
        color: t.text,
        letterSpacing: `${0.04 * scale}em`,
        opacity: 0.85,
      }}>
        {data.phone}
      </div>

      <div style={{
        position: 'absolute',
        top: `${166 * scale}px`,
        left: `${20 * scale}px`,
        fontFamily: "'Jost', sans-serif",
        fontSize: `${9 * scale}px`,
        fontWeight: 300,
        color: t.text,
        letterSpacing: `${0.04 * scale}em`,
        opacity: 0.85,
      }}>
        {data.email}
      </div>

      <div style={{
        position: 'absolute',
        top: `${181 * scale}px`,
        left: `${20 * scale}px`,
        fontFamily: "'Jost', sans-serif",
        fontSize: `${9 * scale}px`,
        fontWeight: 300,
        color: t.text,
        letterSpacing: `${0.04 * scale}em`,
        opacity: 0.85,
      }}>
        {data.website}
      </div>

    </div>
  );
}