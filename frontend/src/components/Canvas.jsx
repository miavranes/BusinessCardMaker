import { useState, useRef, useEffect, forwardRef } from 'react';
import '../css/Canvas.css';

const DEBUG = false;

const Canvas = forwardRef(({
  elements, selectedElement, setSelectedElement, onUpdateElement,
  backgroundColor, template, isBack, showPreview,
  selectedSection, onSelectSection, onUpdateSection,
  userData, sections,
}, ref) => {
  const containerRef = useRef(null);
  const [dragging, setDragging] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [containerWidth, setContainerWidth] = useState(400);
  const [resizing, setResizing] = useState(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const CANVAS_W = 580;
  const CANVAS_H = 330;

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setContainerWidth(width);
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // high-DPI canvas scaling so drawings look crisp and avoid blurriness while
  // dragging. We set the backing store size to devicePixelRatio×CSS size and
  // scale the context accordingly.
  useEffect(() => {
    const canvas = ref?.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_W * dpr;
    canvas.height = CANVAS_H * dpr;
    canvas.style.width = `${CANVAS_W}px`;
    canvas.style.height = `${CANVAS_H}px`;
    ctx.scale(dpr, dpr);
  }, [ref]);

  useEffect(() => {
    const canvas = ref?.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    if (!template) {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    }
    
    // Render text sections first (below elements). When a layout component
    // is active we let it render the template's built-in sections, therefore
    // only draw custom sections that the user has added (ids start with
    // "text-added"). This prevents double‑printing everything.
    if (sections && sections.length > 0) {
      sections.forEach(section => {
        if (section.type === 'text') {
          // if there is a template layout, skip its default sections
          if (template && !section.id.startsWith('text-added')) {
            return;
          }
          const content = section.field === 'name' 
            ? `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim()
            : userData?.[section.field] || '';
          
          if (content) {
            const textElement = {
              id: section.id,
              type: 'text',
              x: section.x * CANVAS_W,
              y: section.y * CANVAS_H,
              width: section.width * CANVAS_W,
              height: section.height * CANVAS_H,
              content: content,
              fontSize: section.fontSize || 16,
              fontFamily: section.fontFamily || 'Arial, sans-serif',
              color: section.color || '#000000',
              fontWeight: section.fontWeight || 'normal',
              fontStyle: section.fontStyle || 'normal',
              textAlign: section.textAlign || 'left',
              textDecoration: section.textDecoration || 'none',
              lineHeight: section.lineHeight || 1.2,
              textShadowBlur: section.textShadowBlur || 0,
              textShadowColor: section.textShadowColor || '#000000',
              textStrokeWidth: section.textStrokeWidth || 0,
              textStrokeColor: section.textStrokeColor || '#000000',
              opacity: section.opacity ?? 1,
            };
            
            ctx.save();
            ctx.globalAlpha = textElement.opacity;
            drawText(ctx, textElement);
            ctx.restore();
          }
        }
      });
    }
    
    elements.forEach(el => {
      ctx.save();
      ctx.globalAlpha = el.opacity ?? 1;
      
      if (el.type === 'text') {
        drawText(ctx, el);
      } else if (el.type === 'shape') {
        drawShape(ctx, el);
      } else if (el.type === 'image') {
        if (!el.imgElement) {
          // silently skip
        } else {
          drawImage(ctx, el);
        }
      }
      
      ctx.restore();
      
      if (!showPreview && el.id === selectedElement) {
        // draw the same highlight style used by section overlays (solid border
        // + slight translucent fill) so that sections and elements look
        // identical when selected.
        const b = getElementBounds(el);
        ctx.save();
        ctx.strokeStyle = 'rgba(99,102,241,0.8)';
        ctx.lineWidth = 1.5;
        ctx.fillStyle = 'rgba(99,102,241,0.08)';
        ctx.fillRect(b.x - 5, b.y - 5, b.width + 10, b.height + 10);
        ctx.strokeRect(b.x - 5, b.y - 5, b.width + 10, b.height + 10);
        ctx.restore();

        // Draw crisp resize handles
        const handleSize = 8;
        ctx.fillStyle = 'rgba(99,102,241,1)';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;

        const corners = [
          { x: b.x - 5, y: b.y - 5 },
          { x: b.x + b.width + 5, y: b.y - 5 },
          { x: b.x - 5, y: b.y + b.height + 5 },
          { x: b.x + b.width + 5, y: b.y + b.height + 5 },
        ];

        corners.forEach(corner => {
          ctx.beginPath();
          ctx.arc(corner.x, corner.y, handleSize / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        });
      }
    });
  }, [elements, selectedElement, backgroundColor, template, showPreview, sections, userData]);

  const drawText = (ctx, el) => {
    ctx.save();
    ctx.font = `${el.fontStyle || 'normal'} ${el.fontWeight || 'normal'} ${el.fontSize}px ${el.fontFamily}`;
    ctx.textAlign = 'left'; // always use left; we handle alignment manually below
    ctx.textBaseline = 'top';

    if (el.textShadowBlur > 0) {
      ctx.shadowBlur = el.textShadowBlur;
      ctx.shadowColor = el.textShadowColor || '#000000';
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
    }

    ctx.fillStyle = el.color;

    const lines = el.content.split('\n');
    const lh = el.fontSize * (el.lineHeight || 1.2);

    // Measure max line width so we can anchor alignment to el.x (left edge)
    let maxW = 0;
    lines.forEach(line => { maxW = Math.max(maxW, ctx.measureText(line).width); });

    lines.forEach((line, i) => {
      const lineW = ctx.measureText(line).width;
      let drawX = el.x;

      if (el.textAlign === 'center') {
        drawX = el.x + (maxW - lineW) / 2;
      } else if (el.textAlign === 'right') {
        drawX = el.x + maxW - lineW;
      }

      const yPos = el.y + i * lh;

      // Draw stroke first (if enabled)
      if (el.textStrokeWidth > 0) {
        ctx.strokeStyle = el.textStrokeColor || '#000000';
        ctx.lineWidth = el.textStrokeWidth;
        ctx.strokeText(line, drawX, yPos);
      }

      ctx.fillText(line, drawX, yPos);

      if (el.textDecoration === 'underline') {
        const underlineY = yPos + el.fontSize + 2;

        ctx.beginPath();
        ctx.strokeStyle = el.color;
        ctx.lineWidth = Math.max(1, el.fontSize / 12);
        ctx.moveTo(drawX, underlineY);
        ctx.lineTo(drawX + lineW, underlineY);
        ctx.stroke();
      }
    });

    ctx.restore();
  };

  const drawShape = (ctx, el) => {
    ctx.fillStyle = el.fill || '#3b82f6';
    if (el.strokeWidth > 0) { ctx.strokeStyle = el.stroke || '#000'; ctx.lineWidth = el.strokeWidth; }
    if (el.shapeType === 'rectangle') {
      ctx.fillRect(el.x, el.y, el.width, el.height);
      if (el.strokeWidth > 0) ctx.strokeRect(el.x, el.y, el.width, el.height);
    } else if (el.shapeType === 'circle') {
      ctx.beginPath();
      ctx.arc(el.x + el.width / 2, el.y + el.height / 2, el.width / 2, 0, Math.PI * 2);
      ctx.fill(); if (el.strokeWidth > 0) ctx.stroke();
    } else if (el.shapeType === 'triangle') {
      ctx.beginPath();
      ctx.moveTo(el.x + el.width / 2, el.y);
      ctx.lineTo(el.x + el.width, el.y + el.height);
      ctx.lineTo(el.x, el.y + el.height);
      ctx.closePath(); ctx.fill(); if (el.strokeWidth > 0) ctx.stroke();
    } else if (el.shapeType === 'line') {
      ctx.beginPath(); ctx.strokeStyle = el.fill; ctx.lineWidth = el.height || 2;
      ctx.moveTo(el.x, el.y); ctx.lineTo(el.x + el.width, el.y); ctx.stroke();
    }
  };

  const drawImage = (ctx, el) => {
    if (el.imgElement) ctx.drawImage(el.imgElement, el.x, el.y, el.width, el.height);
  };

  const getElementBounds = (el) => {
    if (el.type === 'text') {
      const canvas = ref?.current;
      if (!canvas) return { x: 0, y: 0, width: 0, height: 0 };
      const ctx = canvas.getContext('2d');
      ctx.font = `${el.fontStyle || 'normal'} ${el.fontWeight || 'normal'} ${el.fontSize}px ${el.fontFamily}`;
      const lines = el.content.split('\n');
      const lh = el.fontSize * (el.lineHeight || 1.2);
      let maxW = 0;
      lines.forEach(line => { maxW = Math.max(maxW, ctx.measureText(line).width); });
      // el.x is always the left edge regardless of textAlign
      return { x: el.x, y: el.y, width: maxW, height: lines.length * lh };
    }
    return { x: el.x, y: el.y, width: el.width, height: el.height };
  };

  const getMousePos = (e) => {
    const rect = ref.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (CANVAS_W / rect.width),
      y: (e.clientY - rect.top) * (CANVAS_H / rect.height),
    };
  };

  const handleMouseDown = (e) => {
    if (showPreview) return;
    const { x, y } = getMousePos(e);

    // Check if clicking on resize handle first
    if (selectedElement) {
      const el = elements.find(e => e.id === selectedElement);
      if (el) {
        const b = getElementBounds(el);
        const handleSize = 8;
        const corners = [
          { name: 'nw', x: b.x - 5, y: b.y - 5 },
          { name: 'ne', x: b.x + b.width + 5, y: b.y - 5 },
          { name: 'sw', x: b.x - 5, y: b.y + b.height + 5 },
          { name: 'se', x: b.x + b.width + 5, y: b.y + b.height + 5 },
        ];

        for (const corner of corners) {
          const dist = Math.sqrt((x - corner.x) ** 2 + (y - corner.y) ** 2);
          if (dist <= handleSize) {
            setResizing({ id: el.id, corner: corner.name });
            setResizeStart({ x: el.x, y: el.y, width: el.width || b.width, height: el.height || b.height, mouseX: x, mouseY: y });
            return;
          }
        }
      }
    }

    // Otherwise check for element selection
    for (let i = elements.length - 1; i >= 0; i--) {
      const el = elements[i];
      const b = getElementBounds(el);
      if (x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height) {
        setSelectedElement(el.id);
        setDragging(el.id);
        setOffset({ x: x - el.x, y: y - el.y });
        return;
      }
    }
    setSelectedElement(null);
  };

  const dragThrottleRef = useRef({ last: 0, pending: null });

  const handleMouseMove = (e) => {
    if (showPreview) return;

    if (resizing) {
      const { x, y } = getMousePos(e);
      const el = elements.find(e => e.id === resizing.id);
      if (!el) return;

      const dx = x - resizeStart.mouseX;
      const dy = y - resizeStart.mouseY;

      let newX = resizeStart.x;
      let newY = resizeStart.y;
      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;

      if (resizing.corner.includes('e')) {
        newWidth = Math.max(20, resizeStart.width + dx);
      }
      if (resizing.corner.includes('w')) {
        newWidth = Math.max(20, resizeStart.width - dx);
        newX = resizeStart.x + (resizeStart.width - newWidth);
      }
      if (resizing.corner.includes('s')) {
        newHeight = Math.max(20, resizeStart.height + dy);
      }
      if (resizing.corner.includes('n')) {
        newHeight = Math.max(20, resizeStart.height - dy);
        newY = resizeStart.y + (resizeStart.height - newHeight);
      }

      onUpdateElement(resizing.id, { x: newX, y: newY, width: newWidth, height: newHeight });
      return;
    }

    if (!dragging) return;
    const { x, y } = getMousePos(e);
    const now = performance.now();
    const coords = { x: x - offset.x, y: y - offset.y };

    // throttle to ~60fps to reduce state churn
    if (now - dragThrottleRef.current.last > 16) {
      onUpdateElement(dragging, coords);
      dragThrottleRef.current.last = now;
    } else {
      dragThrottleRef.current.pending = coords;
    }
  };

  // flush pending drag position on animation frame
  useEffect(() => {
    let anim;
    const tick = () => {
      if (dragThrottleRef.current.pending && dragging) {
        onUpdateElement(dragging, dragThrottleRef.current.pending);
        dragThrottleRef.current.last = performance.now();
        dragThrottleRef.current.pending = null;
      }
      anim = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(anim);
  }, [dragging]);

  const handleMouseUp = () => {
    setDragging(null);
    setResizing(null);
  };

  const sectionDragRef = useRef(null);

  const handleSectionMouseDown = (e, section) => {
    if (showPreview) return;
    e.stopPropagation();

    onSelectSection(section, e.currentTarget.getBoundingClientRect());

    const wrapperRect = containerRef.current.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const startSectionX = section.x;
    const startSectionY = section.y;

    sectionDragRef.current = { startX, startY, startSectionX, startSectionY, section };

    const onMove = (moveEvent) => {
      if (!sectionDragRef.current) return;
      const dx = (moveEvent.clientX - startX) / wrapperRect.width;
      const dy = (moveEvent.clientY - startY) / wrapperRect.height;

      const newX = Math.max(0, Math.min(0.95, startSectionX + dx));
      const newY = Math.max(0, Math.min(0.95, startSectionY + dy));

      onUpdateSection(section.id, { x: newX, y: newY });
    };

    const onUp = () => {
      sectionDragRef.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const handleResizeMouseDown = (e, section, corner) => {
    e.stopPropagation();

    const wrapperRect = containerRef.current.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const startSectionX = section.x;
    const startSectionY = section.y;
    const startWidth = section.width;
    const startHeight = section.height;

    const onMove = (moveEvent) => {
      const dx = (moveEvent.clientX - startX) / wrapperRect.width;
      const dy = (moveEvent.clientY - startY) / wrapperRect.height;

      let newX = startSectionX;
      let newY = startSectionY;
      let newWidth = startWidth;
      let newHeight = startHeight;

      if (corner.includes('e')) {
        newWidth = Math.max(0.05, Math.min(1 - startSectionX, startWidth + dx));
      }
      if (corner.includes('w')) {
        const maxDx = startWidth - 0.05;
        const constrainedDx = Math.max(-startSectionX, Math.min(maxDx, dx));
        newX = startSectionX + constrainedDx;
        newWidth = startWidth - constrainedDx;
      }
      if (corner.includes('s')) {
        newHeight = Math.max(0.05, Math.min(1 - startSectionY, startHeight + dy));
      }
      if (corner.includes('n')) {
        const maxDy = startHeight - 0.05;
        const constrainedDy = Math.max(-startSectionY, Math.min(maxDy, dy));
        newY = startSectionY + constrainedDy;
        newHeight = startHeight - constrainedDy;
      }

      onUpdateSection(section.id, {
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
      });
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const LayoutComponent = template?.layoutComponent;

  return (
    <div ref={containerRef} className="canvas-container">
      <div className="canvas-wrapper" style={{ position: 'relative' }}>

        <canvas
          ref={ref}
          width={CANVAS_W}
          height={CANVAS_H}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`canvas-element ${showPreview ? '' : 'draggable'}`}
          style={{
            position: 'relative',
            zIndex: 2,           // bring canvas above layout so added elements are visible
            background: template ? 'transparent' : backgroundColor,
            cursor: resizing ? `${resizing.corner}-resize` : (dragging ? 'grabbing' : 'default'),
          }}
        />

        {LayoutComponent && (
          <div style={{
            position: 'absolute', top: 0, left: 0,
            width: '100%', height: '100%',
            zIndex: 1,          // put layout below canvas
            pointerEvents: 'none', // make layout non‑interactive, overlays handle clicks
          }}
            onMouseDown={e => e.stopPropagation()}
          >
            {/* layout rendered below canvas */}
            <LayoutComponent
              template={template}
              isBack={isBack}
              containerWidth={containerWidth}
              userData={userData}
              sections={sections}
              selectedSection={selectedSection}
              onSelectSection={onSelectSection}
              onUpdateSection={onUpdateSection}
              showPreview={showPreview}
            />
          </div>
        )}

        {!showPreview && sections && sections.map(section => {
          const isSelected = selectedSection?.id === section.id;
          return (
            <div
              key={section.id}
              onMouseDown={e => handleSectionMouseDown(e, section)}
              style={{
                position: 'absolute',
                left:   `${section.x * 100}%`,
                top:    `${section.y * 100}%`,
                width:  `${section.width * 100}%`,
                height: `${section.height * 100}%`,
                zIndex: 10,
                cursor: 'grab',
                boxSizing: 'border-box',
                border: isSelected
                  ? '1.5px solid rgba(99,102,241,0.8)'
                  : '1.5px solid transparent',
                borderRadius: '3px',
                background: isSelected
                  ? 'rgba(99,102,241,0.08)'
                  : 'transparent',
                transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              {isSelected && (
                <>
                  {['nw', 'ne', 'sw', 'se'].map(corner => (
                    <div
                      key={corner}
                      onMouseDown={e => handleResizeMouseDown(e, section, corner)}
                      className={`resize-handle resize-${corner}`}
                      style={{
                        position: 'absolute',
                        width: '10px',
                        height: '10px',
                        background: '#6366f1',
                        border: '2px solid white',
                        borderRadius: '50%',
                        cursor: `${corner}-resize`,
                        zIndex: 20,
                        ...(corner === 'nw' && { top: '-5px', left: '-5px' }),
                        ...(corner === 'ne' && { top: '-5px', right: '-5px' }),
                        ...(corner === 'sw' && { bottom: '-5px', left: '-5px' }),
                        ...(corner === 'se' && { bottom: '-5px', right: '-5px' }),
                      }}
                    />
                  ))}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

Canvas.displayName = 'Canvas';
export default Canvas;