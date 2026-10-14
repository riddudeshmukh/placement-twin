import React, { useState, useEffect, lazy, Suspense } from 'react';
import { MotionConfig, motion } from 'framer-motion';
import LandingPage from './components/landing/LandingPage';
import AuthModal from './components/auth/AuthModal';
const MainAppLayout = lazy(() => import('./components/dashboard/MainAppLayout'));
import { initialEmptyUserData } from './data/mockData';
import { getActiveSession, clearSession } from './lib/authStore';
import { viewTransition } from './lib/motion';
import './styles/theme.css';
import './styles/premium.css';

const profileKey = email => 'placementtwin_profile_v8_'+email.toLowerCase();
function readProfile(email) {try {return JSON.parse(localStorage.getItem(profileKey(email)) || '{}');}catch{return {};}}
export default function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'app'
  useEffect(() => { window.scrollTo(0, 0); }, [currentView]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [checkingSession, setCheckingSession] = useState(true);
  const [saveError,setSaveError] = useState('');

  // Real candidate state initialized completely blank without fake data
  const [userData, setUserData] = useState(initialEmptyUserData);

  // Restore a still-valid session (e.g. "stay signed in") on load, instead of
  // forcing a re-login every time the page refreshes.
  useEffect(() => {
    const session = getActiveSession();
    if (session) {
      setUserData(prev => ({
        ...prev,
        ...readProfile(session.email),
        fullName: session.fullName,
        email: session.email,
      }));
      setCurrentView('app');
    }
    setCheckingSession(false);
  }, []);

  const handleOpenAuth = (mode = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (userPayload) => {
    setUserData(() => ({
      ...initialEmptyUserData,
      ...readProfile(userPayload.email),
      fullName: userPayload.fullName,
      email: userPayload.email
    }));
    setAuthModalOpen(false);
    setCurrentView('app');
  };

  const handleLogout = () => {
    clearSession();
    setUserData(initialEmptyUserData);
    setCurrentView('landing');
  };

  const handleUpdateUserData = (updatedData) => {
    setUserData(updatedData);
    try { localStorage.setItem(profileKey(updatedData.email), JSON.stringify(updatedData)); } catch { setSaveError("Browser storage is full or unavailable. Your current changes may not survive a reload."); }
  };

  if (checkingSession) {
    return <div className="app-root"><div className="ambient-glow-mesh"></div></div>;
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="app-root">
        {/* Luxury Neomorphic Ambient Lighting */}
        <div className="ambient-glow-mesh"></div>

        {saveError && <p role="status" style={{padding:16,position:"relative",zIndex:100}}>{saveError}</p>}
        {/* Main Flow */}

          <motion.div key={currentView} {...viewTransition}>
            <Suspense fallback={<p role="status" style={{padding:40}}>Opening your workspace…</p>}>
            {currentView === 'landing' ? (
              <LandingPage
                onGetStarted={() => handleOpenAuth('signup')}
                onLoginClick={() => handleOpenAuth('login')}
              />
            ) : (
              <MainAppLayout
                userData={userData}
                onUpdateUserData={handleUpdateUserData}
                onLogout={handleLogout}
              />
            )}
            </Suspense>
          </motion.div>


        {/* Neomorphic Auth Modal */}
        <AuthModal
          isOpen={authModalOpen}
          initialMode={authModalMode}
          onClose={() => setAuthModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      </div>
    </MotionConfig>
  );
}
