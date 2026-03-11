import { useState, useRef, useEffect, useCallback } from 'react';

const DEBUG = false;
import { useParams, useLocation } from 'react-router-dom';
import { templates } from '../templates';
import { reorderSections } from '../sectionSchema';
import Canvas from '../components/Canvas';
import FloatingEditor from '../components/FloatingEditor';
import Sidebar from '../components/Sidebar';
import '../css/Editor.css';

// ---------------------------------------------------------------------------
// useHistory — undo/redo stack
// ---------------------------------------------------------------------------
function useHistory(initial) {
  const [past,    setPast]    = useState([]);
  const [present, setPresent] = useState(initial);
  const [future,  setFuture]  = useState([]);

  const push = useCallback((updater) => {
    setPresent(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      setPast(p => [...p, prev]);
      setFuture([]);
      return next;
    });
  }, []);

  const silentSet = useCallback((updater) => {
    setPresent(prev => typeof updater === 'function' ? updater(prev) : updater);
  }, []);

  const undo = useCallback(() => {
    setPast(p => {
      if (!p.length) return p;
      const previous = p[p.length - 1];
      setFuture(f => [present, ...f]);
      setPresent(previous);
      return p.slice(0, -1);
    });
  }, [present]);

  const redo = useCallback(() => {
    setFuture(f => {
      if (!f.length) return f;
      const next = f[0];
      setPast(p => [...p, present]);
      setPresent(next);
      return f.slice(1);
    });
  }, [present]);

  return { state: present, push, silentSet, undo, redo, canUndo: past.length > 0, canRedo: future.length > 0 };
}

