import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  FileText,
  Globe,
  Video,
  Code2,
  Award,
  LogOut,
  User,
  QrCode,
  ChevronRight,
  Sliders,
  ExternalLink
} from 'lucide-react';
import DashboardOverview from '../dashboard/DashboardOverview';
import ResumeUploader from '../resume/ResumeUploader';
import PortfolioTwin from '../portfolio/PortfolioTwin';
import InterviewSimulator from '../interview/InterviewSimulator';
import CodingChallenges from '../coding/CodingChallenges';
import AtsScoreAudit from '../ats/AtsScoreAudit';
import { viewTransition } from '../../lib/motion';
import './MainAppLayout.css';

export default function MainAppLayout({ userData, onUpdateUserData, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Sliders },
    { id: 'resume', label: 'Resume Parser', icon: FileText },
    { id: 'portfolio', label: 'Portfolio & QR', icon: Globe },
    { id: 'interview', label: 'Interview Studio', icon: Video, pulse: true },
    { id: 'coding', label: 'Coding Practice', icon: Code2 },
    { id: 'ats', label: 'Resume Review', icon: Award, badge: userData.atsScore > 0 ? `${userData.atsScore}%` : null }
  ];

  const handleInterviewComplete = (result) => {
    const entry = {
      id: `session-${Date.now()}`,
      date: result.date,
      role: "Software Engineering Technical Evaluation",
      totalScore: result.overallScore,
      technicalScore: result.technicalScore,
      hrScore: result.hrScore,
      communicationScore: result.communicationScore,
      verdict: result.verdict,
      summary: result.detailedNotes,
      answers: result.answers || [],
      difficulty: result.difficulty,
      source: result.source
    };
    onUpdateUserData({
      ...userData,
      interviewHistory: [entry, ...userData.interviewHistory]
    });
  };

  const handleNavigateToCoding = () => {
    setActiveTab('coding');
  };

  return (
    <div className="shell-root">
      {/* Fixed left sidebar — replaces the old top segmented dock everywhere */}
      <aside className="shell-sidebar neu-float">
        <div className="shell-brand">
          <div className="brand-disc neu-pill">
            <Bot size={19} className="text-brass" />
          </div>
          <div className="brand-titles">
            <span className="brand-name">Placement<span className="text-brass">Twin</span></span>
            <span className="brand-tag">YOUR NEXT CHAPTER</span>
          </div>
        </div>

        <nav className="shell-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                className={`shell-nav-btn ${isActive ? 'shell-nav-btn--active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                {isActive && (
                  <motion.span
                    layoutId="shell-nav-active"
                    className="shell-nav-active-bg"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                <Icon size={16} style={{ position: 'relative' }} />
                <span className="shell-nav-label" style={{ position: 'relative' }}>{item.label}</span>
                {item.pulse && <span className="shell-nav-pulse"></span>}
                {item.badge && <span className="shell-nav-badge" style={{ position: 'relative' }}>{item.badge}</span>}
              </button>
            );
          })}
        </nav>

        <div className="shell-sidebar-foot">
          <div className="shell-candidate neu-pill">
            <div className="shell-candidate-avatar">
              {userData.avatar ? (
                <img src={userData.avatar} alt="Candidate" />
              ) : (
                <User size={14} className="text-brass" />
              )}
            </div>
            <span>{userData.fullName || 'Candidate'}</span>
          </div>
          <button className="btn-soft shell-logout" onClick={onLogout} title="Sign Out">
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Workspace */}
      <div className="shell-workspace">
        <div className="shell-topline">
          <div className="breadcrumbs">
            <span className="crumb-root">Candidate Suite</span>
            <ChevronRight size={14} className="text-faint" />
            <span className="crumb-active">{navItems.find(n => n.id === activeTab)?.label}</span>
          </div>

          <button className="shell-portfolio-badge neu-pill" onClick={() => setActiveTab('portfolio')}>
            <QrCode size={14} className="text-brass" />
            <span>Open your portfolio</span>
            <ExternalLink size={12} className="text-faint" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.main className="shell-module" key={activeTab} data-tab={activeTab} {...viewTransition}>
            {activeTab === 'overview' && (
              <DashboardOverview
                userData={userData}
                onNavigateTab={(t) => setActiveTab(t)}
              />
            )}

            {activeTab === 'resume' && (
              <ResumeUploader
                userData={userData}
                onResumeParsed={onUpdateUserData}
                onNavigateTab={(t) => setActiveTab(t)}
              />
            )}

            {activeTab === 'portfolio' && (
              <PortfolioTwin
                userData={userData}
                onUpdateUserData={onUpdateUserData}
              />
            )}

            {activeTab === 'interview' && (
              <InterviewSimulator
                userData={userData}
                onInterviewComplete={handleInterviewComplete}
                onSaveJobDescription={jobDescription=>onUpdateUserData({...userData,jobDescription})}
                onNavigateToCoding={handleNavigateToCoding}
              />
            )}

            {activeTab === 'coding' && (
              <CodingChallenges userData={userData} />
            )}

            {activeTab === 'ats' && (
              <AtsScoreAudit
                userData={userData}
                onUpdateUserData={onUpdateUserData}
              />
            )}
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  );
}
