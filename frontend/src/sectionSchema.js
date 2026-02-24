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

    // Text
    fontSize:      section.fontSize      ?? template.defaultFontSize      ?? 12,
    fontFamily:    section.fontFamily    ?? template.defaultFontFamily    ?? 'sans-serif',
    fontWeight:    section.fontWeight    ?? template.defaultFontWeight    ?? 'normal',
    fontStyle:     section.fontStyle     ?? 'normal',
    color:         section.color         ?? template.defaultColor         ?? '#000000',
    align:         section.align         ?? template.defaultAlign         ?? 'left',
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