export default function Editor() {
  const { templateId } = useParams();
  const location = useLocation();
  const prefill = location.state?.prefill ?? {};

  const selectedTemplate = templateId
    ? templates.find(t => t.id === Number(templateId))
    : null;

  const canvasFrontRef = useRef(null);
  const canvasBackRef  = useRef(null);
  const editorRef      = useRef(null);

  const initialState = {
    sectionsFront: (selectedTemplate?.sectionsFront ?? []).map(s => ({ ...s })),
    sectionsBack:  (selectedTemplate?.sectionsBack  ?? []).map(s => ({ ...s })),
    elementsFront: [],
    elementsBack:  [],
  };

  const { state, push, silentSet, undo, redo, canUndo, canRedo } = useHistory(initialState);
  const { sectionsFront, sectionsBack, elementsFront, elementsBack } = state;

  const setSectionsFront = fn => push(s => ({ ...s, sectionsFront: typeof fn === 'function' ? fn(s.sectionsFront) : fn }));
  const setSectionsBack  = fn => push(s => ({ ...s, sectionsBack:  typeof fn === 'function' ? fn(s.sectionsBack)  : fn }));
  const setElementsFront = fn => push(s => ({ ...s, elementsFront: typeof fn === 'function' ? fn(s.elementsFront) : fn }));
  const setElementsBack  = fn => push(s => ({ ...s, elementsBack:  typeof fn === 'function' ? fn(s.elementsBack)  : fn }));

  const patchElement = (id, updates) => {
    push(s => ({
      ...s,
      elementsFront: s.elementsFront.map(el => el.id === id ? { ...el, ...updates } : el),
      elementsBack:  s.elementsBack.map( el => el.id === id ? { ...el, ...updates } : el),
    }));
  };

  const silentUpdateElement = useCallback((id, updates) => {
    silentSet(s => ({
      ...s,
      elementsFront: s.elementsFront.map(el => el.id === id ? { ...el, ...updates } : el),
      elementsBack:  s.elementsBack.map( el => el.id === id ? { ...el, ...updates } : el),
    }));
  }, [silentSet]);

  const silentUpdateSection = useCallback((sectionId, updates) => {
    silentSet(s => ({
      ...s,
      sectionsFront: s.sectionsFront.map(sec => sec.id === sectionId ? { ...sec, ...updates } : sec),
      sectionsBack:  s.sectionsBack.map( sec => sec.id === sectionId ? { ...sec, ...updates } : sec),
    }));
    setSelectedSection(prev => prev?.id === sectionId ? { ...prev, ...updates } : prev);
  }, [silentSet]);

  // -------------------------------------------------------------------------
  // userData — NOT part of undo history
  // -------------------------------------------------------------------------
  const [userData, setUserData] = useState(() => {
    const base = { ...selectedTemplate?.defaultData, ...prefill };
    if (prefill.name) {
      const parts = prefill.name.trim().split(/\s+/);
      base.firstName = parts[0] || '';
      base.lastName  = parts.slice(1).join(' ') || '';
    }
    delete base.name;
    return base;
  });

  const updateUserData = (field, value) => setUserData(prev => ({ ...prev, [field]: value }));

  // -------------------------------------------------------------------------
  // Section helpers
  // -------------------------------------------------------------------------
  const updateSection = (sectionId, updates) => {
    const isFront = sectionsFront.some(s => s.id === sectionId);
    push(s => {
      const patch = list => list.map(sec => sec.id === sectionId ? { ...sec, ...updates } : sec);
      return isFront
        ? { ...s, sectionsFront: patch(s.sectionsFront) }
        : { ...s, sectionsBack:  patch(s.sectionsBack)  };
    });
    setSelectedSection(prev => prev?.id === sectionId ? { ...prev, ...updates } : prev);
  };

  const handleReorderSection = (sectionId, direction) => {
    const isFront = sectionsFront.some(s => s.id === sectionId);
    push(s => isFront
      ? { ...s, sectionsFront: reorderSections(s.sectionsFront, sectionId, direction) }
      : { ...s, sectionsBack:  reorderSections(s.sectionsBack,  sectionId, direction) }
    );
  };

  // -------------------------------------------------------------------------
  // Selection state
  // -------------------------------------------------------------------------
  const [selectedSection,   setSelectedSection]   = useState(null);
  const [sectionAnchorRect, setSectionAnchorRect] = useState(null);
  const [selectedElement,   setSelectedElement]   = useState(null);
  const [elementAnchorRect, setElementAnchorRect] = useState(null);
  const [activeCanvas,      setActiveCanvas]      = useState('front');
  const [dragPreview,       setDragPreview]       = useState(null);

  const handleSelectSection = (section, domRect) => {
    setSelectedSection(section ?? null);
    setSectionAnchorRect(domRect ?? null);
    if (section) { setSelectedElement(null); setElementAnchorRect(null); }
  };

  const handleSelectElement = (id, rect) => {
    setSelectedElement(id);
    setElementAnchorRect(rect || null);
    if (id) { setSelectedSection(null); setSectionAnchorRect(null); }
  };

  // -------------------------------------------------------------------------
  // Element helpers
  // -------------------------------------------------------------------------
  const addElement = (el) => {
    if (activeCanvas === 'front') setElementsFront(prev => [...prev, el]);
    else                          setElementsBack(  prev => [...prev, el]);
    setSelectedElement(el.id);
    setSelectedSection(null);
  };

  const addElementToFront = (el) => { setElementsFront(prev => [...prev, el]); setSelectedElement(el.id); setSelectedSection(null); };
  const addElementToBack  = (el) => { setElementsBack(  prev => [...prev, el]); setSelectedElement(el.id); setSelectedSection(null); };

  const updateElement = (id, updates) => patchElement(id, updates);

  const deleteElement = (id) => {
    push(s => ({
      ...s,
      elementsFront: s.elementsFront.filter(el => el.id !== id),
      elementsBack:  s.elementsBack.filter( el => el.id !== id),
    }));
    setSelectedElement(null);
    setElementAnchorRect(null);
  };

  const moveElementToBack = (element) => {
    push(s => ({
      ...s,
      elementsFront: s.elementsFront.filter(el => el.id !== element.id),
      elementsBack:  [...s.elementsBack, element],
    }));
    setSelectedElement(element.id);
    setActiveCanvas('back');
  };

  const moveElementToFront = (element) => {
    push(s => ({
      ...s,
      elementsBack:  s.elementsBack.filter( el => el.id !== element.id),
      elementsFront: [...s.elementsFront, element],
    }));
    setSelectedElement(element.id);
    setActiveCanvas('front');
  };

  const mapSectionToSide = (section) => ({ ...section, id: `${section.id}-moved-${Date.now()}` });

  const moveSectionToBack = (section) => {
    const mapped = mapSectionToSide(section);
    push(s => ({
      ...s,
      sectionsFront: s.sectionsFront.filter(sec => sec.id !== section.id),
      sectionsBack:  [...s.sectionsBack, mapped],
    }));
    setSelectedSection(mapped);
    setActiveCanvas('back');
  };

  const moveSectionToFront = (section) => {
    const mapped = mapSectionToSide(section);
    push(s => ({
      ...s,
      sectionsBack:  s.sectionsBack.filter( sec => sec.id !== section.id),
      sectionsFront: [...s.sectionsFront, mapped],
    }));
    setSelectedSection(mapped);
    setActiveCanvas('front');
  };

  const allElements = [...elementsFront, ...elementsBack];

  const handleDragElement = (element, coords, targetSide) => setDragPreview({ element, x: coords.x, y: coords.y, targetSide });
  const handleDragEnd = () => setDragPreview(null);

  useEffect(() => {
    if (!selectedElement) setElementAnchorRect(null);
  }, [selectedElement]);

  useEffect(() => {
    if (!selectedElement) return;
    const el = allElements.find(e => e.id === selectedElement);
    if (!el) return;
    const CANVAS_W = 580;
    const canvasRef = activeCanvas === 'front' ? canvasFrontRef : canvasBackRef;
    if (!canvasRef.current) return;
    const parentRect = canvasRef.current.getBoundingClientRect();
    const scale = parentRect.width / CANVAS_W;
    const left = parentRect.left + el.x * scale;
    const top  = parentRect.top  + el.y * scale;
    const widthPx  = (el.width  || 0) * scale;
    const heightPx = (el.height || 0) * scale;
    setElementAnchorRect({ left, right: left + widthPx, top, bottom: top + heightPx, width: widthPx, height: heightPx });
  }, [allElements, selectedElement, activeCanvas]);

  // ── Background colors (live, not in undo history) ──
  const [bgFront, setBgFront] = useState(selectedTemplate?.bg     || '#ffffff');
  const [bgBack,  setBgBack]  = useState(selectedTemplate?.bgBack || '#ffffff');

  const handleLogoUpload = file => updateUserData('logoUrl', URL.createObjectURL(file));

  const handleDeleteSection = (sectionId) => {
    push(s => ({
      ...s,
      sectionsFront: s.sectionsFront.filter(sec => sec.id !== sectionId),
      sectionsBack:  s.sectionsBack.filter( sec => sec.id !== sectionId),
    }));
  };

  const handleAddTextSection = () => {
    const fieldKey   = `custom_${Date.now()}`;
    const newSection = {
      id: `text-added-${Date.now()}`,
      type: 'text', field: fieldKey, label: 'Added Text',
      x: 0.05, y: 0.35, width: 0.9, height: 0.3,
      fontSize: 16, fontFamily: 'Arial, sans-serif', color: '#000000',
      fontWeight: 'normal', fontStyle: 'normal', textAlign: 'left',
      textDecoration: 'none', textShadowBlur: 0, textShadowColor: '#000000',
      textStrokeWidth: 0, textStrokeColor: '#000000', opacity: 1, zIndex: 1,
    };
    if (activeCanvas === 'front') setSectionsFront(prev => [...prev, newSection]);
    else                          setSectionsBack(  prev => [...prev, newSection]);
    setUserData(prev => ({ ...prev, [fieldKey]: '' }));
    setSelectedSection(newSection);
    setSectionAnchorRect({
      left: window.innerWidth / 2, right: window.innerWidth / 2,
      top:  window.innerHeight / 2, bottom: window.innerHeight / 2,
      width: 0, height: 0,
    });
    setSelectedElement(null);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (!ctrl) return;
      if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo]);

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

  const activeTemplate = selectedTemplate
    ? { ...selectedTemplate, sectionsFront, sectionsBack }
    : null;

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
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        // Background color props
        bgFront={bgFront}
        bgBack={bgBack}
        onChangeBgFront={setBgFront}
        onChangeBgBack={setBgBack}
      />

      <div className={`canvas-area${(selectedSection || selectedElement) ? ' canvas-area--shift' : ''}`}>
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
            setSelectedElement={id => { setSelectedElement(id); setSelectedSection(null); setActiveCanvas('front'); }}
            onAddElement={addElementToFront}
            onUpdateElement={updateElement}
            onSilentUpdateElement={silentUpdateElement}
            onSilentUpdateSection={silentUpdateSection}
            onUpdateSection={updateSection}
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
            setSelectedElement={id => { setSelectedElement(id); setSelectedSection(null); setActiveCanvas('back'); }}
            onAddElement={addElementToBack}
            onUpdateElement={updateElement}
            onSilentUpdateElement={silentUpdateElement}
            onSilentUpdateSection={silentUpdateSection}
            onUpdateSection={updateSection}
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
          onReorderSection={handleReorderSection}
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