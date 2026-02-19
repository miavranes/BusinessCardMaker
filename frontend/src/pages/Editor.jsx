import { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { templates } from '../templates';
import Canvas from '../components/Canvas';
import Navbar from '../components/Navbar';
import '../css/Editor.css';

function Editor() {
  const { templateId } = useParams();

  const selectedTemplate = templateId
    ? templates.find(t => t.id === Number(templateId))
    : null;

  const canvasFrontRef = useRef(null);
  const canvasBackRef = useRef(null);

  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [backgroundColor, setBackgroundColor] = useState(selectedTemplate?.bg || '#ffffff');
  const [backgroundColorBack, setBackgroundColorBack] = useState(selectedTemplate?.bgBack || '#ffffff');
  const [userData, setUserData] = useState(selectedTemplate?.defaultData || {});

  // Sections state — kopija iz templatea, može se mijenjati (pozicija, stil)
  const [sectionsBack, setSectionsBack] = useState(selectedTemplate?.sectionsBack || []);
  const [sectionsFront, setSectionsFront] = useState(selectedTemplate?.sectionsFront || []);

  const updateUserData = (field, value) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  };

  // Ažurira sekciju po ID-u (pozicija, boja, font...)
  const updateSection = (sectionId, updates) => {
    const updateList = (list) => list.map(s => s.id === sectionId ? { ...s, ...updates } : s);
    setSectionsBack(prev => updateList(prev));
    setSectionsFront(prev => updateList(prev));

    // Ažuriraj i selectedSection ako je ista
    if (selectedSection?.id === sectionId) {
      setSelectedSection(prev => ({ ...prev, ...updates }));
    }
  };

  // Template sa ažuriranim sekcijama
  const activeTemplate = selectedTemplate ? {
    ...selectedTemplate,
    sectionsBack,
    sectionsFront,
  } : null;

  const addText = () => {
    const newElement = {
      id: Date.now(), type: 'text', content: 'New text',
      x: 50, y: 50, fontSize: 24, fontFamily: 'Arial',
      fontWeight: 'normal', fontStyle: 'normal', color: '#000000', align: 'left'
    };
    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
  };

  const addShape = (shapeType) => {
    const newElement = {
      id: Date.now(), type: 'shape', shapeType,
      x: 100, y: 100, width: 100, height: 100,
      fill: '#3b82f6', stroke: '#000000', strokeWidth: 0, borderRadius: 0
    };
    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
  };

  const updateElement = (id, updates) => {
    setElements(elements.map(el => el.id === id ? { ...el, ...updates } : el));
  };

  const deleteElement = () => {
    if (selectedElement) {
      setElements(elements.filter(el => el.id !== selectedElement));
      setSelectedElement(null);
    }
  };

  const selectedElementData = elements.find(el => el.id === selectedElement);

  return (
    <div className="editor-container">
      <Navbar
        onAddText={addText}
        onAddShape={addShape}
        backgroundColor={backgroundColor}
        onBackgroundChange={setBackgroundColor}
        selectedElement={selectedElementData}
        onUpdateElement={updateElement}
        onDeleteElement={deleteElement}
        selectedSection={selectedSection}
        onUpdateSection={updateSection}
        userData={userData}
        onUpdateUserData={updateUserData}
      />

      <div className="canvas-area">
        <div className="canvas-side">
          <p className="canvas-label">Front</p>
          <Canvas
            ref={canvasFrontRef}
            elements={elements}
            selectedElement={selectedElement}
            setSelectedElement={setSelectedElement}
            onUpdateElement={updateElement}
            backgroundColor={backgroundColor}
            template={activeTemplate}
            isBack={false}
            showPreview={false}
            selectedSection={selectedSection}
            onSelectSection={setSelectedSection}
            onUpdateSection={updateSection}
            userData={userData}
          />
        </div>

        <div className="canvas-side">
          <p className="canvas-label">Back</p>
          <Canvas
            ref={canvasBackRef}
            elements={elements}
            selectedElement={selectedElement}
            setSelectedElement={setSelectedElement}
            onUpdateElement={updateElement}
            backgroundColor={backgroundColorBack}
            template={activeTemplate}
            isBack={true}
            showPreview={false}
            selectedSection={selectedSection}
            onSelectSection={setSelectedSection}
            onUpdateSection={updateSection}
            userData={userData}
          />
        </div>
      </div>
    </div>
  );
}

export default Editor;