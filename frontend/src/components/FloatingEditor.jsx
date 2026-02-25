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

  const PANEL_W = 320;
  const PANEL_H = 520;
  const GAP = 12;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let left = anchorRect.right + GAP;
  let top = anchorRect.top;

  if (left + PANEL_W > vw - 8) left = anchorRect.left - PANEL_W - GAP;
  if (left < 8) left = 8;
  if (top + PANEL_H > vh - 8) top = vh - PANEL_H - 8;
  if (top < 8) top = 8;

  const style = { position: 'fixed', top, left, zIndex: 9999 };

  const isLogo = selectedSection.type === 'logo';
  const isText = selectedSection.type === 'text';
  const isNameField = selectedSection.field === 'name';

  const getValue = (field) => userData[field] ?? '';
  const sectionLabel = selectedSection.label || selectedSection.id;

  // Normalizuje width/height između 0.05 i 1
  const normalize = (val) => Math.max(0.05, Math.min(1, val));

  return (
    <div className="floating-editor" style={style} onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>
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
                <input type="text" value={getValue(selectedSection.field)} onChange={e => onUpdateUserData(selectedSection.field, e.target.value)} />
              )}
            </div>

            <div className="fe-divider" />

            <div className="fe-group">
              <label className="fe-label">Font Size (px)</label>
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

            <div className="fe-group">
              <label className="fe-label">Font Family</label>
              <select value={selectedSection.fontFamily || ''} onChange={e => onUpdateSection(selectedSection.id, { fontFamily: e.target.value })}>
                {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
          </>
        )}

      </div>
    </div>
  );
}