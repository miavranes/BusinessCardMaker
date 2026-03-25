import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { templates } from '../templates';
import '../css/OnboardingModal.css';

const FIELD_MAP = {
  name:      { label: 'Full Name',  placeholder: 'John Doe' },
  title:     { label: 'Job Title',  placeholder: 'CEO & Founder' },
  company:   { label: 'Company',    placeholder: 'Acme Inc.' },
  slogan:    { label: 'Slogan',     placeholder: 'Modern Design for Growing Brands.' },
  email:     { label: 'Email',      placeholder: 'john@acme.com' },
  phone:     { label: 'Phone',      placeholder: '+1 555 000 000' },
  website:   { label: 'Website',    placeholder: 'www.acme.com' },
  address:   { label: 'Address',    placeholder: '123 Main St, NYC' },
  instagram: { label: 'Instagram',  placeholder: '@username' },
  linkedin:  { label: 'LinkedIn',   placeholder: 'linkedin.com/in/username' },
  facebook:  { label: 'Facebook',   placeholder: 'facebook.com/username' },
  twitter:   { label: 'Twitter/X',  placeholder: '@username' },
  tiktok:    { label: 'TikTok',     placeholder: '@username' },
};

const FIELD_ORDER = [
  'name', 'title', 'company', 'slogan',
  'phone', 'email', 'website', 'address',
  'instagram', 'linkedin', 'facebook', 'twitter', 'tiktok',
];

function getTemplateFields(templateId) {
  const t = templates.find(t => t.id === templateId);
  if (!t) return [];

  const allSections = [...(t.sectionsFront || []), ...(t.sectionsBack || [])];
  const fieldsInTemplate = new Set(
    allSections
      .map(s => s.field)
      .filter(f => f && f !== 'name' && FIELD_MAP[f])
  );

  const result = ['name'];
  for (const f of FIELD_ORDER) {
    if (f !== 'name' && fieldsInTemplate.has(f)) result.push(f);
  }
  return result;
}

export default function OnboardingModal({ onClose }) {
  const navigate = useNavigate();
  const [step, setStep] = useState('template');
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [formData, setFormData] = useState({});
  const [showErrors, setShowErrors] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleTemplateSelect = (id) => {
    setSelectedTemplateId(id);
    setFormData({});
    setShowErrors(false);
  };

  const handleStart = () => {
    if (!selectedTemplateId) return;
    if (!isFormValid) {
      setShowErrors(true);
      return;
    }
    sessionStorage.setItem(`editor_is_new_${selectedTemplateId}`, '1');
    navigate(`/editor/${selectedTemplateId}`, { state: { prefill: formData, fresh: true } });
    onClose();
  };

  const fields = selectedTemplateId ? getTemplateFields(selectedTemplateId) : [];
  const isFormValid = fields.every(f => (formData[f] || '').trim() !== '');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>

        <div className="modal-steps">
          <div className={`modal-step ${step === 'template' ? 'active' : 'done'}`}>1. Pick Template</div>
          <div className="modal-step-divider" />
          <div className={`modal-step ${step === 'info' ? 'active' : ''}`}>2. Your Info</div>
        </div>

        {step === 'template' && (
          <>
            <h2 className="modal-title">Choose a template</h2>
            <p className="modal-subtitle">You can change it later in the editor.</p>
            <div className="modal-templates-grid">
              {templates.map(t => {
                const Layout = t.layoutComponent;
                return (
                  <div
                    key={t.id}
                    className={`modal-template-card ${selectedTemplateId === t.id ? 'selected' : ''}`}
                    onClick={() => handleTemplateSelect(t.id)}
                  >
                    <div className="modal-template-preview" style={{ background: t.bg }}>
                      <Layout
                        template={t}
                        isBack={false}
                        containerWidth={220}
                        sections={t.sectionsFront}
                      />
                    </div>
                    <p className="modal-template-name">{t.name}</p>
                  </div>
                );
              })}
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={onClose}>Cancel</button>
              <button
                className="btn-primary"
                disabled={!selectedTemplateId}
                style={{ opacity: selectedTemplateId ? 1 : 0.45, cursor: selectedTemplateId ? 'pointer' : 'not-allowed' }}
                onClick={() => setStep('info')}
              >
                Next →
              </button>
            </div>
          </>
        )}

        {step === 'info' && (
          <>
            <h2 className="modal-title">Enter your details</h2>
            <p className="modal-subtitle">These will be pre-filled on your business card.</p>
            <div className="modal-form">
              {fields.map(fieldKey => {
                const field = FIELD_MAP[fieldKey];
                const isEmpty = (formData[fieldKey] || '').trim() === '';
                const hasError = showErrors && isEmpty;
                return (
                  <div className="form-group" key={fieldKey}>
                    <label>{field.label}</label>
                    <input
                      name={fieldKey}
                      value={formData[fieldKey] || ''}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      style={{
                        borderColor: hasError ? '#ef4444' : undefined,
                        background: hasError ? 'rgba(239,68,68,0.05)' : undefined,
                      }}
                    />
                    {hasError && (
                      <span style={{ color: '#ef4444', fontSize: 11, marginTop: 2 }}>
                        This field is required.
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {showErrors && !isFormValid && (
              <p style={{ color: '#ef4444', fontSize: 12, margin: '-4px 0 8px', textAlign: 'center' }}>
                Please fill in all fields before continuing.
              </p>
            )}

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => { setStep('template'); setShowErrors(false); }}>
                ← Back
              </button>
              <button
                className="btn-primary"
                onClick={handleStart}
                style={{ opacity: isFormValid ? 1 : 0.45, cursor: isFormValid ? 'pointer' : 'not-allowed' }}
              >
                Open Editor
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}