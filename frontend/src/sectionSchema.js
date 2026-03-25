/**
 * SECTION SCHEMA — shared across all templates
 *
 * Every section object follows this shape. Templates only need to define
 * the values relevant to them; everything else falls back to template-level
 * defaults or the hardcoded defaults listed here.
 *
 * ┌─────────────────────────────────────────────────────────────┐
 * │ FIELD           │ TYPE              │ DEFAULT               │
 * ├─────────────────┼───────────────────┼───────────────────────┤
 * │ id              │ string            │ required              │
 * │ type            │ 'text' | 'logo'   │ required              │
 * │ field           │ string            │ required (text only)  │
 * │ label           │ string            │ id                    │
 * │                 │                   │                       │
 * │ x               │ 0–1 (% of card)   │ 0                     │
 * │ y               │ 0–1               │ 0                     │
 * │ width           │ 0–1               │ 1                     │
 * │ height          │ 0–1               │ 1                     │
 * │ zIndex          │ number            │ 1                     │
 * │                 │                   │                       │
 * │ fontSize        │ number (px)       │ template default      │
 * │ fontFamily      │ string (CSS)      │ template default      │
 * │ fontWeight      │ 'normal'|'bold'   │ 'normal'              │
 * │ fontStyle       │ 'normal'|'italic' │ 'normal'              │
 * │ color           │ hex string        │ template default      │
 * │ align           │ 'left'|'center'   │ 'left'                │
 * │                 │   |'right'        │                       │
 * │ letterSpacing   │ number (em)       │ 0                     │
 * │ lineHeight      │ number (×)        │ 1.3                   │
 * │ opacity         │ 0–1               │ 1                     │
 * │ textTransform   │ CSS value         │ 'none'                │
 * │ verticalAlign   │ 'top'|'center'    │ 'top'                 │
 * │                 │   |'bottom'       │                       │
 * │                 │                   │                       │
 * │ objectFit       │ CSS value         │ 'contain' (logo)      │
 * │ filter          │ CSS string        │ 'none' (logo)         │
 * └─────────────────┴───────────────────┴───────────────────────┘
 *
 * CARD DIMENSIONS (logical units used by canvas renderer)
 */

export const CARD_W = 500;
export const CARD_H = 300;

/**
 * Resolve a section's final style by merging:
 *   section overrides  >  template defaults  >  hardcoded fallbacks
 */
export function resolveSection(section, template) {
  return {
    // Identity
    id:            section.id,
    type:          section.type,
    field:         section.field,
    label:         section.label ?? section.field ?? section.id,

    // Layout
    x:      section.x      ?? 0,
    y:      section.y      ?? 0,
    width:  section.width  ?? 1,
    height: section.height ?? 1,
    zIndex: section.zIndex ?? 1,

    // Text
    fontSize:      section.fontSize      ?? template.defaultFontSize      ?? 12,
    fontFamily:    section.fontFamily    ?? template.defaultFontFamily    ?? 'sans-serif',
    fontWeight:    section.fontWeight    ?? template.defaultFontWeight    ?? 'normal',
    fontStyle:     section.fontStyle     ?? 'normal',
    color:         section.color         ?? template.defaultColor         ?? '#000000',
    textAlign:     section.textAlign     ?? template.defaultTextAlign     ?? 'left',
    letterSpacing: section.letterSpacing ?? template.defaultLetterSpacing ?? 0,
    lineHeight:    section.lineHeight    ?? 1.3,
    opacity:       section.opacity       ?? 1,
    textTransform: section.textTransform ?? 'none',
    textDecoration: section.textDecoration ?? 'none',
    verticalAlign: section.verticalAlign ?? 'top',

    // Logo
    objectFit: section.objectFit ?? 'contain',
    filter:    section.filter    ?? 'none',
  };
}

/**
 * Get display text for a text section given userData
 */
export function getSectionContent(section, userData = {}) {
  if (section.field === 'name') {
    return [userData.firstName, userData.lastName].filter(Boolean).join(' ');
  }
  return userData[section.field] ?? '';
}

/**
 * BUILT-IN FIELD DEFINITIONS
 *
 * Templates declare which fields they use via sections[].field.
 * Each field key maps to a definition here, or templates can override/extend
 * via template.fields = { myKey: { label, inputType } }.
 *
 * Special key 'name' is always split into firstName + lastName inputs.
 */
export const BUILT_IN_FIELDS = {
  name:      { label: 'Full name',   inputType: 'name'     },
  firstName: { label: 'First name',  inputType: 'text'     },
  lastName:  { label: 'Last name',   inputType: 'text'     },
  title:     { label: 'Job title',   inputType: 'text',    group: 'info'    },
  company:   { label: 'Company',     inputType: 'text',    group: 'info'    },
  phone:     { label: 'Phone',       inputType: 'tel',     group: 'contact' },
  email:     { label: 'Email',       inputType: 'email',   group: 'contact' },
  website:   { label: 'Website',     inputType: 'url',     group: 'contact' },
  address:   { label: 'Address',     inputType: 'textarea',group: 'contact' },
  instagram: { label: 'Instagram',   inputType: 'text',    placeholder: '@handle',            group: 'social' },
  linkedin:  { label: 'LinkedIn',    inputType: 'text',    placeholder: 'linkedin.com/in/…',  group: 'social' },
  twitter:   { label: 'Twitter / X', inputType: 'text',    placeholder: '@handle',            group: 'social' },
  tiktok:    { label: 'TikTok',      inputType: 'text',    placeholder: '@handle',            group: 'social' },
  tagline:   { label: 'Tagline',     inputType: 'textarea' },
  custom1:   { label: 'Custom 1',    inputType: 'text'     },
  custom2:   { label: 'Custom 2',    inputType: 'text'     },
};

