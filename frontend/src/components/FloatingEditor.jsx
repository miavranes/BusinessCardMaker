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
  const prefix = isBack ? 'back_' : 'front_';

  const style = {
    position: 'fixed',
    top: Math.min(window.innerHeight - 450, anchorRect.top), 
    left: Math.min(window.innerWidth - 300, anchorRect.right + 15),
    zIndex: 9999,
  };

  const isLogo = selectedSection.field === 'logo';
 const isNameField = selectedSection.field === 'firstName';

 const getValue = (field) => {
    return userData[prefix + field] || userData[field] || "";
  };

  return (
    <div className="floating-editor" style={style} onClick={(e) => e.stopPropagation()}>
      <div className="editor-header">
        <span>Modify {selectedSection.id}</span>
        <button className="close-x" onClick={onClose}>&times;</button>
      </div>

      <div className="editor-body">
        {isLogo ? (
          <div className="editor-group">
            <div className="upload-container">
              <input 
                type="file" 
                id="logo-upload-input" 
                hidden 
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files[0]) onLogoUpload(e.target.files[0]);
                }} 
              />
              <label htmlFor="logo-upload-input" className="upload-label-btn">
                Choose New Image
              </label>
            </div>
          </div>
        ) : (
          <>
            <div className="editor-group">
              <label>Content</label>
              {isNameField ? (
                <div className="dual-input">
                  <input 
                    type="text" 
                    value={getValue('firstName')} 
                    placeholder="First Name"
                    onChange={(e) => onUpdateUserData(prefix + 'firstName', e.target.value)} 
                  />
                  <input
                    type="text"
                    value={getValue('lastName')}
                    placeholder="Last Name"
                    onChange={(e) => onUpdateUserData(prefix + 'lastName', e.target.value)}
                  />
                </div>
              ) : (
                <input
                  type="text"
                  value={getValue(selectedSection.field)}
                  onChange={(e) => onUpdateUserData(prefix + selectedSection.field, e.target.value)}
                />
              )}
            </div>

            <hr />

            <div className="editor-group row">
              <div className="sub-group">
                <label>Size</label>
                <input 
                  type="number" 
                  value={selectedSection.fontSize || 12} 
                  onChange={(e) => onUpdateSection(selectedSection.id, { fontSize: parseInt(e.target.value) })}
                />
              </div>
              <div className="sub-group">
                <label>Color</label>
                <input 
                  type="color" 
                  value={selectedSection.color || '#000000'} 
                  onChange={(e) => onUpdateSection(selectedSection.id, { color: e.target.value })}
                />
              </div>
            </div>

            <div className="editor-group">
              <label>Font Family</label>
              <select 
                value={selectedSection.fontFamily || ''} 
                onChange={(e) => onUpdateSection(selectedSection.id, { fontFamily: e.target.value })}
              >
                {FONT_OPTIONS.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>

            <div className="editor-toolbar">
              <button 
                className={selectedSection.fontWeight === 'bold' ? 'active' : ''}
                onClick={() => onUpdateSection(selectedSection.id, { fontWeight: selectedSection.fontWeight === 'bold' ? 'normal' : 'bold' })}
              ><b>B</b></button>
              <button 
                className={selectedSection.fontStyle === 'italic' ? 'active' : ''}
                onClick={() => onUpdateSection(selectedSection.id, { fontStyle: selectedSection.fontStyle === 'italic' ? 'normal' : 'italic' })}
              ><i>I</i></button>
              <button 
                className={selectedSection.textDecoration === 'underline' ? 'active' : ''}
                onClick={() => onUpdateSection(selectedSection.id, { textDecoration: selectedSection.textDecoration === 'underline' ? 'none' : 'underline' })}
              ><u>U</u></button>
              <button 
                className={selectedSection.textTransform === 'uppercase' ? 'active' : ''}
                onClick={() => onUpdateSection(selectedSection.id, { textTransform: selectedSection.textTransform === 'uppercase' ? 'none' : 'uppercase' })}
              >TT</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}