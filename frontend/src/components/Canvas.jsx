import { useState, useRef, useEffect, forwardRef } from 'react';
import '../css/Canvas.css';

const Canvas = forwardRef(({
  elements,
  selectedElement,
  setSelectedElement,
  onUpdateElement,
  backgroundColor,
  template,
  isBack,
  showPreview,
  selectedSection,
  onSelectSection,
  onUpdateSection,
  userData,
}, ref) => {
  const containerRef = useRef(null);
  const [dragging, setDragging] = useState(null);       // custom element dragging
  const [draggingSection, setDraggingSection] = useState(null); // section dragging
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [containerWidth, setContainerWidth] = useState(400);

  const canvasWidth = 500;
  const canvasHeight = 300;

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) setContainerWidth(containerRef.current.offsetWidth);
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useEffect(() => {
    drawCanvas();
  }, [elements, selectedElement, backgroundColor, selectedSection]);

  const getSections = () => {
    if (!template) return [];
    return isBack ? (template.sectionsBack || []) : (template.sectionsFront || []);
  };

  const sectionToPx = (section) => ({
    x: section.x * canvasWidth,
    y: section.y * canvasHeight,
    width: section.width * canvasWidth,
    height: section.height * canvasHeight,
  });

  const drawCanvas = () => {
    const canvas = ref?.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    if (!template) {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    elements.forEach(element => {
      if (element.type === 'text') drawText(ctx, element);
      else if (element.type === 'shape') drawShape(ctx, element);
      else if (element.type === 'image') drawImage(ctx, element);

      if (!showPreview && element.id === selectedElement) {
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        const bounds = getElementBounds(element);
        ctx.strokeRect(bounds.x - 5, bounds.y - 5, bounds.width + 10, bounds.height + 10);
        ctx.setLineDash([]);
      }
    });

    if (!showPreview) {
      const sections = getSections();
      sections.forEach(section => {
        const px = sectionToPx(section);
        const isSelected = selectedSection?.id === section.id;
        if (!isSelected) return;

        ctx.fillStyle = 'rgba(99, 102, 241, 0.08)';
        ctx.fillRect(px.x, px.y, px.width, px.height);
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.strokeRect(px.x, px.y, px.width, px.height);

        // Drag handle — mali kvadrat u gornjem lijevom uglu
        ctx.fillStyle = '#6366f1';
        ctx.fillRect(px.x, px.y, 12, 12);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⠿', px.x + 6, px.y + 6);
      });
    }
  };

  const drawText = (ctx, element) => {
    ctx.font = `${element.fontStyle || 'normal'} ${element.fontWeight || 'normal'} ${element.fontSize}px ${element.fontFamily}`;
    ctx.fillStyle = element.color;
    ctx.textAlign = element.align || 'left';
    ctx.textBaseline = 'top';
    const lines = element.content.split('\n');
    const lineHeight = element.fontSize * (element.lineHeight || 1.2);
    lines.forEach((line, index) => {
      const x = element.x;
      const y = element.y + index * lineHeight;
      ctx.fillText(line, x, y);
      if (element.textDecoration === 'underline') {
        const metrics = ctx.measureText(line);
        ctx.beginPath();
        ctx.strokeStyle = element.color;
        ctx.lineWidth = 1;
        ctx.moveTo(x - (element.align === 'center' ? metrics.width / 2 : 0), y + element.fontSize);
        ctx.lineTo(x + (element.align === 'center' ? metrics.width / 2 : metrics.width), y + element.fontSize);
        ctx.stroke();
      }
    });
  };

  const drawShape = (ctx, element) => {
    ctx.fillStyle = element.fill || '#3b82f6';
    if (element.strokeWidth > 0) {
      ctx.strokeStyle = element.stroke || '#000000';
      ctx.lineWidth = element.strokeWidth;
    }
    if (element.shapeType === 'rectangle') {
      ctx.fillRect(element.x, element.y, element.width, element.height);
      if (element.strokeWidth > 0) ctx.strokeRect(element.x, element.y, element.width, element.height);
    } else if (element.shapeType === 'circle') {
      ctx.beginPath();
      ctx.arc(element.x + element.width / 2, element.y + element.height / 2, element.width / 2, 0, Math.PI * 2);
      ctx.fill();
      if (element.strokeWidth > 0) ctx.stroke();
    } else if (element.shapeType === 'triangle') {
      ctx.beginPath();
      ctx.moveTo(element.x + element.width / 2, element.y);
      ctx.lineTo(element.x + element.width, element.y + element.height);
      ctx.lineTo(element.x, element.y + element.height);
      ctx.closePath();
      ctx.fill();
      if (element.strokeWidth > 0) ctx.stroke();
    } else if (element.shapeType === 'line') {
      ctx.beginPath();
      ctx.strokeStyle = element.fill;
      ctx.lineWidth = element.height || 2;
      ctx.moveTo(element.x, element.y);
      ctx.lineTo(element.x + element.width, element.y);
      ctx.stroke();
    }
  };

  const drawImage = (ctx, element) => {
    if (element.imgElement) {
      ctx.drawImage(element.imgElement, element.x, element.y, element.width, element.height);
    }
  };

  const getElementBounds = (element) => {
    if (element.type === 'text') {
      const canvas = ref?.current;
      if (!canvas) return { x: 0, y: 0, width: 0, height: 0 };
      const ctx = canvas.getContext('2d');
      ctx.font = `${element.fontStyle || 'normal'} ${element.fontWeight || 'normal'} ${element.fontSize}px ${element.fontFamily}`;
      const lines = element.content.split('\n');
      const lineHeight = element.fontSize * (element.lineHeight || 1.2);
      let maxWidth = 0;
      lines.forEach(line => {
        const metrics = ctx.measureText(line);
        maxWidth = Math.max(maxWidth, metrics.width);
      });
      return { x: element.x, y: element.y, width: maxWidth, height: lines.length * lineHeight };
    }
    if (element.type === 'shape' || element.type === 'image') {
      return { x: element.x, y: element.y, width: element.width, height: element.height };
    }
    return { x: 0, y: 0, width: 0, height: 0 };
  };

  const getMousePos = (e) => {
    const rect = ref.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvasWidth / rect.width),
      y: (e.clientY - rect.top) * (canvasHeight / rect.height),
    };
  };

  const handleMouseDown = (e) => {
    if (showPreview) return;
    const { x, y } = getMousePos(e);

    // Provjeri da li se draga sekcija (već selektovana)
    if (selectedSection && template) {
      const px = sectionToPx(selectedSection);
      if (x >= px.x && x <= px.x + px.width && y >= px.y && y <= px.y + px.height) {
        setDraggingSection(selectedSection);
        setOffset({ x: x - px.x, y: y - px.y });
        return;
      }
    }

    // Provjeri klik na drugu sekciju
    if (template && onSelectSection) {
      const sections = getSections();
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const px = sectionToPx(section);
        if (x >= px.x && x <= px.x + px.width && y >= px.y && y <= px.y + px.height) {
          onSelectSection(section);
          setSelectedElement(null);
          return;
        }
      }
      onSelectSection(null);
    }

    // Provjeri klik na custom element
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i];
      const bounds = getElementBounds(element);
      if (x >= bounds.x && x <= bounds.x + bounds.width && y >= bounds.y && y <= bounds.y + bounds.height) {
        setSelectedElement(element.id);
        setDragging(element.id);
        setOffset({ x: x - element.x, y: y - element.y });
        return;
      }
    }

    setSelectedElement(null);
  };

  const handleMouseMove = (e) => {
    if (showPreview) return;
    const { x, y } = getMousePos(e);

    // Drag sekcije
    if (draggingSection && onUpdateSection) {
      const newX = Math.max(0, Math.min((x - offset.x) / canvasWidth, 1 - draggingSection.width));
      const newY = Math.max(0, Math.min((y - offset.y) / canvasHeight, 1 - draggingSection.height));
      onUpdateSection(draggingSection.id, { x: newX, y: newY });
      return;
    }

    // Drag custom elementa
    if (dragging) {
      onUpdateElement(dragging, { x: x - offset.x, y: y - offset.y });
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
    setDraggingSection(null);
  };

  const LayoutComponent = template?.layoutComponent;

  return (
    <div ref={containerRef} className="canvas-container">
      <div className="canvas-wrapper" style={{ position: 'relative' }}>
        {LayoutComponent && (
          <div style={{
            position: 'absolute', top: 0, left: 0,
            width: '100%', height: '100%',
            zIndex: 0, pointerEvents: 'none',
          }}>
            <LayoutComponent
              template={template}
              isBack={isBack}
              containerWidth={containerWidth}
              userData={userData}
            />
          </div>
        )}

        <canvas
          ref={ref}
          width={canvasWidth}
          height={canvasHeight}
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