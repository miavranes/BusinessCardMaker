import { useState, useRef, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { templates } from '../templates';
import Canvas from '../components/Canvas';
import FloatingEditor from '../components/FloatingEditor';
import Sidebar from '../components/Sidebar';
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

  const [userData, setUserData] = useState(() => {
    const baseData = { ...selectedTemplate?.defaultData, ...prefill };
    if (prefill.name) {
      const parts = prefill.name.trim().split(/\s+/);
      baseData.firstName = parts[0] || '';
      baseData.lastName = parts.slice(1).join(' ') || '';
    }
    return baseData;
  });

  const updateUserData = (field, value) => {
    console.log('updateUserData called:', field, '=', value);
    setUserData(prev => {
      const updated = { ...prev, [field]: value };
      console.log('Updated userData:', updated);
      return updated;
    });
  };

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
    if (isFront) setSectionsFront(prev => patch(prev));
    else setSectionsBack(prev => patch(prev));
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

  const [elementsFront, setElementsFront] = useState([]);
  const [elementsBack, setElementsBack]   = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);

  const [activeCanvas, setActiveCanvas] = useState('front'); // 'front' | 'back'

  const getSetters = (side) =>
    side === 'front'
      ? { elements: elementsFront, setElements: setElementsFront }
      : { elements: elementsBack,  setElements: setElementsBack  };

  const addElement = (el) => {
    const { setElements } = getSetters(activeCanvas);
    console.log('Adding element to', activeCanvas, 'canvas:', el);
    setElements(prev => {
      const newElements = [...prev, el];
      console.log('New elements array:', newElements);
      return newElements;
    });
    setSelectedElement(el.id);
    setSelectedSection(null);
  };

  const updateElement = (id, updates) => {
   setElementsFront(prev =>
      prev.some(el => el.id === id)
        ? prev.map(el => el.id === id ? { ...el, ...updates } : el)
        : prev
    );
    setElementsBack(prev =>
      prev.some(el => el.id === id)
        ? prev.map(el => el.id === id ? { ...el, ...updates } : el)
        : prev
    );
  };

  const deleteElement = (id) => {
    setElementsFront(prev => prev.filter(el => el.id !== id));
    setElementsBack(prev => prev.filter(el => el.id !== id));
    setSelectedElement(null);
  };

  const allElements = [...elementsFront, ...elementsBack];

  const [bgFront, setBgFront] = useState(selectedTemplate?.bg || '#ffffff');
  const [bgBack, setBgBack]   = useState(selectedTemplate?.bgBack || '#ffffff');

  const handleLogoUpload = file => {
    const url = URL.createObjectURL(file);
    updateUserData('logoUrl', url);
  };

  const handleDeleteSection = sectionId => {
    if (sectionId.startsWith('back-')) {
      setSectionsBack(prev => prev.filter(s => s.id !== sectionId));
    } else {
      setSectionsFront(prev => prev.filter(s => s.id !== sectionId));
    }
  };

 const handleAddTextSection = () => {
    const fieldKey = `custom_${Date.now()}`;
    const newSection = {
      id: `text-added-${Date.now()}`,
      type: 'text',
      field: fieldKey,
      label: 'Added Text',
      x: 0.05, y: 0.35,
      width: 0.9, height: 0.3,
      fontSize: 16,
      fontFamily: 'Arial, sans-serif',
      color: '#000000',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textAlign: 'left',
      textDecoration: 'none',
      textShadowBlur: 0,
      textShadowColor: '#000000',
      textStrokeWidth: 0,
      textStrokeColor: '#000000',
      opacity: 1,
    };

    console.log('Adding text section to', activeCanvas, ':', newSection);

    if (activeCanvas === 'front') {
      setSectionsFront(prev => {
        const updated = [...prev, newSection];
        console.log('Updated sectionsFront:', updated);
        return updated;
      });
    } else {
      setSectionsBack(prev => {
        const updated = [...prev, newSection];
        console.log('Updated sectionsBack:', updated);
        return updated;
      });
    }

    setUserData(prev => ({ ...prev, [fieldKey]: '' }));

    setSelectedSection(newSection);
    setSectionAnchorRect({
      left: window.innerWidth / 2,
      right: window.innerWidth / 2,
      top: window.innerHeight / 2,
      bottom: window.innerHeight / 2,
      width: 0,
      height: 0,
    });

    // Deselektuj element
    setSelectedElement(null);
  };

  const activeTemplate = selectedTemplate
    ? { ...selectedTemplate, sectionsFront, sectionsBack }
    : null;

  useEffect(() => {
    const handleOutsideClick = e => {
      if (
        !e.target.closest('.canvas-area') &&
        !e.target.closest('.floating-editor') &&
        !e.target.closest('.sidebar')
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

      <Sidebar
        elements={allElements}
        selectedElement={selectedElement}
        activeCanvas={activeCanvas}
        onSetActiveCanvas={setActiveCanvas}
        onAddElement={addElement}
        onUpdateElement={updateElement}
        onDeleteElement={deleteElement}
        onAddTextSection={handleAddTextSection}
      />

      <div className="canvas-area">
        <div
          className={`canvas-side ${activeCanvas === 'front' ? 'canvas-side--active' : ''}`}
          onClick={() => setActiveCanvas('front')}
        >
          <p className="canvas-label">
            Front Side
            {activeCanvas === 'front' && <span className="canvas-active-badge">● Active</span>}
          </p>
          <Canvas
            key="front-canvas"
            ref={canvasFrontRef}
            elements={elementsFront}
            selectedElement={selectedElement}
            setSelectedElement={id => {
              setSelectedElement(id);
              setSelectedSection(null);
              setActiveCanvas('front');
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
            isActive={activeCanvas === 'front'}
          />
        </div>

        <div
          className={`canvas-side ${activeCanvas === 'back' ? 'canvas-side--active' : ''}`}
          onClick={() => setActiveCanvas('back')}
        >
          <p className="canvas-label">
            Back Side
            {activeCanvas === 'back' && <span className="canvas-active-badge">● Active</span>}
          </p>
          <Canvas
            key="back-canvas"
            ref={canvasBackRef}
            elements={elementsBack}
            selectedElement={selectedElement}
            setSelectedElement={id => {
              setSelectedElement(id);
              setSelectedSection(null);
              setActiveCanvas('back');
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
            isActive={activeCanvas === 'back'}
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