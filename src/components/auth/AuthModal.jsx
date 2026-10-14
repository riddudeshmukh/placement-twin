import React, { useState, useEffect, useRef } from 'react';
import { Bot, Mail, Lock, User, ArrowRight, AlertCircle, Eye, EyeOff, ShieldCheck, Loader2 } from 'lucide-react';
import { photos } from '../../assets/photoLibrary';
import {
  validateEmailFormat,
  evaluatePasswordStrength,
  startSignup,
  startLogin,
  resendOtp,
  verifyOtp,
  createSession,
} from '../../lib/authStore';
import './AuthModal.css';

const STRENGTH_LABELS = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialMode = 'login' }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if(!isOpen)return;
    const previous=document.activeElement;
    const overflow=document.body.style.overflow;
    document.body.style.overflow='hidden';
    dialogRef.current?.querySelector('input')?.focus();
    const onKey=e=>{
      if(e.key==='Escape'){closeRef.current();return;}
      if(e.key!=='Tab')return;
      const nodes=[...dialogRef.current.querySelectorAll('button:not([disabled]), input, a[href]')].filter(n=>n.offsetParent!==null);
      const first=nodes[0],last=nodes.at(-1);
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
    };
    document.addEventListener('keydown',onKey);
    return()=>{document.body.style.overflow=overflow;document.removeEventListener('keydown',onKey);previous?.focus();};
  },[isOpen]);
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [otp, setOtp] = useState('');
  const [resendIn, setResendIn] = useState(0);
  const [info, setInfo] = useState('');

  useEffect(() => {
    setIsLogin(initialMode === 'login');
    setError('');
  }, [initialMode, isOpen]);

  useEffect(() => {
    if (resendIn <= 0) return undefined;
    const id = setInterval(() => setResendIn(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [resendIn]);

  // Reset the popup whenever the modal is closed/reopened.
  useEffect(() => {
    if (!isOpen) { setStep('form'); setOtp(''); setInfo(''); setError(''); }
  }, [isOpen]);

  if (!isOpen) return null;

  const strength = evaluatePasswordStrength(password);

  const resetFieldsOnModeSwitch = () => {
    setError('');
    setPassword('');
    setConfirmPassword('');
  };

  const purpose = isLogin ? 'login' : 'signup';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const trimmedEmail = email.trim();

    if (!validateEmailFormat(trimmedEmail)) { setError('Enter a valid email address.'); return; }
    if (!password) { setError('Please enter your password.'); return; }
    if (!isLogin) {
      if (!fullName.trim()) { setError('Please enter your full name.'); return; }
      if (!strength.valid) { setError(`Password needs ${strength.issues.join(', ')}.`); return; }
      if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    }

    setSubmitting(true);
    try {
      if (isLogin) await startLogin({ email: trimmedEmail, password });
      else await startSignup({ fullName, email: trimmedEmail, password });
      setOtp('');
      setInfo(`We sent a 6-digit code to ${trimmedEmail}.`);
      setResendIn(30);
      setStep('otp'); // OTP popup appears here
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^\d{6}$/.test(otp)) { setError('Enter the 6-digit code.'); return; }
    setSubmitting(true);
    try {
      const data = await verifyOtp({ email: email.trim(), purpose, otp });
      const session = createSession(data, rememberMe);
      onAuthSuccess({ fullName: data.user.fullName, email: data.user.email, isLoggedIn: true, sessionToken: session.token });
    } catch (err) {
      setError(err.message || 'Verification failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError('');
    try {
      await resendOtp({ email: email.trim(), purpose });
      setInfo('A new code is on its way.');
      setResendIn(30);
    } catch (err) {
      setError(err.message);
    }
  };


  return (
    <div className="auth-backdrop" onClick={onClose}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Account access" data-mode={isLogin?"login":"signup"} className="auth-card neu-card-lg auth-card--split" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close-btn" onClick={onClose} aria-label="Close modal">×</button>
        {step === 'otp' && (
          <div className="otp-overlay" role="dialog" aria-modal="true" aria-label="Verify your email">
            <form className="otp-box" onSubmit={handleVerify}>
              <div className="brand-logo-neu"><Mail size={22} className="text-gold" /></div>
              <h2>Check your email</h2>
              <p className="otp-sub">{info}</p>
              {error && (<div role="alert" className="auth-error-pill neu-sunken-well"><AlertCircle size={16} className="text-terracotta" /><span>{error}</span></div>)}
              <input
                className="neu-input otp-input"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="••••••"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                aria-label="6-digit verification code"
                autoFocus
              />
              <button type="submit" className="btn-brass auth-submit-btn" disabled={submitting || otp.length !== 6}>
                {submitting ? <><Loader2 size={16} className="spin-icon" /> Verifying...</> : <>Verify &amp; continue <ArrowRight size={16} /></>}
              </button>
              <div className="otp-actions">
                <button type="button" disabled={resendIn > 0} onClick={handleResend}>{resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend code'}</button>
                <button type="button" onClick={() => { setStep('form'); setError(''); }}>Change email</button>
              </div>
            </form>
          </div>
        )}

        <div className="auth-visual-panel" aria-hidden="true">
          <img src={photos.authVisual} alt="" loading="lazy" />
          <div className="auth-visual-veil" />
          <div className="auth-visual-top">
            <div className="brand-disc neu-pill">
              <Bot size={18} className="text-brass" />
            </div>
            <span>PlacementTwin</span>
          </div>
          <div className="auth-visual-caption">
            <span className="eyebrow">BUILD YOUR NEXT CHAPTER</span>
            <p>Confidence comes<br/>from showing up.</p>
            <ul className="auth-visual-checklist">
              <li><ShieldCheck size={13} /> 96 step-by-step coding lessons</li>
              <li><ShieldCheck size={13} /> Resume and JD interview practice</li>
              <li><ShieldCheck size={13} /> Your account is verified by email</li>
            </ul>
          </div>
        </div>

        <div className="auth-form-panel">
        <div className="pt-auth-modes" role="group" aria-label="Account mode"><button type="button" aria-pressed={isLogin} onClick={()=>{setIsLogin(true);resetFieldsOnModeSwitch();}}>Sign in</button><button type="button" aria-pressed={!isLogin} onClick={()=>{setIsLogin(false);resetFieldsOnModeSwitch();}}>Create account</button></div>
        <div className="auth-header" key={isLogin?'login':'signup'}>
          <div className="brand-logo-neu">
            <Bot size={22} className="text-gold" />
          </div>
          <h2>{isLogin ? 'Welcome back.' : 'Start your next chapter.'}</h2>
          <p>{isLogin ? 'Continue your practice and learning' : 'Verify with a code sent to your email'}</p>
        </div>

        {error && (
          <div role="alert" className="auth-error-pill neu-sunken-well">
            <AlertCircle size={16} className="text-terracotta" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="auth-name">Full Candidate Name</label>
              <div className="input-wrap">
                <User size={17} className="input-icon" />
                <input 
                  type="text" 
                  id="auth-name" placeholder="Your full name" 
                  className="neu-input with-icon"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="auth-email">Email Address</label>
            <div className="input-wrap">
              <Mail size={17} className="input-icon" />
              <input 
                type="email" 
                id="auth-email" placeholder="you@example.com" 
                className="neu-input with-icon"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="auth-password">Password</label>
            <div className="input-wrap">
              <Lock size={17} className="input-icon" />
              <input 
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••" 
                className="neu-input with-icon with-icon-right"
                id="auth-password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                required
              />
              <button
                type="button"
                className="input-icon-btn-right"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {!isLogin && password.length > 0 && (
              <div className="password-strength-row">
                <div className="password-strength-track">
                  <div
                    className={`password-strength-fill strength-${strength.score}`}
                    style={{ width: `${(strength.score / 4) * 100}%` }}
                  />
                </div>
                <span className="password-strength-label">{STRENGTH_LABELS[strength.score]}</span>
              </div>
            )}
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="auth-confirm">Confirm Password</label>
              <div className="input-wrap">
                <Lock size={17} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  className="neu-input with-icon"
                  id="auth-confirm" value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
              {confirmPassword.length > 0 && confirmPassword !== password && (
                <span className="field-hint field-hint-warn">Passwords don't match yet.</span>
              )}
            </div>
          )}

          <div className="auth-remember-row">
            <label className="remember-checkbox">
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
              <span>Stay signed in on this device</span>
            </label>
          </div>

          <button type="submit" className="btn-brass auth-submit-btn" disabled={submitting}>
            {submitting ? (
              <><Loader2 size={16} className="spin-icon" /> Sending code...</>
            ) : (
              <>{isLogin ? 'Sign in' : 'Create account'} <ArrowRight size={16} /></>
            )}
          </button>

          <div className="auth-security-note">
            <ShieldCheck size={13} /> A 6-digit code will be emailed to you to confirm it is really you.
          </div>
        </form>

        <div className="auth-footer-toggle">
          {isLogin ? (
            <p>New candidate? <button type="button" onClick={() => { setIsLogin(false); resetFieldsOnModeSwitch(); }}>Create an account</button></p>
          ) : (
            <p>Already registered? <button type="button" onClick={() => { setIsLogin(true); resetFieldsOnModeSwitch(); }}>Sign In</button></p>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
