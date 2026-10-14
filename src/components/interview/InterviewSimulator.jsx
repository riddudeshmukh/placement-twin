import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  HelpCircle,
  Award,
  Zap,
  User,
  AlertTriangle,
  Tag,
  Camera
} from 'lucide-react';
import { photos } from '../../assets/photoLibrary';
import { scoreAnswer, aggregateSession } from '../../lib/interviewScoring';
import { buildInterviewSession, markQuestionAsked, resetUsedQuestionIds } from '../../lib/interviewQuestionBank';
import './InterviewSimulator.css';

export default function InterviewSimulator({ userData, onInterviewComplete, onNavigateToCoding, onSaveJobDescription }) {
  const [sessionActive, setSessionActive] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [matchedSkills, setMatchedSkills] = useState(null);
  const [poolRecycled, setPoolRecycled] = useState(false);

  // Setup / mode selection
  const [selectedMode, setSelectedMode] = useState(userData?.skills?.length ? 'resume' : 'general');
  const [jdText, setJdText] = useState(userData.jobDescription || '');
  const [difficulty, setDifficulty] = useState('beginner');
  const [sessionSize, setSessionSize] = useState(5);
  const [sessionNotice, setSessionNotice] = useState('');
  const [setupError, setSetupError] = useState('');

  // Media states
  const [cameraActive, setCameraActive] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [audioFeedbackVoice, setAudioFeedbackVoice] = useState(true);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isUserRecording, setIsUserRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [micLevel, setMicLevel] = useState(0);
  const [mediaError, setMediaError] = useState('');

  // Response handling
  const [answerDraft, setAnswerDraft] = useState('');
  const [answersLog, setAnswersLog] = useState([]);
  const [analyzingResponse, setAnalyzingResponse] = useState(false);

  // Final Result
  const [evaluationResult, setEvaluationResult] = useState(null);

  const videoRef = useRef(null);
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioCtxRef = useRef(null);
  const micRafRef = useRef(null);
  const [speechSupported] = useState(
    typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  );
  const [speechError, setSpeechError] = useState('');

  const candidateKey = userData?.email || 'guest';
  const resumeSkillNames = (userData?.skills || []).map(s => s.name);

  const launchInterviewRoom = () => {
    setSetupError('');

    if ((selectedMode === 'resume' || selectedMode === 'combined') && resumeSkillNames.length === 0) {
      setSetupError('No skills were detected from a resume yet. Upload one in Resume Parser, or choose a different mode.');
      return;
    }
    if ((selectedMode === 'jd' || selectedMode === 'combined') && !jdText.trim()) {
      setSetupError('Paste a job description first so questions can be matched to it.');
      return;
    }

    const session = buildInterviewSession({
      source: selectedMode,
      resumeSkillNames,
      jdText,
      candidateKey,
      resumeText: userData.resumeText || '',
      difficulty,
      technicalCount: sessionSize - 1,
      hrCount: 1,
    });

    if (session.error) { setSetupError(session.error); return; }
    const { questions: selected, matchedSkills: matched, poolRecycled: recycled } = session;
    setSessionNotice(session.notice);
    onSaveJobDescription?.(jdText);
    setQuestions(selected);
    setMatchedSkills(matched);
    setPoolRecycled(recycled);
    setCurrentQuestionIndex(0);
    setAnswersLog([]);
    setEvaluationResult(null);
    setCompleted(false);
    setMediaError('');
    setSessionActive(true);
  };

  const restartFromResult = () => {
    setSessionActive(false);
    setCompleted(false);
    setQuestions([]);
    setEvaluationResult(null);
  };

  const speakQuestion = (text) => {
    if (!audioFeedbackVoice || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => v.lang.startsWith('en'));
    if (naturalVoice) utterance.voice = naturalVoice;

    setIsAiSpeaking(true);
    utterance.onend = () => setIsAiSpeaking(false);
    utterance.onerror = () => setIsAiSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (sessionActive && questions.length > 0 && !completed) {
      const q = questions[currentQuestionIndex];
      if (q) { markQuestionAsked(candidateKey, q.id); speakQuestion(q.question); }
    }
    return () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, sessionActive, completed]);

  // Video + mic feed hookup. Requests both tracks together so a single
  // permission prompt covers camera and the mic level meter; speech-to-text
  // itself still runs through the separate Web Speech API.
  useEffect(() => {
    let stream = null;
    let cancelled = false;
    setMediaError('');

    if (sessionActive && (cameraActive || micActive) && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: cameraActive, audio: micActive })
        .then((s) => {
          if (cancelled) {
            s.getTracks().forEach(t => t.stop());
            return;
          }
          stream = s;
          if (videoRef.current && cameraActive) {
            videoRef.current.srcObject = s;
          }
          if (micActive && s.getAudioTracks().length > 0) {
            setupMicLevelMeter(s);
          }
        })
        .catch((err) => {
          if (cancelled) return;
          setMediaError(
            err?.name === 'NotAllowedError'
              ? 'Camera/microphone access was denied. Enable permissions in your browser to use live feeds.'
              : 'Could not access camera/microphone on this device.'
          );
        });
    }
    return () => {
      cancelled = true;
      if (stream) stream.getTracks().forEach(t => t.stop());
      teardownMicLevelMeter();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionActive, cameraActive, micActive]);

  const setupMicLevelMeter = (stream) => {
    teardownMicLevelMeter();
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      audioCtxRef.current = ctx;

      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setMicLevel(Math.min(100, Math.round((avg / 128) * 100)));
        micRafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      // Mic level meter is a nice-to-have; failing silently keeps the interview usable.
    }
  };

  const teardownMicLevelMeter = () => {
    if (micRafRef.current) cancelAnimationFrame(micRafRef.current);
    micRafRef.current = null;
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    setMicLevel(0);
  };

  // Recording counter
  useEffect(() => {
    if (isUserRecording) {
      timerRef.current = setInterval(() => setRecordingSeconds(p => p + 1), 1000);
    } else {
      clearInterval(timerRef.current);
      setRecordingSeconds(0);
    }
    return () => clearInterval(timerRef.current);
  }, [isUserRecording]);

  const toggleRecording = () => {
    if (!speechSupported) {
      setSpeechError('Speech-to-text is not supported in this browser. Try Chrome or Edge, or type your answer directly.');
      return;
    }
    if (!micActive) {
      setSpeechError('Turn your microphone on first (Mic Muted button below the camera feed).');
      return;
    }

    if (isUserRecording) {
      recognitionRef.current?.stop();
      return;
    }

    setSpeechError('');
    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      let transcriptChunk = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        if (event.results[i].isFinal) {
          transcriptChunk += event.results[i][0].transcript;
        }
      }
      if (transcriptChunk) {
        setAnswerDraft(prev => (prev ? `${prev.trim()} ${transcriptChunk.trim()}` : transcriptChunk.trim()));
      }
    };

    recognition.onerror = (event) => {
      setSpeechError(`Speech recognition error: ${event.error}. You can keep typing instead.`);
      setIsUserRecording(false);
    };

    recognition.onend = () => setIsUserRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsUserRecording(true);
  };

  useEffect(() => {
    return () => recognitionRef.current?.stop();
  }, []);

  const handleNextQuestion = () => {
    if (!answerDraft.trim()) return;
    setAnalyzingResponse(true);

    const currentQ = questions[currentQuestionIndex];
    setTimeout(() => {
      const { score, feedback } = scoreAnswer(currentQ, answerDraft);

      const logItem = {
        question: currentQ.question,
        userAnswer: answerDraft,
        score,
        category: currentQ.domain || currentQ.type,
        kind: currentQ.kind,
        feedback,
      };

      const updated = [...answersLog, logItem];
      setAnswersLog(updated);
      setAnswerDraft('');
      setAnalyzingResponse(false);

      if (currentQuestionIndex + 1 < questions.length) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        finishSession(updated);
      }
    }, 500);
  };

  const finishSession = (logs) => {
    setCompleted(true);
    setSessionActive(false);
    const result = {...aggregateSession(logs), answers: logs, difficulty, source: selectedMode};
    setEvaluationResult(result);
    if (onInterviewComplete) onInterviewComplete(result);
  };

  return (
    <div className="room-layout">
      <div className="stat-strip interview-stat-strip">
        <div className="stat-strip-cell">
          <span className="stat-strip-value text-brass">{userData.interviewHistory.length}</span>
          <span className="stat-strip-label">Past Sessions</span>
        </div>
        <div className="stat-strip-cell">
          <span className="stat-strip-value text-moss">
            {userData.interviewHistory.length > 0 ? `${userData.interviewHistory[0].totalScore}/100` : '—'}
          </span>
          <span className="stat-strip-label">Last Score</span>
        </div>
        <div className="stat-strip-cell">
          <span className="stat-strip-value">{resumeSkillNames.length}</span>
          <span className="stat-strip-label">Skills On File</span>
        </div>
      </div>

      {/* Header bar */}
      <div className="room-topbar neu-float">
        <div className="room-title-group">
          <h2>Your interview studio</h2>
          <p>Evidence-based prompts. Optional voice and camera. Text answers work on every device.</p>
        </div>

        <div className="room-topbar-actions">
          {(sessionActive || completed) && (
            <button className="btn-soft" onClick={restartFromResult}>
              <RotateCcw size={15} /> Choose New Setup
            </button>
          )}
        </div>
      </div>

      {/* Screen Views */}
      {!sessionActive && !completed ? (
        /* Setup: mode selection + entrance */
        <div className="room-entrance-card neu-float room-entrance-card--visual">
          <div className="entrance-media-layer" aria-hidden="true">
            <img className="entrance-media-video" src={photos.interviewPoster} alt="" loading="lazy" />
            <div className="entrance-media-veil"></div>
          </div>
          <div className="entrance-disc neu-inset">
            <Bot size={40} className="text-brass" />
          </div>
          <h3>Practice for your next conversation</h3>
          <p>
            Choose your source and level. Prompts are assembled locally from matched topics and your source text. Feedback is a keyword and structure heuristic, not an AI assessment of correctness.
          </p>

          <div className="interview-controls">
            <label>Question source<select value={selectedMode} onChange={e=>{setSelectedMode(e.target.value);setSetupError('');}}>
              <option value="combined">Resume + job description</option><option value="resume">My resume</option><option value="jd">Job description</option><option value="general">General practice</option>
            </select></label>
            <label>Difficulty<select value={difficulty} onChange={e=>setDifficulty(e.target.value)}><option value="beginner">Beginner · explain & apply</option><option value="intermediate">Intermediate · debug & compare</option><option value="advanced">Advanced · design & defend</option></select></label>
            <label>Session length<select value={sessionSize} onChange={e=>setSessionSize(Number(e.target.value))}><option value={5}>5 questions</option><option value={8}>8 questions</option><option value={10}>10 questions</option></select></label>
          </div>
          {(selectedMode === 'resume' || selectedMode === 'combined') && (
            <div className="mode-detail-pod neu-inset">
              {resumeSkillNames.length > 0 ? (
                <>
                  <span className="mode-detail-title"><Tag size={14} className="text-brass" /> Skills detected from your resume:</span>
                  <div className="gap-pills-row">
                    {resumeSkillNames.slice(0, 12).map((s, i) => (
                      <span key={i} className="pill-tag pill-moss">{s}</span>
                    ))}
                  </div>
                </>
              ) : (
                <span className="mode-detail-title">No resume parsed yet — upload one in the Resume Parser tab, or pick a different mode.</span>
              )}
            </div>
          )}

          {(selectedMode === 'jd' || selectedMode === 'combined') && (
            <div className="mode-detail-pod neu-inset">
              <span className="mode-detail-title">Paste the job description below:</span>
              <textarea
                className="neu-inset jd-textarea"
                rows={5}
                placeholder="Paste the job posting text here — required skills, responsibilities, tech stack..."
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
              />
            </div>
          )}

          {setupError && (
            <div className="rubric-hint-box neu-inset">
              <AlertTriangle size={15} className="text-clay" />
              <span>{setupError}</span>
            </div>
          )}

          <div className="entrance-specs-pod neu-inset">
            <div><CheckCircle2 size={16} className="text-moss" /> {sessionSize - 1} technical + 1 behavioral question requested; shorter if the fresh pool runs out</div>
            <div><CheckCircle2 size={16} className="text-moss" /> Natural Speech Audio Synthesis with repeat capability</div>
            <div><CheckCircle2 size={16} className="text-moss" /> Live Candidate Camera Viewport with real-time mic level meter</div>
            <div><CheckCircle2 size={16} className="text-moss" /> Question history is saved on this browser; repeats require an explicit reset</div>
          </div>

          <details className="history-reset"><summary>Question history & review</summary><p>Resetting allows previously asked prompts to appear again on this browser.</p><button className="btn-soft" onClick={()=>{resetUsedQuestionIds(candidateKey);setSetupError('Question history reset. Previously asked prompts can now be used for review.');}}>Reset history for review</button></details>
          <button className="btn-brass entrance-launch-btn" onClick={launchInterviewRoom}>
            <Sparkles size={16} /> Enter Mock Interview Room
          </button>
        </div>
      ) : completed && evaluationResult ? (
        /* Evaluation Card */
        <div className="room-eval-card neu-float">
          <div className="eval-card-header">
            <span className="pill-tag pill-moss"><Award size={14} /> Evaluation Concluded</span>
            <h2>Practice feedback</h2>
            <p className="eval-result-verdict text-brass">{evaluationResult.verdict}</p>
          </div>

          <div className="eval-quad-scores">
            <div className="quad-score-box neu-inset">
              <span className="quad-label">Overall Index</span>
              <span className="quad-num text-brass">{evaluationResult.overallScore}</span>
              <span className="quad-foot">out of 100</span>
            </div>

            <div className="quad-score-box neu-inset">
              <span className="quad-label">Technical keyword coverage</span>
              <span className="quad-num text-moss">{evaluationResult.technicalScore}%</span>
            </div>

            <div className="quad-score-box neu-inset">
              <span className="quad-label">Behavioral keyword coverage</span>
              <span className="quad-num text-clay">{evaluationResult.hrScore}%</span>
            </div>

            <div className="quad-score-box neu-inset">
              <span className="quad-label">Length & filler signals</span>
              <span className="quad-num">{evaluationResult.communicationScore}%</span>
            </div>
          </div>

          <details className="interview-review neu-inset"><summary>Review each answer and explanation</summary>{answersLog.map((log,i)=><section key={i}><span className="eyebrow">Question {i+1} · {log.category}</span><h4>{log.question}</h4><p><strong>Your answer:</strong> {log.userAnswer}</p><p><strong>Feedback:</strong> {log.feedback}</p><p><strong>How to improve:</strong> {questions[i]?.sampleTip || 'Explain the mechanism, give a concrete example, and check an edge case.'}</p></section>)}</details>
          <div className="eval-dual-panes">
            <div className="eval-pane neu-inset">
              <h4>Practice notes</h4>
              <p>{evaluationResult.detailedNotes}</p>
            </div>

            <div className="eval-pane neu-inset">
              <div className="pane-gap-title">
                <AlertTriangle size={16} className="text-brass" />
                <h4>Diagnosed Areas for Reinforcement:</h4>
              </div>
              <div className="gap-pills-row">
                {evaluationResult.weakSkills.map((sk, i) => (
                  <span key={i} className="pill-tag pill-brass">{sk}</span>
                ))}
              </div>
              <p className="pane-gap-desc">
                Explore the coding curriculum and choose a module relevant to your next learning goal.
              </p>
              <button 
                className="btn-brass"
                onClick={() => onNavigateToCoding(evaluationResult.weakSkills)}
              >
                <Zap size={15} /> Practice Algorithmic Drills
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Active Two-Column Studio Layout */
        <div className="room-stage-grid">
          {(matchedSkills || poolRecycled) && (
            <div className="session-meta-banner neu-inset">
              {matchedSkills && (
                <span><Tag size={13} className="text-brass" /> Targeting: {matchedSkills.slice(0, 8).join(', ') || 'general mix (no overlapping skills found)'}</span>
              )}
              {poolRecycled && <span className="session-meta-note">Question bank fully covered previously — recycling the full set for this run.</span>}
            </div>
          )}

          {sessionNotice && <p role="status">{sessionNotice}</p>}
          {/* Streams Column */}
          <div className="room-streams-column">
            {/* AI Evaluator Screen */}
            <div className="evaluator-feed neu-float">
              <div className="feed-header-line">
                <div className="feed-label">
                  <Bot size={15} className="text-brass" />
                  <span>Practice interviewer</span>
                </div>
                {isAiSpeaking && <span className="pill-tag pill-brass">Speaking</span>}
              </div>

              <div className="evaluator-visual neu-inset">
                <div className={`evaluator-avatar-orb neu-pill ${isAiSpeaking ? 'orb-speaking' : ''}`}>
                  <Bot size={40} className="text-brass" />
                </div>
              </div>

              <div className="question-display-pod neu-inset">
                <span className="q-domain-tag text-brass">
                  Question {currentQuestionIndex + 1} of {questions.length} • {questions[currentQuestionIndex]?.domain || questions[currentQuestionIndex]?.type}
                </span>
                <p className="q-body-text">
                  "{questions[currentQuestionIndex]?.question}"
                </p>

                <div className="question-evidence"><span>{questions[currentQuestionIndex]?.difficulty} · {questions[currentQuestionIndex]?.origin}</span>{questions[currentQuestionIndex]?.evidence && <blockquote>Source excerpt: “{questions[currentQuestionIndex].evidence}”</blockquote>}</div>
                <div className="voice-toggles">
                  <button 
                    className="btn-soft btn-sm"
                    onClick={() => {
                      setAudioFeedbackVoice(!audioFeedbackVoice);
                      if (audioFeedbackVoice && 'speechSynthesis' in window) window.speechSynthesis.cancel();
                    }}
                  >
                    {audioFeedbackVoice ? <Volume2 size={13} /> : <VolumeX size={13} />}
                    <span>{audioFeedbackVoice ? 'Audio Active' : 'Audio Muted'}</span>
                  </button>

                  <button 
                    className="btn-soft btn-sm"
                    onClick={() => speakQuestion(questions[currentQuestionIndex]?.question)}
                  >
                    Repeat Question
                  </button>
                </div>
              </div>
            </div>

            {/* Candidate User Video Screen */}
            <div className="candidate-feed neu-float">
              <div className="feed-header-line">
                <div className="feed-label">
                  <User size={15} />
                  <span>Candidate Feed: {userData.fullName || 'Candidate'}</span>
                </div>
              </div>

              {mediaError && (
                <div className="rubric-hint-box neu-inset">
                  <Camera size={15} className="text-clay" />
                  <span>{mediaError}</span>
                </div>
              )}

              <div className="camera-viewport neu-inset">
                {cameraActive ? (
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="viewport-video-tag"
                  />
                ) : (
                  <div className="camera-disabled-msg">
                    <User size={36} className="text-muted" />
                    <span>Camera toggled off</span>
                  </div>
                )}

                <div className="viewport-hud">
                  <span className={`hud-badge ${micActive ? 'hud-green' : 'hud-red'}`}>
                    MIC: {micActive ? (isUserRecording ? 'RECORDING' : 'READY') : 'MUTED'}
                  </span>
                  {isUserRecording && (
                    <span className="hud-timer">● 00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}</span>
                  )}
                </div>
              </div>

              {micActive && (
                <div className="mic-level-track neu-inset" aria-label="Microphone input level">
                  <div className="mic-level-fill" style={{ width: `${micLevel}%` }} />
                </div>
              )}

              <div className="feed-controls-row">
                <button 
                  className="btn-soft btn-sm"
                  onClick={() => setCameraActive(!cameraActive)}
                >
                  {cameraActive ? <Video size={13} /> : <VideoOff size={13} />}
                  <span>{cameraActive ? 'Stop Video' : 'Start Video'}</span>
                </button>

                <button 
                  className="btn-soft btn-sm"
                  onClick={() => setMicActive(!micActive)}
                >
                  {micActive ? <Mic size={13} /> : <MicOff size={13} />}
                  <span>{micActive ? 'Mic Active' : 'Mic Muted'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Response Composer Column */}
          <div className="room-composer-column neu-float">
            <div className="composer-head">
              <h3>Candidate Response & Architecture</h3>
              <span className="pill-tag pill-brass">
                Domain: {questions[currentQuestionIndex]?.domain || questions[currentQuestionIndex]?.type}
              </span>
            </div>

            {questions[currentQuestionIndex]?.sampleTip && (
              <div className="rubric-hint-box neu-inset">
                <HelpCircle size={15} className="text-brass" />
                <span><strong>Rubric Guidance:</strong> {questions[currentQuestionIndex].sampleTip}</span>
              </div>
            )}

            <div className="voice-input-strip">
              <button 
                type="button" 
                className={`btn-soft record-strip-btn ${isUserRecording ? 'is-recording' : ''}`}
                onClick={toggleRecording}
              >
                {isUserRecording ? <MicOff size={15} /> : <Mic size={15} />}
                <span>{isUserRecording ? 'Stop Voice Input' : 'Voice Input (Speech-to-Text)'}</span>
              </button>
              <span className="strip-divider">or enter detailed response:</span>
            </div>

            {speechError && (
              <div className="rubric-hint-box neu-inset">
                <HelpCircle size={15} className="text-clay" />
                <span>{speechError}</span>
              </div>
            )}

            <textarea 
              className="neu-inset composer-textarea"
              rows={8}
              placeholder="Structure your answer clearly with constraints, trade-offs, and measurable outcomes..."
              value={answerDraft}
              onChange={(e) => setAnswerDraft(e.target.value)}
            />

            <div className="composer-actions-bottom">
              <span className="word-count-note">
                {answerDraft.trim() ? answerDraft.trim().split(/\s+/).length : 0} words
              </span>

              <button 
                className="btn-brass"
                disabled={!answerDraft.trim() || analyzingResponse}
                onClick={handleNextQuestion}
              >
                {analyzingResponse ? 'Scoring Answer...' : 'Submit & Advance'} <Send size={14} />
              </button>
            </div>

            {/* Answer History */}
            {answersLog.length > 0 && (
              <div className="evaluated-stream-pod neu-inset">
                <h4>Evaluated Questions ({answersLog.length})</h4>
                <div className="stream-items">
                  {answersLog.map((item, idx) => (
                    <div key={idx} className="stream-entry neu-pill">
                      <div className="entry-head-line">
                        <strong>Q{idx + 1}: {item.question.substring(0, 48)}...</strong>
                        <span className="pill-tag pill-moss">{item.score}/100</span>
                      </div>
                      <p className="entry-note">{item.feedback}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
