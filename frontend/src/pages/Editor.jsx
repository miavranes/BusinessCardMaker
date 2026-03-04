import { useState, useRef, useEffect } from 'react';

const DEBUG = false;
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
    // remove the raw "name" key – templates only use firstName/lastName
    delete baseData.name;
    return baseData;
  });

  const updateUserData = (field, value) => {
    DEBUG && console.log('updateUserData called:', field, '=', value);
    setUserData(prev => {
      const updated = { ...prev, [field]: value };
      DEBUG && console.log('Updated userData:', updated);
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

  const [selectedElement, setSelectedElement] = useState(null); // already declared earlier
  const [elementAnchorRect, setElementAnchorRect] = useState(null);


  const handleSelectSection = (section, domRect) => {
    setSelectedSection(section ?? null);
    setSectionAnchorRect(domRect ?? null);
    if (section) {
      setSelectedElement(null);
      setElementAnchorRect(null);
    }
  };

  const handleSelectElement = (id, rect) => {
    setSelectedElement(id);
    setElementAnchorRect(rect || null);
    // clear section selection when an element is chosen
    if (id) {
      setSelectedSection(null);
      setSectionAnchorRect(null);
    }
  };

  const [elementsFront, setElementsFront] = useState([]);
  const [elementsBack, setElementsBack]   = useState([]);

  const [dragPreview, setDragPreview] = useState(null); // { element, x, y, targetSide }

  const handleDragElement = (element, coords, targetSide) => {
    setDragPreview({ element, x: coords.x, y: coords.y, targetSide });
  };
  const handleDragEnd = () => {
    setDragPreview(null);
  };

  const [activeCanvas, setActiveCanvas] = useState('front'); // 'front' | 'back'

  const getSetters = (side) =>
    side === 'front'
      ? { elements: elementsFront, setElements: setElementsFront }
      : { elements: elementsBack,  setElements: setElementsBack  };

  const addElement = (el) => {
    DEBUG && console.log('Editor.addElement called; activeCanvas=', activeCanvas);
    const { setElements } = getSetters(activeCanvas);
    DEBUG && console.log('Adding element to', activeCanvas, 'canvas:', el);
    setElements(prev => {
      const newElements = [...prev, el];
      DEBUG && console.log('New elements array:', newElements);
      return newElements;
    });
    setSelectedElement(el.id);
    setSelectedSection(null);
  };

  const addElementToFront = (el) => {
    DEBUG && console.log('Adding element to front canvas:', el);
    setElementsFront(prev => [...prev, el]);
    setSelectedElement(el.id);
    setSelectedSection(null);
  };

  const addElementToBack = (el) => {
    DEBUG && console.log('Adding element to back canvas:', el);
    setElementsBack(prev => [...prev, el]);
    setSelectedElement(el.id);
    setSelectedSection(null);
  };

  const moveElementToBack = (element) => {
    DEBUG && console.log('Moving element to back canvas:', element.id);
    // Remove from front
    setElementsFront(prev => prev.filter(el => el.id !== element.id));
    // Add to back
    setElementsBack(prev => [...prev, element]);
    setSelectedElement(element.id);
    setActiveCanvas('back'); // make sure editor/anchor uses correct canvas
  };

  const moveElementToFront = (element) => {
    DEBUG && console.log('Moving element to front canvas:', element.id);
    // Remove from back
    setElementsBack(prev => prev.filter(el => el.id !== element.id));
    // Add to front
    setElementsFront(prev => [...prev, element]);
    setSelectedElement(element.id);
    setActiveCanvas('front');
  };

  const mapSectionToSide = (section, side) => {
    // when moving logos we need to translate ids so the layout knows about them
    if (section.type === 'logo') {
      const newId = side === 'back' ? 'back-logo' : 'front-logo';
      return { ...section, id: newId };
    }
    return section;
  };

  const moveSectionToBack = (section) => {
    DEBUG && console.log('Moving section to back canvas:', section.id);
    setSectionsFront(prev => prev.filter(s => s.id !== section.id));
    const mapped = mapSectionToSide(section, 'back');
    setSectionsBack(prev => {
      // if section already has updated coords, replace existing copy
      const filtered = prev.filter(s => s.id !== mapped.id);
      return [...filtered, mapped];
    });
    setSelectedSection(mapped);
    setActiveCanvas('back');
  };
  
  const moveSectionToFront = (section) => {
    DEBUG && console.log('Moving section to front canvas:', section.id);
    setSectionsBack(prev => prev.filter(s => s.id !== section.id));
    const mapped = mapSectionToSide(section, 'front');
    setSectionsFront(prev => {
      const filtered = prev.filter(s => s.id !== mapped.id);
      return [...filtered, mapped];
    });
    setSelectedSection(mapped);
    setActiveCanvas('front');
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
    setElementAnchorRect(null);
  };

  const allElements = [...elementsFront, ...elementsBack];

  useEffect(() => {
    if (!selectedElement) {
      setElementAnchorRect(null);
    }
  }, [selectedElement]);

  // keep the floating editor attached to the element as it moves/resizes
  useEffect(() => {
    if (!selectedElement) return;
    const el = allElements.find(e => e.id === selectedElement);
    if (!el) return;
    const CANVAS_W = 580;
    const CANVAS_H = 330;
    const canvasRef = activeCanvas === 'front' ? canvasFrontRef : canvasBackRef;
    if (!canvasRef.current) return;
    const parentRect = canvasRef.current.getBoundingClientRect();
    const scale = parentRect.width / CANVAS_W;
    const left = parentRect.left + el.x * scale;
    const top = parentRect.top + el.y * scale;
    const widthPx = (el.width || 0) * scale;
    const heightPx = (el.height || 0) * scale;
    setElementAnchorRect({ left, right: left + widthPx, top, bottom: top + heightPx, width: widthPx, height: heightPx });
  }, [allElements, selectedElement, activeCanvas]);

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

    DEBUG && console.log('Adding text section to', activeCanvas, ':', newSection);

    if (activeCanvas === 'front') {
      setSectionsFront(prev => {
        const updated = [...prev, newSection];
        DEBUG && console.log('Updated sectionsFront:', updated);
        return updated;
      });
    } else {
      setSectionsBack(prev => {
        const updated = [...prev, newSection];
        DEBUG && console.log('Updated sectionsBack:', updated);
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
            onAddElement={addElementToFront}
            onUpdateElement={updateElement}
            onMoveElementToOtherCanvas={moveElementToBack}
            otherCanvasRef={canvasBackRef}
            onMoveSectionToOtherCanvas={moveSectionToBack}
            onElementSelect={handleSelectElement}
            onDragElement={handleDragElement}
            onDragEnd={handleDragEnd}
            dragPreview={dragPreview}
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
            onAddElement={addElementToBack}
            onUpdateElement={updateElement}
            onMoveElementToOtherCanvas={moveElementToFront}
            otherCanvasRef={canvasFrontRef}
            onMoveSectionToOtherCanvas={moveSectionToFront}
            onElementSelect={handleSelectElement}
            onDragElement={handleDragElement}
            onDragEnd={handleDragEnd}
            dragPreview={dragPreview}
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

      {(selectedSection || selectedElement) && (
        <FloatingEditor
          selectedSection={selectedSection}
          selectedElement={allElements.find(el => el.id === selectedElement) || null}
          anchorRect={selectedSection ? sectionAnchorRect : elementAnchorRect}
          userData={userData}
          onUpdateUserData={updateUserData}
          onUpdateSection={updateSection}
          onUpdateElement={updateElement}
          onClose={() => {
            setSelectedSection(null);
            setSectionAnchorRect(null);
            setSelectedElement(null);
            setElementAnchorRect(null);
          }}
          onLogoUpload={handleLogoUpload}
          onDeleteSection={handleDeleteSection}
          onDeleteElement={deleteElement}
        />
      )}
    </div>
  );
}