import { useState, useRef, useEffect, useMemo, forwardRef, useCallback } from 'react';
import QRCode from 'qrcode';
import '../css/Canvas.css';

const CANVAS_W = 580;
const CANVAS_H = 330;

// Returns true if the point is inside any .canvas-side element
function isInsideAnyCanvas(clientX, clientY) {
  const sides = document.querySelectorAll('.canvas-side');
  for (const s of sides) {
    const r = s.getBoundingClientRect();
    if (clientX >= r.left && clientX <= r.right &&
        clientY >= r.top  && clientY <= r.bottom) {
      return true;
    }
  }
  return false;
}

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
  onDropElementOutside,
  onDropSectionOutside,
}, ref) => {
  const containerRef = useRef(null);
  const [dragging, setDragging] = useState(null);
  const [containerWidth, setContainerWidth] = useState(400);
  const [resizing, setResizing] = useState(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [dragOverCanvas, setDragOverCanvas] = useState(false);
  const [qrDataUrls, setQrDataUrls] = useState({});

  const onSilentUpdateElementRef = useRef(onSilentUpdateElement);
  useEffect(() => { onSilentUpdateElementRef.current = onSilentUpdateElement; }, [onSilentUpdateElement]);

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
  // POPRAVKA: errorCorrectionLevel: 'L' umjesto 'M'
  // Level L = najviše kapaciteta (~41% više od M), dovoljno za kontakt kartice
  // margin: 1 umjesto 2 = još malo manje podataka, ali QR ostaje čitljiv
  const qrKey = elements.filter(e => e.type === 'qr').map(e => e.id + e.vcardString).join('|');
  useEffect(() => {
    const qrEls = elements.filter(el => el.type === 'qr' && el.vcardString);
    if (!qrEls.length) { setQrDataUrls({}); return; }
    qrEls.forEach(el => {
      QRCode.toDataURL(el.vcardString, {
        width: 512,
        margin: 4,                    // ← quiet zone mora biti min 4 modula, iPhone kamera to zahtijeva
        errorCorrectionLevel: 'L',    // ← KLJUČNA PROMJENA: 'M' → 'L'
        color: { dark: el.qrFg || '#000000', light: el.qrBg || '#ffffff' },
      }).then(url => setQrDataUrls(prev => ({ ...prev, [el.id]: url })))
        .catch(err => console.error('QR generation failed:', err));
    });
  }, [qrKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Reconstruct imgElement from src when missing ──
  const imageReconstructKey = useMemo(
    () => elements.map(e => e.id + (e.imgElement ? '1' : '0')).join(','),
    [elements]
  );
  useEffect(() => {
    const imageEls = elements.filter(el => el.type === 'image' && !el.imgElement && el.src);
    if (!imageEls.length) return;
    imageEls.forEach(el => {
      const img = new window.Image();
      img.onload = () => onSilentUpdateElementRef.current(el.id, { imgElement: img });
      img.src = el.src;
    });
  }, [imageReconstructKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Canvas draw loop ──
  useEffect(() => {
    const canvas = ref?.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    if (!template?.layoutComponent) {
      ctx.fillStyle = backgroundColor || '#ffffff';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    }

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
      if      (el.type === 'text')                   drawText(ctx, el);
      else if (el.type === 'shape')                  drawShape(ctx, el);
      else if (el.type === 'image' && el.imgElement) drawImage(ctx, el);
      else if (el.type === 'image' && !el.imgElement) {
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(el.x, el.y, el.width||60, el.height||60);
        ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1;
        ctx.strokeRect(el.x, el.y, el.width||60, el.height||60);
      }
      ctx.restore();
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
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    if (el.color) {
      ctx.drawImage(el.imgElement, el.x, el.y, el.width, el.height);
      ctx.globalCompositeOperation = 'source-in';
      ctx.fillStyle = el.color;
      ctx.fillRect(el.x, el.y, el.width, el.height);
      ctx.globalCompositeOperation = 'source-over';
    } else {
      ctx.drawImage(el.imgElement, el.x, el.y, el.width, el.height);
    }
  }

  function getBounds(el) {
    if (el.type === 'text') {
      if (el.width && el.height) {
        return { x: el.x, y: el.y, w: el.width, h: el.height };
      }
      const canvas = ref?.current; if (!canvas) return { x:0,y:0,w:0,h:0 };
      const ctx = canvas.getContext('2d');
      ctx.font = `${el.fontStyle||'normal'} ${el.fontWeight||'normal'} ${el.fontSize}px ${el.fontFamily}`;
      const lines = (el.content || '').split('\n');
      const lh = el.fontSize*(el.lineHeight||1.2);
      let maxW = 0; lines.forEach(l => { maxW = Math.max(maxW, ctx.measureText(l).width); });
      return { x: el.x, y: el.y, w: Math.max(maxW, 30), h: Math.max(lines.length * lh, 30) };
    }
    return { x: el.x, y: el.y, w: el.width||80, h: el.height||80 };
  }

  function getMousePos(e) {
    const rect = ref.current.getBoundingClientRect();
    return { x: (e.clientX - rect.left) * (CANVAS_W / rect.width), y: (e.clientY - rect.top) * (CANVAS_H / rect.height) };
  }

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

  function startElementDrag(e, el) {
    const canvasRect = ref.current.getBoundingClientRect();
    const startMX = e.clientX, startMY = e.clientY;
    const origX = el.x, origY = el.y;
    let lx = origX, ly = origY;
    let lastCX = e.clientX, lastCY = e.clientY;
    let hasMoved = false;
    let overCanvas = true;

    const onMove = (mv) => {
      hasMoved = true;
      lastCX = mv.clientX;
      lastCY = mv.clientY;
      overCanvas = isInsideAnyCanvas(mv.clientX, mv.clientY);

      lx = origX + (mv.clientX - startMX) / canvasRect.width  * CANVAS_W;
      ly = origY + (mv.clientY - startMY) / canvasRect.height * CANVAS_H;
      onSilentUpdateElement(el.id, { x: lx, y: ly });

      if (typeof onDragElement === 'function') {
        let targetSide = isBack ? 'back' : 'front', targetRect = canvasRect;
        document.querySelectorAll('.canvas-side').forEach(side => {
          const cr = side.getBoundingClientRect();
          if (mv.clientX >= cr.left && mv.clientX <= cr.right && mv.clientY >= cr.top && mv.clientY <= cr.bottom) {
            if (!side.contains(ref.current)) {
              targetSide = isBack ? 'front' : 'back';
              const oc = side.querySelector('canvas');
              if (oc) targetRect = oc.getBoundingClientRect();
            }
          }
        });
        onDragElement(el, {
          x: (mv.clientX - targetRect.left) * (CANVAS_W / targetRect.width),
          y: (mv.clientY - targetRect.top)  * (CANVAS_H / targetRect.height),
        }, targetSide);
      }
    };

    const onUp = (up) => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      if (typeof onDragEnd === 'function') onDragEnd();

      if (!hasMoved) {
        onUpdateElement(el.id, { x: origX, y: origY });
        setDragging(null);
        return;
      }

      if (!overCanvas) {
        if (typeof onDropElementOutside === 'function') {
          onDropElementOutside(el.id);
        } else {
          onSilentUpdateElement(el.id, { x: origX, y: origY });
          onUpdateElement(el.id, { x: origX, y: origY });
        }
        setDragging(null);
        return;
      }

      onUpdateElement(el.id, { x: lx, y: ly });

      if (onMoveElementToOtherCanvas) {
        const sides = document.querySelectorAll('.canvas-side');
        let other = null;
        for (const s of sides) {
          if (s.contains(ref.current)) {
            for (const o of sides) { if (o !== s) { other = o; break; } }
            break;
          }
        }
        if (other) {
          const or = other.getBoundingClientRect();
          if (lastCX >= or.left && lastCX <= or.right && lastCY >= or.top && lastCY <= or.bottom) {
            const oc = other.querySelector('canvas');
            const ocRect = oc?.getBoundingClientRect();
            const moved = ocRect
              ? { ...el, x: (lastCX - ocRect.left) * (CANVAS_W / ocRect.width), y: (lastCY - ocRect.top) * (CANVAS_H / ocRect.height) }
              : el;
            onMoveElementToOtherCanvas(moved);
          }
        }
      }

      setDragging(null);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    if (typeof onDragElement === 'function') onDragElement(el, { x: origX, y: origY }, isBack ? 'back' : 'front');
  }

  const handleMouseDown = (e) => {
    if (showPreview) return;
    const { x, y } = getMousePos(e);

    if (selectedElement) {
      const el = elements.find(el => el.id === selectedElement);
      if (el && el.type !== 'qr') {
        const b = getBounds(el);
        const corners = [
          { name: 'nw', cx: b.x-5,     cy: b.y-5     },
          { name: 'ne', cx: b.x+b.w+5, cy: b.y-5     },
          { name: 'sw', cx: b.x-5,     cy: b.y+b.h+5 },
          { name: 'se', cx: b.x+b.w+5, cy: b.y+b.h+5 },
        ];
        for (const c of corners) {
          if (Math.hypot(x - c.cx, y - c.cy) <= 10) {
            setResizing({ id: el.id, corner: c.name });
            setResizeStart({ x: el.x, y: el.y, width: el.width||b.w, height: el.height||b.h, mouseX: x, mouseY: y });
            return;
          }
        }
      }
    }

    for (let i = elements.length - 1; i >= 0; i--) {
      const el = elements[i];
      if (el.type === 'qr') continue;
      const b = getBounds(el);
      if (x >= b.x && x <= b.x+b.w && y >= b.y && y <= b.y+b.h) {
        setSelectedElement(el.id);
        setDragging(el.id);
        notifySelect(el);
        startElementDrag(e, el);
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
    const origSX = section.x, origSY = section.y;
    let lx = origSX, ly = origSY;
    let hasMoved = false;
    let overCanvas = true;
    sectionDragRef.current = { startX, startY, section, lastX: startX, lastY: startY };

    const onMove = (mv) => {
      hasMoved = true;
      overCanvas = isInsideAnyCanvas(mv.clientX, mv.clientY);
      sectionDragRef.current.lastX = mv.clientX;
      sectionDragRef.current.lastY = mv.clientY;
      lx = origSX + (mv.clientX - startX) / wr.width;
      ly = origSY + (mv.clientY - startY) / wr.height;
      onSilentUpdateSection(section.id, { x: lx, y: ly });
    };

    const onUp = () => {
      if (!hasMoved) {
        onUpdateSection(section.id, { x: origSX, y: origSY });
        sectionDragRef.current = null;
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        return;
      }

      if (!overCanvas) {
        if (typeof onDropSectionOutside === 'function') {
          onDropSectionOutside(section.id);
        } else {
          onSilentUpdateSection(section.id, { x: origSX, y: origSY });
          onUpdateSection(section.id, { x: origSX, y: origSY });
        }
        sectionDragRef.current = null;
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        return;
      }

      onUpdateSection(section.id, { x: lx, y: ly });

      if (onMoveSectionToOtherCanvas) {
        const lastCX = sectionDragRef.current.lastX;
        const lastCY = sectionDragRef.current.lastY;
        const sides = document.querySelectorAll('.canvas-side');
        let other = null;
        for (const s of sides) { if (s.contains(ref.current)) { for (const o of sides) { if (o !== s) { other = o; break; } } break; } }
        if (other) {
          const or = other.getBoundingClientRect();
          if (lastCX >= or.left && lastCX <= or.right && lastCY >= or.top && lastCY <= or.bottom) {
            const oc = other.querySelector('canvas');
            const ocRect = oc?.getBoundingClientRect();
            const ns = ocRect
              ? { ...sectionDragRef.current.section, x: (lastCX - ocRect.left) / ocRect.width, y: (lastCY - ocRect.top) / ocRect.height }
              : sectionDragRef.current.section;
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

  const handleSectionResizeMouseDown = (e, section, corner) => {
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
    const onUp = () => {
      onUpdateSection(section.id,last);
      window.removeEventListener('mousemove',onMove);
      window.removeEventListener('mouseup',onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const handleElementResizeMouseDown = (e, el, corner) => {
    e.stopPropagation();
    const wr = containerRef.current.getBoundingClientRect();
    const startX = e.clientX, startY = e.clientY;
    const { x: ex, y: ey, width: ew, height: eh } = el;
    const bw = ew || getBounds(el).w;
    const bh = eh || getBounds(el).h;
    const onMove = (mv) => {
      const dx = (mv.clientX - startX) / wr.width  * CANVAS_W;
      const dy = (mv.clientY - startY) / wr.height * CANVAS_H;
      let nx=ex, ny=ey, nw=bw, nh=bh;
      if (corner.includes('e')) nw=Math.max(20,bw+dx);
      if (corner.includes('w')) { nw=Math.max(20,bw-dx); nx=ex+(bw-nw); }
      if (corner.includes('s')) nh=Math.max(20,bh+dy);
      if (corner.includes('n')) { nh=Math.max(20,bh-dy); ny=ey+(bh-nh); }
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
  };

  const LayoutComponent = template?.layoutComponent;

  const resizeDot = (corner) => ({
    position: 'absolute', width: 10, height: 10,
    background: '#6366f1', border: '2px solid white', borderRadius: '50%',
    cursor: `${corner}-resize`, zIndex: 20, pointerEvents: 'all',
    ...(corner==='nw' && { top: -5, left: -5 }),
    ...(corner==='ne' && { top: -5, right: -5 }),
    ...(corner==='sw' && { bottom: -5, left: -5 }),
    ...(corner==='se' && { bottom: -5, right: -5 }),
  });

  const selectionOverlayStyle = (isSelected) => ({
    border: isSelected ? '1.5px solid rgba(99,102,241,0.8)' : '1.5px solid transparent',
    borderRadius: '3px',
    background: isSelected ? 'rgba(99,102,241,0.08)' : 'transparent',
    transition: 'border-color 0.15s, background 0.15s',
  });

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
          style={{
            position: 'relative', zIndex: 2, background: 'transparent',
            cursor: resizing ? `${resizing.corner}-resize` : (dragging ? 'grabbing' : 'default'),
            opacity: dragOverCanvas ? 0.7 : 1,
            transition: dragOverCanvas ? 'opacity 0.15s' : 'none',
          }}
        />

        {!LayoutComponent && (
          <div style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', background: backgroundColor||'#ffffff', zIndex:0, pointerEvents:'none' }} />
        )}

        {LayoutComponent && (
          <div
            className="layout-component-wrapper"
            style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', zIndex:1, pointerEvents:'none', background:'transparent' }}
            onMouseDown={e => e.stopPropagation()}
          >
            <LayoutComponent
              template={template} isBack={isBack} containerWidth={containerWidth}
              userData={userData} sections={sections} selectedSection={selectedSection}
              onSelectSection={onSelectSection} onUpdateSection={onUpdateSection}
              showPreview={showPreview} backgroundColor={backgroundColor}
            />
          </div>
        )}

        {/* ── QR overlays ── */}
        {elements.filter(el => el.type === 'qr').map(el => {
          const dataUrl = qrDataUrls[el.id];
          const isSelected = el.id === selectedElement;
          const scaleX = 100 / CANVAS_W, scaleY = 100 / CANVAS_H;
          return (
            <div
              key={el.id}
              data-qr-id={el.id}
              onMouseDown={showPreview ? undefined : (e) => {
                e.stopPropagation();
                setSelectedElement(el.id);
                if (typeof onElementSelect === 'function' && containerRef.current) {
                  const wr = containerRef.current.getBoundingClientRect();
                  const sx = wr.width / CANVAS_W, sy = wr.height / CANVAS_H;
                  onElementSelect(el.id, {
                    left:   wr.left + el.x * sx, top:    wr.top  + el.y * sy,
                    right:  wr.left + (el.x + el.width) * sx, bottom: wr.top + (el.y + el.height) * sy,
                    width:  el.width * sx, height: el.height * sy,
                  });
                }
                startElementDrag(e, el);
              }}
              style={{
                position: 'absolute',
                left: `${el.x * scaleX}%`, top: `${el.y * scaleY}%`,
                width: `${el.width * scaleX}%`, height: `${el.height * scaleY}%`,
                zIndex: 5, opacity: el.opacity ?? 1,
                cursor: showPreview ? 'default' : 'grab',
                boxSizing: 'border-box',
                ...selectionOverlayStyle(isSelected && !showPreview),
              }}
            >
              {dataUrl
                ? <img src={dataUrl} alt="QR" draggable={false} style={{ width:'100%', height:'100%', display:'block', imageRendering:'auto', pointerEvents:'none' }} />
                : <div style={{ width:'100%', height:'100%', background:'#f3f4f6', border:'1px solid #e5e7eb' }} />
              }
              {isSelected && !showPreview && ['nw','ne','sw','se'].map(corner => (
                <div key={corner} onMouseDown={e => { e.stopPropagation(); handleElementResizeMouseDown(e, el, corner); }} style={resizeDot(corner)} />
              ))}
            </div>
          );
        })}

        {/* ── HTML selection overlays for non-QR canvas elements ── */}
        {!showPreview && elements.filter(el => el.type !== 'qr').map(el => {
          const isSelected = el.id === selectedElement;
          if (!isSelected) return null;
          const b = getBounds(el);
          return (
            <div
              key={`overlay-${el.id}`}
              style={{
                position: 'absolute',
                left:   `${(b.x / CANVAS_W) * 100}%`,
                top:    `${(b.y / CANVAS_H) * 100}%`,
                width:  `${(b.w / CANVAS_W) * 100}%`,
                height: `${(b.h / CANVAS_H) * 100}%`,
                zIndex: 8, boxSizing: 'border-box', pointerEvents: 'none',
                border: '1.5px solid rgba(99,102,241,0.8)',
                borderRadius: '3px', background: 'rgba(99,102,241,0.08)',
              }}
            >
              {['nw','ne','sw','se'].map(corner => (
                <div key={corner} onMouseDown={e => { e.stopPropagation(); handleElementResizeMouseDown(e, el, corner); }} style={{ ...resizeDot(corner), pointerEvents: 'all' }} />
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
                ...selectionOverlayStyle(isSelected),
              }}
            >
              {isSelected && ['nw','ne','sw','se'].map(corner => (
                <div key={corner} onMouseDown={e => handleSectionResizeMouseDown(e, section, corner)}
                  className={`resize-handle resize-${corner}`}
                  style={resizeDot(corner)}
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