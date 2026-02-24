import { useState, useRef, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import front from '../assets/front.png';
import back from '../assets/back.png';
import { templates } from '../templates';
import "../css/Home.css";

const categories = ["All", "Modern", "Elegant", "Minimal", "Creative"];

function BusinessCardPreview({ template, isBack = false, containerWidth }) {
  const LayoutComponent = template.layoutComponent;
  return <LayoutComponent template={template} isBack={isBack} containerWidth={containerWidth} />;
}

function TemplateCard({ template, onSelect }) {
  const [flipped, setFlipped] = useState(false);
  const cardRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(400);

  useEffect(() => {
    const updateWidth = () => {
      if (cardRef.current) {
        setContainerWidth(cardRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  return (
    <div
      ref={cardRef}
      className="template-card"
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      onClick={() => onSelect(template)}
    >
      <div className={`card-flip ${flipped ? "flipped" : ""}`}>
        <div className="card-front" style={{ background: template.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <BusinessCardPreview template={template} containerWidth={containerWidth} />
        </div>
        <div className="card-back" style={{ background: template.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <BusinessCardPreview template={template} isBack={true} containerWidth={containerWidth} />
        </div>
      </div>
      <p className="template-name">{template.name}</p>
    </div>
  );
}

export default function Home({ onStartEditor, onLoadTemplate }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const navigate = useNavigate();

  const filtered = activeCategory === "All"
    ? templates
    : templates.filter(t => t.category.toLowerCase() === activeCategory.toLowerCase());

  return (
    <div className="home-page">
      <div className="noise-overlay" />

      <section className="hero">
        <div className="hero-content">
          <div className="badge">
            <div className="badge-dot" />
            <span>Business cards created in minutes</span>
          </div>

          <div className="title-with-image">
            <h1 className="title">
              Design<br />
              <span className="highlight">Personalize</span><br />
              Export
            </h1>
            <div className="rotating-card" style={{ marginLeft: '200px' }}>
              <div className="rotating-card-inner">
                <div className="rotating-card-front">
                  <img src={front} alt="Front card" />
                </div>
                <div className="rotating-card-back">
                  <img src={back} alt="Back card" />
                </div>
              </div>
            </div>
          </div>

          <p className="subtitle">
            Professional business cards made easy.
            Select a template, enter your details, export instantly.
          </p>

          <div className="actions">
            <button className="btn-primary" onClick={() => navigate('/editor')}>
              Start from scratch
            </button>
            <button className="btn-secondary" onClick={() =>
              document.getElementById("templates")?.scrollIntoView({ behavior: "smooth" })
            }>
              View templates
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="blob blob-1" />
          <div className="blob blob-2" />
        </div>
      </section>

      <section className="steps">
        <p className="section-eyebrow">How it works</p>
        <div className="steps-grid">
          <div className="step">
            <div className="step-num">01</div>
            <h3>Select a template</h3>
            <p>Browse our templates and choose the one you prefer.</p>
          </div>
          <div className="step">
            <div className="step-num">02</div>
            <h3>Personalize</h3>
            <p>Enter your details, customize the colors, fonts, and layout.</p>
          </div>
          <div className="step">
            <div className="step-num">03</div>
            <h3>Export</h3>
            <p>Download your card as PNG, JPG, or PDF ready for print.</p>
          </div>
        </div>
      </section>

     <section id="templates" className="templates">
        <div className="templates-header">
          <div>
            <h2 className="section-title">Select a template</h2>
          </div>
          <div className="filters">
            {categories.map(cat => (
              <button
                key={cat}
                className={`filter-btn ${activeCategory === cat ? "active" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

       <div className="templates-grid">
          {filtered.map(t => (
            <TemplateCard 
                key={t.id} 
                template={t} 
                onSelect={(template) => navigate(`/editor/${template.id}`)} 
            />
          ))}
        </div>
      </section>

      <section className="features">
        <h2 className="section-title">Everything you need</h2>
        <div className="features-grid">
          <div className="feature">
            <h3>Drag & Drop</h3>
            <p>Place your elements exactly where you want.</p>
          </div>
          <div className="feature">
            <h3>QR Code</h3>
            <p>Generate a QR code with contact information.</p>
          </div>
          <div className="feature">
            <h3>High-Resolution Export</h3>
            <p>PNG, JPG, or PDF — ready for print with professional quality.</p>
          </div>
          <div className="feature">
            <h3>Animations</h3>
            <p>Fade, slide, zoom — bring your business card to life.</p>
          </div>
        </div>
      </section>

     <section className="cta">
        <p className="section-eyebrow">Ready?</p>
        <h2 className="cta-title">Create your business card</h2>
        <button className="btn-primary btn-lg" onClick={() => navigate('/editor')}>
          Open Editor
        </button>
      </section>
    </div>
  );
}