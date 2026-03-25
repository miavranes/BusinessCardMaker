import React, { useRef, useState } from 'react';

class GenericErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return <div style={{ padding: 20 }}>Something went wrong in the card layout.</div>;
    }
    return this.props.children;
  }
}

export default function GenericCardLayout({
  template = {},
  isBack = false,
  containerWidth = 400,
  userData = {},
  sections,
  selectedSection,
  onSelectSection,
  onUpdateSection,
  showPreview = false,
}) {
  const t = template;
  const scale = containerWidth / 400;
  const data = { ...t.defaultData, ...userData };
  const isOverlay = t.renderMode === 'overlay';

  const activeSections = Array.isArray(sections)
    ? sections
    : Array.isArray(isBack ? t.sectionsBack : t.sectionsFront)
      ? (isBack ? t.sectionsBack : t.sectionsFront)
      : [];

  const dragRef = useRef(null);
  const containerRef = useRef(null);

  const handleSectionClick = (e, rawSection) => {
    e.stopPropagation();
    if (showPreview) return;
    onSelectSection?.(rawSection, e.currentTarget.getBoundingClientRect());
  };

  const handleSectionMouseDown = (e, rawSection) => {
    if (showPreview) return;
    e.stopPropagation();

    const domRect = e.currentTarget.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    onSelectSection?.(rawSection, domRect);

    if (!containerRect) return;

    dragRef.current = {
      sectionId: rawSection.id,
      startX: e.clientX,
      startY: e.clientY,
      origX: rawSection.x,
      origY: rawSection.y,
      cw: containerRect.width,
      ch: containerRect.height,
      moved: false,
    };

    const onMouseMove = (me) => {
      const d = dragRef.current;
      if (!d) return;
      const dx = (me.clientX - d.startX) / d.cw;
      const dy = (me.clientY - d.startY) / d.ch;
      if (Math.abs(dx) > 0.004 || Math.abs(dy) > 0.004) d.moved = true;
      if (!d.moved) return;
      const newX = Math.max(0, Math.min(d.origX + dx, 1 - rawSection.width));
      const newY = Math.max(0, Math.min(d.origY + dy, 1 - rawSection.height));
      onUpdateSection?.(d.sectionId, { x: newX, y: newY });
    };

    const onMouseUp = () => {
      dragRef.current = null;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <GenericErrorBoundary>
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          boxSizing: 'border-box',
          userSelect: 'none',
          background: isOverlay ? 'transparent' : (isBack ? t.bgBack : t.bg) || '#fff',
        }}
        onClick={() => { if (!showPreview) onSelectSection?.(null, null); }}
      >
        {activeSections.map((rawSection) => {
          const section = resolveSection(rawSection, t) || {};
          return (
            <SectionDiv
              key={rawSection.id}
              section={section}
              rawSection={rawSection}
              data={data}
              scale={scale}
              isSelected={selectedSection?.id === rawSection.id}
              isOverlay={isOverlay}
              showPreview={showPreview}
              onClick={(e) => handleSectionClick(e, rawSection)}
              onMouseDown={(e) => handleSectionMouseDown(e, rawSection)}
            />
          );
        })}
      </div>
    </GenericErrorBoundary>
  );
}

function SectionDiv({ section, data, scale, isSelected, isOverlay, showPreview, onClick, onMouseDown }) {
  const [hovered, setHovered] = useState(false);

  if (!section) return null;

  const base = {
    position: 'absolute',
    left: `${(section.x ?? 0) * 100}%`,
    top: `${(section.y ?? 0) * 100}%`,
    width: `${(section.width ?? 0) * 100}%`,
    height: `${(section.height ?? 0) * 100}%`,
    boxSizing: 'border-box',
    cursor: showPreview ? 'default' : isSelected ? 'grab' : 'pointer',
    outline: !showPreview
      ? isSelected ? '2px solid rgba(99,102,241,0.9)'
        : hovered ? '2px solid rgba(99,102,241,0.4)'
        : '2px solid transparent'
      : 'none',
    outlineOffset: '2px',
    background: !showPreview
      ? isSelected ? 'rgba(99,102,241,0.07)'
        : hovered ? 'rgba(99,102,241,0.03)'
        : 'transparent'
      : 'transparent',
    borderRadius: 3,
    transition: 'outline-color 0.12s, background 0.12s',
  };

  const events = showPreview
    ? {}
    : { onClick, onMouseDown, onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false) };

  try {
    if (section.type === 'logo') {
      return (
        <div style={{ ...base, display: 'flex', alignItems: 'center', justifyContent: 'center' }} {...events}>
          <img
            src={data.logoUrl || defaultLogo}
            alt="logo"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: section.objectFit || 'contain',
              pointerEvents: 'none',
            }}
          />
          {isSelected && <Badge>{section.label}</Badge>}
        </div>
      );
    }

    if (section.type === 'text') {
      const content = getSectionContent(section, data) || '';
      const alignItems =
        section.verticalAlign === 'center' ? 'center'
          : section.verticalAlign === 'bottom' ? 'flex-end'
          : 'flex-start';

      return (
        <div style={base} {...events}>
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems }}>
            <span style={{
              fontFamily: section.fontFamily || 'system-ui, sans-serif',
              fontSize: `${(section.fontSize ?? 12) * scale}px`,
              fontWeight: section.fontWeight ?? 'normal',
              fontStyle: section.fontStyle ?? 'normal',
              color: section.color ?? '#000',
              textAlign: section.textAlign ?? 'left',
              letterSpacing: `${section.letterSpacing ?? 0}em`,
              lineHeight: section.lineHeight ?? 1,
              opacity: section.opacity ?? 1,
              textTransform: section.textTransform ?? 'none',
              textDecoration: section.textDecoration ?? 'none',
              textShadow: section.textShadowBlur > 0 
                ? `2px 2px ${section.textShadowBlur}px ${section.textShadowColor || '#000000'}`
                : 'none',
              WebkitTextStroke: section.textStrokeWidth > 0
                ? `${section.textStrokeWidth}px ${section.textStrokeColor || '#000000'}`
                : 'none',
              paintOrder: 'stroke fill',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              width: '100%',
              pointerEvents: 'none',
            }}>
              {content}
            </span>
          </div>
          {isSelected && <Badge>{section.label}</Badge>}
        </div>
      );
    }
  } catch (err) {
    console.error('Error rendering SectionDiv', section, err);
    return null;
  }

  return null;
}

function Badge({ children }) {
  return (
    <div style={{
      position: 'absolute',
      top: 3,
      right: 4,
      background: 'rgba(99,102,241,0.88)',
      color: '#fff',
      fontSize: 9,
      padding: '2px 6px',
      borderRadius: 3,
      fontFamily: 'system-ui, sans-serif',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      fontWeight: 600,
      pointerEvents: 'none',
      whiteSpace: 'nowrap',
    }}>
      {children}
    </div>
  );
}

function resolveSection(rawSection, template) {
  return rawSection;
}

function getSectionContent(section, data) {
  return section.key ? data[section.key] : '';
}