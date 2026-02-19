import logo from '../../assets/logo.png';
import qrCode from '../../assets/qr.svg';

export const monteroTemplate = {
  id: 4,
  category: "modern",
  name: "Montero",
  bg: "#f5f1ebff",
  bgBack: "#f5f1ebff",
  accent: "#c9b896ff",
  text: "#4a4a4aff",
  textBack: "#4a4a4aff",
  textMuted: "#8a8a8aff",
  fontName: "Cormorant Garamond, serif",
  fontBody: "Montserrat, sans-serif",
  dividerOpacity: 0.2,
  border: "none",
};



const VerticalLines = ({ color, scale }) => (
  <svg width={60 * scale} height={200 * scale} viewBox="0 0 60 200" fill="none">
    <line x1="10" y1="0" x2="10" y2="200" stroke={color} strokeWidth="1.5" opacity="0.3" />
    <line x1="25" y1="20" x2="25" y2="180" stroke={color} strokeWidth="1.5" opacity="0.5" />
    <line x1="40" y1="40" x2="40" y2="160" stroke={color} strokeWidth="1.5" opacity="0.4" />
    <line x1="50" y1="60" x2="50" y2="140" stroke={color} strokeWidth="1.5" opacity="0.3" />
  </svg>
);

export default function MonteroLayout({ template, isBack = false, containerWidth }) {
  const t = template;
  const baseWidth = 400;
  const scale = containerWidth ? containerWidth / baseWidth : 1;

  const data = {
    firstName: "MIA",
    lastName: "VRANES",
    title: "Web Designer",
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
    padding: `${50 * scale}px`,
    boxSizing: "border-box",
    position: "relative",
    overflow: "hidden",
    flexShrink: 0,
  };

  if (isBack) {
    return (
      <div style={{ 
        ...baseStyle,
        display: "flex", 
        flexDirection: "column", 
        justifyContent: "space-between",
      }}>
        <div style={{ 
          color: t.text, 
          fontFamily: t.fontBody,
          fontSize: `${18 * scale}px`,
          fontWeight: 300,
          letterSpacing: `${0.02 * scale}em`,
          lineHeight: 1.4
        }}>
          <div style={{ 
            fontSize: `${22 * scale}px`,
            marginBottom: `${4 * scale}px`,
            fontWeight: 400
          }}>
            {data.firstName} {data.lastName}
          </div>
          <div style={{ 
            fontSize: `${12 * scale}px`,
            fontStyle: "italic",
            color: t.textMuted,
            marginBottom: `${30 * scale}px`
          }}>
            {data.title}
          </div>
        </div>

        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: `${8 * scale}px`,
          fontFamily: t.fontBody,
          fontSize: `${10 * scale}px`,
          color: t.text,
          fontWeight: 300,
          lineHeight: 1.6
        }}>
          <div>{data.phone}</div>
          <div>{data.website}</div>
          <div>{data.email}</div>
        </div>

        <div style={{
          position: 'absolute',
          top: `${50 * scale}px`,
          right: `${20 * scale}px`,
          opacity: 0.9
        }}>
          <VerticalLines color={t.text} scale={scale} />
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
      textAlign: "center"
    }}>
      <div style={{
        marginBottom: `${25 * scale}px`,
      }}>
        <img 
          src={logo} 
          alt="Logo" 
          style={{ 
            width: `${80 * scale}px`, 
            height: 'auto',
            objectFit: 'contain'
          }} 
        />
      </div>

      <div style={{ 
        color: t.text, 
        fontFamily: t.fontName,
        fontSize: `${32 * scale}px`,
        letterSpacing: `${0.08 * scale}em`,
        fontWeight: 400,
        marginBottom: `${8 * scale}px`
      }}>
        MIA VRANES
      </div>

      <div style={{ 
        color: t.textMuted, 
        fontFamily: t.fontBody,
        fontSize: `${8 * scale}px`,
        letterSpacing: `${0.15 * scale}em`,
        fontStyle: "italic",
        fontWeight: 300
      }}>
        Modern Design for Growing Brands.
      </div>
    </div>
  );
}