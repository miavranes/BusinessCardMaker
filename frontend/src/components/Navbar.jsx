import { useState } from 'react';
import '../css/Navbar.css';

function Navbar({
  onAddText,
  onAddShape,
  backgroundColor,
  onBackgroundChange,
  selectedElement,
  onUpdateElement,
  onDeleteElement,
  selectedSection,
  onUpdateSection,
  userData,
  onUpdateUserData,
}) {
  const [showElementsMenu, setShowElementsMenu] = useState(false);
  const [showTextMenu, setShowTextMenu] = useState(false);
  const [showTemplatesMenu, setShowTemplatesMenu] = useState(false);

  const field = selectedSection?.type === 'logo' ? 'logo' : selectedSection?.field;

  return (
    <nav className="navbar">
      <h1 className="navbar-title">Business Card Maker</h1>

      <div className="navbar-menu">
        <div className="dropdown">
          <button onClick={() => { setShowElementsMenu(!showElementsMenu); setShowTextMenu(false); setShowTemplatesMenu(false); }} className="dropdown-button">
            Elements
          </button>
          {showElementsMenu && (
            <div className="dropdown-menu">
              <button onClick={() => { onAddShape('rectangle'); setShowElementsMenu(false); }} className="dropdown-item">Rectangle</button>
              <button onClick={() => { onAddShape('circle'); setShowElementsMenu(false); }} className="dropdown-item">Circle</button>
              <button onClick={() => { onAddShape('triangle'); setShowElementsMenu(false); }} className="dropdown-item">Triangle</button>
            </div>
          )}
        </div>

        <div className="dropdown">
          <button onClick={() => { setShowTextMenu(!showTextMenu); setShowElementsMenu(false); setShowTemplatesMenu(false); }} className="dropdown-button">
            Text
          </button>
          {showTextMenu && (
            <div className="dropdown-menu">
              <button onClick={() => { onAddText(); setShowTextMenu(false); }} className="dropdown-item">Add Text</button>
            </div>
          )}
        </div>

        <div className="dropdown">
          <button onClick={() => { setShowTemplatesMenu(!showTemplatesMenu); setShowElementsMenu(false); setShowTextMenu(false); }} className="dropdown-button">
            Templates
          </button>
        </div>

        <div className="background-picker">
          <label>Background:</label>
          <input type="color" value={backgroundColor} onChange={(e) => onBackgroundChange(e.target.value)} />
        </div>

        {/* === SECTION EDITOR === */}
        {selectedSection && (
          <div className="editor-section">
            <h3 className="editor-title">
              {selectedSection.label || selectedSection.id}
            </h3>

            {/* Logo upload */}
            {field === 'logo' && (
              <div className="form-group">
                <label>Upload logo:</label>
                <input type="file" accept="image/*" />
              </div>
            )}

            {/* Ime */}
            {field === 'name' && (
              <>
                <div className="form-group">
                  <label>First name:</label>
                  <input type="text" value={userData?.firstName || ''} onChange={(e) => onUpdateUserData('firstName', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Last name:</label>
                  <input type="text" value={userData?.lastName || ''} onChange={(e) => onUpdateUserData('lastName', e.target.value)} />
                </div>
              </>
            )}

            {field === 'title' && (
              <div className="form-group">
                <label>Position:</label>
                <input type="text" value={userData?.title || ''} onChange={(e) => onUpdateUserData('title', e.target.value)} />
              </div>
            )}

            {field === 'phone' && (
              <div className="form-group">
                <label>Phone:</label>
                <input type="text" value={userData?.phone || ''} onChange={(e) => onUpdateUserData('phone', e.target.value)} />
              </div>
            )}

            {field === 'email' && (
              <div className="form-group">
                <label>Email:</label>
                <input type="text" value={userData?.email || ''} onChange={(e) => onUpdateUserData('email', e.target.value)} />
              </div>
            )}

            {field === 'website' && (
              <div className="form-group">
                <label>Website:</label>
                <input type="text" value={userData?.website || ''} onChange={(e) => onUpdateUserData('website', e.target.value)} />
              </div>
            )}

            {/* Styling za text sekcije */}
            {selectedSection.type === 'text' && (
              <>
                <div className="form-group">
                  <label>Font size:</label>
                  <input
                    type="number"
                    value={selectedSection.fontSize || ''}
                    placeholder="Default"
                    min="6" max="100"
                    onChange={(e) => onUpdateSection(selectedSection.id, { fontSize: parseInt(e.target.value) || undefined })}
                  />
                </div>

                <div className="form-group">
                  <label>Color:</label>
                  <input
                    type="color"
                    value={selectedSection.color || '#000000'}
                    onChange={(e) => onUpdateSection(selectedSection.id, { color: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Font:</label>
                  <select
                    value={selectedSection.fontFamily || ''}
                    onChange={(e) => onUpdateSection(selectedSection.id, { fontFamily: e.target.value })}
                  >
                    <option value="">Default</option>
                    <option value="Arial">Arial</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Cormorant Garamond">Cormorant Garamond</option>
                    <option value="Jost">Jost</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Style:</label>
                  <div className="button-group">
                    <button
                      onClick={() => onUpdateSection(selectedSection.id, { fontWeight: selectedSection.fontWeight === 'bold' ? 'normal' : 'bold' })}
                      className={selectedSection.fontWeight === 'bold' ? 'active' : ''}
                    >B</button>
                    <button
                      onClick={() => onUpdateSection(selectedSection.id, { fontStyle: selectedSection.fontStyle === 'italic' ? 'normal' : 'italic' })}
                      className={selectedSection.fontStyle === 'italic' ? 'active' : ''}
                    >I</button>
                  </div>
                </div>
              </>
            )}

            <p className="drag-hint">Drag section on canvas to reposition</p>
          </div>
        )}

        {/* === CUSTOM TEXT EDITOR === */}
        {selectedElement && selectedElement.type === 'text' && (
          <div className="editor-section">
            <h3 className="editor-title">Text Editor</h3>
            <div className="form-group">
              <label>Text:</label>
              <textarea value={selectedElement.content} onChange={(e) => onUpdateElement(selectedElement.id, { content: e.target.value })} rows="3" />
            </div>
            <div className="form-group">
              <label>Font size:</label>
              <input type="number" value={selectedElement.fontSize} onChange={(e) => onUpdateElement(selectedElement.id, { fontSize: parseInt(e.target.value) || 12 })} min="8" max="200" />
            </div>
            <div className="form-group">
              <label>Color:</label>
              <input type="color" value={selectedElement.color} onChange={(e) => onUpdateElement(selectedElement.id, { color: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Font:</label>
              <select value={selectedElement.fontFamily} onChange={(e) => onUpdateElement(selectedElement.id, { fontFamily: e.target.value })}>
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
                <option value="Georgia">Georgia</option>
                <option value="Verdana">Verdana</option>
              </select>
            </div>
            <div className="form-group">
              <label>Style:</label>
              <div className="button-group">
                <button onClick={() => onUpdateElement(selectedElement.id, { fontWeight: selectedElement.fontWeight === 'bold' ? 'normal' : 'bold' })} className={selectedElement.fontWeight === 'bold' ? 'active' : ''}>B</button>
                <button onClick={() => onUpdateElement(selectedElement.id, { fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic' })} className={selectedElement.fontStyle === 'italic' ? 'active' : ''}>I</button>
              </div>
            </div>
            <button onClick={onDeleteElement} className="delete-button">Delete</button>
          </div>
        )}

        {/* === CUSTOM SHAPE EDITOR === */}
        {selectedElement && selectedElement.type === 'shape' && (
          <div className="editor-section">
            <h3 className="editor-title">Shape Editor</h3>
            <div className="form-group">
              <label>Fill:</label>
              <input type="color" value={selectedElement.fill} onChange={(e) => onUpdateElement(selectedElement.id, { fill: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Width:</label>
              <input type="number" value={selectedElement.width} onChange={(e) => onUpdateElement(selectedElement.id, { width: parseInt(e.target.value) || 10 })} min="10" max="800" />
            </div>
            <div className="form-group">
              <label>Height:</label>
              <input type="number" value={selectedElement.height} onChange={(e) => onUpdateElement(selectedElement.id, { height: parseInt(e.target.value) || 10 })} min="10" max="800" />
            </div>
            <div className="form-group">
              <label>Border:</label>
              <input type="number" value={selectedElement.strokeWidth} onChange={(e) => onUpdateElement(selectedElement.id, { strokeWidth: parseInt(e.target.value) || 0 })} min="0" max="50" />
            </div>
            {selectedElement.strokeWidth > 0 && (
              <div className="form-group">
                <label>Border color:</label>
                <input type="color" value={selectedElement.stroke} onChange={(e) => onUpdateElement(selectedElement.id, { stroke: e.target.value })} />
              </div>
            )}
            {selectedElement.shapeType === 'rectangle' && (
              <div className="form-group">
                <label>Radius:</label>
                <input type="number" value={selectedElement.borderRadius} onChange={(e) => onUpdateElement(selectedElement.id, { borderRadius: parseInt(e.target.value) || 0 })} min="0" max="100" />
              </div>
            )}
            <button onClick={onDeleteElement} className="delete-button">Delete</button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;