import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { templates } from '../templates';
import '../css/OnboardingModal.css';

const STEPS = ['info', 'template'];

export default function OnboardingModal({ onClose }) {
  const navigate = useNavigate();
  const [step, setStep] = useState('info');
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    company: '',
    email: '',
    phone: '',
    website: '',
    address: '',
  });
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleStart = () => {
    if (!selectedTemplateId) return;
    // Proslijedi podatke kroz location state
    navigate(`/editor/${selectedTemplateId}`, { state: { prefill: formData } });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>

        {/* Progress */}
        <div className="modal-steps">
          <div className={`modal-step ${step === 'info' ? 'active' : 'done'}`}>1. Your Info</div>
          <div className="modal-step-divider" />
          <div className={`modal-step ${step === 'template' ? 'active' : ''}`}>2. Pick Template</div>
        </div>

        {step === 'info' && (
          <>
            <h2 className="modal-title">Enter your details</h2>
            <p className="modal-subtitle">These will be pre-filled on your business card.</p>
            <div className="modal-form">
              {[
                { name: 'name',    label: 'Full Name',    placeholder: 'John Doe' },
                { name: 'title',   label: 'Job Title',    placeholder: 'CEO & Founder' },
                { name: 'company', label: 'Company',      placeholder: 'Acme Inc.' },
                { name: 'email',   label: 'Email',        placeholder: 'john@acme.com' },
                { name: 'phone',   label: 'Phone',        placeholder: '+1 555 000 000' },
                { name: 'website', label: 'Website',      placeholder: 'www.acme.com' },
                { name: 'address', label: 'Address',      placeholder: '123 Main St, NYC' },
              ].map(field => (
                <div className="form-group" key={field.name}>
                  <label>{field.label}</label>
                  <input
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                  />
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={onClose}>Cancel</button>
              <button className="btn-primary" onClick={() => setStep('template')}>
                Next →
              </button>
            </div>
          </>
        )}

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
                    onClick={() => setSelectedTemplateId(t.id)}
                  >
                    <div className="modal-template-preview" style={{ background: t.bg }}>
                      <Layout
                        template={t}
                        isBack={false}
                        containerWidth={220}
                        sections={t.sectionsFront}  
                      /></div>
                    <p className="modal-template-name">{t.name}</p>
                  </div>
                );
              })}
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setStep('info')}>← Back</button>
              <button
                className="btn-primary"
                disabled={!selectedTemplateId}
                onClick={handleStart}
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