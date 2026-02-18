import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import "../css/Home.css";



const templates = [
  { id: 1, category: "modern", name: "Onyx", bg: "#0f0f0f", accent: "#c8a96e", text: "#ffffff" },
  { id: 2, category: "modern", name: "Neon", bg: "#0a0a1a", accent: "#00f5ff", text: "#ffffff" },
  { id: 3, category: "elegant", name: "Ivory", bg: "#f5f0e8", accent: "#8b6914", text: "#1a1a1a" },
  { id: 4, category: "elegant", name: "Noir", bg: "#1c1c1c", accent: "#d4af7a", text: "#f0ead6" },
  { id: 5, category: "minimal", name: "Blanc", bg: "#ffffff", accent: "#111111", text: "#111111" },
  { id: 6, category: "minimal", name: "Sage", bg: "#e8ede6", accent: "#3d5a40", text: "#1a2b1c" },
  { id: 7, category: "creative", name: "Aurora", bg: "#1a0533", accent: "#ff6b9d", text: "#ffffff" },
  { id: 8, category: "creative", name: "Rust", bg: "#2d1b0e", accent: "#e8672a", text: "#f5dcc8" },
];

const categories = ["All", "Modern", "Elegant", "Minimal", "Creative"];

function TemplateCard({ template, onSelect }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="template-card"
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
    >
      <div className={`card-flip ${flipped ? "flipped" : ""}`}>
        <div className="card-front" style={{ background: template.bg }}>
          <div className="card-line" style={{ background: template.accent }} />
          <p className="card-name" style={{ color: template.text }}>Mia Vranes</p>
          <p className="card-job" style={{ color: template.accent }}>Designer</p>
          <div className="card-blob" style={{ background: template.accent }} />
        </div>
        <div className="card-back" style={{ background: template.accent }}>
          <p className="card-label">{template.name}</p>
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

          <h1 className="title">
            Design<br></br> 
            Personalize<br></br>
            Export
          </h1>

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
            <p>Download your card as PNG, JPG, or PDF ready for print or digital sharing.</p>
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
            <TemplateCard key={t.id} template={t} onSelect={onLoadTemplate || (() => {})} />
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
            <p>PNG, JPG, or PDF — ready for print with professional quality from the first click.</p>

          </div>
          <div className="feature">
            <h3>Animations</h3>
            <p>Fade, slide, zoom — bring your business card to life for digital presentations.</p>
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
