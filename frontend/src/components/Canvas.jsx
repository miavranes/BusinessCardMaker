import { useState, useRef, useEffect, forwardRef } from 'react';
import '../css/Canvas.css';

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

  const CANVAS_W = 580;
  const CANVAS_H = 330;

  useEffect(() => {
    const update = () => {
      if (containerRef.current) setContainerWidth(containerRef.current.offsetWidth);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => { drawCanvas(); }, [elements, selectedElement, backgroundColor]);

  const drawCanvas = () => {
    const canvas = ref?.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    if (!template) {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    }
    elements.forEach(el => {
      if (el.type === 'text') drawText(ctx, el);
      else if (el.type === 'shape') drawShape(ctx, el);
      else if (el.type === 'image') drawImage(ctx, el);
      if (!showPreview && el.id === selectedElement) {
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        const b = getElementBounds(el);
        ctx.strokeRect(b.x - 5, b.y - 5, b.width + 10, b.height + 10);
        ctx.setLineDash([]);
      }
    });
  };

  const drawText = (ctx, el) => {
    ctx.font = `${el.fontStyle || 'normal'} ${el.fontWeight || 'normal'} ${el.fontSize}px ${el.fontFamily}`;
    ctx.fillStyle = el.color;
    ctx.textAlign = el.align || 'left';
    ctx.textBaseline = 'top';
    const lines = el.content.split('\n');
    const lh = el.fontSize * (el.lineHeight || 1.2);
    lines.forEach((line, i) => { ctx.fillText(line, el.x, el.y + i * lh); });
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

  const handleMouseMove = (e) => {
    if (!dragging || showPreview) return;
    const { x, y } = getMousePos(e);
    onUpdateElement(dragging, { x: x - offset.x, y: y - offset.y });
  };

  const handleMouseUp = () => { setDragging(null); };

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

  const LayoutComponent = template?.layoutComponent;

  return (
    <div ref={containerRef} className="canvas-container">
      <div className="canvas-wrapper" style={{ position: 'relative' }}>

       {LayoutComponent && (
          <div style={{
            position: 'absolute', top: 0, left: 0,
            width: '100%', height: '100%',
            zIndex: 2,
            pointerEvents: showPreview ? 'none' : 'auto',
          }}
            onMouseDown={e => e.stopPropagation()}
          >
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
            />
          );
        })}
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
            zIndex: 1,
            background: template ? 'transparent' : backgroundColor,
          }}
        />
      </div>
    </div>
  );
});

Canvas.displayName = 'Canvas';
export default Canvas;