/**
 * resolveFieldDef — get the field definition for any key.
 * Merges template overrides on top of built-in definitions.
 * Falls back gracefully for completely unknown keys.
 *
 * Usage in template config to override or add fields:
 *   fields: {
 *     instagram: { label: 'IG handle' },          // override label
 *     promoCode: { label: 'Promo code', inputType: 'text' }, // new field
 *   }
 */
export function resolveFieldDef(fieldKey, template) {
  if (!fieldKey) return null;
  const override = template?.fields?.[fieldKey];
  const builtIn  = BUILT_IN_FIELDS[fieldKey];
  if (override || builtIn) return { ...builtIn, ...override };
  // Unknown field — auto-generate fallback so it always works
  return { label: fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1), inputType: 'text' };
}

export const FONT_OPTIONS = [
  { label: 'Default',            value: '' },
  { label: 'Jost',               value: "'Jost', sans-serif" },
  { label: 'Cormorant Garamond', value: "'Cormorant Garamond', serif" },
  { label: 'Arial',              value: 'Arial, sans-serif' },
  { label: 'Georgia',            value: 'Georgia, serif' },
  { label: 'Times New Roman',    value: "'Times New Roman', serif" },
  { label: 'Courier New',        value: "'Courier New', monospace" },
  { label: 'Verdana',            value: 'Verdana, sans-serif' },
  { label: 'Playfair Display',   value: "'Playfair Display', serif" },
  { label: 'Montserrat',         value: "'Montserrat', sans-serif" },
];

export function getSectionPos(sections, id) {
  const s = sections?.find(sec => sec.id === id);
  if (!s) return {};
  return {
    position: 'absolute',
    left:   `${s.x * 100}%`,
    top:    `${s.y * 100}%`,
    width:  `${s.width * 100}%`,
    height: `${s.height * 100}%`,
    zIndex: s.zIndex ?? 1,
    boxSizing: 'border-box',
  };
}

/**
 * reorderSections — returns a new sections array with updated zIndex values.
 *
 * direction:
 *   'front'    → bring to top (highest zIndex)
 *   'back'     → send to bottom (lowest zIndex)
 *   'forward'  → move one step up
 *   'backward' → move one step down
 *
 * Usage in parent:
 *   import { reorderSections } from '../sectionSchema';
 *
 *   const handleReorderSection = (id, direction) => {
 *     setSections(prev => reorderSections(prev, id, direction));
 *   };
 */
export function reorderSections(sections, id, direction) {
  // Normalize — assign clean sequential zIndex values sorted by current zIndex
  const sorted = [...sections].sort((a, b) => (a.zIndex ?? 1) - (b.zIndex ?? 1));
  sorted.forEach((s, i) => { s.zIndex = i + 1; });

  const idx = sorted.findIndex(s => s.id === id);
  if (idx === -1) return sections;

  switch (direction) {
    case 'front': {
      const max = sorted.length;
      sorted[idx].zIndex = max + 1;
      // Re-normalize so there are no gaps
      sorted.sort((a, b) => a.zIndex - b.zIndex).forEach((s, i) => { s.zIndex = i + 1; });
      break;
    }
    case 'back': {
      sorted[idx].zIndex = 0;
      sorted.sort((a, b) => a.zIndex - b.zIndex).forEach((s, i) => { s.zIndex = i + 1; });
      break;
    }
    case 'forward': {
      if (idx < sorted.length - 1) {
        const cur  = sorted[idx].zIndex;
        const next = sorted[idx + 1].zIndex;
        sorted[idx].zIndex     = next;
        sorted[idx + 1].zIndex = cur;
      }
      break;
    }
    case 'backward': {
      if (idx > 0) {
        const cur  = sorted[idx].zIndex;
        const prev = sorted[idx - 1].zIndex;
        sorted[idx].zIndex     = prev;
        sorted[idx - 1].zIndex = cur;
      }
      break;
    }
    default:
      break;
  }

  return sorted.map(s => ({ ...s }));
}

function textAlignToJustifyContent(textAlign) {
  switch (textAlign) {
    case 'center': return 'center';
    case 'right':  return 'flex-end';
    default:       return 'flex-start';
  }
}

export function getSectionTextStyle(section, scale = 1, fallbacks = {}) {
  if (!section) return fallbacks;

  const textAlign = section.textAlign ?? fallbacks.textAlign ?? 'left';

  return {
    color: section.color ?? fallbacks.color,
    fontFamily: section.fontFamily ?? fallbacks.fontFamily,
    fontSize: section.fontSize ? `${section.fontSize * scale}px` : fallbacks.fontSize,
    fontWeight: section.fontWeight ?? fallbacks.fontWeight ?? 'normal',
    fontStyle: section.fontStyle ?? fallbacks.fontStyle ?? 'normal',
    textAlign,
    justifyContent: textAlignToJustifyContent(textAlign),
    textTransform: section.textTransform ?? fallbacks.textTransform ?? 'none',
    textDecoration: section.textDecoration ?? fallbacks.textDecoration ?? 'none',
    letterSpacing: section.letterSpacing ? `${section.letterSpacing}em` : fallbacks.letterSpacing,
    lineHeight: section.lineHeight ?? fallbacks.lineHeight ?? 1.2,
    textShadow: section.textShadowBlur > 0
      ? `2px 2px ${section.textShadowBlur}px ${section.textShadowColor || '#000000'}`
      : 'none',
    WebkitTextStroke: section.textStrokeWidth > 0
      ? `${section.textStrokeWidth}px ${section.textStrokeColor || '#000000'}`
      : 'none',
    paintOrder: 'stroke fill',
    whiteSpace: 'pre-wrap',
  };
}