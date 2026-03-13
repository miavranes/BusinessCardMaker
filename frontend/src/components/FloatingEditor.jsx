import { FONT_OPTIONS } from '../sectionSchema';
import '../css/FloatingEditor.css';
import React, { useRef, useEffect } from 'react';

export default function FloatingEditor({
  selectedSection,
  selectedElement,
  anchorRect,
  userData,
  onUpdateUserData,
  onUpdateSection,
  onUpdateElement,
  onClose,
  onLogoUpload,
  onDeleteSection,
  onDeleteElement,
  onReorderSection,
}) {
  if ((!selectedSection && !selectedElement) || !anchorRect) return null;

  const panelRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const PANEL_H = 620;
  const vh = window.innerHeight;
  const top = Math.max(16, (vh - PANEL_H) / 2);
  const style = { position: 'fixed', top, right: 16, zIndex: 9999, transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)' };

  const editingSection = !!selectedSection;
  const el = selectedElement;

  const isLogo     = editingSection && selectedSection.type === 'logo';
  const isText     = editingSection && selectedSection.type === 'text';
  const isNameField = isText && selectedSection.field === 'name';

  const isTextEl  = !editingSection && el?.type === 'text';
  const isImageEl = !editingSection && el?.type === 'image';
  const isShapeEl = !editingSection && el?.type === 'shape';
  const isQREl    = !editingSection && el?.type === 'qr';
  const isIconEl  = isImageEl && (el?.id || '').startsWith('icon-');

  const getValue = (field) => userData[field] ?? '';

  const label = editingSection
    ? (selectedSection.label || selectedSection.id)
    : isQREl    ? 'QR Code'
    : isIconEl  ? 'Icon'
    : isImageEl ? 'Image'
    : isShapeEl ? 'Shape'
    : isTextEl  ? 'Text'
    : 'Element';

  const normalize = (v) => Math.max(0.05, Math.min(1, v));

  const currentValue = editingSection ? getValue(selectedSection.field) || '' : '';
  const nonEmptyLines = currentValue.split('\n').filter(l => l.trim() !== '');
  const hasBullets = nonEmptyLines.length > 0 && nonEmptyLines.every(l => l.startsWith('• '));
  const toggleBullets = () => {
    const lines = currentValue.split('\n');
    onUpdateUserData(selectedSection.field, hasBullets
      ? lines.map(l => l.replace(/^• /, '')).join('\n')
      : lines.map(l => l.trim() === '' ? l : l.startsWith('• ') ? l : `• ${l}`).join('\n'));
  };

  const matchFont = (fontFamily) => {
    if (!fontFamily) return '';
    const exact = FONT_OPTIONS.find(f => f.value === fontFamily);
    if (exact) return exact.value;
    const stripped = fontFamily.replace(/['"]/g, '').toLowerCase().trim();
    const partial = FONT_OPTIONS.find(f =>
      f.value.replace(/['"]/g, '').toLowerCase().trim() === stripped ||
      f.value.replace(/['"]/g, '').toLowerCase().trim().startsWith(stripped.split(',')[0].trim()) ||
      stripped.startsWith(f.value.replace(/['"]/g, '').toLowerCase().trim().split(',')[0].trim())
    );
    return partial ? partial.value : '';
  };

  const Divider = () => <div className="fe-divider" />;

  const OpacityRow = ({ value, onChange }) => (
    <div className="fe-group">
      <label className="fe-label">Opacity</label>
      <div className="fe-row" style={{ alignItems: 'center', gap: 10 }}>
        <input type="range" min="0" max="1" step="0.05" value={value ?? 1}
          onChange={e => onChange(parseFloat(e.target.value))}
          style={{ flex: 1 }} />
        <span style={{ minWidth: 32, textAlign: 'right', fontSize: 12 }}>{Math.round((value ?? 1) * 100)}%</span>
      </div>
    </div>
  );

  const SizeRow = ({ el }) => (
    <div className="fe-row">
      <div className="fe-group">
        <label className="fe-label">W</label>
        <div className="fe-stepper">
          <button onClick={() => onUpdateElement(el.id, { width: Math.max(10, (el.width||60) - 5) })}>−</button>
          <span>{Math.round(el.width || 60)}</span>
          <button onClick={() => onUpdateElement(el.id, { width: (el.width||60) + 5 })}>+</button>
        </div>
      </div>
      <div className="fe-group">
        <label className="fe-label">H</label>
        <div className="fe-stepper">
          <button onClick={() => onUpdateElement(el.id, { height: Math.max(10, (el.height||60) - 5) })}>−</button>
          <span>{Math.round(el.height || 60)}</span>
          <button onClick={() => onUpdateElement(el.id, { height: (el.height||60) + 5 })}>+</button>
        </div>
      </div>
    </div>
  );

  const LayerControls = ({ id }) => (
    <>
      <Divider />
      <div className="fe-group">
        <label className="fe-label">Layer</label>
        <div className="fe-toolbar">
          <button className="fe-tool-btn" onClick={() => onReorderSection(id, 'back')}   title="To Back">⬇ Back</button>
          <button className="fe-tool-btn" onClick={() => onReorderSection(id, 'backward')} title="Backward">↓ Bwd</button>
          <button className="fe-tool-btn" onClick={() => onReorderSection(id, 'forward')}  title="Forward">↑ Fwd</button>
          <button className="fe-tool-btn" onClick={() => onReorderSection(id, 'front')}  title="To Front">⬆ Front</button>
        </div>
      </div>
    </>
  );

  return (
    <div className="floating-editor" ref={panelRef} style={style}>
      <div className="fe-header">
        <div className="fe-header-left">
          <div className="fe-header-dot" />
          <span className="fe-header-title">{label}</span>
        </div>
        <div className="fe-header-actions">
          <button className="fe-delete" onClick={() => {
            if (editingSection) onDeleteSection(selectedSection.id);
            else if (el) onDeleteElement(el.id);
            onClose();
          }}>Delete</button>
          <button className="fe-close" onClick={onClose}>Close</button>
        </div>
      </div>

      <div className="fe-body">

        {/* ═══════════════════════════════════════
            CANVAS TEXT ELEMENT
        ════════════════════════════════════════ */}
        {isTextEl && (
          <>
            <div className="fe-group">
              <label className="fe-label">Content</label>
              <textarea rows="3" value={el.content || ''}
                onChange={e => onUpdateElement(el.id, { content: e.target.value })}
                style={{ width:'100%', padding:'12px 14px', border:'2px solid #e2e8f0', borderRadius:'14px', fontSize:'14px', fontFamily:'inherit', resize:'none' }}
              />
            </div>
            <Divider />
            <div className="fe-group">
              <label className="fe-label">Font</label>
              <select value={matchFont(el.fontFamily)} onChange={e => onUpdateElement(el.id, { fontFamily: e.target.value })} style={{ fontFamily: matchFont(el.fontFamily)||'inherit' }}>
                <option value="">— Select font —</option>
                {FONT_OPTIONS.map(f => <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</option>)}
              </select>
            </div>
            <div className="fe-row">
              <div className="fe-group">
                <label className="fe-label">Size</label>
                <div className="fe-stepper">
                  <button onClick={() => onUpdateElement(el.id, { fontSize: Math.max(6,(el.fontSize||14)-1) })}>−</button>
                  <span>{el.fontSize||14}</span>
                  <button onClick={() => onUpdateElement(el.id, { fontSize: (el.fontSize||14)+1 })}>+</button>
                </div>
              </div>
              <div className="fe-group">
                <label className="fe-label">Color</label>
                <input type="color" value={el.color||'#000000'} onChange={e => onUpdateElement(el.id, { color: e.target.value })} />
              </div>
            </div>
            <div className="fe-group">
              <label className="fe-label">Style</label>
              <div className="fe-toolbar">
                <button className={`fe-tool-btn ${el.fontWeight==='bold'?'active':''}`}    onClick={() => onUpdateElement(el.id,{fontWeight: el.fontWeight==='bold'?'normal':'bold'})}><strong>B</strong></button>
                <button className={`fe-tool-btn ${el.fontStyle==='italic'?'active':''}`}   onClick={() => onUpdateElement(el.id,{fontStyle: el.fontStyle==='italic'?'normal':'italic'})}><em>I</em></button>
                <button className={`fe-tool-btn ${el.textDecoration==='underline'?'active':''}`} onClick={() => onUpdateElement(el.id,{textDecoration: el.textDecoration==='underline'?'none':'underline'})}><u>U</u></button>
              </div>
            </div>
            <div className="fe-group">
              <label className="fe-label">Align</label>
              <div className="fe-toolbar">
                <button className={`fe-tool-btn ${(el.textAlign||'left')==='left'?'active':''}`}   onClick={() => onUpdateElement(el.id,{textAlign:'left'})}>⬅</button>
                <button className={`fe-tool-btn ${el.textAlign==='center'?'active':''}`}           onClick={() => onUpdateElement(el.id,{textAlign:'center'})}>↔</button>
                <button className={`fe-tool-btn ${el.textAlign==='right'?'active':''}`}            onClick={() => onUpdateElement(el.id,{textAlign:'right'})}>➡</button>
              </div>
            </div>
            <Divider />
            <OpacityRow value={el.opacity} onChange={v => onUpdateElement(el.id,{opacity:v})} />
          </>
        )}

        {/* ═══════════════════════════════════════
            ICON ELEMENT
        ════════════════════════════════════════ */}
        {isIconEl && (
          <>
            <div className="fe-group">
              <label className="fe-label">Color</label>
              <input type="color" value={el.color||'#000000'} onChange={e => onUpdateElement(el.id,{color:e.target.value})} />
            </div>
            <Divider />
            <SizeRow el={el} />
            <Divider />
            <OpacityRow value={el.opacity} onChange={v => onUpdateElement(el.id,{opacity:v})} />
          </>
        )}

        {/* ═══════════════════════════════════════
            IMAGE ELEMENT (non-icon)
        ════════════════════════════════════════ */}
        {isImageEl && !isIconEl && (
          <>
            <SizeRow el={el} />
            <Divider />
            <OpacityRow value={el.opacity} onChange={v => onUpdateElement(el.id,{opacity:v})} />
          </>
        )}

        {/* ═══════════════════════════════════════
            SHAPE ELEMENT
        ════════════════════════════════════════ */}
        {isShapeEl && (
          <>
            <div className="fe-group">
              <label className="fe-label">Fill</label>
              <input type="color" value={el.fill||'#3b82f6'} onChange={e => onUpdateElement(el.id,{fill:e.target.value})} />
            </div>
            <div className="fe-row">
              <div className="fe-group">
                <label className="fe-label">Stroke</label>
                <input type="color" value={el.stroke||'#000000'} onChange={e => onUpdateElement(el.id,{stroke:e.target.value})} />
              </div>
              <div className="fe-group">
                <label className="fe-label">Stroke W</label>
                <div className="fe-stepper">
                  <button onClick={() => onUpdateElement(el.id,{strokeWidth:Math.max(0,(el.strokeWidth||0)-1)})}>−</button>
                  <span>{el.strokeWidth||0}</span>
                  <button onClick={() => onUpdateElement(el.id,{strokeWidth:(el.strokeWidth||0)+1})}>+</button>
                </div>
              </div>
            </div>
            <Divider />
            <SizeRow el={el} />
            <Divider />
            <OpacityRow value={el.opacity} onChange={v => onUpdateElement(el.id,{opacity:v})} />
          </>
        )}

        {/* ═══════════════════════════════════════
            QR CODE ELEMENT
        ════════════════════════════════════════ */}
        {isQREl && (
          <>
            <p style={{ fontSize:12, color:'#94a3b8', margin:'0 0 8px' }}>
              Auto-generated from your contact fields.
            </p>
            <OpacityRow value={el.opacity} onChange={v => onUpdateElement(el.id,{opacity:v})} />
          </>
        )}

        {/* ═══════════════════════════════════════
            SECTION: LOGO
        ════════════════════════════════════════ */}
        {isLogo && (
          <>
            <div className="fe-group">
              <label className="fe-label">Width (%)</label>
              <div className="fe-stepper">
                <button onClick={() => onUpdateSection(selectedSection.id,{width:normalize((selectedSection.width||0.5)-0.05)})}>−</button>
                <span>{Math.round((selectedSection.width||0.5)*100)}</span>
                <button onClick={() => onUpdateSection(selectedSection.id,{width:normalize((selectedSection.width||0.5)+0.05)})}>+</button>
              </div>
            </div>
            <div className="fe-group">
              <label className="fe-label">Height (%)</label>
              <div className="fe-stepper">
                <button onClick={() => onUpdateSection(selectedSection.id,{height:normalize((selectedSection.height||0.5)-0.05)})}>−</button>
                <span>{Math.round((selectedSection.height||0.5)*100)}</span>
                <button onClick={() => onUpdateSection(selectedSection.id,{height:normalize((selectedSection.height||0.5)+0.05)})}>+</button>
              </div>
            </div>
            <div className="fe-group">
              <label className="fe-label">Overlay Color</label>
              <input type="color" value={selectedSection.color||'#000000'} onChange={e => onUpdateSection(selectedSection.id,{color:e.target.value})} />
            </div>
            <div className="fe-group">
              <label className="fe-label">Upload Logo</label>
              <input type="file" id="logo-upload-input" hidden accept="image/*" onChange={e => { if (e.target.files[0]) onLogoUpload(e.target.files[0]); }} />
              <label htmlFor="logo-upload-input" className="fe-upload-btn">Choose File</label>
            </div>
            <LayerControls id={selectedSection.id} />
          </>
        )}

        {/* ═══════════════════════════════════════
            SECTION: TEXT
        ════════════════════════════════════════ */}
        {isText && (
          <>
            <div className="fe-group">
              <label className="fe-label">Content</label>
              {isNameField ? (
                <div className="fe-dual-input">
                  <input autoFocus type="text" placeholder="First Name" value={getValue('firstName')} onChange={e => onUpdateUserData('firstName',e.target.value)} />
                  <input type="text" placeholder="Last Name"  value={getValue('lastName')}  onChange={e => onUpdateUserData('lastName', e.target.value)} />
                </div>
              ) : (
                <textarea rows="2" value={getValue(selectedSection.field)}
                  onChange={e => onUpdateUserData(selectedSection.field, e.target.value)}
                  onKeyDown={e => {
                    if (e.key==='Enter' && hasBullets) {
                      e.preventDefault();
                      const val = getValue(selectedSection.field);
                      const { selectionStart, selectionEnd } = e.target;
                      onUpdateUserData(selectedSection.field, val.slice(0,selectionStart)+'\n• '+val.slice(selectionEnd));
                      requestAnimationFrame(() => { e.target.selectionStart = selectionStart+3; e.target.selectionEnd = selectionStart+3; });
                    }
                  }}
                  autoFocus placeholder="Enter text…"
                  style={{ width:'100%', padding:'12px 14px', border:'2px solid #e2e8f0', borderRadius:'14px', fontSize:'14px', fontFamily:'inherit', resize:'none' }}
                />
              )}
            </div>
            <Divider />
            <div className="fe-group">
              <label className="fe-label">Font</label>
              <select value={matchFont(selectedSection.fontFamily)} onChange={e => onUpdateSection(selectedSection.id,{fontFamily:e.target.value})} style={{ fontFamily: matchFont(selectedSection.fontFamily)||'inherit' }}>
                <option value="">— Select font —</option>
                {FONT_OPTIONS.map(f => <option key={f.value} value={f.value} style={{fontFamily:f.value}}>{f.label}</option>)}
              </select>
            </div>
            <div className="fe-row">
              <div className="fe-group">
                <label className="fe-label">Size</label>
                <div className="fe-stepper">
                  <button onClick={() => onUpdateSection(selectedSection.id,{fontSize:Math.max(6,(selectedSection.fontSize||12)-1)})}>−</button>
                  <span>{selectedSection.fontSize||12}</span>
                  <button onClick={() => onUpdateSection(selectedSection.id,{fontSize:(selectedSection.fontSize||12)+1})}>+</button>
                </div>
              </div>
              <div className="fe-group">
                <label className="fe-label">Color</label>
                <input type="color" value={selectedSection.color||'#000000'} onChange={e => onUpdateSection(selectedSection.id,{color:e.target.value})} />
              </div>
            </div>
            <Divider />
            <div className="fe-group">
              <label className="fe-label">Style</label>
              <div className="fe-toolbar">
                <button className={`fe-tool-btn ${selectedSection.fontWeight==='bold'?'active':''}`}          onClick={() => onUpdateSection(selectedSection.id,{fontWeight:selectedSection.fontWeight==='bold'?'normal':'bold'})}><strong>B</strong></button>
                <button className={`fe-tool-btn ${selectedSection.fontStyle==='italic'?'active':''}`}         onClick={() => onUpdateSection(selectedSection.id,{fontStyle:selectedSection.fontStyle==='italic'?'normal':'italic'})}><em>I</em></button>
                <button className={`fe-tool-btn ${selectedSection.textDecoration==='underline'?'active':''}`} onClick={() => onUpdateSection(selectedSection.id,{textDecoration:selectedSection.textDecoration==='underline'?'none':'underline'})}><u>U</u></button>
                {!isNameField && <button className={`fe-tool-btn ${hasBullets?'active':''}`} onClick={toggleBullets} title="Bullet list">•≡</button>}
              </div>
            </div>
            <div className="fe-group">
              <label className="fe-label">Align</label>
              <div className="fe-toolbar">
                <button className={`fe-tool-btn ${(selectedSection.textAlign||'left')==='left'?'active':''}`}  onClick={() => onUpdateSection(selectedSection.id,{textAlign:'left'})}>⬅</button>
                <button className={`fe-tool-btn ${selectedSection.textAlign==='center'?'active':''}`}          onClick={() => onUpdateSection(selectedSection.id,{textAlign:'center'})}>↔</button>
                <button className={`fe-tool-btn ${selectedSection.textAlign==='right'?'active':''}`}           onClick={() => onUpdateSection(selectedSection.id,{textAlign:'right'})}>➡</button>
              </div>
            </div>
            <Divider />
            <div className="fe-group">
              <label className="fe-label">Shadow</label>
              <div className="fe-row">
                <div style={{flex:'0 0 100px'}}>
                  <div className="fe-stepper">
                    <button onClick={() => onUpdateSection(selectedSection.id,{textShadowBlur:Math.max(0,(selectedSection.textShadowBlur||0)-1)})}>−</button>
                    <span>{selectedSection.textShadowBlur||0}</span>
                    <button onClick={() => onUpdateSection(selectedSection.id,{textShadowBlur:(selectedSection.textShadowBlur||0)+1})}>+</button>
                  </div>
                </div>
                <input type="color" value={selectedSection.textShadowColor||'#000000'} onChange={e => onUpdateSection(selectedSection.id,{textShadowColor:e.target.value})} />
              </div>
            </div>
            <div className="fe-group">
              <label className="fe-label">Stroke</label>
              <div className="fe-row">
                <div style={{flex:'0 0 100px'}}>
                  <div className="fe-stepper">
                    <button onClick={() => onUpdateSection(selectedSection.id,{textStrokeWidth:Math.max(0,(selectedSection.textStrokeWidth||0)-0.5)})}>−</button>
                    <span>{(selectedSection.textStrokeWidth||0).toFixed(1)}</span>
                    <button onClick={() => onUpdateSection(selectedSection.id,{textStrokeWidth:Math.min(10,(selectedSection.textStrokeWidth||0)+0.5)})}>+</button>
                  </div>
                </div>
                <input type="color" value={selectedSection.textStrokeColor||'#000000'} onChange={e => onUpdateSection(selectedSection.id,{textStrokeColor:e.target.value})} />
              </div>
            </div>
            <LayerControls id={selectedSection.id} />
          </>
        )}

      </div>
    </div>
  );
}