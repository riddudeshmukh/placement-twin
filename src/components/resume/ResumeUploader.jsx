import React, { useState } from 'react';
import {
  UploadCloud, FileText, CheckCircle2, Cpu, ExternalLink, ArrowRight, Info,
  AlertTriangle, ClipboardPaste, Lock, ScanLine
} from 'lucide-react';
import { extractTextFromFile } from '../../lib/fileTextExtractor';
import { analyzeResume } from '../../lib/resumeAnalyzer';
import './ResumeUploader.css';

export default function ResumeUploader({ userData, onResumeParsed, onNavigateTab }) {
  const [dragActive, setDragActive] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);
  const [currentStepText, setCurrentStepText] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [rawResumeText, setRawResumeText] = useState('');
  const [inputMode, setInputMode] = useState('upload'); // 'upload' | 'manual'

  const runAnalysis = (filename, text) => {
    const { skills, structured, atsScore, atsFeedback } = analyzeResume(text);

    const parsedPayload = {
      ...userData,
      lastUploadedFileName: filename,
      resumeText: text,
      skills,
      education: structured.education.length > 0 ? structured.education : userData.education,
      experience: structured.experience.length > 0 ? structured.experience : userData.experience,
      atsScore,
      atsFeedback,
    };

    onResumeParsed(parsedPayload);
  };

  const executeExtraction = async (filename, file) => {
    setErrorMsg('');
    setUploadedFileName(null);
    setParsing(true);
    setParseProgress(15);
    setCurrentStepText('Reading document contents...');

    try {
      const text = await extractTextFromFile(file);

      setParseProgress(55);
      setCurrentStepText('Scanning for technical keywords...');
      await new Promise(r => setTimeout(r, 300));

      setParseProgress(85);
      setCurrentStepText('Scoring against ATS parsing heuristics...');
      await new Promise(r => setTimeout(r, 300));

      runAnalysis(filename, text);

      setParseProgress(100);
      setCurrentStepText('Resume analysis complete.');
      setUploadedFileName(filename);
    } catch (err) {
      setErrorMsg(err.message || 'Could not read this file.');
    } finally {
      setParsing(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      executeExtraction(file.name, file);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      executeExtraction(file.name, file);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!rawResumeText.trim()) return;
    setErrorMsg('');
    setParsing(true);
    setParseProgress(30);
    setCurrentStepText('Scanning pasted text for technical keywords...');

    setTimeout(() => {
      setParseProgress(90);
      setCurrentStepText('Scoring against ATS parsing heuristics...');
      setTimeout(() => {
        runAnalysis('Direct_Resume_Input.txt', rawResumeText);
        setParseProgress(100);
        setUploadedFileName('Direct_Resume_Input.txt');
        setParsing(false);
      }, 300);
    }, 300);
  };

  return (
    <div className="ru-root">
      {/* Centered ingest stage — replaces the old side-by-side panel layout */}
      <section className="ru-stage neu-float">
        <div className="ru-stage-head">
          <span className="pill-tag pill-brass"><ScanLine size={12} /> Resume Ingestion</span>
          <h2>Parse a real resume into a profile draft</h2>
          <p>No templates to fill in — upload or paste what you already have.</p>
        </div>

        <div className="ru-mode-switch neu-inset">
          <button className={`ru-mode-btn ${inputMode === 'upload' ? 'ru-mode-btn--active neu-pill' : ''}`} onClick={() => setInputMode('upload')}>
            <UploadCloud size={14} /> Document
          </button>
          <button className={`ru-mode-btn ${inputMode === 'manual' ? 'ru-mode-btn--active neu-pill' : ''}`} onClick={() => setInputMode('manual')}>
            <ClipboardPaste size={14} /> Paste Text
          </button>
        </div>

        {inputMode === 'upload' ? (
          <div
            className={`ru-dropzone neu-inset ${dragActive ? 'ru-dropzone--active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="ru-dropzone-icon neu-pill">
              <UploadCloud size={28} className="text-brass" />
            </div>
            <h3>Drop your resume file here</h3>
            <p>PDF, DOCX, or plain text — max 15MB</p>
            <label className="btn-brass">
              <span>Choose File</span>
              <input type="file" accept=".pdf,.docx,.doc,.txt,.md" onChange={handleFileInput} style={{ display: 'none' }} />
            </label>
          </div>
        ) : (
          <form onSubmit={handleManualSubmit} className="ru-paste-form">
            <textarea
              className="neu-inset ru-textarea"
              rows={7}
              placeholder="Paste your education history, project highlights, tech stack, and work history..."
              value={rawResumeText}
              onChange={(e) => setRawResumeText(e.target.value)}
            />
            <button type="submit" className="btn-brass" disabled={!rawResumeText.trim() || parsing}>
              Parse Text <ArrowRight size={14} />
            </button>
          </form>
        )}

        <span className="ru-privacy-line"><Lock size={12} /> 100% client-side — documents stay in memory, never uploaded to a server.</span>

        {parsing && (
          <div className="ru-progress neu-inset">
            <div className="ru-progress-labels">
              <span><Cpu size={14} className="text-brass animate-spin" /> {currentStepText}</span>
              <span className="text-brass">{parseProgress}%</span>
            </div>
            <div className="ru-progress-track">
              <div className="ru-progress-fill" style={{ width: `${parseProgress}%` }}></div>
            </div>
          </div>
        )}

        {errorMsg && !parsing && (
          <div className="ru-banner ru-banner--warn neu-inset">
            <AlertTriangle size={17} className="text-clay" />
            <div><strong>Could not parse this file</strong><p>{errorMsg}</p></div>
          </div>
        )}

        {uploadedFileName && !parsing && !errorMsg && (
          <div className="ru-banner neu-inset">
            <CheckCircle2 size={17} className="text-moss" />
            <div><strong>{uploadedFileName} parsed</strong><p>Synced to your Interview Simulator and Digital Portfolio.</p></div>
            <button className="btn-moss ru-banner-btn" onClick={() => onNavigateTab('interview')}>Test in Mock Panel <ArrowRight size={13} /></button>
          </div>
        )}
      </section>

      {/* Horizontal result strip — replaces the old side preview panel */}
      <section className="ru-result-strip">
        <div className="ru-result-identity neu-float">
          <div className="ru-avatar neu-pill">
            {userData.avatar ? <img src={userData.avatar} alt="Candidate" /> : <FileText size={20} className="text-brass" />}
          </div>
          <div>
            <h3>{userData.fullName || 'Candidate Unnamed'}</h3>
            <span className="text-brass">{userData.headline || 'Add your resume to begin'}</span>
            <span className="ru-result-email">{userData.email || 'Email not specified'}</span>
          </div>
          {userData.atsScore > 0 && <span className="pill-tag pill-moss ru-result-score">ATS {userData.atsScore}/100</span>}
        </div>

        <div className="ru-result-skills neu-float">
          <h4>Extracted Competencies ({userData.skills.length})</h4>
          {userData.skills.length === 0 ? (
            <div className="ru-empty neu-inset">
              <Info size={15} className="text-muted" /> No skills extracted yet.
            </div>
          ) : (
            <div className="ru-skill-chip-row">
              {userData.skills.map((sk, idx) => (
                <span key={idx} className="ru-skill-chip neu-inset">
                  {sk.name} <b className="text-brass">Mentioned</b>
                </span>
              ))}
            </div>
          )}
        </div>

        <button
          className="btn-soft ru-result-cta neu-float"
          onClick={() => onNavigateTab('portfolio')}
          disabled={userData.skills.length === 0}
        >
          View Digital Portfolio <ExternalLink size={14} />
        </button>
      </section>
    </div>
  );
}
