import { useRef, useState } from 'react';
import '../css/Sidebar.css';

import {
  Square, Circle, Triangle, Minus, Star, Heart, Hexagon, Octagon,
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  ArrowUpRight, ArrowUpLeft, ArrowDownRight, ArrowDownLeft,
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  ChevronsUp, ChevronsDown, ChevronsLeft, ChevronsRight,
  CornerUpRight, CornerDownRight, Undo2, Redo2,
  Check, X, Plus, AlertTriangle, AlertCircle, Info,
  HelpCircle, Zap, Flame, Sparkles, Crown, Trophy,
  Medal, Award, Shield, ShieldCheck, Bookmark, Flag,
  Tag, Hash, AtSign, Asterisk, Infinity,
  Home, User, Users, Phone, Mail, MapPin, Calendar,
  Clock, Search, Settings, Lock, Bell, Camera,
  Music, Video, Mic, Wifi, Bluetooth, Battery,
  Globe, Link, Share2, Download, Upload, Send,
  Flower2, Leaf, Feather, Moon, Sun, Cloud,
  CloudRain, Snowflake, Wind, Waves, Mountain, Trees,
} from 'lucide-react';

const CATEGORIES = [
  {
    id: 'shapes', label: 'Shapes',
    icons: [
      { Icon: Square, name: 'Square' }, { Icon: Circle, name: 'Circle' },
      { Icon: Triangle, name: 'Triangle' }, { Icon: Hexagon, name: 'Hexagon' },
      { Icon: Octagon, name: 'Octagon' }, { Icon: Star, name: 'Star' },
      { Icon: Heart, name: 'Heart' }, { Icon: Minus, name: 'Line' },
    ],
  },
  {
    id: 'arrows', label: 'Arrows',
    icons: [
      { Icon: ArrowUp, name: 'Up' }, { Icon: ArrowDown, name: 'Down' },
      { Icon: ArrowLeft, name: 'Left' }, { Icon: ArrowRight, name: 'Right' },
      { Icon: ArrowUpRight, name: 'Up-Right' }, { Icon: ArrowUpLeft, name: 'Up-Left' },
      { Icon: ArrowDownRight, name: 'Dn-Right' }, { Icon: ArrowDownLeft, name: 'Dn-Left' },
      { Icon: ChevronUp, name: 'Chev Up' }, { Icon: ChevronDown, name: 'Chev Dn' },
      { Icon: ChevronLeft, name: 'Chev Lt' }, { Icon: ChevronRight, name: 'Chev Rt' },
      { Icon: ChevronsUp, name: 'Dbl Up' }, { Icon: ChevronsDown, name: 'Dbl Dn' },
      { Icon: ChevronsLeft, name: 'Dbl Lt' }, { Icon: ChevronsRight, name: 'Dbl Rt' },
      { Icon: CornerUpRight, name: 'Corner UR' }, { Icon: CornerDownRight, name: 'Corner DR' },
      { Icon: Undo2, name: 'Undo' }, { Icon: Redo2, name: 'Redo' },
    ],
  },
  {
    id: 'symbols', label: 'Symbols',
    icons: [
      { Icon: Check, name: 'Check' }, { Icon: X, name: 'Cross' },
      { Icon: Plus, name: 'Plus' }, { Icon: AlertTriangle, name: 'Warning' },
      { Icon: AlertCircle, name: 'Alert' }, { Icon: Info, name: 'Info' },
      { Icon: HelpCircle, name: 'Help' }, { Icon: Zap, name: 'Zap' },
      { Icon: Flame, name: 'Flame' }, { Icon: Sparkles, name: 'Sparkles' },
      { Icon: Crown, name: 'Crown' }, { Icon: Trophy, name: 'Trophy' },
      { Icon: Medal, name: 'Medal' }, { Icon: Award, name: 'Award' },
      { Icon: Shield, name: 'Shield' }, { Icon: ShieldCheck, name: 'Shield ✓' },
      { Icon: Bookmark, name: 'Bookmark' }, { Icon: Flag, name: 'Flag' },
      { Icon: Tag, name: 'Tag' }, { Icon: Hash, name: 'Hash' },
      { Icon: AtSign, name: 'At' }, { Icon: Asterisk, name: 'Asterisk' },
      { Icon: Infinity, name: 'Infinity' },
    ],
  },
  {
    id: 'objects', label: 'Objects',
    icons: [
      { Icon: Home, name: 'Home' }, { Icon: User, name: 'User' },
      { Icon: Users, name: 'Users' }, { Icon: Phone, name: 'Phone' },
      { Icon: Mail, name: 'Mail' }, { Icon: MapPin, name: 'Location' },
      { Icon: Calendar, name: 'Calendar' }, { Icon: Clock, name: 'Clock' },
      { Icon: Search, name: 'Search' }, { Icon: Settings, name: 'Settings' },
      { Icon: Lock, name: 'Lock' }, { Icon: Bell, name: 'Bell' },
      { Icon: Camera, name: 'Camera' }, { Icon: Music, name: 'Music' },
      { Icon: Video, name: 'Video' }, { Icon: Mic, name: 'Mic' },
      { Icon: Wifi, name: 'WiFi' }, { Icon: Bluetooth, name: 'BT' },
      { Icon: Battery, name: 'Battery' }, { Icon: Globe, name: 'Globe' },
      { Icon: Link, name: 'Link' }, { Icon: Share2, name: 'Share' },
      { Icon: Download, name: 'Download' }, { Icon: Upload, name: 'Upload' },
      { Icon: Send, name: 'Send' },
    ],
  },
  {
    id: 'nature', label: 'Nature',
    icons: [
      { Icon: Flower2, name: 'Flower' }, { Icon: Leaf, name: 'Leaf' },
      { Icon: Feather, name: 'Feather' }, { Icon: Moon, name: 'Moon' },
      { Icon: Sun, name: 'Sun' }, { Icon: Cloud, name: 'Cloud' },
      { Icon: CloudRain, name: 'Rain' }, { Icon: Snowflake, name: 'Snow' },
      { Icon: Wind, name: 'Wind' }, { Icon: Waves, name: 'Waves' },
      { Icon: Mountain, name: 'Mountain' }, { Icon: Trees, name: 'Trees' },
    ],
  },
];

