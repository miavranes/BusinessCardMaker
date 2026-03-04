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
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const editingSection = !!selectedSection;
  const editingElement = !!selectedElement;

  const PANEL_H = 600;
  const vh = window.innerHeight;

  const top = Math.max(16, (vh - PANEL_H) / 2);
  const style = { position: 'fixed', top, right: 16, zIndex: 9999, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' };

  const isCentered = true;

  const isLogo = editingSection && selectedSection.type === 'logo';
  const isText = editingSection && selectedSection.type === 'text';
  const isNameField = editingSection && selectedSection.field === 'name';

  const getValue = (field) => userData[field] ?? '';
  const sectionLabel = editingSection
    ? (selectedSection.label || selectedSection.id)
    : (editingElement
        ? (((selectedElement.type === 'image' && (selectedElement.id || '').startsWith('icon-'))
            || selectedElement.type === 'icon')
            ? 'Icon'
            : 'Element')
        : 'Element');

  const normalize = (val) => Math.max(0.05, Math.min(1, val));

  const currentValue = editingSection ? getValue(selectedSection.field) || '' : '';
  const nonEmptyLines = currentValue.split('\n').filter(l => l.trim() !== '');
  const hasBullets = nonEmptyLines.length > 0 && nonEmptyLines.every(l => l.startsWith('• '));

  const toggleBullets = () => {
    const lines = currentValue.split('\n');
    const toggled = hasBullets
      ? lines.map(l => l.replace(/^• /, '')).join('\n')
      : lines.map(l => l.trim() === '' ? l : l.startsWith('• ') ? l : `• ${l}`).join('\n');
    onUpdateUserData(selectedSection.field, toggled);
  };

  const LayerControls = () => (
    <>
      <div className="fe-divider" />
      <div className="fe-group">
        <label className="fe-label">Layer</label>
        <div className="fe-toolbar">
          <button
            className="fe-tool-btn"
            onClick={() => onReorderSection(selectedSection.id, 'back')}
            title="To Back"
          >⬇ Back</button>
          <button
            className="fe-tool-btn"
            onClick={() => onReorderSection(selectedSection.id, 'backward')}
            title="Move Backward"
          >↓ Backward</button>
          <button
            className="fe-tool-btn"
            onClick={() => onReorderSection(selectedSection.id, 'forward')}
            title="Move Forward"
          >↑ Forward</button>
          <button
            className="fe-tool-btn"
            onClick={() => onReorderSection(selectedSection.id, 'front')}
            title="To Front"
          >⬆ Front</button>
        </div>
      </div>
    </>
  );

  return (
    <div className="floating-editor" ref={panelRef} style={style}>
      {!isCentered && (
        <div
          className="fe-connector"
          style={{
            position: 'absolute',
            right: '-8px',
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
          <button className="fe-delete" onClick={() => {
            if (editingSection) { onDeleteSection(selectedSection.id); }
            else if (editingElement) { onDeleteElement(selectedElement.id); }
            onClose();
          }}>Delete</button>
          <button className="fe-close" onClick={onClose}>Close</button>
        </div>
      </div>

      <div className="fe-body">

        {editingElement && selectedElement?.type === 'text' && (
          <>
            <div className="fe-group">
              <label className="fe-label">Content</label>
              <textarea
                rows="2"
                value={selectedElement.content || ''}
                onChange={e => onUpdateElement(selectedElement.id, { content: e.target.value })}
                style={{
                  width: '100%', padding: '12px 14px', border: '2px solid #e2e8f0',
                  borderRadius: '14px', fontSize: '14px', fontFamily: 'inherit', resize: 'none'
                }}
              />
            </div>
            <div className="fe-divider" />
          </>
        )}

        {editingElement && (selectedElement?.id || '').startsWith('icon-') && (
          <>
            <div className="fe-group">
              <label className="fe-label">Color</label>
              <input
                type="color"
                value={selectedElement.color || '#000000'}
                onChange={e => onUpdateElement(selectedElement.id, { color: e.target.value })}
              />
            </div>
            <div className="fe-divider" />
          </>
        )}

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

            <LayerControls />
          </>
        )}

        {isText && (
          <>
            <div className="fe-group">
              <label className="fe-label">Content</label>
              {isNameField ? (
                <div className="fe-dual-input">
                  <input autoFocus type="text" placeholder="First Name" value={getValue('firstName')} onChange={e => onUpdateUserData('firstName', e.target.value)} />
                  <input type="text" placeholder="Last Name" value={getValue('lastName')} onChange={e => onUpdateUserData('lastName', e.target.value)} />
                </div>
              ) : (
                <textarea
                  rows="2"
                  value={getValue(selectedSection.field)}
                  onChange={e => {
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
                  autoFocus
                  placeholder="Enter text…"
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

            <LayerControls />
          </>
        )}

      </div>
    </div>
  );
}