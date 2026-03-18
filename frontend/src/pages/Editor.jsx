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
const AUTOSAVE_INTERVAL = 30000;
const STORAGE_KEY = 'bcard_editor_state';

const FIELD_ICON_SVGS = {
  phone: (color) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="${color}"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg>`,
  email: (color) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
  website: (color) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
};

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

function serializeElements(elements) {
  return elements.map(el => { const { imgElement, ...rest } = el; return rest; });
}

// ── FIX: save/load helpers koji rade pouzdano ──────────────────────────────
function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

function loadFromStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function Editor() {
  const { templateId } = useParams();
  const location = useLocation();
  const prefill = location.state?.prefill ?? {};
  const isFresh = location.state?.fresh === true;

  const selectedTemplate = templateId
    ? templates.find(t => t.id === Number(templateId))
    : null;

  const canvasFrontRef = useRef(null);
  const canvasBackRef  = useRef(null);
  const editorRef      = useRef(null);

  // ── FIX: storageKey mora biti stabilan string, ne zavisi od render-a ──
  const storageKey = `${STORAGE_KEY}_${templateId || 'blank'}`;

  // ── FIX: učitaj saved podatke jednom, na mount-u, uz provjeru isFresh ──
  // Ranije: saved se računao svaki render, a isFresh provjera bila je u useEffect
  // koji se izvršava NAKON prvog rendera — pa bi stari podaci bili učitani.
  const saved = useRef((() => {
    if (isFresh) {
      localStorage.removeItem(storageKey);
      return null;
    }
    return loadFromStorage(storageKey);
  })()).current;

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

  const [userData, setUserData] = useState(() => {
    // ── FIX: isFresh znači novi template — ignoriši sve što je saved ──
    // Ranije: saved?.userData se koristio čak i kad je isFresh=true jer
    // useEffect koji briše localStorage dolazi prekasno (nakon prvog rendera).
    if (isFresh || !saved?.userData) {
      const base = { ...selectedTemplate?.defaultData, ...prefill };
      if (prefill.name) {
        const parts = prefill.name.trim().split(/\s+/);
        base.firstName = parts[0] || '';
        base.lastName  = parts.slice(1).join(' ') || '';
      }
      delete base.name;
      return base;
    }
    return saved.userData;
  });

  const updateUserData = (field, value) => setUserData(prev => ({ ...prev, [field]: value }));

  const [saveStatus, setSaveStatus] = useState('saved');

  // ── FIX: koristimo ref za trenutne vrijednosti da saveNow ne mora biti
  // u dependency listi useCallback-a — tako interval ostaje stabilan ──
  const stateRef    = useRef(state);
  const userDataRef = useRef(userData);
  const bgFrontRef  = useRef(null);
  const bgBackRef   = useRef(null);

  useEffect(() => { stateRef.current = state; },    [state]);
  useEffect(() => { userDataRef.current = userData; }, [userData]);

  const saveNow = useCallback(() => {
    setSaveStatus('saving');
    const s = stateRef.current;
    const ok = saveToStorage(storageKey, {
      sectionsFront: s.sectionsFront,
      sectionsBack:  s.sectionsBack,
      elementsFront: serializeElements(s.elementsFront),
      elementsBack:  serializeElements(s.elementsBack),
      userData:      userDataRef.current,
      bgFront:       bgFrontRef.current,
      bgBack:        bgBackRef.current,
    });
    setSaveStatus(ok ? 'saved' : 'error');
  }, [storageKey]); // ← samo storageKey, stabilan string

  // Označi kao unsaved kad se nešto promijeni
  useEffect(() => { setSaveStatus('unsaved'); }, [state, userData]);

  // ── FIX: autosave interval sada ostaje stabilan jer saveNow ne mijenja referencu ──
  useEffect(() => {
    const id = setInterval(saveNow, AUTOSAVE_INTERVAL);
    return () => clearInterval(id);
  }, [saveNow]);

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

  const [selectedSection,   setSelectedSection]   = useState(null);
  const [sectionAnchorRect, setSectionAnchorRect] = useState(null);
  const [selectedElement,   setSelectedElement]   = useState(null);
  const [elementAnchorRect, setElementAnchorRect] = useState(null);
  const [activeCanvas,      setActiveCanvas]      = useState('front');
  const [dragPreview,       setDragPreview]       = useState(null);
  const [previewMode,       setPreviewMode]       = useState(false);

  const clipboardRef = useRef(null);

  const undoRef            = useRef(undo);
  const redoRef            = useRef(redo);
  const saveNowRef         = useRef(saveNow);
  const selectedElementRef = useRef(selectedElement);
  const allElementsRef     = useRef([]);
  const activeCanvasRef    = useRef(activeCanvas);
  const previewModeRef     = useRef(previewMode);

  useEffect(() => { undoRef.current = undo; },                        [undo]);
  useEffect(() => { redoRef.current = redo; },                        [redo]);
  useEffect(() => { saveNowRef.current = saveNow; },                  [saveNow]);
  useEffect(() => { selectedElementRef.current = selectedElement; },  [selectedElement]);
  useEffect(() => { activeCanvasRef.current = activeCanvas; },        [activeCanvas]);
  useEffect(() => { previewModeRef.current = previewMode; },          [previewMode]);

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

  const addElement = (el) => {
    if (activeCanvas === 'front') setElementsFront(prev => [...prev, el]);
    else                          setElementsBack(  prev => [...prev, el]);
    setSelectedElement(el.id);
    setSelectedSection(null);
  };

  const addElementToFront = (el) => { setElementsFront(prev => [...prev, el]); setSelectedElement(el.id); setSelectedSection(null); };
  const addElementToBack  = (el) => { setElementsBack(  prev => [...prev, el]); setSelectedElement(el.id); setSelectedSection(null); };

  const updateElement = (id, updates) => patchElement(id, updates);

  const deleteElement = useCallback((id) => {
    push(s => ({
      ...s,
      elementsFront: s.elementsFront.filter(el => el.id !== id),
      elementsBack:  s.elementsBack.filter( el => el.id !== id),
    }));
    setSelectedElement(null);
    setElementAnchorRect(null);
  }, [push]);

  const deleteElementRef = useRef(deleteElement);
  useEffect(() => { deleteElementRef.current = deleteElement; }, [deleteElement]);

  const copyElement = useCallback((id) => {
    const el = allElementsRef.current.find(e => e.id === id);
    if (el) clipboardRef.current = el;
  }, []);

  const pasteElement = useCallback(() => {
    const el = clipboardRef.current;
    if (!el) return;
    const clone = { ...el, id: `${el.type}-${Date.now()}`, x: (el.x ?? 0) + 16, y: (el.y ?? 0) + 16 };
    if (activeCanvasRef.current === 'front') setElementsFront(prev => [...prev, clone]);
    else                                     setElementsBack(  prev => [...prev, clone]);
    setSelectedElement(clone.id);
    setSelectedSection(null);
  }, []);

  const setElRect = useCallback((x, y, w, h, forFront) => {
    const canvasEl = (forFront ? canvasFrontRef : canvasBackRef).current;
    if (!canvasEl) return;
    const parentRect = canvasEl.getBoundingClientRect();
    const scale = parentRect.width / CANVAS_W;
    const left   = parentRect.left + x * scale;
    const top    = parentRect.top  + y * scale;
    const wPx    = w * scale;
    const hPx    = h * scale;
    setElementAnchorRect({ left, right: left + wPx, top, bottom: top + hPx, width: wPx, height: hPx });
    setSectionAnchorRect(null);
  }, []);

  const duplicateElement = useCallback((id) => {
    const el = allElementsRef.current.find(e => e.id === id);
    if (!el) return;
    const clone = { ...el, id: `${el.type}-${Date.now()}`, x: el.x + 16, y: el.y + 16 };
    const inFront = elementsFront.some(e => e.id === id);
    if (inFront) setElementsFront(prev => [...prev, clone]);
    else         setElementsBack( prev => [...prev, clone]);
    setSelectedElement(clone.id);
    setSelectedSection(null);
    setElRect(clone.x, clone.y, clone.width || 80, clone.height || 80, inFront);
  }, [elementsFront, elementsBack, setElRect]);

  const duplicateSection = useCallback((section) => {
    const isFront = sectionsFront.some(s => s.id === section.id);
    const addToCanvas = isFront ? setElementsFront : setElementsBack;
    const ts = Date.now();

    if (section.type === 'logo') {
      const w = Math.round(section.width  * CANVAS_W);
      const h = Math.round(section.height * CANVAS_H);
      const x = Math.round(section.x * CANVAS_W) + 16;
      const y = Math.round(section.y * CANVAS_H) + 16;

      let src = userData.logoUrl || section.src || null;
      if (!src) {
        const canvasEl = isFront ? canvasFrontRef.current : canvasBackRef.current;
        const wrapper  = canvasEl?.closest('.canvas-wrapper');
        const logoImg  = wrapper?.querySelector('.layout-component-wrapper img');
        if (logoImg?.src) src = logoImg.src;
      }

      const cloneId = `image-${ts}`;
      const clone = {
        id: cloneId, type: 'image',
        x, y, width: w, height: h,
        src: src || null, imgElement: null,
        opacity: section.opacity ?? 1,
        _sectionType: 'logo',
      };

      if (src) {
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => silentUpdateElement(cloneId, { imgElement: img });
        img.onerror = () => {
          const fi = new window.Image();
          fi.onload = () => silentUpdateElement(cloneId, { imgElement: fi });
          fi.src = src;
        };
        img.src = src;
      }

      addToCanvas(prev => [...prev, clone]);
      setSelectedElement(cloneId);
      setSelectedSection(null);
      setElRect(x, y, w, h, isFront);
      return;
    }

    const iconSvgFn = FIELD_ICON_SVGS[section.field];
    const iconColor = section.color || '#000000';
    const iconSize  = section.fontSize || 12;
    const sectionX  = Math.round(section.x * CANVAS_W);
    const sectionY  = Math.round(section.y * CANVAS_H);

    let content = '';
    if (section.field === 'name') {
      content = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
    } else {
      content = userData[section.field] || '';
    }

    if (iconSvgFn) {
      const svgString = iconSvgFn(iconColor);
      const dataUrl   = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
      const iconId    = `icon-${ts}`;

      const iconEl = {
        id: iconId, type: 'image',
        x: sectionX + 16, y: sectionY + 16,
        width: iconSize, height: iconSize,
        src: dataUrl, imgElement: null,
        color: iconColor, opacity: section.opacity ?? 1,
        _sectionType: 'icon', _sectionField: section.field,
      };

      const img = new window.Image();
      img.onload = () => silentUpdateElement(iconId, { imgElement: img });
      img.src = dataUrl;

      const gap    = 6;
      const textX  = sectionX + 16 + iconSize + gap;
      const textY  = sectionY + 16;
      const estW   = Math.max(60, content.length * (section.fontSize || 12) * 0.6);
      const estH   = (section.fontSize || 12) * (section.lineHeight || 1.2);
      const textEl = {
        id: `text-${ts + 1}`, type: 'text', content,
        x: textX, y: textY, width: estW, height: estH,
        fontSize: section.fontSize || 12, fontFamily: section.fontFamily || 'Arial, sans-serif',
        fontWeight: section.fontWeight || 'normal', fontStyle: section.fontStyle || 'normal',
        color: section.color || '#000000', textAlign: section.textAlign || 'left',
        textDecoration: section.textDecoration || 'none',
        textShadowBlur: section.textShadowBlur || 0, textShadowColor: section.textShadowColor || '#000000',
        textStrokeWidth: section.textStrokeWidth || 0, textStrokeColor: section.textStrokeColor || '#000000',
        lineHeight: section.lineHeight || 1.2, opacity: section.opacity ?? 1,
        _sectionType: 'text', _sectionField: section.field, _sectionLabel: section.label,
      };

      addToCanvas(prev => [...prev, iconEl, textEl]);
      setSelectedElement(textEl.id);
      setSelectedSection(null);
      setElRect(textX, textY, estW, estH, isFront);
      return;
    }

    const textX  = sectionX + 16;
    const textY  = sectionY + 16;
    const estW   = Math.max(60, content.length * (section.fontSize || 12) * 0.6);
    const estH   = (section.fontSize || 12) * (section.lineHeight || 1.2);
    const textClone = {
      id: `text-${ts}`, type: 'text', content,
      x: textX, y: textY, width: estW, height: estH,
      fontSize: section.fontSize || 12, fontFamily: section.fontFamily || 'Arial, sans-serif',
      fontWeight: section.fontWeight || 'normal', fontStyle: section.fontStyle || 'normal',
      color: section.color || '#000000', textAlign: section.textAlign || 'left',
      textDecoration: section.textDecoration || 'none',
      textShadowBlur: section.textShadowBlur || 0, textShadowColor: section.textShadowColor || '#000000',
      textStrokeWidth: section.textStrokeWidth || 0, textStrokeColor: section.textStrokeColor || '#000000',
      lineHeight: section.lineHeight || 1.2, opacity: section.opacity ?? 1,
      _sectionType: 'text', _sectionField: section.field, _sectionLabel: section.label,
    };

    addToCanvas(prev => [...prev, textClone]);
    setSelectedElement(textClone.id);
    setSelectedSection(null);
    setElRect(textX, textY, estW, estH, isFront);
  }, [userData, sectionsFront, silentUpdateElement, setElRect]);

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
  useEffect(() => { allElementsRef.current = allElements; });

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

  // ── FIX: bgFront/bgBack se čuvaju i u ref-u da saveNow ima pristup bez dependency liste ──
  const [bgFront, setBgFront] = useState(saved?.bgFront ?? selectedTemplate?.bg     ?? '#ffffff');
  const [bgBack,  setBgBack]  = useState(saved?.bgBack  ?? selectedTemplate?.bgBack ?? '#ffffff');
  useEffect(() => { bgFrontRef.current = bgFront; }, [bgFront]);
  useEffect(() => { bgBackRef.current  = bgBack;  }, [bgBack]);

  const handleLogoUpload = file => {
    const reader = new FileReader();
    reader.onload = e => updateUserData('logoUrl', e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDeleteSection = (sectionId) => {
    push(s => ({
      ...s,
      sectionsFront: s.sectionsFront.filter(sec => sec.id !== sectionId),
      sectionsBack:  s.sectionsBack.filter( sec => sec.id !== sectionId),
    }));
  };

  const handleAddTextSection = () => {
    const fieldKey = `custom_${Date.now()}`;
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

  const handleAddQRCode = useCallback(() => {
    const allSections = [...sectionsFront, ...sectionsBack];
    const vcard = buildVCard(userData, allSections);
    const size = 120; // ← povećano sa 90 na 120 za bolju čitljivost
    addElement({
      id: `qr-${Date.now()}`, type: 'qr',
      x: (CANVAS_W - size) / 2, y: (CANVAS_H - size) / 2,
      width: size, height: size,
      vcardString: vcard, qrFg: '#000000', qrBg: '#ffffff', opacity: 1,
    });
  }, [userData, sectionsFront, sectionsBack, addElement]);

  const userDataKey = JSON.stringify(userData);
  useEffect(() => {
    const qrElements = [...elementsFront, ...elementsBack].filter(el => el.type === 'qr');
    if (!qrElements.length) return;
    const allSections = [...sectionsFront, ...sectionsBack];
    const vcard = buildVCard(userData, allSections);
    qrElements.forEach(qrEl => silentUpdateElement(qrEl.id, { vcardString: vcard }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userDataKey]);

  useEffect(() => {
    const onKey = (e) => {
      const ctrl    = e.ctrlKey || e.metaKey;
      const tag     = document.activeElement?.tagName?.toLowerCase();
      const inInput = tag === 'input' || tag === 'textarea' || tag === 'select';

      if (ctrl && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undoRef.current(); return; }
      if (ctrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redoRef.current(); return; }
      if (ctrl && e.key === 's') { e.preventDefault(); saveNowRef.current(); return; }

      if (e.key === 'Escape') {
        if (previewModeRef.current) { setPreviewMode(false); return; }
        setSelectedSection(null); setSectionAnchorRect(null);
        setSelectedElement(null); setElementAnchorRect(null);
        return;
      }

      if (inInput) return;

      const selId = selectedElementRef.current;

      if (ctrl && e.key === 'c' && selId) { e.preventDefault(); copyElement(selId); return; }
      if (ctrl && e.key === 'v') { e.preventDefault(); pasteElement(); return; }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selId) { e.preventDefault(); deleteElementRef.current(selId); }
        return;
      }

      if (selId && ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
        const dy = e.key === 'ArrowUp'   ? -step : e.key === 'ArrowDown'  ? step : 0;
        const el = allElementsRef.current.find(el => el.id === selId);
        if (el) patchElement(el.id, { x: el.x + dx, y: el.y + dy });
        return;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  return (
    <div className={`editor-container${previewMode ? ' preview-mode' : ''}`} ref={editorRef}>

      {previewMode && (
        <div className="preview-bar">
          <span className="preview-bar-label">Preview Mode</span>
          <button className="preview-bar-exit" onClick={() => setPreviewMode(false)}>✕ Exit Preview</button>
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
            onDropElementOutside={deleteElement}
            onDropSectionOutside={handleDeleteSection}
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
          onDuplicateSection={duplicateSection}
        />
      )}
    </div>
  );
}