function svgFromButton(buttonEl) {
  const svg = buttonEl.querySelector('svg');
  if (!svg) return null;
  const clone = svg.cloneNode(true);
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width', '120');
  clone.setAttribute('height', '120');
  const svgString = new XMLSerializer().serializeToString(clone);
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
}

const DEBUG = false;

export default function Sidebar({
  elements, selectedElement,
  activeCanvas, onSetActiveCanvas,
  onAddElement, onUpdateElement, onDeleteElement,
  onAddTextSection,
}) {
  const fileRef = useRef(null);
  const [activeCat, setActiveCat] = useState('shapes');
  const [iconColor, setIconColor] = useState('#8b5cf6');
  const [search, setSearch] = useState('');

  const addIcon = (e) => {
    const dataUrl = svgFromButton(e.currentTarget);
    if (!dataUrl) {
      DEBUG && console.error('Could not extract SVG from button');
      // fallback: try taking the innerHTML of the button (should contain svg)
      const html = e.currentTarget.innerHTML;
      const match = html.match(/<svg[\s\S]*<\/svg>/i);
      if (match) {
        const fallback = 'data:image/svg+xml;charset=utf-8,' +
          encodeURIComponent(match[0]);
        DEBUG && console.warn('using fallback svg data URL');
        return addIcon({ currentTarget: { querySelector: () => {
          const tmp = document.createElement('div');
          tmp.innerHTML = match[0];
          return tmp.firstChild;
        } } });
      }
      return;
    }
    DEBUG && console.log('Creating icon with dataUrl:', dataUrl.substring(0, 100) + '...');
    const img = new window.Image();
    img.onload = () => {
      DEBUG && console.log('Image loaded successfully, adding element');
      // center element inside 580×330 canvas (same size used in Canvas.jsx)
      const W = 60;
      const H = 60;
      const newElement = {
        id: `icon-${Date.now()}`,
        type: 'image',
        x: (580 - W) / 2,
        y: (330 - H) / 2,
        width: W, height: H,
        imgElement: img,
        src: dataUrl,
        opacity: 1,
      };
      DEBUG && console.log('Calling onAddElement with:', newElement);
      onAddElement(newElement);
    };
    img.onerror = (e) => DEBUG && console.error('img failed to load SVG data URL', e);
    img.src = dataUrl;
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    DEBUG && console.log('Uploading image:', file.name);
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      DEBUG && console.log('Image loaded, dimensions:', img.naturalWidth, 'x', img.naturalHeight);
      const maxW = 180;
      const ratio = img.naturalHeight / img.naturalWidth;
      const w = Math.min(maxW, img.naturalWidth);
      const newElement = {
        id: `image-${Date.now()}`,
        type: 'image',
        x: 40, y: 40,
        width: w, height: w * ratio,
        imgElement: img, src: url, opacity: 1,
      };
      console.log('Calling onAddElement with:', newElement);
      onAddElement(newElement);
    };
    img.src = url;
    e.target.value = '';
  };

  const allIcons = CATEGORIES.flatMap(c => c.icons);
  const displayIcons = search
    ? allIcons.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
    : (CATEGORIES.find(c => c.id === activeCat)?.icons ?? []);

  return (
    <aside className="sidebar">
      <div className="sb-header">
        <span className="sb-title">Sidebar</span>
      </div>

      <div className="sb-canvas-toggle">
        <button
          className={`sb-canvas-btn ${activeCanvas === 'front' ? 'active' : ''}`}
          onClick={() => onSetActiveCanvas('front')}
        >
          Front
        </button>
        <button
          className={`sb-canvas-btn ${activeCanvas === 'back' ? 'active' : ''}`}
          onClick={() => onSetActiveCanvas('back')}
        >
          Back
        </button>
      </div>

      <div className="sb-search-wrap">
        <svg className="sb-search-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          className="sb-search"
          placeholder="Search icons…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && <button className="sb-search-clear" onClick={() => setSearch('')}>×</button>}
      </div>

      {!search && (
        <div className="sb-cats">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`sb-cat-btn ${activeCat === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCat(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      <div className="sb-icon-color-row">
        <span className="sb-swatch-label">Icon color</span>
        <label className="sb-swatch-wrap" style={{ background: iconColor }}>
          <input type="color" value={iconColor} onChange={e => setIconColor(e.target.value)} />
        </label>
      </div>

      <div className="sb-icons-grid">
        {displayIcons.map(({ Icon, name }) => (
          <button
            key={name}
            className="sb-icon-btn"
            onClick={addIcon}
            title={name}
          >
            <Icon size={22} color={iconColor} strokeWidth={1.8} />
            <span>{name}</span>
          </button>
        ))}
        {displayIcons.length === 0 && (
          <p className="sb-empty">No icons found</p>
        )}
      </div>

      <div className="sb-divider" style={{ margin: '8px 14px' }} />

      <div className="sb-upload-section">
        <p className="sb-section-title" style={{ padding: '0 16px' }}>Image</p>
        <button className="sb-upload-btn" onClick={() => fileRef.current?.click()}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
          </svg>
          Upload Image
        </button>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleImageUpload} />
      </div>

      <div className="sb-divider" style={{ margin: '8px 14px' }} />

      <div className="sb-upload-section">
        <p className="sb-section-title" style={{ padding: '0 16px' }}>Text</p>
        <button className="sb-upload-btn" onClick={() => {
          DEBUG && console.log('Add Text button clicked!');
          onAddTextSection();
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 7V4h16v3M9 20h6M12 4v16" />
          </svg>
          Add Text
        </button>
      </div>
    </aside>
  );
}