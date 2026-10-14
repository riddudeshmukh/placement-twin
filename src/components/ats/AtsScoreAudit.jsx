import React from 'react';
import { CheckCircle2, AlertCircle, Sparkles, Info } from 'lucide-react';
import './AtsScoreAudit.css';

const RADIUS = 50;
const CIRC = 2 * Math.PI * RADIUS;

export default function AtsScoreAudit({ userData }) {
  const { atsScore, atsFeedback } = userData;
  const hasResume = atsScore > 0 && atsFeedback;

  if (!hasResume) {
    return (
      <div className="az-root">
        <div className="az-empty-card neu-float">
          <Info size={22} className="text-brass" />
          <h3>No resume analyzed yet</h3>
          <p>Upload or paste your resume in the Resume Parser tab first — every score on this page is
            computed directly from that document, so there's nothing to audit until it exists.</p>
        </div>
      </div>
    );
  }

  const offset = CIRC - (atsScore / 100) * CIRC;

  const metrics = [
    { label: 'Keyword Density', val: atsFeedback.keywordsMatchScore, tone: 'text-brass', desc: 'Recognized keyword count, scaled against a fixed reference count.' },
    { label: 'Parser Compatibility', val: atsFeedback.formattingScore, tone: 'text-moss', desc: 'Text headings, bullet markers, and line structure; visual layout is not evaluated.' },
    { label: 'Impact Quantification', val: atsFeedback.impactScore, tone: 'text-clay', desc: 'Quantified metrics and measurable throughput.' },
    { label: 'Brevity Health', val: atsFeedback.brevityScore, tone: 'text-brass', desc: 'Optimized density fitting recruiter screens.' },
  ];

  return (
    <div className="az-root">
      {/* Radial score band — replaces the old banner-with-image masthead */}
      <div className="az-score-band neu-float">
        <div className="az-radial">
          <svg viewBox="0 0 120 120">
            <circle className="az-radial-track" cx="60" cy="60" r={RADIUS} />
            <circle
              className="az-radial-fill" cx="60" cy="60" r={RADIUS}
              strokeDasharray={CIRC} strokeDashoffset={offset}
            />
          </svg>
          <div className="az-radial-label">
            <span>{atsScore}</span>
            <small>/ 100</small>
          </div>
        </div>
        <div className="az-score-text">
          <h2>Resume signals, explained</h2>
          <p>A local text-based heuristic, not a score from an employer’s ATS or a prediction of selection.</p>
        </div>
      </div>

      {/* Metric rail */}
      <div className="az-metric-rail">
        {metrics.map(({ label, val, tone, desc }) => (
          <div key={label} className="az-metric-card neu-float">
            <span className={`az-metric-value ${tone}`}>{val}%</span>
            <span className="az-metric-label">{label}</span>
            <div className="az-metric-track"><div className={`az-metric-fill ${tone}`} style={{ width: `${val}%` }} /></div>
            <p>{desc}</p>
          </div>
        ))}
      </div>

      {/* Keyword injection */}
      {atsFeedback.missingKeywords.length > 0 && (
        <div className="az-keywords neu-float">
          <div className="az-keywords-head">
            <span><Sparkles size={17} className="text-brass" /> Possible learning topics</span>
            <span className="pill-tag pill-brass">No automatic score boosts</span>
          </div>
          <p>These common topics were not found in your text. They are not necessarily required for your role. Add a skill to your resume only when you can support it with actual experience, then re-upload for analysis.</p>
          <div className="az-keyword-chips">
            {atsFeedback.missingKeywords.map(kw => <span key={kw} className="pill-tag">{kw}</span>)}
          </div>
        </div>
      )}

      {/* Strengths & improvements */}
      <div className="az-checklist-band">
        <div className="az-checklist-col neu-float">
          <span><CheckCircle2 size={17} className="text-moss" /> Identified Resume Strengths</span>
          <ul>{atsFeedback.strengths.map((s, idx) => <li key={idx}><span className="text-moss">✓</span> {s}</li>)}</ul>
        </div>
        <div className="az-checklist-col neu-float">
          <span><AlertCircle size={17} className="text-clay" /> High Priority Improvements</span>
          <ul>{atsFeedback.improvements.map((imp, idx) => <li key={idx}><span className="text-clay">!</span> {imp}</li>)}</ul>
        </div>
      </div>
    </div>
  );
}
