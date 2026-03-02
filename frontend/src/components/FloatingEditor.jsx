import { FONT_OPTIONS } from '../sectionSchema';
import '../css/FloatingEditor.css';
import React from 'react';

export default function FloatingEditor({
  selectedSection,
  anchorRect,
  userData,
  onUpdateUserData,
  onUpdateSection,
  onClose,
  onLogoUpload,
  onDeleteSection
}) {
  if (!selectedSection || !anchorRect) return null;

  const PANEL_W = 340;
  const PANEL_H = 600;
  const GAP = 16;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let left, top;
  
  if (anchorRect.right + GAP + PANEL_W <= vw - 16) {
    left = anchorRect.right + GAP;
    top = Math.max(16, Math.min(anchorRect.top, vh - PANEL_H - 16));
  } else if (anchorRect.left - GAP - PANEL_W >= 16) {
    left = anchorRect.left - PANEL_W - GAP;
    top = Math.max(16, Math.min(anchorRect.top, vh - PANEL_H - 16));
  } else {
    left = Math.max(16, (vw - PANEL_W) / 2);
    top = Math.max(16, (vh - PANEL_H) / 2);
  }

  const style = { position: 'fixed', top, left, zIndex: 9999 };
  
  const isOnRight = left > anchorRect.right;
  const isOnLeft = left + PANEL_W < anchorRect.left;
  const isCentered = !isOnRight && !isOnLeft;

  const isLogo = selectedSection.type === 'logo';
  const isText = selectedSection.type === 'text';
  const isNameField = selectedSection.field === 'name';

  const getValue = (field) => userData[field] ?? '';
  const sectionLabel = selectedSection.label || selectedSection.id;

  const normalize = (val) => Math.max(0.05, Math.min(1, val));

  const currentValue = getValue(selectedSection.field) || '';
  const nonEmptyLines = currentValue.split('\n').filter(l => l.trim() !== '');
  const hasBullets = nonEmptyLines.length > 0 && nonEmptyLines.every(l => l.startsWith('• '));

  const toggleBullets = () => {
    const lines = currentValue.split('\n');
    const toggled = hasBullets
      ? lines.map(l => l.replace(/^• /, '')).join('\n')
      : lines.map(l => l.trim() === '' ? l : l.startsWith('• ') ? l : `• ${l}`).join('\n');
    onUpdateUserData(selectedSection.field, toggled);
  };

  return (
    <div className="floating-editor" style={style} onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>
      {!isCentered && (
        <div 
          className="fe-connector"
          style={{
            position: 'absolute',
            [isOnRight ? 'left' : 'right']: '-8px',
            top: Math.max(60, Math.min(anchorRect.top - top + anchorRect.height / 2, PANEL_H - 60)),
            width: '8px',
            height: '8px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            transform: 'rotate(45deg)',
            boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
          }}
        />
      )}
      
      <div className="fe-header">
        <div className="fe-header-left">
          <div className="fe-header-dot" />
          <span className="fe-header-title">{sectionLabel}</span>
        </div>
        <div className="fe-header-actions">
          <button className="fe-delete" onClick={() => { onDeleteSection(selectedSection.id); onClose(); }}>Delete</button>
          <button className="fe-close" onClick={onClose}>Close</button>
        </div>
      </div>

      <div className="fe-body">

        {isLogo && (
          <>
            <div className="fe-group">
              <label className="fe-label">Width (%)</label>
              <div className="fe-stepper">
                <button onClick={() => onUpdateSection(selectedSection.id, { width: normalize((selectedSection.width || 0.5) - 0.05) })}>−</button>
                <span>{Math.round((selectedSection.width || 0.5) * 100)}</span>
                <button onClick={() => onUpdateSection(selectedSection.id, { width: normalize((selectedSection.width || 0.5) + 0.05) })}>+</button>
              </div>
            </div>

            <div className="fe-group">
              <label className="fe-label">Height (%)</label>
              <div className="fe-stepper">
                <button onClick={() => onUpdateSection(selectedSection.id, { height: normalize((selectedSection.height || 0.5) - 0.05) })}>−</button>
                <span>{Math.round((selectedSection.height || 0.5) * 100)}</span>
                <button onClick={() => onUpdateSection(selectedSection.id, { height: normalize((selectedSection.height || 0.5) + 0.05) })}>+</button>
              </div>
            </div>

            <div className="fe-group">
              <label className="fe-label">Overlay Color</label>
              <input
                type="color"
                value={selectedSection.color || '#000000'}
                onChange={e => onUpdateSection(selectedSection.id, { color: e.target.value })}
              />
            </div>

            <div className="fe-group">
              <label className="fe-label">Upload Logo</label>
              <input
                type="file"
                id="logo-upload-input"
                hidden
                accept="image/*"
                onChange={e => { if (e.target.files[0]) onLogoUpload(e.target.files[0]); }}
              />
              <label htmlFor="logo-upload-input" className="fe-upload-btn">Choose File</label>
            </div>
          </>
        )}

        {isText && (
          <>
            <div className="fe-group">
              <label className="fe-label">Content</label>
              {isNameField ? (
                <div className="fe-dual-input">
                  <input type="text" placeholder="First Name" value={getValue('firstName')} onChange={e => onUpdateUserData('firstName', e.target.value)} />
                  <input type="text" placeholder="Last Name" value={getValue('lastName')} onChange={e => onUpdateUserData('lastName', e.target.value)} />
                </div>
              ) : (
                <textarea 
                  rows="2"
                  value={getValue(selectedSection.field)} 
                  onChange={e => {
                    console.log('Updating field:', selectedSection.field, 'with value:', e.target.value);
                    onUpdateUserData(selectedSection.field, e.target.value);
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && hasBullets) {
                      e.preventDefault();
                      const val = getValue(selectedSection.field);
                      const { selectionStart, selectionEnd } = e.target;
                      const newVal =
                        val.slice(0, selectionStart) + '\n• ' + val.slice(selectionEnd);
                      onUpdateUserData(selectedSection.field, newVal);
                      requestAnimationFrame(() => {
                        e.target.selectionStart = selectionStart + 3;
                        e.target.selectionEnd = selectionStart + 3;
                      });
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '14px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    resize: 'none',
                  }}
                />
              )}
            </div>

            <div className="fe-divider" />
            <div className="fe-group">
              <label className="fe-label">Font</label>
              <select value={selectedSection.fontFamily || ''} onChange={e => onUpdateSection(selectedSection.id, { fontFamily: e.target.value })}>
                {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>

            <div className="fe-row">
              <div className="fe-group">
                <label className="fe-label">Size</label>
                <div className="fe-stepper">
                  <button onClick={() => onUpdateSection(selectedSection.id, { fontSize: Math.max(6, (selectedSection.fontSize || 12) - 1) })}>−</button>
                  <span>{selectedSection.fontSize || 12}</span>
                  <button onClick={() => onUpdateSection(selectedSection.id, { fontSize: (selectedSection.fontSize || 12) + 1 })}>+</button>
                </div>
              </div>

              <div className="fe-group">
                <label className="fe-label">Color</label>
                <input
                  type="color"
                  value={selectedSection.color || '#000000'}
                  onChange={e => onUpdateSection(selectedSection.id, { color: e.target.value })}
                />
              </div>
            </div>

            <div className="fe-divider" />
            <div className="fe-group">
              <label className="fe-label">Style</label>
              <div className="fe-toolbar">
                <button 
                  className={`fe-tool-btn ${selectedSection.fontWeight === 'bold' ? 'active' : ''}`}
                  onClick={() => onUpdateSection(selectedSection.id, { fontWeight: selectedSection.fontWeight === 'bold' ? 'normal' : 'bold' })}
                  title="Bold"
                >
                  <strong>B</strong>
                </button>
                <button 
                  className={`fe-tool-btn ${selectedSection.fontStyle === 'italic' ? 'active' : ''}`}
                  onClick={() => onUpdateSection(selectedSection.id, { fontStyle: selectedSection.fontStyle === 'italic' ? 'normal' : 'italic' })}
                  title="Italic"
                >
                  <em>I</em>
                </button>
                <button 
                  className={`fe-tool-btn ${selectedSection.textDecoration === 'underline' ? 'active' : ''}`}
                  onClick={() => onUpdateSection(selectedSection.id, { textDecoration: selectedSection.textDecoration === 'underline' ? 'none' : 'underline' })}
                  title="Underline"
                >
                  <u>U</u>
                </button>
                {!isNameField && (
                  <button
                    className={`fe-tool-btn ${hasBullets ? 'active' : ''}`}
                    onClick={toggleBullets}
                    title="Bullet lista"
                  >
                    •≡
                  </button>
                )}
              </div>
            </div>

            <div className="fe-group">
              <label className="fe-label">Align</label>
              <div className="fe-toolbar">
                <button 
                  className={`fe-tool-btn ${(selectedSection.textAlign || 'left') === 'left' ? 'active' : ''}`}
                  onClick={() => onUpdateSection(selectedSection.id, { textAlign: 'left' })}
                  title="Left"
                >
                  ⬅
                </button>
                <button 
                  className={`fe-tool-btn ${selectedSection.textAlign === 'center' ? 'active' : ''}`}
                  onClick={() => onUpdateSection(selectedSection.id, { textAlign: 'center' })}
                  title="Center"
                >
                  ↔
                </button>
                <button 
                  className={`fe-tool-btn ${selectedSection.textAlign === 'right' ? 'active' : ''}`}
                  onClick={() => onUpdateSection(selectedSection.id, { textAlign: 'right' })}
                  title="Right"
                >
                  ➡
                </button>
              </div>
            </div>

            <div className="fe-divider" />
            <div className="fe-group">
              <label className="fe-label">Shadow</label>
              <div className="fe-row">
                <div style={{ flex: '0 0 100px' }}>
                  <div className="fe-stepper">
                    <button onClick={() => onUpdateSection(selectedSection.id, { textShadowBlur: Math.max(0, (selectedSection.textShadowBlur || 0) - 1) })}>−</button>
                    <span>{selectedSection.textShadowBlur || 0}</span>
                    <button onClick={() => onUpdateSection(selectedSection.id, { textShadowBlur: (selectedSection.textShadowBlur || 0) + 1 })}>+</button>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <input
                    type="color"
                    value={selectedSection.textShadowColor || '#000000'}
                    onChange={e => onUpdateSection(selectedSection.id, { textShadowColor: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="fe-group">
              <label className="fe-label">Stroke</label>
              <div className="fe-row">
                <div style={{ flex: '0 0 100px' }}>
                  <div className="fe-stepper">
                    <button onClick={() => onUpdateSection(selectedSection.id, { textStrokeWidth: Math.max(0, (selectedSection.textStrokeWidth || 0) - 0.5) })}>−</button>
                    <span>{(selectedSection.textStrokeWidth || 0).toFixed(1)}</span>
                    <button onClick={() => onUpdateSection(selectedSection.id, { textStrokeWidth: Math.min(10, (selectedSection.textStrokeWidth || 0) + 0.5) })}>+</button>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <input
                    type="color"
                    value={selectedSection.textStrokeColor || '#000000'}
                    onChange={e => onUpdateSection(selectedSection.id, { textStrokeColor: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}