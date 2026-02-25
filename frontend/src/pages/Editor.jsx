import { useState, useRef, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { templates } from '../templates';
import Canvas from '../components/Canvas';
import FloatingEditor from '../components/FloatingEditor';
import '../css/Editor.css';

export default function Editor() {
  const { templateId } = useParams();
  const location = useLocation();
  const prefill = location.state?.prefill ?? {};

  const selectedTemplate = templateId
    ? templates.find(t => t.id === Number(templateId))
    : null;

  const canvasFrontRef = useRef(null);
  const canvasBackRef = useRef(null);
  const editorRef = useRef(null);

  const [userData, setUserData] = useState(() => ({
    ...selectedTemplate?.defaultData,
    ...prefill,
  }));

  const updateUserData = (field, value) =>
    setUserData(prev => ({ ...prev, [field]: value }));

  const [sectionsFront, setSectionsFront] = useState(() =>
    (selectedTemplate?.sectionsFront ?? []).map(s => ({ ...s }))
  );
  const [sectionsBack, setSectionsBack] = useState(() =>
    (selectedTemplate?.sectionsBack ?? []).map(s => ({ ...s }))
  );

  const updateSection = (sectionId, updates) => {
    const patch = list =>
      list.map(s => (s.id === sectionId ? { ...s, ...updates } : s));

    const isFront = sectionsFront.some(s => s.id === sectionId);

    if (isFront) {
      setSectionsFront(prev => patch(prev));
    } else {
      setSectionsBack(prev => patch(prev));
    }

    setSelectedSection(prev =>
      prev?.id === sectionId ? { ...prev, ...updates } : prev
    );
  };

  const [selectedSection, setSelectedSection] = useState(null);
  const [sectionAnchorRect, setSectionAnchorRect] = useState(null);

  const handleSelectSection = (section, domRect) => {
    setSelectedSection(section ?? null);
    setSectionAnchorRect(domRect ?? null);
    if (section) setSelectedElement(null);
  };

  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);

  const updateElement = (id, updates) =>
    setElements(prev =>
      prev.map(el => (el.id === id ? { ...el, ...updates } : el))
    );

  const [bgFront, setBgFront] = useState(selectedTemplate?.bg || '#ffffff');
  const [bgBack, setBgBack] = useState(selectedTemplate?.bgBack || '#ffffff');

  const handleLogoUpload = file => {
    const url = URL.createObjectURL(file);
    updateUserData('logoUrl', url);
  };

  const handleDeleteSection = sectionId => {
    const isBack = sectionId.startsWith('back-');
    if (isBack) {
      setSectionsBack(prev => prev.filter(s => s.id !== sectionId));
    } else {
      setSectionsFront(prev => prev.filter(s => s.id !== sectionId));
    }
  };

  const activeTemplate = selectedTemplate
    ? { ...selectedTemplate, sectionsFront, sectionsBack }
    : null;

  useEffect(() => {
    const handleOutsideClick = e => {
      if (
        !e.target.closest('.canvas-area') &&
        !e.target.closest('.floating-editor')
      ) {
        setSelectedSection(null);
        setSectionAnchorRect(null);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div className="editor-container" ref={editorRef}>
      <div className="canvas-area">
        <div className="canvas-side">
          <p className="canvas-label">Front Side</p>
          <Canvas
            ref={canvasFrontRef}
            elements={elements}
            selectedElement={selectedElement}
            setSelectedElement={id => {
              setSelectedElement(id);
              setSelectedSection(null);
            }}
            onUpdateElement={updateElement}
            backgroundColor={bgFront}
            template={activeTemplate}
            isBack={false}
            showPreview={false}
            selectedSection={selectedSection}
            onSelectSection={handleSelectSection}
            onUpdateSection={updateSection}
            userData={userData}
            sections={sectionsFront}
          />
        </div>

        <div className="canvas-side">
          <p className="canvas-label">Back Side</p>
          <Canvas
            ref={canvasBackRef}
            elements={elements}
            selectedElement={selectedElement}
            setSelectedElement={id => {
              setSelectedElement(id);
              setSelectedSection(null);
            }}
            onUpdateElement={updateElement}
            backgroundColor={bgBack}
            template={activeTemplate}
            isBack={true}
            showPreview={false}
            selectedSection={selectedSection}
            onSelectSection={handleSelectSection}
            onUpdateSection={updateSection}
            userData={userData}
            sections={sectionsBack}
          />
        </div>
      </div>

      {selectedSection && (
        <FloatingEditor
          selectedSection={selectedSection}
          anchorRect={sectionAnchorRect}
          userData={userData}
          onUpdateUserData={updateUserData}
          onUpdateSection={updateSection}
          onClose={() => {
            setSelectedSection(null);
            setSectionAnchorRect(null);
          }}
          onLogoUpload={handleLogoUpload}
          onDeleteSection={handleDeleteSection}
        />
      )}
    </div>
  );
}