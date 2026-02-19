import logo from '../../assets/logo.png';

export const luminaTemplate = {
  id: 8,
  category: "modern",
  name: "Lumina",
  bg: "#c4856a",
  bgBack: "#c4856a",
  accent: "#c4856a",
  text: "#ffffff",
  textBack: "#ffffff",
  textMuted: "#f0e6df",
  fontName: "'Playfair Display', serif",
  fontBody: "'Raleway', sans-serif",
  dividerOpacity: 0.15,
  border: "none",
};

export default function LuminaLayout({ template, isBack = false, containerWidth }) {
  const t = template;
  const baseWidth = 400;
  const scale = containerWidth ? containerWidth / baseWidth : 1;

  const data = {
    firstName: "Mia",
    lastName: "Vranes",
    title: "Graphic Designer",
    phone: "+123-456-7890",
    email: "mia@example.com",
    website: "www.miavranes.com",
    address: "123 Name Street",
    city: "Brooklyn, NY",
    instagram: "Instagram: mia_vranes",
    facebook: "Facebook: Mia Vranes",
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
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        <img
          src={logo}
          alt="Logo"
          style={{
            position: "absolute",
            width: `${220 * scale}px`,
            height: 'auto',
            filter: 'brightness(0) invert(1)',
            opacity: 0.2,
          }}
        />
        <span style={{
          position: "relative",
          color: "white",
          fontSize: `${28 * scale}px`,
          fontWeight: "700",
          letterSpacing: "0.3em",
          textAlign: "center",
        }}>
          {data.firstName} {data.lastName}
        </span>
      </div>
    );
  }

  
  return (
    <div style={{
      ...baseStyle,
      display: "flex",
      flexDirection: "row",
    }}>
      <div style={{
        width: '45%',
        height: '100%',
        background: t.bg,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: `${28 * scale}px ${24 * scale}px`,
      }}>
        <div style={{
          fontFamily: "'Raleway', sans-serif",
          fontSize: `${13 * scale}px`,
          fontWeight: 400,
          color: '#ffffff',
          letterSpacing: `${0.02 * scale}em`,
          lineHeight: 1.3,
        }}>
          {data.firstName} {data.lastName}
        </div>
        <div style={{
          fontFamily: "'Raleway', sans-serif",
          fontSize: `${10 * scale}px`,
          fontWeight: 400,
          color: '#f0e6df',
          fontStyle: "italic",
          marginTop: `${4 * scale}px`,
          opacity: 0.85,
        }}>
          {data.title}
        </div>
      </div>

      <div style={{
        width: '55%',
        height: '100%',
        background: '#ffffff',
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: `${24 * scale}px ${22 * scale}px`,
        gap: `${14 * scale}px`,
      }}>
        <div>
          <div style={{
            fontFamily: "'Raleway', sans-serif",
            fontSize: `${9 * scale}px`,
            fontWeight: 500,
            color: '#1a1a1a',
            letterSpacing: `${0.08 * scale}em`,
            marginBottom: `${4 * scale}px`,
          }}>
            Postal Address
          </div>
          {[data.address, data.city].map((line, i) => (
            <div key={i} style={{
              fontFamily: "'Raleway', sans-serif",
              fontSize: `${8 * scale}px`,
              fontWeight: 300,
              color: '#555555',
              lineHeight: 1.6,
            }}>
              {line}
            </div>
          ))}
        </div>

        <div>
          <div style={{
            fontFamily: "'Raleway', sans-serif",
            fontSize: `${9 * scale}px`,
            fontWeight: 500,
            color: '#1a1a1a',
            letterSpacing: `${0.08 * scale}em`,
            marginBottom: `${4 * scale}px`,
          }}>
            Online
          </div>
          {[data.email, data.website].map((line, i) => (
            <div key={i} style={{
              fontFamily: "'Raleway', sans-serif",
              fontSize: `${8 * scale}px`,
              fontWeight: 300,
              color: '#555555',
              lineHeight: 1.6,
            }}>
              {line}
            </div>
          ))}
        </div>

        <div>
          <div style={{
            fontFamily: "'Raleway', sans-serif",
            fontSize: `${9 * scale}px`,
            fontWeight: 500,
            color: '#1a1a1a',
            letterSpacing: `${0.08 * scale}em`,
            marginBottom: `${4 * scale}px`,
          }}>
            Social
          </div>
          {[data.instagram, data.facebook].map((line, i) => (
            <div key={i} style={{
              fontFamily: "'Raleway', sans-serif",
              fontSize: `${8 * scale}px`,
              fontWeight: 300,
              color: '#555555',
              lineHeight: 1.6,
            }}>
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}