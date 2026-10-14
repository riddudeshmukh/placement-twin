import React from 'react';
import { motion } from 'framer-motion';
import { 
  UploadCloud, 
  Globe, 
  Video, 
  Code2, 
  Award, 
  ArrowRight, 
  Sparkles,
  TrendingUp,
  Cpu,
  Layers,
  FileText
} from 'lucide-react';
import { photos } from '../../assets/photoLibrary';
import { fadeUp, scaleIn, staggerContainer, hoverLift } from '../../lib/motion';
import './DashboardOverview.css';

const channels = [
  { tab: 'resume', icon: UploadCloud, tone: 'text-brass', title: 'Resume Ingestion', body: 'Upload PDF/DOCX or direct text to extract verifiable career milestones.' },
  { tab: 'portfolio', icon: Globe, tone: 'text-moss', title: 'Portfolio & QR', body: 'Edit your profile and projects, and generate a QR code for your link.' },
  { tab: 'interview', icon: Video, tone: 'text-clay', title: 'Interview Studio', body: 'Practice resume-matched questions with optional camera and voice input.' },
  { tab: 'coding', icon: Code2, tone: 'text-brass', title: 'Coding Practice', body: 'Start from Hello, world! across five learning paths, with detailed lessons and exercises.' },
];

export default function DashboardOverview({ userData, onNavigateTab }) {
  const extractedCount = userData.skills.length;
  const isProfileActive = extractedCount > 0;

  return (
    <div className="overview-hub">
      {/* Top Banner */}
      <motion.section
        className="hub-masthead neu-float"
        initial="hidden"
        animate="show"
        variants={staggerContainer(0.08)}
      >
        <motion.div className="masthead-left" variants={fadeUp}>
          <div className="masthead-status">
            <span className="pill-tag pill-brass">
              <Sparkles size={12} /> Placement Twin v13
            </span>
          </div>

          <h1 className="masthead-title">
            Candidate Digital Twin <span className="text-brass">Workspace</span>
          </h1>

          <p className="masthead-lead">
            {isProfileActive
              ? `Your digital portfolio is synchronized with ${extractedCount} extracted skills. Ready for mock interviews and instant QR sharing with recruiters.`
              : 'Upload your resume to identify the skills you mention, build your profile, and start matched interview practice.'}
          </p>

          {isProfileActive && (
            <div className="masthead-success-badge neu-pill">
              <img src={photos.successState} alt="" loading="lazy" />
              <span>Profile Active & Extracted</span>
            </div>
          )}

          <div className="masthead-actions">
            {isProfileActive ? (
              <>
                <motion.button className="btn-brass" onClick={() => onNavigateTab('interview')} whileTap={{ scale: 0.97 }} whileHover={{ y: -2 }}>
                  <Video size={15} /> Launch Mock Interview Panel
                </motion.button>
                <motion.button className="btn-soft" onClick={() => onNavigateTab('portfolio')} whileTap={{ scale: 0.97 }} whileHover={{ y: -2 }}>
                  <Globe size={15} /> View Web Portfolio & QR
                </motion.button>
              </>
            ) : (
              <motion.button className="btn-brass" onClick={() => onNavigateTab('resume')} whileTap={{ scale: 0.97 }} whileHover={{ y: -2 }}>
                <UploadCloud size={15} /> Upload Resume Document
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Dynamic Metric Gauges */}
        <motion.div className="masthead-gauges" variants={staggerContainer(0.08)}>
          <motion.div className="metric-pod neu-inset" variants={scaleIn}>
            <div className="metric-pod-head">
              <span className="pod-label">ATS Score</span>
              <Award size={15} className="text-moss" />
            </div>
            <div className="pod-score text-moss">
              {userData.atsScore > 0 ? `${userData.atsScore}%` : 'Pending'}
            </div>
            <span className="pod-sub">Text-based resume heuristic</span>
          </motion.div>

          <motion.div className="metric-pod neu-inset" variants={scaleIn}>
            <div className="metric-pod-head">
              <span className="pod-label">Extracted Stack</span>
              <Cpu size={15} className="text-brass" />
            </div>
            <div className="pod-score text-brass">
              {extractedCount}
            </div>
            <span className="pod-sub">Keywords detected in your resume</span>
          </motion.div>

          <motion.div className="metric-pod neu-inset" variants={scaleIn}>
            <div className="metric-pod-head">
              <span className="pod-label">Mock Sessions</span>
              <Video size={15} className="text-clay" />
            </div>
            <div className="pod-score text-clay">
              {userData.interviewHistory.length}
            </div>
            <span className="pod-sub">Evaluated Interviews</span>
          </motion.div>
        </motion.div>
      </motion.section>

      <section className="dashboard-photo-banner neu-float"><img src={photos.successState} alt="People working together around a table with laptops and notebooks" loading="lazy"/><div><span className="eyebrow">YOUR NEXT STEP</span><h2>Turn practice into progress.</h2><p>Choose from 96 lessons, from your first program to more demanding coding and web projects.</p><button className="btn-brass" onClick={()=>onNavigateTab('coding')}>Explore the learning paths</button></div></section>
      {/* Grid of Actionable Studio Channels */}
      <motion.section
        className="hub-channels-grid"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-40px 0px' }}
        variants={staggerContainer(0.07)}
      >
        {channels.map(({ tab, icon: Icon, tone, title, body }) => (
          <motion.button type="button"
            key={tab}
            className="channel-box neu-float"
            onClick={() => onNavigateTab(tab)}
            variants={fadeUp}
            {...hoverLift}
          >
            <div className="channel-icon-pill neu-inset">
              <Icon size={20} className={tone} />
            </div>
            <div className="channel-text">
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
            <ArrowRight size={15} className="channel-arr" />
          </motion.button>
        ))}
      </motion.section>

      {/* Bottom Insights Dual Column */}
      <section className="hub-insights-grid">
        {/* Left: Extracted Technical Skills */}
        <motion.div
          className="insight-card neu-float"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px 0px' }}
          transition={{ duration: 0.5 }}
        >
          <div className="card-heading">
            <Layers size={17} className="text-brass" />
            <h3>Extracted Skills Spectrum</h3>
          </div>
          <p className="card-subhead">Extracted directly from candidate experience and project claims.</p>

          <div className="skills-spectrum-list">
            {userData.skills.length === 0 ? (
              <div className="spectrum-empty neu-inset">
                <img src={photos.dashboardEmpty} alt="" className="spectrum-empty-art" loading="lazy" />
                <FileText size={24} className="text-muted" />
                <p>Upload a resume to see the skills it mentions.</p>
                <button className="btn-brass" onClick={() => onNavigateTab('resume')}>
                  Upload Resume
                </button>
              </div>
            ) : (
              userData.skills.map((sk, idx) => (
                <div key={idx} className="spectrum-item">
                  <div className="item-labels">
                    <span className="item-name">{sk.name}</span>
                    <span className="item-val text-brass">Mentioned</span>
                  </div>

                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Right: Placement Evaluation Records */}
        <motion.div
          className="insight-card neu-float"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px 0px' }}
          transition={{ duration: 0.5, delay: 0.08 }}
        >
          <div className="card-heading">
            <TrendingUp size={17} className="text-moss" />
            <h3>Evaluation Records & History</h3>
          </div>
          <p className="card-subhead">Saved mock interviews with heuristic feedback for practice.</p>

          <div className="records-stream">
            {userData.interviewHistory.length === 0 ? (
              <div className="spectrum-empty neu-inset">
                <img src={photos.dashboardEmpty} alt="" className="spectrum-empty-art" loading="lazy" />
                <Video size={24} className="text-muted" />
                <p>No mock interviews taken yet. Enter the simulation room to test your knowledge.</p>
                <button className="btn-moss" onClick={() => onNavigateTab('interview')}>
                  Start Mock Interview
                </button>
              </div>
            ) : (
              userData.interviewHistory.map((rec, idx) => (
                <div key={idx} className="record-entry neu-inset">
                  <div className="rec-top">
                    <strong>{rec.role}</strong>
                    <span className="pill-tag pill-moss">Score: {rec.totalScore}/100</span>
                  </div>
                  <div className="rec-verdict text-brass">{rec.verdict}</div>
                  <p className="rec-notes">{rec.summary}</p>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
