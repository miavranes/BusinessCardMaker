import { useState, useRef, useEffect, useCallback } from 'react';

const DEBUG = false;
import { useParams, useLocation } from 'react-router-dom';
import { templates } from '../templates';
import { reorderSections } from '../sectionSchema';
import Canvas from '../components/Canvas';
import FloatingEditor from '../components/FloatingEditor';
import Sidebar from '../components/Sidebar';
import { buildVCard } from '../qrGenerator';
import '../css/Editor.css';

const CANVAS_W = 580;
const CANVAS_H = 330;
const AUTOSAVE_INTERVAL = 30000; // 30 seconds
const STORAGE_KEY = 'bcard_editor_state';

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

// ---------------------------------------------------------------------------
// localStorage helpers — strip non-serializable imgElement before saving
// ---------------------------------------------------------------------------
function serializeElements(elements) {
  return elements.map(el => {
    const { imgElement, ...rest } = el;
    return rest;
  });
}

function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch { return false; }
}

function loadFromStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
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

  // ── Try to restore saved state for this template ──
  const storageKey = `${STORAGE_KEY}_${templateId || 'blank'}`;
  const saved = loadFromStorage(storageKey);

  const initialState = {
    sectionsFront: saved?.sectionsFront ?? (selectedTemplate?.sectionsFront ?? []).map(s => ({ ...s })),
    sectionsBack:  saved?.sectionsBack  ?? (selectedTemplate?.sectionsBack  ?? []).map(s => ({ ...s })),
    elementsFront: saved?.elementsFront ?? [],
    elementsBack:  saved?.elementsBack  ?? [],
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
    if (saved?.userData) return saved.userData;
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
  // Save state
  // -------------------------------------------------------------------------
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'unsaved' | 'saving'

  const saveNow = useCallback(() => {
    setSaveStatus('saving');
    const ok = saveToStorage(storageKey, {
      sectionsFront,
      sectionsBack,
      elementsFront: serializeElements(elementsFront),
      elementsBack:  serializeElements(elementsBack),
      userData,
    });
    setSaveStatus(ok ? 'saved' : 'unsaved');
  }, [storageKey, sectionsFront, sectionsBack, elementsFront, elementsBack, userData]);

  // Mark unsaved on any state change
  useEffect(() => { setSaveStatus('unsaved'); }, [state, userData]);

  // Auto-save every 30s
  useEffect(() => {
    const id = setInterval(saveNow, AUTOSAVE_INTERVAL);
    return () => clearInterval(id);
  }, [saveNow]);

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
  const [previewMode,       setPreviewMode]       = useState(false);

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

  // ── Duplicate element ──
  const duplicateElement = useCallback((id) => {
    const allEls = [...elementsFront, ...elementsBack];
    const el = allEls.find(e => e.id === id);
    if (!el) return;
    const clone = { ...el, id: `${el.type}-${Date.now()}`, x: el.x + 16, y: el.y + 16 };
    const inFront = elementsFront.some(e => e.id === id);
    if (inFront) setElementsFront(prev => [...prev, clone]);
    else         setElementsBack( prev => [...prev, clone]);
    setSelectedElement(clone.id);
    setSelectedSection(null);
  }, [elementsFront, elementsBack]);

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

  // ── Background colors ──
  const [bgFront, setBgFront] = useState(saved?.bgFront ?? selectedTemplate?.bg     ?? '#ffffff');
  const [bgBack,  setBgBack]  = useState(saved?.bgBack  ?? selectedTemplate?.bgBack ?? '#ffffff');

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

  // -------------------------------------------------------------------------
  // QR Code helpers
  // -------------------------------------------------------------------------
  const handleAddQRCode = useCallback(() => {
    const allSections = [...sectionsFront, ...sectionsBack];
    const vcard = buildVCard(userData, allSections);
    const size  = 90;
    addElement({
      id:           `qr-${Date.now()}`,
      type:         'qr',
      x:            (CANVAS_W - size) / 2,
      y:            (CANVAS_H - size) / 2,
      width:        size,
      height:       size,
      vcardString:  vcard,
      qrFg:         '#000000',
      qrBg:         '#ffffff',
      opacity:      1,
    });
  }, [userData, sectionsFront, sectionsBack, addElement]);

  // Auto-update vcardString on all QR elements whenever userData changes.
  const userDataKey = JSON.stringify(userData);
  useEffect(() => {
    const qrElements = [...elementsFront, ...elementsBack].filter(el => el.type === 'qr');
    if (!qrElements.length) return;
    const allSections = [...sectionsFront, ...sectionsBack];
    const vcard = buildVCard(userData, allSections);
    qrElements.forEach(qrEl => {
      silentUpdateElement(qrEl.id, { vcardString: vcard });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userDataKey]);

  // -------------------------------------------------------------------------
  // Keyboard shortcuts
  // -------------------------------------------------------------------------
  useEffect(() => {
    const onKey = (e) => {
      const ctrl = e.ctrlKey || e.metaKey;
      const tag = document.activeElement?.tagName?.toLowerCase();
      const inInput = tag === 'input' || tag === 'textarea' || tag === 'select';

      // Undo / Redo
      if (ctrl && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); return; }
      if (ctrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); return; }

      // Save
      if (ctrl && e.key === 's') { e.preventDefault(); saveNow(); return; }

      // Preview toggle
      if (e.key === 'Escape') { 
        if (previewMode) { setPreviewMode(false); return; }
        setSelectedSection(null); setSectionAnchorRect(null);
        setSelectedElement(null); setElementAnchorRect(null);
        return;
      }

      if (inInput) return;

      // Delete selected element
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElement) {
        e.preventDefault();
        deleteElement(selectedElement);
        return;
      }

      // Duplicate — Ctrl+D
      if (ctrl && e.key === 'd' && selectedElement) {
        e.preventDefault();
        duplicateElement(selectedElement);
        return;
      }

      // Arrow keys — move selected element by 1px (10px with Shift)
      if (selectedElement && ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
        const dy = e.key === 'ArrowUp'   ? -step : e.key === 'ArrowDown'  ? step : 0;
        const el = allElements.find(el => el.id === selectedElement);
        if (el) updateElement(el.id, { x: el.x + dx, y: el.y + dy });
        return;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo, saveNow, selectedElement, selectedSection, allElements, duplicateElement, previewMode]);

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

  // -------------------------------------------------------------------------
  // Download — html2canvas snapshot of entire .canvas-wrapper
  // -------------------------------------------------------------------------
  const downloadCanvasImages = useCallback(async () => {
    const prevSelectedSection = selectedSection;
    const prevSelectedElement = selectedElement;
    setSelectedSection(null);
    setSelectedElement(null);

    await new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 50)));

    const exportSide = async (canvasRef, name) => {
      const canvasEl = canvasRef.current;
      if (!canvasEl) return;
      const wrapper = canvasEl.closest('.canvas-wrapper');
      if (!wrapper) return;
      try {
        const { default: html2canvas } = await import('html2canvas');
        const snap = await html2canvas(wrapper, {
          backgroundColor: null,
          scale: CANVAS_W / wrapper.offsetWidth,
          useCORS: true,
          allowTaint: true,
          ignoreElements: (el) =>
            el.classList?.contains('resize-handle') ||
            el.classList?.contains('resize-nw') ||
            el.classList?.contains('resize-ne') ||
            el.classList?.contains('resize-sw') ||
            el.classList?.contains('resize-se'),
        });
        const url = snap.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url; a.download = name;
        document.body.appendChild(a); a.click();
        document.body.removeChild(a);
      } catch (err) {
        console.error('Export failed:', err);
        alert('Export failed. Make sure html2canvas is installed:\nnpm install html2canvas');
      }
    };

    await exportSide(canvasFrontRef, 'card-front.png');
    await exportSide(canvasBackRef,  'card-back.png');

    setSelectedSection(prevSelectedSection);
    setSelectedElement(prevSelectedElement);
  }, [selectedSection, selectedElement]);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className={`editor-container${previewMode ? ' preview-mode' : ''}`} ref={editorRef}>

      {/* Preview mode overlay bar */}
      {previewMode && (
        <div className="preview-bar">
          <span className="preview-bar-label">Preview Mode</span>
          <button className="preview-bar-exit" onClick={() => setPreviewMode(false)}>
            ✕ Exit Preview
          </button>
        </div>
      )}

      {!previewMode && (
        <Sidebar
          elements={allElements}
          selectedElement={selectedElement}
          activeCanvas={activeCanvas}
          onSetActiveCanvas={setActiveCanvas}
          onAddElement={addElement}
          onUpdateElement={updateElement}
          onDeleteElement={deleteElement}
          onAddTextSection={handleAddTextSection}
          onAddQRCode={handleAddQRCode}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={undo}
          onRedo={redo}
          bgFront={bgFront}
          bgBack={bgBack}
          onChangeBgFront={setBgFront}
          onChangeBgBack={setBgBack}
          onDownloadImages={downloadCanvasImages}
          onSave={saveNow}
          saveStatus={saveStatus}
          onPreview={() => setPreviewMode(true)}
          onDuplicateElement={duplicateElement}
        />
      )}

      <div className={`canvas-area${(selectedSection || selectedElement) && !previewMode ? ' canvas-area--shift' : ''}`}>
        <div
          className={`canvas-side ${activeCanvas === 'front' ? 'canvas-side--active' : ''}`}
          onClick={() => !previewMode && setActiveCanvas('front')}
        >
          {!previewMode && (
            <p className="canvas-label">
              Front Side
              {activeCanvas === 'front' && <span className="canvas-active-badge">● Active</span>}
            </p>
          )}
          <Canvas
            key="front-canvas"
            ref={canvasFrontRef}
            elements={elementsFront}
            selectedElement={previewMode ? null : selectedElement}
            setSelectedElement={id => { if (previewMode) return; setSelectedElement(id); setSelectedSection(null); setActiveCanvas('front'); }}
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
            showPreview={previewMode}
            selectedSection={previewMode ? null : selectedSection}
            onSelectSection={handleSelectSection}
            userData={userData}
            sections={sectionsFront}
            isActive={activeCanvas === 'front'}
          />
        </div>

        <div
          className={`canvas-side ${activeCanvas === 'back' ? 'canvas-side--active' : ''}`}
          onClick={() => !previewMode && setActiveCanvas('back')}
        >
          {!previewMode && (
            <p className="canvas-label">
              Back Side
              {activeCanvas === 'back' && <span className="canvas-active-badge">● Active</span>}
            </p>
          )}
          <Canvas
            key="back-canvas"
            ref={canvasBackRef}
            elements={elementsBack}
            selectedElement={previewMode ? null : selectedElement}
            setSelectedElement={id => { if (previewMode) return; setSelectedElement(id); setSelectedSection(null); setActiveCanvas('back'); }}
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
            showPreview={previewMode}
            selectedSection={previewMode ? null : selectedSection}
            onSelectSection={handleSelectSection}
            userData={userData}
            sections={sectionsBack}
            isActive={activeCanvas === 'back'}
          />
        </div>
      </div>

      {!previewMode && (selectedSection || selectedElement) && (
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
          onDuplicateElement={duplicateElement}
        />
      )}
    </div>
  );
}