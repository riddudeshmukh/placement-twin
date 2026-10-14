import React, { useState } from 'react';
import {
  Globe, QrCode, ExternalLink, Mail, Phone, MapPin, Check, Copy, Sparkles,
  Image as ImageIcon, Edit3, Award, Layers, GraduationCap, Briefcase, Plus,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { photos } from '../../assets/photoLibrary';
import { Tilt3D } from '../common/Tilt3D';
import './PortfolioTwin.css';

const SECTIONS = [
  { id: 'projects', label: 'Projects', icon: Layers },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'skills', label: 'Skills', icon: Award },
  { id: 'education', label: 'Education', icon: GraduationCap },
];

export default function PortfolioTwin({ userData, onUpdateUserData }) {
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [avatarUrlInput, setAvatarUrlInput] = useState(userData.avatar || '');
  const [activeSection, setActiveSection] = useState('projects');

  const [showAddProject, setShowAddProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectTech, setNewProjectTech] = useState('');
  const [newProjectRepo, setNewProjectRepo] = useState('');

  const [portfolioInput,setPortfolioInput] = useState(userData.links.portfolio || '');
  const [shareError,setShareError] = useState('');
  const portfolioUrl = /^https?:\/\//i.test(userData.links.portfolio || '') ? userData.links.portfolio : '';
  const savePortfolio = e => {e.preventDefault();try{const url=new URL(portfolioInput);if(!['http:','https:'].includes(url.protocol))throw new Error();onUpdateUserData({...userData,links:{...userData.links,portfolio:url.href}});setShareError('');}catch{setShareError('Enter a complete https:// or http:// URL for a portfolio you have published.');}};

  const handleCopy = async () => {try {await navigator.clipboard.writeText(portfolioUrl);setCopied(true);setTimeout(()=>setCopied(false),2000);}catch{setShareError('Clipboard unavailable. Select and copy the URL shown here.');}};

  const handleSaveAvatar = (e) => {
    e.preventDefault();
    onUpdateUserData({ ...userData, avatar: avatarUrlInput.trim() });
    setIsEditingPhoto(false);
  };

  const handleAddProject = (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    const newProj = {
      name: newProjectName.trim(),
      description: newProjectDesc.trim(),
      tech: newProjectTech.split(',').map(t => t.trim()).filter(Boolean),
      repoUrl: newProjectRepo.trim()
    };
    onUpdateUserData({ ...userData, projects: [...userData.projects, newProj] });
    setNewProjectName(''); setNewProjectDesc(''); setNewProjectTech(''); setNewProjectRepo('');
    setShowAddProject(false);
  };

  return (
    <div className="pf-workbench">
      {/* Left rail — sticky profile identity card, replaces the old top banner */}
      <aside className="pf-identity-rail neu-float">
        <div className="pf-identity-cover">
          <img src={photos.portfolioCard} alt="" loading="lazy" />
          <div className="pf-identity-cover-veil" />
        </div>

        <div className="pf-avatar-block">
          <div className="pf-avatar-ring neu-inset">
            {userData.avatar ? (
              <img src={userData.avatar} alt="Candidate" className="pf-avatar-img" />
            ) : (
              <ImageIcon size={30} className="text-muted" />
            )}
          </div>
          <button className="pf-avatar-edit neu-pill" onClick={() => setIsEditingPhoto(!isEditingPhoto)} title="Add or change photo">
            <Edit3 size={12} className="text-brass" />
          </button>
        </div>

        <h2 className="pf-identity-name">{userData.fullName || 'Candidate Full Name'}</h2>
        <span className="pill-tag pill-brass pf-identity-badge"><Sparkles size={11} /> Your profile</span>
        <p className="pf-identity-role">{userData.headline || 'Add your experience and projects'}</p>

        {isEditingPhoto && (
          <form onSubmit={handleSaveAvatar} className="pf-photo-form neu-inset">
            <label>Photo URL</label>
            <input
              type="url" placeholder="https://your-domain.com/photo.jpg"
              value={avatarUrlInput} onChange={(e) => setAvatarUrlInput(e.target.value)}
              className="neu-inset pf-photo-input"
            />
            <div className="pf-photo-form-btns">
              <button type="submit" className="btn-brass btn-sm">Save</button>
              <button type="button" className="btn-soft btn-sm" onClick={() => setIsEditingPhoto(false)}>Close</button>
            </div>
          </form>
        )}

        <div className="pf-identity-contacts">
          {userData.location && <span><MapPin size={13} className="text-muted" /> {userData.location}</span>}
          {userData.email && <span><Mail size={13} className="text-muted" /> {userData.email}</span>}
          {userData.phone && <span><Phone size={13} className="text-muted" /> {userData.phone}</span>}
        </div>

        <div className="pf-identity-divider" />

        <div className="pf-url-block neu-inset">
          <Globe size={13} className="text-brass" />
          <span>{portfolioUrl || 'No published portfolio URL added'}</span>
        </div>

        <form onSubmit={savePortfolio} className="pf-photo-form"><label htmlFor="portfolio-url">Your published portfolio URL</label><input id="portfolio-url" className="neu-inset pf-photo-input" type="url" required value={portfolioInput} placeholder="https://your-portfolio.com" onChange={e=>setPortfolioInput(e.target.value)}/><button type="submit" className="btn-soft">Save URL</button><p style={{fontSize:11,marginTop:10}}>This is a local portfolio workspace. Add a real published URL to enable sharing and QR.</p>{shareError&&<p role="alert">{shareError}</p>}</form>
        <div className="pf-identity-actions">
          <button className="btn-brass pf-share-btn" disabled={!portfolioUrl} onClick={handleCopy}>
            {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Share Portfolio'}
          </button>
          <button className="btn-soft pf-share-btn" disabled={!portfolioUrl} onClick={() => setShowQrModal(true)}>
            <QrCode size={14} /> QR Pass
          </button>
        </div>

        <Tilt3D rotationFactor={4} className="pf-qr-mini neu-inset glow-ring">
          {portfolioUrl && <QRCodeSVG value={portfolioUrl} size={72} level="M" />}
        </Tilt3D>
      </aside>

      {/* Right — tabbed content, replaces the old two-column dossier body */}
      <div className="pf-content-col">
        <div className="pf-tabs neu-inset">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`pf-tab-btn ${activeSection === id ? 'pf-tab-btn--active neu-pill' : ''}`}
              onClick={() => setActiveSection(id)}
            >
              <Icon size={14} /> {label}
              {id === 'projects' && <span className="pf-tab-count">{userData.projects.length}</span>}
              {id === 'skills' && <span className="pf-tab-count">{userData.skills.length}</span>}
            </button>
          ))}
        </div>

        {activeSection === 'projects' && (
          <section className="pf-panel neu-float">
            <div className="pf-panel-head">
              <h3>Engineering Projects</h3>
              <button className="btn-soft btn-sm" onClick={() => setShowAddProject(!showAddProject)}>
                <Plus size={13} /> Add Project
              </button>
            </div>

            {showAddProject && (
              <form onSubmit={handleAddProject} className="pf-new-form neu-inset">
                <div className="form-item">
                  <label>Project Title</label>
                  <input type="text" placeholder="e.g. Distributed Task Queue" className="neu-inset input-clean"
                    value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} required />
                </div>
                <div className="form-item">
                  <label>Description & Architectural Trade-offs</label>
                  <textarea placeholder="Discuss technical choices, system latency, or scale..." className="neu-inset input-clean"
                    rows={3} value={newProjectDesc} onChange={(e) => setNewProjectDesc(e.target.value)} />
                </div>
                <div className="form-item">
                  <label>Technologies Used (comma separated)</label>
                  <input type="text" placeholder="Node.js, Redis, Docker, React" className="neu-inset input-clean"
                    value={newProjectTech} onChange={(e) => setNewProjectTech(e.target.value)} />
                </div>
                <div className="form-item">
                  <label>Repository or Demo URL</label>
                  <input type="url" placeholder="https://github.com/..." className="neu-inset input-clean"
                    value={newProjectRepo} onChange={(e) => setNewProjectRepo(e.target.value)} />
                </div>
                <div className="proj-form-btns">
                  <button type="submit" className="btn-brass btn-sm">Save to Portfolio</button>
                  <button type="button" className="btn-soft btn-sm" onClick={() => setShowAddProject(false)}>Cancel</button>
                </div>
              </form>
            )}

            {userData.projects.length === 0 ? (
              <div className="pf-empty neu-inset"><p>No projects documented yet. Click "+ Add Project" or parse your resume to populate.</p></div>
            ) : (
              <div className="pf-project-grid">
                {userData.projects.map((proj, idx) => (
                  <div key={idx} className="pf-project-card neu-inset">
                    <div className="pf-project-top">
                      <h4>{proj.name}</h4>
                      {proj.repoUrl && (
                        <a href={proj.repoUrl} target="_blank" rel="noreferrer" className="repo-pill">
                          <ExternalLink size={13} /> Repo
                        </a>
                      )}
                    </div>
                    <p>{proj.description}</p>
                    {proj.tech?.length > 0 && (
                      <div className="pf-project-pills">
                        {proj.tech.map((t, tidx) => <span key={tidx} className="pill-tag pill-brass">{t}</span>)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeSection === 'experience' && (
          <section className="pf-panel neu-float">
            <div className="pf-panel-head"><h3>Work Experience & Fellowships</h3></div>
            {userData.experience.length === 0 ? (
              <div className="pf-empty neu-inset"><p>No work experience on file yet.</p></div>
            ) : (
              <div className="pf-exp-list">
                {userData.experience.map((exp, idx) => (
                  <div key={idx} className="pf-exp-row neu-inset">
                    <div className="pf-exp-top"><strong>{exp.role}</strong><span className="pill-tag">{exp.duration}</span></div>
                    <span className="text-brass">{exp.company}</span>
                    <p>{exp.description}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeSection === 'skills' && (
          <section className="pf-panel neu-float">
            <div className="pf-panel-head"><h3>Verified Skills</h3></div>
            {userData.skills.length === 0 ? (
              <div className="pf-empty neu-inset"><p>Upload a resume to automatically extract candidate proficiencies.</p></div>
            ) : (
              <div className="pf-skills-grid">
                {userData.skills.map((sk, idx) => (
                  <div key={idx} className="pf-skill-cell neu-inset">
                    <div className="pf-skill-top"><span>{sk.name}</span><span className="text-brass">Mentioned</span></div>
                    
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeSection === 'education' && (
          <section className="pf-panel neu-float">
            <div className="pf-panel-head"><h3>Academic Credentials</h3></div>
            {userData.education.length === 0 ? (
              <div className="pf-empty neu-inset"><p>No academic credentials on file yet.</p></div>
            ) : (
              <div className="pf-edu-list">
                {userData.education.map((edu, idx) => (
                  <div key={idx} className="pf-edu-row neu-inset">
                    <h4>{edu.degree}</h4>
                    <p className="text-muted">{edu.institution}</p>
                    <div className="pf-edu-meta">
                      <span className="pill-tag pill-moss">GPA: {edu.gpa}</span>
                      <span className="text-muted">{edu.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {showQrModal && (
        <div className="modal-backdrop-luxury" onClick={() => setShowQrModal(false)}>
          <div className="qr-dialog-box neu-float" onClick={(e) => e.stopPropagation()}>
            <button className="auth-close-btn" onClick={() => setShowQrModal(false)}>×</button>
            <div className="qr-dialog-header">
              <div className="brand-disc neu-pill"><QrCode size={20} className="text-brass" /></div>
              <h3>Campus Placement QR Pass</h3>
              <p>This QR opens the portfolio URL you supplied. Check that it is public before sharing.</p>
            </div>
            <div className="qr-display-canvas neu-inset">
              <div className="qr-clean-sheet neu-pill">
                <QRCodeSVG value={portfolioUrl} size={220} level="H" includeMargin={true} />
              </div>
              <div className="qr-display-caption">
                <strong>{userData.fullName || 'Candidate'}</strong>
                <code>{portfolioUrl}</code>
              </div>
            </div>
            <button className="btn-brass w-full" onClick={handleCopy}>
              {copied ? 'Link Copied to Clipboard!' : 'Copy Direct URL'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
