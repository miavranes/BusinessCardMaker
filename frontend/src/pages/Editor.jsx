import { useState, useRef, useEffect, useCallback } from 'react';

const DEBUG = false;
import { useParams, useLocation, useSearchParams } from 'react-router-dom';
import { templates } from '../templates';
import { reorderSections } from '../sectionSchema';
import Canvas from '../components/Canvas';
import FloatingEditor from '../components/FloatingEditor';
import Sidebar from '../components/Sidebar';
import { buildVCard } from '../qrGenerator';
import { encodeShareData, decodeShareData, generateCode } from '../shareUtils';
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

// Maps a section field + userData value to an actionable href
function getSectionAction(section, userData) {
  let val = '';
  if (section.field === 'name') {
    val = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
  } else {
    val = userData[section.field] || '';
  }
  if (!val) return null;

  const clean = val.trim();
  switch (section.field) {
    case 'phone':
      return { href: `tel:${clean.replace(/\s/g, '')}`, label: 'Call', color: '#22c55e' };
    case 'email':
      return { href: `mailto:${clean}`, label: 'Email', color: '#6366f1' };
    case 'website':
      return { href: clean.startsWith('http') ? clean : `https://${clean}`, label: 'Visit', color: '#0ea5e9' };
    case 'instagram':
      return { href: `https://instagram.com/${clean.replace('@', '')}`, label: 'Instagram', color: '#e1306c' };
    case 'facebook':
      return { href: `https://facebook.com/${clean.replace('@', '')}`, label: 'Facebook', color: '#1877f2' };
    case 'linkedin':
      return { href: `https://linkedin.com/in/${clean.replace('@', '')}`, label: 'LinkedIn', color: '#0077b5' };
    case 'twitter':
      return { href: `https://twitter.com/${clean.replace('@', '')}`, label: 'Twitter / X', color: '#000000' };
    case 'tiktok':
      return { href: `https://tiktok.com/@${clean.replace('@', '')}`, label: 'TikTok', color: '#010101' };
    default:
      return null;
  }
}

