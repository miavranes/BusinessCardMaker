import { useState, useRef, useEffect, forwardRef, useCallback } from 'react';
import QRCode from 'qrcode';
import '../css/Canvas.css';

const CANVAS_W = 580;
const CANVAS_H = 330;

const Canvas = forwardRef(({
  elements, selectedElement, setSelectedElement, onUpdateElement, onAddElement,
  backgroundColor, template, isBack, showPreview,
  selectedSection, onSelectSection, onUpdateSection,
  onSilentUpdateElement, onSilentUpdateSection,
  userData, sections,
  onElementSelect,
  onMoveElementToOtherCanvas,
  onMoveSectionToOtherCanvas,
  otherCanvasRef,
  onDragElement,
  onDragEnd,
  dragPreview,
}, ref) => {
  const containerRef = useRef(null);
  const [dragging, setDragging] = useState(null);
  const [containerWidth, setContainerWidth] = useState(400);
  const [resizing, setResizing] = useState(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [dragOverCanvas, setDragOverCanvas] = useState(false);
  const [qrDataUrls, setQrDataUrls] = useState({});

  useEffect(() => {
    const update = () => { if (containerRef.current) setContainerWidth(containerRef.current.offsetWidth); };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    const canvas = ref?.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = CANVAS_W * dpr;
    canvas.height = CANVAS_H * dpr;
    canvas.style.width  = `${CANVAS_W}px`;
    canvas.style.height = `${CANVAS_H}px`;
    ctx.scale(dpr, dpr);
  }, [ref]);

  // ── QR: generate data URLs whenever vcardString changes ──
  const qrKey = elements.filter(e => e.type === 'qr').map(e => e.id + e.vcardString).join('|');
  useEffect(() => {
    const qrEls = elements.filter(el => el.type === 'qr' && el.vcardString);
    if (!qrEls.length) { setQrDataUrls({}); return; }
    qrEls.forEach(el => {
      QRCode.toDataURL(el.vcardString, {
        width: 300, margin: 2, errorCorrectionLevel: 'M',
        color: { dark: el.qrFg || '#000000', light: el.qrBg || '#ffffff' },
      }).then(url => setQrDataUrls(prev => ({ ...prev, [el.id]: url })))
        .catch(console.error);
    });
  }, [qrKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Reconstruct imgElement from src when missing (happens after canvas transfer) ──
  useEffect(() => {
    const imageEls = elements.filter(el => el.type === 'image' && !el.imgElement && el.src);
    if (!imageEls.length) return;
    imageEls.forEach(el => {
      const img = new window.Image();
      img.onload = () => onSilentUpdateElement(el.id, { imgElement: img });
      img.src = el.src;
    });
  }, [elements.map(e => e.id + (e.imgElement ? '1' : '0')).join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Canvas draw loop ──
  useEffect(() => {
    const canvas = ref?.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    if (!template) { ctx.fillStyle = backgroundColor; ctx.fillRect(0, 0, CANVAS_W, CANVAS_H); }

    sections?.forEach(section => {
      if (section.type !== 'text') return;
      if (template && !section.id.startsWith('text-added')) return;
      const content = section.field === 'name'
        ? `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim()
        : userData?.[section.field] || '';
      if (!content) return;
      ctx.save();
      ctx.globalAlpha = section.opacity ?? 1;
      drawText(ctx, {
        ...section,
        x: section.x * CANVAS_W, y: section.y * CANVAS_H,
        width: section.width * CANVAS_W, height: section.height * CANVAS_H,
        content,
      });
      ctx.restore();
    });

    elements.forEach(el => {
      ctx.save();
      ctx.globalAlpha = el.opacity ?? 1;
      if      (el.type === 'text')                      drawText(ctx, el);
      else if (el.type === 'shape')                     drawShape(ctx, el);
      else if (el.type === 'image' && el.imgElement)    drawImage(ctx, el);
      else if (el.type === 'image' && !el.imgElement) {
        // imgElement missing (e.g. after canvas transfer) — draw placeholder so element is visible & selectable
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(el.x, el.y, el.width||60, el.height||60);
        ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1;
        ctx.strokeRect(el.x, el.y, el.width||60, el.height||60);
      }
      // 'qr' is rendered as <img> overlay — skip here
      ctx.restore();

      if (!showPreview && el.id === selectedElement && el.type !== 'qr') {
        const b = getBounds(el);
        ctx.save();
        ctx.strokeStyle = 'rgba(99,102,241,0.8)'; ctx.lineWidth = 1.5;
        ctx.fillStyle = 'rgba(99,102,241,0.08)';
        ctx.fillRect(b.x-5, b.y-5, b.w+10, b.h+10);
        ctx.strokeRect(b.x-5, b.y-5, b.w+10, b.h+10);
        ctx.restore();
        ctx.fillStyle = 'rgba(99,102,241,1)'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
        [[b.x-5,b.y-5],[b.x+b.w+5,b.y-5],[b.x-5,b.y+b.h+5],[b.x+b.w+5,b.y+b.h+5]].forEach(([cx,cy]) => {
          ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI*2); ctx.fill(); ctx.stroke();
        });
      }
    });

    if (dragPreview) {
      const side = isBack ? 'back' : 'front';
      if (dragPreview.targetSide === side) {
        const g = { ...dragPreview.element, x: dragPreview.x, y: dragPreview.y };
        ctx.save(); ctx.globalAlpha = 0.4;
        if (g.type === 'text') drawText(ctx, g);
        else if (g.type === 'shape') drawShape(ctx, g);
        else if (g.type === 'image' && g.imgElement) drawImage(ctx, g);
        ctx.restore();
      }
    }
  }, [elements, selectedElement, backgroundColor, template, showPreview, sections, userData, dragPreview]);

  function drawText(ctx, el) {
    ctx.save();
    ctx.font = `${el.fontStyle||'normal'} ${el.fontWeight||'normal'} ${el.fontSize}px ${el.fontFamily}`;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    if (el.textShadowBlur > 0) { ctx.shadowBlur = el.textShadowBlur; ctx.shadowColor = el.textShadowColor||'#000'; ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 2; }
    ctx.fillStyle = el.color;
    const lines = el.content.split('\n');
    const lh = el.fontSize * (el.lineHeight || 1.2);
    let maxW = 0;
    lines.forEach(l => { maxW = Math.max(maxW, ctx.measureText(l).width); });
    lines.forEach((line, i) => {
      const lw = ctx.measureText(line).width;
      let dx = el.x;
      if (el.textAlign === 'center') dx = el.x + (maxW - lw) / 2;
      else if (el.textAlign === 'right') dx = el.x + maxW - lw;
      const yp = el.y + i * lh;
      if (el.textStrokeWidth > 0) { ctx.strokeStyle = el.textStrokeColor||'#000'; ctx.lineWidth = el.textStrokeWidth; ctx.strokeText(line, dx, yp); }
      ctx.fillText(line, dx, yp);
      if (el.textDecoration === 'underline') {
        ctx.beginPath(); ctx.strokeStyle = el.color; ctx.lineWidth = Math.max(1, el.fontSize/12);
        ctx.moveTo(dx, yp+el.fontSize+2); ctx.lineTo(dx+lw, yp+el.fontSize+2); ctx.stroke();
      }
    });
    ctx.restore();
  }

  function drawShape(ctx, el) {
    ctx.fillStyle = el.fill || '#3b82f6';
    if (el.strokeWidth > 0) { ctx.strokeStyle = el.stroke||'#000'; ctx.lineWidth = el.strokeWidth; }
    if (el.shapeType === 'rectangle') { ctx.fillRect(el.x,el.y,el.width,el.height); if (el.strokeWidth>0) ctx.strokeRect(el.x,el.y,el.width,el.height); }
    else if (el.shapeType === 'circle') { ctx.beginPath(); ctx.arc(el.x+el.width/2,el.y+el.height/2,el.width/2,0,Math.PI*2); ctx.fill(); if (el.strokeWidth>0) ctx.stroke(); }
    else if (el.shapeType === 'triangle') { ctx.beginPath(); ctx.moveTo(el.x+el.width/2,el.y); ctx.lineTo(el.x+el.width,el.y+el.height); ctx.lineTo(el.x,el.y+el.height); ctx.closePath(); ctx.fill(); if (el.strokeWidth>0) ctx.stroke(); }
    else if (el.shapeType === 'line') { ctx.beginPath(); ctx.strokeStyle=el.fill; ctx.lineWidth=el.height||2; ctx.moveTo(el.x,el.y); ctx.lineTo(el.x+el.width,el.y); ctx.stroke(); }
  }

  function drawImage(ctx, el) {
    if (!el.imgElement) return;
    if (el.color) { ctx.drawImage(el.imgElement,el.x,el.y,el.width,el.height); ctx.globalCompositeOperation='source-in'; ctx.fillStyle=el.color; ctx.fillRect(el.x,el.y,el.width,el.height); ctx.globalCompositeOperation='source-over'; }
    else ctx.drawImage(el.imgElement,el.x,el.y,el.width,el.height);
  }

  function getBounds(el) {
    if (el.type === 'text') {
      const canvas = ref?.current; if (!canvas) return { x:0,y:0,w:0,h:0 };
      const ctx = canvas.getContext('2d');
      ctx.font = `${el.fontStyle||'normal'} ${el.fontWeight||'normal'} ${el.fontSize}px ${el.fontFamily}`;
      const lines = el.content.split('\n'); const lh = el.fontSize*(el.lineHeight||1.2);
      let maxW = 0; lines.forEach(l => { maxW = Math.max(maxW, ctx.measureText(l).width); });
      return { x: el.x, y: el.y, w: maxW, h: lines.length * lh };
    }
    return { x: el.x, y: el.y, w: el.width||80, h: el.height||80 };
  }

  function getMousePos(e) {
    const rect = ref.current.getBoundingClientRect();
    return { x: (e.clientX - rect.left) * (CANVAS_W / rect.width), y: (e.clientY - rect.top) * (CANVAS_H / rect.height) };
  }

  // ── Notify FloatingEditor position for any element ──
  const notifySelect = useCallback((el) => {
    if (!onElementSelect || !containerRef.current) return;
    const b = getBounds(el);
    const wr = containerRef.current.getBoundingClientRect();
    const sx = wr.width / CANVAS_W, sy = wr.height / CANVAS_H;
    onElementSelect(el.id, {
      left: wr.left + b.x * sx, top: wr.top + b.y * sy,
      right: wr.left + (b.x + b.w) * sx, bottom: wr.top + (b.y + b.h) * sy,
      width: b.w * sx, height: b.h * sy,
    });
  }, [onElementSelect]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMouseDown = (e) => {
    if (showPreview) return;
    const { x, y } = getMousePos(e);

    // Check resize handles on selected element
    if (selectedElement) {
      const el = elements.find(el => el.id === selectedElement);
      if (el) {
        const b = getBounds(el);
        const corners = [
          { name: 'nw', cx: b.x-5,     cy: b.y-5     },
          { name: 'ne', cx: b.x+b.w+5, cy: b.y-5     },
          { name: 'sw', cx: b.x-5,     cy: b.y+b.h+5 },
          { name: 'se', cx: b.x+b.w+5, cy: b.y+b.h+5 },
        ];
        for (const c of corners) {
          if (Math.hypot(x - c.cx, y - c.cy) <= 8) {
            setResizing({ id: el.id, corner: c.name });
            setResizeStart({ x: el.x, y: el.y, width: el.width||b.w, height: el.height||b.h, mouseX: x, mouseY: y });
            return;
          }
        }
      }
    }

    // Hit-test elements (reverse order = top first)
    for (let i = elements.length - 1; i >= 0; i--) {
      const el = elements[i];
      if (el.type === 'qr') continue; // QR handled by overlay div
      const b = getBounds(el);
      if (x >= b.x && x <= b.x+b.w && y >= b.y && y <= b.y+b.h) {
        setSelectedElement(el.id);
        setDragging(el.id);
        notifySelect(el);

        const canvasRect = ref.current.getBoundingClientRect();
        const startMX = e.clientX, startMY = e.clientY;
        const startEX = el.x, startEY = el.y;
        let lx = startEX, ly = startEY;

        const onMove = (mv) => {
          lx = startEX + (mv.clientX - startMX) / canvasRect.width  * CANVAS_W;
          ly = startEY + (mv.clientY - startMY) / canvasRect.height * CANVAS_H;
          onSilentUpdateElement(el.id, { x: lx, y: ly });
          if (typeof onDragElement === 'function') {
            let targetSide = isBack ? 'back' : 'front', targetRect = canvasRect;
            document.querySelectorAll('.canvas-side').forEach(side => {
              const cr = side.getBoundingClientRect();
              if (mv.clientX >= cr.left && mv.clientX <= cr.right && mv.clientY >= cr.top && mv.clientY <= cr.bottom) {
                if (!side.contains(ref.current)) { targetSide = isBack ? 'front' : 'back'; const oc = side.querySelector('canvas'); if (oc) targetRect = oc.getBoundingClientRect(); }
              }
            });
            onDragElement(el, { x: (mv.clientX - targetRect.left) * (CANVAS_W / targetRect.width), y: (mv.clientY - targetRect.top) * (CANVAS_H / targetRect.height) }, targetSide);
          }
        };
        const onUp = (up) => {
          window.removeEventListener('mousemove', onMove);
          window.removeEventListener('mouseup', onUp);
          if (typeof onDragEnd === 'function') onDragEnd();
          onUpdateElement(el.id, { x: lx, y: ly });
          if (onMoveElementToOtherCanvas) {
            const sides = document.querySelectorAll('.canvas-side');
            let other = null;
            for (const s of sides) { if (s.contains(ref.current)) { for (const o of sides) { if (o !== s) { other = o; break; } } break; } }
            if (other) {
              const or = other.getBoundingClientRect();
              if (up.clientX >= or.left && up.clientX <= or.right && up.clientY >= or.top && up.clientY <= or.bottom) {
                const oc = other.querySelector('canvas');
                const moved = oc ? { ...el, x: (up.clientX - oc.getBoundingClientRect().left) * (CANVAS_W / oc.getBoundingClientRect().width), y: (up.clientY - oc.getBoundingClientRect().top) * (CANVAS_H / oc.getBoundingClientRect().height) } : el;
                onMoveElementToOtherCanvas(moved);
              }
            }
          }
          setDragging(null);
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        if (typeof onDragElement === 'function') onDragElement(el, { x: startEX, y: startEY }, isBack ? 'back' : 'front');
        return;
      }
    }
    setSelectedElement(null);
  };

  const handleMouseMove = (e) => {
    if (showPreview || !resizing) return;
    const { x, y } = getMousePos(e);
    const el = elements.find(e => e.id === resizing.id); if (!el) return;
    const dx = x - resizeStart.mouseX, dy = y - resizeStart.mouseY;
    let nx = resizeStart.x, ny = resizeStart.y, nw = resizeStart.width, nh = resizeStart.height;
    if (resizing.corner.includes('e')) nw = Math.max(20, resizeStart.width + dx);
    if (resizing.corner.includes('w')) { nw = Math.max(20, resizeStart.width - dx); nx = resizeStart.x + (resizeStart.width - nw); }
    if (resizing.corner.includes('s')) nh = Math.max(20, resizeStart.height + dy);
    if (resizing.corner.includes('n')) { nh = Math.max(20, resizeStart.height - dy); ny = resizeStart.y + (resizeStart.height - nh); }
    onSilentUpdateElement(resizing.id, { x: nx, y: ny, width: nw, height: nh });
  };

  useEffect(() => {
    if (!resizing) return;
    const onUp = () => {
      const el = elements.find(e => e.id === resizing.id);
      if (el) onUpdateElement(el.id, { x: el.x, y: el.y, width: el.width, height: el.height });
      setResizing(null);
    };
    window.addEventListener('mouseup', onUp);
    return () => window.removeEventListener('mouseup', onUp);
  }, [resizing, elements]);

  const handleDragOver  = (e) => { if (showPreview) return; e.preventDefault(); e.dataTransfer.dropEffect='copy'; setDragOverCanvas(true); };
  const handleDragLeave = (e) => { if (e.target===ref.current||e.target===containerRef.current) setDragOverCanvas(false); };
  const handleDrop = (e) => {
    if (showPreview) return;
    e.preventDefault(); setDragOverCanvas(false);
    const dataUrl = e.dataTransfer.getData('application/x-icon-svg'); if (!dataUrl) return;
    const color = e.dataTransfer.getData('application/x-icon-color') || undefined;
    const { x, y } = getMousePos(e);
    const img = new window.Image();
    img.onload = () => onAddElement({ id:`icon-${Date.now()}`, type:'image', x:x-30, y:y-30, width:60, height:60, imgElement:img, src:dataUrl, opacity:1, color });
    img.src = dataUrl;
  };

  const sectionDragRef = useRef(null);
  const handleSectionMouseDown = (e, section) => {
    if (showPreview) return;
    e.stopPropagation();
    onSelectSection(section, e.currentTarget.getBoundingClientRect());
    const wr = containerRef.current.getBoundingClientRect();
    const startX = e.clientX, startY = e.clientY;
    const sx0 = section.x, sy0 = section.y;
    let lx = sx0, ly = sy0;
    sectionDragRef.current = { startX, startY, section, lastX: startX, lastY: startY };
    const onMove = (mv) => {
      sectionDragRef.current.lastX = mv.clientX; sectionDragRef.current.lastY = mv.clientY;
      lx = sx0 + (mv.clientX - startX) / wr.width;
      ly = sy0 + (mv.clientY - startY) / wr.height;
      onSilentUpdateSection(section.id, { x: lx, y: ly });
    };
    const onUp = (up) => {
      onUpdateSection(section.id, { x: lx, y: ly });
      if (onMoveSectionToOtherCanvas) {
        const sides = document.querySelectorAll('.canvas-side');
        let other = null;
        for (const s of sides) { if (s.contains(ref.current)) { for (const o of sides) { if (o!==s) { other=o; break; } } break; } }
        if (other) {
          const or = other.getBoundingClientRect();
          const cx = up.clientX||sectionDragRef.current.lastX, cy = up.clientY||sectionDragRef.current.lastY;
          if (cx>=or.left&&cx<=or.right&&cy>=or.top&&cy<=or.bottom) {
            const oc = other.querySelector('canvas');
            const ns = oc ? { ...sectionDragRef.current.section, x:(cx-oc.getBoundingClientRect().left)/oc.getBoundingClientRect().width, y:(cy-oc.getBoundingClientRect().top)/oc.getBoundingClientRect().height } : sectionDragRef.current.section;
            onMoveSectionToOtherCanvas(ns);
          }
        }
      }
      sectionDragRef.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const handleResizeMouseDown = (e, section, corner) => {
    e.stopPropagation();
    const wr = containerRef.current.getBoundingClientRect();
    const startX = e.clientX, startY = e.clientY;
    const { x: sx, y: sy, width: sw, height: sh } = section;
    let last = { x: sx, y: sy, width: sw, height: sh };
    const onMove = (mv) => {
      const dx = (mv.clientX-startX)/wr.width, dy = (mv.clientY-startY)/wr.height;
      let nx=sx, ny=sy, nw=sw, nh=sh;
      if (corner.includes('e')) nw=Math.max(0.05,Math.min(1-sx,sw+dx));
      if (corner.includes('w')) { const cdx=Math.max(-sx,Math.min(sw-0.05,dx)); nx=sx+cdx; nw=sw-cdx; }
      if (corner.includes('s')) nh=Math.max(0.05,Math.min(1-sy,sh+dy));
      if (corner.includes('n')) { const cdy=Math.max(-sy,Math.min(sh-0.05,dy)); ny=sy+cdy; nh=sh-cdy; }
      last={x:nx,y:ny,width:nw,height:nh}; onSilentUpdateSection(section.id,last);
    };
    const onUp = () => { onUpdateSection(section.id,last); window.removeEventListener('mousemove',onMove); window.removeEventListener('mouseup',onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const LayoutComponent = template?.layoutComponent;

  return (
    <div ref={containerRef} className="canvas-container">
      <div className="canvas-wrapper" style={{ position: 'relative' }}>
        <canvas
          ref={ref}
          width={CANVAS_W} height={CANVAS_H}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`canvas-element ${showPreview ? '' : 'draggable'}`}
          style={{ position:'relative', zIndex:2, background:'transparent', cursor: resizing ? `${resizing.corner}-resize` : (dragging ? 'grabbing' : 'default'), opacity: dragOverCanvas ? 0.7 : 1, transition: dragOverCanvas ? 'opacity 0.15s' : 'none' }}
        />
        <div style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', background: backgroundColor||'#ffffff', zIndex:0, pointerEvents:'none' }} />

        {LayoutComponent && (
          <div style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', zIndex:1, pointerEvents:'none', background:'transparent' }} onMouseDown={e => e.stopPropagation()}>
            <LayoutComponent template={template} isBack={isBack} containerWidth={containerWidth} userData={userData} sections={sections} selectedSection={selectedSection} onSelectSection={onSelectSection} onUpdateSection={onUpdateSection} showPreview={showPreview} backgroundColor={backgroundColor} />
          </div>
        )}

        {/* ── QR overlays — <img> tags so they're always crisp & scannable ── */}
        {elements.filter(el => el.type === 'qr').map(el => {
          const dataUrl = qrDataUrls[el.id];
          const isSelected = el.id === selectedElement;
          const scaleX = 100 / CANVAS_W, scaleY = 100 / CANVAS_H;
          return (
            <div
              key={el.id}
              onMouseDown={showPreview ? undefined : (e) => {
                e.stopPropagation(); // prevent canvas mousedown
                setSelectedElement(el.id);
                // Notify FloatingEditor
                if (typeof onElementSelect === 'function' && containerRef.current) {
                  const wr = containerRef.current.getBoundingClientRect();
                  const sx = wr.width / CANVAS_W, sy = wr.height / CANVAS_H;
                  onElementSelect(el.id, {
                    left:   wr.left + el.x * sx,
                    top:    wr.top  + el.y * sy,
                    right:  wr.left + (el.x + el.width)  * sx,
                    bottom: wr.top  + (el.y + el.height) * sy,
                    width:  el.width  * sx,
                    height: el.height * sy,
                  });
                }
                // Drag
                const wr = containerRef.current.getBoundingClientRect();
                const startMX = e.clientX, startMY = e.clientY;
                const startEX = el.x, startEY = el.y;
                let lx = startEX, ly = startEY;
                const onMove = (mv) => {
                  lx = startEX + (mv.clientX - startMX) / wr.width  * CANVAS_W;
                  ly = startEY + (mv.clientY - startMY) / wr.height * CANVAS_H;
                  onSilentUpdateElement(el.id, { x: lx, y: ly });
                };
                const onUp = () => {
                  onUpdateElement(el.id, { x: lx, y: ly });
                  window.removeEventListener('mousemove', onMove);
                  window.removeEventListener('mouseup', onUp);
                };
                window.addEventListener('mousemove', onMove);
                window.addEventListener('mouseup', onUp);
              }}
              style={{
                position: 'absolute',
                left:    `${el.x * scaleX}%`,
                top:     `${el.y * scaleY}%`,
                width:   `${el.width  * scaleX}%`,
                height:  `${el.height * scaleY}%`,
                zIndex:  5,
                opacity: el.opacity ?? 1,
                cursor:  showPreview ? 'default' : 'grab',
                boxSizing: 'border-box',
                outline: isSelected && !showPreview ? '2px solid rgba(99,102,241,0.8)' : 'none',
                outlineOffset: '2px',
              }}
            >
              {dataUrl
                ? <img src={dataUrl} alt="QR" draggable={false} style={{ width:'100%', height:'100%', display:'block', imageRendering:'pixelated', pointerEvents:'none' }} />
                : <div style={{ width:'100%', height:'100%', background:'#f3f4f6', border:'1px solid #e5e7eb' }} />
              }
              {/* Resize handles for QR */}
              {isSelected && !showPreview && ['nw','ne','sw','se'].map(corner => (
                <div
                  key={corner}
                  onMouseDown={e => {
                    e.stopPropagation();
                    const wr = containerRef.current.getBoundingClientRect();
                    const startX = e.clientX, startY = e.clientY;
                    const { x: ex, y: ey, width: ew, height: eh } = el;
                    const onMove = (mv) => {
                      const dx = (mv.clientX - startX) / wr.width  * CANVAS_W;
                      const dy = (mv.clientY - startY) / wr.height * CANVAS_H;
                      let nx=ex, ny=ey, nw=ew, nh=eh;
                      if (corner.includes('e')) nw=Math.max(20,ew+dx);
                      if (corner.includes('w')) { nw=Math.max(20,ew-dx); nx=ex+(ew-nw); }
                      if (corner.includes('s')) nh=Math.max(20,eh+dy);
                      if (corner.includes('n')) { nh=Math.max(20,eh-dy); ny=ey+(eh-nh); }
                      onSilentUpdateElement(el.id, { x:nx, y:ny, width:nw, height:nh });
                    };
                    const onUp = () => {
                      const cur = elements.find(e => e.id === el.id);
                      if (cur) onUpdateElement(cur.id, { x:cur.x, y:cur.y, width:cur.width, height:cur.height });
                      window.removeEventListener('mousemove', onMove);
                      window.removeEventListener('mouseup', onUp);
                    };
                    window.addEventListener('mousemove', onMove);
                    window.addEventListener('mouseup', onUp);
                  }}
                  style={{
                    position:'absolute', width:10, height:10,
                    background:'#6366f1', border:'2px solid white', borderRadius:'50%',
                    cursor:`${corner}-resize`, zIndex:20, pointerEvents:'all',
                    ...(corner==='nw'&&{top:-5,left:-5}), ...(corner==='ne'&&{top:-5,right:-5}),
                    ...(corner==='sw'&&{bottom:-5,left:-5}), ...(corner==='se'&&{bottom:-5,right:-5}),
                  }}
                />
              ))}
            </div>
          );
        })}

        {/* ── Section overlays ── */}
        {!showPreview && sections && sections.map(section => {
          const isSelected = selectedSection?.id === section.id;
          return (
            <div key={section.id} onMouseDown={e => handleSectionMouseDown(e, section)}
              style={{
                position:'absolute', left:`${section.x*100}%`, top:`${section.y*100}%`,
                width:`${section.width*100}%`, height:`${section.height*100}%`,
                zIndex:10, cursor:'grab', boxSizing:'border-box',
                border: isSelected ? '1.5px solid rgba(99,102,241,0.8)' : '1.5px solid transparent',
                borderRadius:'3px', background: isSelected ? 'rgba(99,102,241,0.08)' : 'transparent',
                transition:'border-color 0.15s, background 0.15s',
              }}
            >
              {isSelected && ['nw','ne','sw','se'].map(corner => (
                <div key={corner} onMouseDown={e => handleResizeMouseDown(e, section, corner)}
                  className={`resize-handle resize-${corner}`}
                  style={{
                    position:'absolute', width:10, height:10,
                    background:'#6366f1', border:'2px solid white', borderRadius:'50%',
                    cursor:`${corner}-resize`, zIndex:20,
                    ...(corner==='nw'&&{top:-5,left:-5}), ...(corner==='ne'&&{top:-5,right:-5}),
                    ...(corner==='sw'&&{bottom:-5,left:-5}), ...(corner==='se'&&{bottom:-5,right:-5}),
                  }}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
});

Canvas.displayName = 'Canvas';
export default Canvas;