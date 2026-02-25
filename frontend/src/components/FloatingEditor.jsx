import { FONT_OPTIONS } from '../sectionSchema';
import '../css/FloatingEditor.css';

export default function FloatingEditor({
  selectedSection,
  anchorRect,
  userData,
  onUpdateUserData,
  onUpdateSection,
  onClose,
  onLogoUpload
}) {
  if (!selectedSection || !anchorRect) return null;

  const isBack = String(selectedSection.id).startsWith('back-');
  const prefix = isBack ? 'back_' : '';

  const PANEL_W = 290;
  const PANEL_H = 420;
  const GAP = 12;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let left = anchorRect.right + GAP;
  let top  = anchorRect.top;

  if (left + PANEL_W > vw - 8) left = anchorRect.left - PANEL_W - GAP;
  if (left < 8) left = 8;
  if (top + PANEL_H > vh - 8) top = vh - PANEL_H - 8;
  if (top < 8) top = 8;

  const style = { position: 'fixed', top, left, zIndex: 9999 };

  const isLogo      = selectedSection.type === 'logo';
  const isNameField = selectedSection.field === 'name';

  const getValue = (field) => {
  return userData[field] ?? '';
};

  const sectionLabel = selectedSection.label || selectedSection.id;

  return (
    <div className="floating-editor" style={style} onClick={e => e.stopPropagation()}>

      <div className="fe-header">
        <div className="fe-header-left">
          <div className="fe-header-dot" />
          <span className="fe-header-title">{sectionLabel}</span>
        </div>
        <button className="fe-close" onClick={onClose}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div className="fe-body">

        {isLogo ? (
          <div className="fe-group">
            <label className="fe-label">Logo Image</label>
            <input
              type="file"
              id="logo-upload-input"
              hidden
              accept="image/*"
              onChange={e => { if (e.target.files[0]) onLogoUpload(e.target.files[0]); }}
            />
            <label htmlFor="logo-upload-input" className="fe-upload-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Upload Image
            </label>
          </div>
        ) : (
          <>
            
            <div className="fe-group">
              <label className="fe-label">Content</label>
              {isNameField ? (
                <div className="fe-dual-input">
                  <input
                    className="fe-input"
                    type="text"
                    placeholder="First Name"
                    value={getValue('firstName')}
                    onChange={e => onUpdateUserData('firstName', e.target.value)}
                  />
                  <input
                    className="fe-input"
                    type="text"
                    placeholder="Last Name"
                    value={getValue('lastName')}
                    onChange={e => onUpdateUserData('lastName', e.target.value)}
                  />
                </div>
              ) : (
                <input
                  className="fe-input"
                  type="text"
                  value={getValue(selectedSection.field)}
                  onChange={e => onUpdateUserData(selectedSection.field, e.target.value)}
                />
              )}
            </div>

            <div className="fe-divider" />
            <div className="fe-row">
              <div className="fe-group">
                <label className="fe-label">Size</label>
                <div className="fe-stepper">
                  <button className="fe-stepper-btn"
                    onClick={() => onUpdateSection(selectedSection.id, { fontSize: Math.max(6, (selectedSection.fontSize || 12) - 1) })}>
                    −
                  </button>
                  <span className="fe-stepper-val">{selectedSection.fontSize || 12}</span>
                  <button className="fe-stepper-btn"
                    onClick={() => onUpdateSection(selectedSection.id, { fontSize: (selectedSection.fontSize || 12) + 1 })}>
                    +
                  </button>
                </div>
              </div>

              <div className="fe-group">
                <label className="fe-label">Color</label>
                <div className="fe-color-wrap">
                  <input
                    type="color"
                    value={selectedSection.color || '#000000'}
                    onChange={e => onUpdateSection(selectedSection.id, { color: e.target.value })}
                  />
                  <span className="fe-color-hex">{selectedSection.color || '#000000'}</span>
                </div>
              </div>
            </div>

            <div className="fe-group">
              <label className="fe-label">Font</label>
              <select
                className="fe-select"
                value={selectedSection.fontFamily || ''}
                onChange={e => onUpdateSection(selectedSection.id, { fontFamily: e.target.value })}
              >
                {FONT_OPTIONS.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>

            <div className="fe-group">
              <label className="fe-label">Style</label>
              <div className="fe-toolbar">
                <button
                  className={`fe-tool-btn ${selectedSection.fontWeight === 'bold' ? 'active' : ''}`}
                  onClick={() => onUpdateSection(selectedSection.id, {
                    fontWeight: selectedSection.fontWeight === 'bold' ? 'normal' : 'bold'
                  })}
                ><b>B</b></button>

                <button
                  className={`fe-tool-btn ${selectedSection.fontStyle === 'italic' ? 'active' : ''}`}
                  onClick={() => onUpdateSection(selectedSection.id, {
                    fontStyle: selectedSection.fontStyle === 'italic' ? 'normal' : 'italic'
                  })}
                ><i>I</i></button>

                <button
                  className={`fe-tool-btn ${selectedSection.textDecoration === 'underline' ? 'active' : ''}`}
                  onClick={() => onUpdateSection(selectedSection.id, {
                    textDecoration: selectedSection.textDecoration === 'underline' ? 'none' : 'underline'
                  })}
                ><u>U</u></button>

                <button
                  className={`fe-tool-btn ${selectedSection.textTransform === 'uppercase' ? 'active' : ''}`}
                  onClick={() => onUpdateSection(selectedSection.id, {
                    textTransform: selectedSection.textTransform === 'uppercase' ? 'none' : 'uppercase'
                  })}
                >AA</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}