// Renders clickable hotspots over a canvas in preview mode
function PreviewHotspots({ sections, userData, canvasW, canvasH }) {
  return (
    <>
      {sections.map(section => {
        const action = getSectionAction(section, userData);
        if (!action) return null;
        const left   = (section.x      || 0) * 100;
        const top    = (section.y      || 0) * 100;
        const width  = (section.width  || 0.9) * 100;
        const height = Math.max((section.height || 0.12) * 100, 8);
        return (
          <a
            key={section.id}
            href={action.href}
            target="_blank"
            rel="noopener noreferrer"
            title={action.label}
            style={{
              position: 'absolute',
              left: `${left}%`, top: `${top}%`,
              width: `${width}%`, height: `${height}%`,
              borderRadius: 6,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
              padding: '0 6px',
              textDecoration: 'none',
              zIndex: 10,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = `${action.color}22`; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <span style={{
              fontSize: 9, fontWeight: 700, color: action.color,
              background: `${action.color}22`, borderRadius: 4,
              padding: '1px 5px', opacity: 0, transition: 'opacity 0.15s',
              pointerEvents: 'none',
            }}
              className="hotspot-label"
            >
              {action.label} ↗
            </span>
          </a>
        );
      })}
      <style>{`
        a:hover .hotspot-label { opacity: 1 !important; }
      `}</style>
    </>
  );
}

// Code gate — shown to recipients before they can view the card
function CodeGate({ onUnlock }) {
  const [input, setInput]   = useState('');
  const [shake, setShake]   = useState(false);
  const [error, setError]   = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = () => {
    const result = onUnlock(input.trim().toUpperCase());
    if (!result) {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setTimeout(() => setError(false), 2000);
      setInput('');
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 0,
    }}>
      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-8px); }
          40%      { transform: translateX(8px); }
          60%      { transform: translateX(-6px); }
          80%      { transform: translateX(6px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .code-gate-card { animation: fadeUp 0.5s ease; }
      `}</style>

      {/* Logo / icon */}
      <div style={{ marginBottom: 32, opacity: 0.4 }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </div>

      <div className="code-gate-card" style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 20, padding: '40px 48px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24,
        minWidth: 340,
        animation: shake ? 'shake 0.5s ease' : undefined,
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.02em' }}>
            Enter Access Code
          </h2>
          <p style={{ margin: '8px 0 0', fontSize: 13, color: '#64748b' }}>
            This card is protected. Enter the code to view it.
          </p>
        </div>

        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="XXXXXX"
          maxLength={6}
          style={{
            width: '100%', boxSizing: 'border-box',
            background: error ? 'rgba(239,68,68,0.1)' : 'rgba(0,0,0,0.3)',
            border: `1px solid ${error ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: 12, padding: '14px 16px',
            color: '#f1f5f9', fontSize: 24, fontFamily: 'monospace',
            textAlign: 'center', letterSpacing: '0.4em',
            outline: 'none', transition: 'border 0.2s, background 0.2s',
          }}
        />

        {error && (
          <p style={{ margin: '-12px 0 -8px', fontSize: 12, color: '#ef4444' }}>
            Incorrect code. Please try again.
          </p>
        )}

        <button
          onClick={handleSubmit}
          style={{
            width: '100%', padding: '13px 0',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            border: 'none', borderRadius: 12,
            color: '#fff', fontSize: 14, fontWeight: 700,
            cursor: 'pointer', letterSpacing: '0.02em',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          View Card
        </button>
      </div>
    </div>
  );
}

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

function rehydrateElements(elements) {
  if (!elements) return [];
  return elements.map(el => {
    if (el.type !== 'image' || !el.src) return el;
    return { ...el, imgElement: null };
  });
}

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

function SaveIndicator({ status }) {
  const map = {
    saved:   { color: '#4ade80', label: '✓ Saved' },
    unsaved: { color: '#f59e0b', label: '● Unsaved' },
    saving:  { color: '#94a3b8', label: '… Saving' },
  };
  const { color, label } = map[status] || map.unsaved;
  return (
    <span style={{ fontSize: 11, color, fontWeight: 500, letterSpacing: '0.02em' }}>
      {label}
    </span>
  );
}

export default function Editor() {
  const { templateId } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const prefill = location.state?.prefill ?? {};

  const shareData = searchParams.get('data');
  const isSharedPreview = searchParams.get('mode') === 'preview' && !!shareData;
  const sharedState = isSharedPreview ? decodeShareData(shareData) : null;

  const isFresh = (() => {
    if (location.state?.fresh !== true) return false;
    const key = `editor_is_new_${templateId || 'blank'}`;
    if (sessionStorage.getItem(key) === '1') {
      sessionStorage.removeItem(key);
      return true;
    }
    return false;
  })();

  const selectedTemplate = templateId
    ? templates.find(t => t.id === Number(templateId))
    : null;

  const canvasFrontRef = useRef(null);
  const canvasBackRef  = useRef(null);
  const editorRef      = useRef(null);

  const storageKey = `${STORAGE_KEY}_${templateId || 'blank'}`;

  const saved = useRef((() => {
    if (isFresh) {
      localStorage.removeItem(storageKey);
      return null;
    }
    return loadFromStorage(storageKey);
  })()).current;

  const initialState = {
    sectionsFront: sharedState?.sectionsFront
      ?? saved?.sectionsFront
      ?? (selectedTemplate?.sectionsFront ?? []).map(s => ({ ...s })),
    sectionsBack: sharedState?.sectionsBack
      ?? saved?.sectionsBack
      ?? (selectedTemplate?.sectionsBack  ?? []).map(s => ({ ...s })),
    elementsFront: rehydrateElements(sharedState?.elementsFront ?? saved?.elementsFront ?? []),
    elementsBack:  rehydrateElements(sharedState?.elementsBack  ?? saved?.elementsBack  ?? []),
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
    if (sharedState?.userData) return sharedState.userData;
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
  }, [storageKey]);

  useEffect(() => { setSaveStatus('unsaved'); }, [state, userData]);

  useEffect(() => {
    const id = setInterval(saveNow, AUTOSAVE_INTERVAL);
    return () => clearInterval(id);
  }, [saveNow]);

  // ── Rehydrate imgElements after mount ──
  useEffect(() => {
    const allEls = [...initialState.elementsFront, ...initialState.elementsBack];
    allEls.forEach(el => {
      if (el.type !== 'image' || !el.src) return;
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => silentUpdateElement(el.id, { imgElement: img });
      img.onerror = () => {
        const img2 = new window.Image();
        img2.onload = () => silentUpdateElement(el.id, { imgElement: img2 });
        img2.src = el.src;
      };
      img.src = el.src;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  const [previewMode,       setPreviewMode]       = useState(isSharedPreview);
  const [isFlipped,         setIsFlipped]         = useState(false);
  const [codeUnlocked,      setCodeUnlocked]      = useState(!isSharedPreview);
  const [shareUrl,          setShareUrl]          = useState(null);
  const [shareCode,         setShareCode]         = useState(null);
  const [shareCopied,       setShareCopied]       = useState(false);
  const [codeCopied,        setCodeCopied]        = useState(false);
  const sharePopoverRef = useRef(null);

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
      const w = Math.max(Math.round((section.width  || 0) * CANVAS_W), 40);
      const h = Math.max(Math.round((section.height || 0) * CANVAS_H), 40);
      const x = Math.round((section.x || 0) * CANVAS_W) + 16;
      const y = Math.round((section.y || 0) * CANVAS_H) + 16;

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

  const [bgFront, setBgFront] = useState(
    sharedState?.bgFront ?? saved?.bgFront ?? selectedTemplate?.bg     ?? '#ffffff'
  );
  const [bgBack, setBgBack] = useState(
    sharedState?.bgBack  ?? saved?.bgBack  ?? selectedTemplate?.bgBack ?? '#ffffff'
  );
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
    const size = 120;
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

  // Share popover close on outside click
  useEffect(() => {
    if (!shareUrl) return;
    const handler = (e) => {
      if (sharePopoverRef.current && !sharePopoverRef.current.contains(e.target)) {
        setShareUrl(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [shareUrl]);

  const handleShare = useCallback(() => {
    if (shareUrl) { setShareUrl(null); return; }
    const code = generateCode();
    setShareCode(code);
    const encoded = encodeShareData(state, userData, bgFront, bgBack, code);
    if (!encoded) { alert('Greška pri dijeljenju.'); return; }
    const url = new URL(window.location.href);
    url.search = '';
    url.searchParams.set('mode', 'preview');
    url.searchParams.set('data', encoded);
    setShareUrl(url.toString());
    setShareCopied(false);
    setCodeCopied(false);
  }, [state, userData, bgFront, bgBack, shareUrl]);

  const handleCopyShareUrl = useCallback(() => {
    if (!shareUrl) return;
    navigator.clipboard?.writeText(shareUrl).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    });
  }, [shareUrl]);

  const handleCopyCode = useCallback(() => {
    if (!shareCode) return;
    navigator.clipboard?.writeText(shareCode).then(() => {
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    });
  }, [shareCode]);

  const handleCodeUnlock = useCallback((entered) => {
    if (entered === sharedState?.accessCode) {
      setCodeUnlocked(true);
      return true;
    }
    return false;
  }, [sharedState]);

  // Canvas props shared between preview and editor modes
  const frontCanvasProps = {
    key: 'front-canvas',
    ref: canvasFrontRef,
    elements: elementsFront,
    selectedElement: previewMode ? null : selectedElement,
    setSelectedElement: id => { if (previewMode) return; setSelectedElement(id); setSelectedSection(null); setActiveCanvas('front'); },
    onAddElement: addElementToFront,
    onUpdateElement: updateElement,
    onSilentUpdateElement: silentUpdateElement,
    onSilentUpdateSection: silentUpdateSection,
    onUpdateSection: updateSection,
    onMoveElementToOtherCanvas: moveElementToBack,
    otherCanvasRef: canvasBackRef,
    onMoveSectionToOtherCanvas: moveSectionToBack,
    onElementSelect: handleSelectElement,
    onDragElement: handleDragElement,
    onDragEnd: handleDragEnd,
    dragPreview: dragPreview,
    backgroundColor: bgFront,
    template: activeTemplate,
    isBack: false,
    showPreview: previewMode,
    selectedSection: previewMode ? null : selectedSection,
    onSelectSection: handleSelectSection,
    userData: userData,
    sections: sectionsFront,
    isActive: activeCanvas === 'front',
    onDropElementOutside: deleteElement,
    onDropSectionOutside: handleDeleteSection,
  };

  const backCanvasProps = {
    key: 'back-canvas',
    ref: canvasBackRef,
    elements: elementsBack,
    selectedElement: previewMode ? null : selectedElement,
    setSelectedElement: id => { if (previewMode) return; setSelectedElement(id); setSelectedSection(null); setActiveCanvas('back'); },
    onAddElement: addElementToBack,
    onUpdateElement: updateElement,
    onSilentUpdateElement: silentUpdateElement,
    onSilentUpdateSection: silentUpdateSection,
    onUpdateSection: updateSection,
    onMoveElementToOtherCanvas: moveElementToFront,
    otherCanvasRef: canvasFrontRef,
    onMoveSectionToOtherCanvas: moveSectionToFront,
    onElementSelect: handleSelectElement,
    onDragElement: handleDragElement,
    onDragEnd: handleDragEnd,
    dragPreview: dragPreview,
    backgroundColor: bgBack,
    template: activeTemplate,
    isBack: true,
    showPreview: previewMode,
    selectedSection: previewMode ? null : selectedSection,
    onSelectSection: handleSelectSection,
    userData: userData,
    sections: sectionsBack,
    isActive: activeCanvas === 'back',
  };

  return (
    <div className={`editor-container${previewMode ? ' preview-mode' : ''}`} ref={editorRef}>
      <style>{`
        @keyframes cardEntrance {
          from { opacity: 0; transform: translateY(32px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .preview-card-entrance { animation: cardEntrance 0.55s cubic-bezier(0.22,1,0.36,1) forwards; }
        .preview-btn-entrance  { animation: fadeInUp 0.4s 0.25s cubic-bezier(0.22,1,0.36,1) both; }
      `}</style>

      {/* Code gate for shared preview */}
      {isSharedPreview && !codeUnlocked && (
        <CodeGate onUnlock={handleCodeUnlock} />
      )}

      {/* ── EDITOR topbar ── */}
      {!previewMode && !isSharedPreview && (
        <div className="editor-topbar">
          <button className="topbar-btn topbar-btn--ghost" onClick={() => setPreviewMode(true)} title="Preview">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            Preview
          </button>
          <div style={{ position: 'relative' }} ref={sharePopoverRef}>
            <button className="topbar-btn topbar-btn--primary" onClick={handleShare} title="Share">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              Share
            </button>
            {shareUrl && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                background: '#1e293b', border: '1px solid #334155',
                borderRadius: 12, padding: '16px 18px', zIndex: 9999,
                display: 'flex', flexDirection: 'column', gap: 14,
                boxShadow: '0 12px 32px rgba(0,0,0,0.45)', minWidth: 420,
              }}>
                {/* URL row */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ color: '#64748b', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Preview Link
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      readOnly value={shareUrl}
                      onClick={e => e.target.select()}
                      style={{
                        flex: 1, background: '#0f172a', border: '1px solid #334155',
                        borderRadius: 8, padding: '8px 10px', color: '#94a3b8',
                        fontSize: 12, fontFamily: 'monospace', outline: 'none',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}
                    />
                    <button
                      onClick={handleCopyShareUrl}
                      onMouseEnter={e => e.currentTarget.style.background = '#4f46e5'}
                      onMouseLeave={e => e.currentTarget.style.background = '#6366f1'}
                      style={{
                        flexShrink: 0, background: '#6366f1', border: 'none',
                        borderRadius: 8, padding: '8px 0', color: '#fff',
                        fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        transition: 'background 0.2s', width: 90, textAlign: 'center',
                      }}
                    >
                      {shareCopied ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                {/* Divider */}
                <div style={{ borderTop: '1px solid #1e3a5f' }} />

                {/* Code row */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ color: '#64748b', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Access Code
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      flex: 1, background: '#0f172a', border: '1px solid #334155',
                      borderRadius: 8, padding: '8px 14px',
                      display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6,
                    }}>
                      {shareCode && shareCode.split('').map((char, i) => (
                        <span key={i} style={{
                          display: 'inline-block', width: 28, height: 36,
                          lineHeight: '36px', textAlign: 'center',
                          background: '#1e293b', borderRadius: 6,
                          color: '#a5b4fc', fontSize: 18, fontWeight: 800,
                          fontFamily: 'monospace', letterSpacing: 0,
                          border: '1px solid #334155',
                        }}>
                          {char}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={handleCopyCode}
                      onMouseEnter={e => e.currentTarget.style.background = '#4f46e5'}
                      onMouseLeave={e => e.currentTarget.style.background = '#6366f1'}
                      style={{
                        flexShrink: 0, background: '#6366f1', border: 'none',
                        borderRadius: 8, padding: '8px 0', color: '#fff',
                        fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        transition: 'background 0.2s', width: 90, textAlign: 'center',
                      }}
                    >
                      {codeCopied ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                  <p style={{ margin: 0, fontSize: 11, color: '#475569', lineHeight: 1.4 }}>
                    Share this code alongside the link. Recipients must enter it to view your card.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── EDITOR preview bar ── */}
      {previewMode && !isSharedPreview && (
        <div className="preview-bar">
          <span className="preview-bar-label">Preview Mode</span>
          <button className="preview-bar-exit" onClick={() => setPreviewMode(false)}>✕ Exit Preview</button>
        </div>
      )}

      {/* ── SIDEBAR ── */}
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
          saveStatus={saveStatus}
          onDuplicateElement={duplicateElement}
        />
      )}

      {/* ── PREVIEW MODE: flip card ── */}
      {previewMode && codeUnlocked && (
        <div style={{
          position: 'fixed', inset: 0,
          background: '#000000',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 32, zIndex: 1,
          paddingTop: isSharedPreview ? 0 : 48,
        }}>
          {/* Flip card container */}
          <div className="preview-card-entrance" style={{ perspective: '1400px' }}>
            <div style={{
              position: 'relative',
              width: 'min(580px, 90vw)',
              aspectRatio: '580/330',
              transformStyle: 'preserve-3d',
              transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              borderRadius: 24,
              boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
            }}>
              {/* FRONT face */}
              <div style={{
                position: 'absolute', inset: 0,
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                borderRadius: 24, overflow: 'hidden',
              }}>
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                  <Canvas {...frontCanvasProps} />
                  <PreviewHotspots sections={sectionsFront} userData={userData} />
                </div>
              </div>

              {/* BACK face */}
              <div style={{
                position: 'absolute', inset: 0,
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                borderRadius: 24, overflow: 'hidden',
              }}>
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                  <Canvas {...backCanvasProps} />
                  <PreviewHotspots sections={sectionsBack} userData={userData} />
                </div>
              </div>
            </div>
          </div>

          {/* Flip button */}
          <button
            className="preview-btn-entrance"
            onClick={() => setIsFlipped(f => !f)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 40, padding: '10px 22px',
              color: '#cbd5e1', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', backdropFilter: 'blur(8px)',
              transition: 'background 0.2s, border 0.2s, color 0.2s',
              letterSpacing: '0.01em',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(99,102,241,0.2)';
              e.currentTarget.style.border = '1px solid rgba(99,102,241,0.5)';
              e.currentTarget.style.color = '#a5b4fc';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
              e.currentTarget.style.border = '1px solid rgba(255,255,255,0.12)';
              e.currentTarget.style.color = '#cbd5e1';
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ transition: 'transform 0.6s', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
            {isFlipped ? 'View Front' : 'View Back'}
          </button>
        </div>
      )}

      {/* ── EDITOR MODE: normal canvas area ── */}
      {!previewMode && (
        <>
          <div className={`canvas-area${(selectedSection || selectedElement) ? ' canvas-area--shift' : ''}`}>
            <div
              className={`canvas-side ${activeCanvas === 'front' ? 'canvas-side--active' : ''}`}
              onClick={() => setActiveCanvas('front')}
            >
              <p className="canvas-label">
                Front Side
                {activeCanvas === 'front' && <span className="canvas-active-badge">● Active</span>}
              </p>
              <Canvas {...frontCanvasProps} />
            </div>

            <div
              className={`canvas-side ${activeCanvas === 'back' ? 'canvas-side--active' : ''}`}
              onClick={() => setActiveCanvas('back')}
            >
              <p className="canvas-label">
                Back Side
                {activeCanvas === 'back' && <span className="canvas-active-badge">● Active</span>}
              </p>
              <Canvas {...backCanvasProps} />
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
              onDuplicateElement={duplicateElement}
              onDuplicateSection={duplicateSection}
              onSilentUpdateSection={silentUpdateSection}
            />
          )}
        </>
      )}
    </div>
  );
}