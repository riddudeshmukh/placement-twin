import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Check, ChevronDown, Play, RotateCcw, BookOpen, Code2, Sparkles, Shuffle } from 'lucide-react';
import { curriculum, levels } from '../../data/curriculum';
import { extractSkillsFromJobDescription } from '../../lib/interviewQuestionBank';
import { runExercise } from '../../lib/exerciseRunner';
import './CodingChallenges.css';
const read = key => {try{return JSON.parse(localStorage.getItem(key)||'{}');}catch{return {};}};
export default function GuidedLessons({userData}) {
  const key='placementtwin_learning_v8_'+(userData?.email||'guest');
  const [progress,setProgress]=useState(()=>read(key));
  const [level,setLevel]=useState('beginner');
  const [activeId,setActiveId]=useState(()=>curriculum.find(l=>!read(key)[l.id]?.complete)?.id||curriculum[0].id);
  const [tab,setTab]=useState('learn');
  const [hints,setHints]=useState(0);
  const [solution,setSolution]=useState(false);
  const [quizFeedback,setQuizFeedback]=useState('');
  const [rows,setRows]=useState(null);
  const [error,setError]=useState('');
  const [running,setRunning]=useState(false);
  const [storageError,setStorageError]=useState('');
  const controller=useRef(null);
  const active=curriculum.find(l=>l.id===activeId)||curriculum[0];
  const entry=progress[active.id]||{};
  const code=entry.code??active.starter;
  const solved=curriculum.filter(l=>progress[l.id]?.complete).length;
  const sourceSkills=[...new Set([...(userData?.skills||[]).map(s=>s.name),...extractSkillsFromJobDescription(userData?.jobDescription||'')])];
  const recommended = sourceSkills.some(s=>['React','JavaScript','TypeScript','Node.js'].includes(s)) ? ['arrays','immutable','async','retry'] : sourceSkills.some(s=>['Data Structures','Algorithms','Java','C++','Python'].includes(s)) ? ['pointers','search','graph','dp'] : [];
  const selected=curriculum.filter(l=>l.level===level);
  const modules=[...new Set(selected.map(l=>l.module))];
  const update=patch=>setProgress(old=>({...old,[active.id]:{...old[active.id],...patch}}));
  useEffect(()=>{setLevel(active.level);},[]);
  useEffect(()=>{try{localStorage.setItem(key,JSON.stringify(progress));setStorageError('');}catch{setStorageError('Browser storage is full or unavailable. Progress is kept only while this page stays open.');}},[key,progress]);
  useEffect(()=>()=>controller.current?.abort(),[]);
  const select=lesson=>{controller.current?.abort();setActiveId(lesson.id);setLevel(lesson.level);setTab('learn');setHints(0);setSolution(false);setQuizFeedback('');setRows(null);setError('');setRunning(false);};
  const pickLevel=value=>{setLevel(value);select(curriculum.find(l=>l.level===value&&!progress[l.id]?.complete)||curriculum.find(l=>l.level===value));};
  const checkQuiz=index=>{const correct=index===active.quiz.answer;setQuizFeedback((correct?'Correct. ':'Try again. ')+active.quiz.explanation);if(correct)update({quiz:true});};
  const run=async()=>{
    controller.current?.abort();const current=new AbortController();controller.current=current;
    setRunning(true);setError('');setRows(null);
    try { const result=await runExercise(code,active,{signal:current.signal});if(current.signal.aborted)return;setRows(result);const passed=result.every(r=>r.passed);if(passed)update({passed:true,complete:!!entry.quiz,completedAt:new Date().toISOString()}); }
    catch(e){if(!current.signal.aborted)setError(e.message);}
    finally{if(!current.signal.aborted)setRunning(false);}
  };
  // Knowledge check and code test are both required; order does not matter.
  useEffect(()=>{if(entry.quiz&&entry.passed&&!entry.complete)update({complete:true,completedAt:new Date().toISOString()});},[entry.quiz,entry.passed,entry.complete]);
  const next=curriculum[curriculum.findIndex(l=>l.id===active.id)+1];
  return <div className="learning-studio">
    <header className="learning-header"><div><span className="eyebrow">THE PRACTICE STUDIO</span><h1>Small steps.<br/><em>Real understanding.</em></h1><p>Learn the idea. Try it. Make it yours.</p></div><div className="learning-progress"><span>{solved}<small> / {curriculum.length}</small></span><p>lessons completed</p><progress max={curriculum.length} value={solved}/><small>{solved*40} XP · earned by completing lessons</small></div></header>
    {sourceSkills.length>0&&<div className="learning-context"><span className="eyebrow">BASED ON YOUR RESUME / SAVED JD</span><p>Topics mentioned: {sourceSkills.slice(0,8).join(', ')}. This curriculum uses JavaScript; choose beginner if the language is new to you.</p>{recommended.length>0&&<div>{recommended.map(id=><button className="btn-soft" key={id} onClick={()=>select(curriculum.find(l=>l.id===id))}>{curriculum.find(l=>l.id===id).title}<ArrowRight size={12}/></button>)}</div>}</div>}
    {storageError&&<p role="status">{storageError}</p>}
    <div className="learning-layout"><aside className="learning-path"><div className="path-top"><h2>Your learning path</h2><BookOpen size={18}/></div><label className="field-label">Choose your level<select value={level} onChange={e=>pickLevel(e.target.value)}>{levels.map(l=><option key={l} value={l}>{l[0].toUpperCase()+l.slice(1)}</option>)}</select></label><label className="field-label mobile-lesson-select">Choose a lesson<select value={active.id} onChange={e=>select(curriculum.find(l=>l.id===e.target.value))}>{selected.map(l=><option key={l.id} value={l.id}>{progress[l.id]?.complete?"✓ ":""}{l.title}</option>)}</select></label><p className="path-note">Start anywhere. Follow the order if you’re new to coding.</p>
      {modules.map(module=><section className="path-module" key={module}><h3>{module}</h3>{selected.filter(l=>l.module===module).map(l=><button aria-current={l.id===active.id?'step':undefined} key={l.id} onClick={()=>select(l)} className={`path-lesson ${l.id===active.id?'current':''}`}><span className="lesson-node">{progress[l.id]?.complete?<Check size={16}/>:String(curriculum.indexOf(l)+1).padStart(2,'0')}</span><span>{l.title}<small>{progress[l.id]?.complete?'Completed · revisit anytime':progress[l.id]?.code?'In progress':'Learn + practice'}</small></span><ArrowRight size={14}/></button>)}</section>)}
      <button className="btn-soft" onClick={()=>{const pool=selected.filter(l=>l.id!==active.id&&!progress[l.id]?.complete);const candidates=pool.length?pool:selected.filter(l=>l.id!==active.id);select(candidates[Math.floor(Math.random()*candidates.length)]||active);}}><Shuffle size={14}/>Mix up my practice</button>
    </aside>
    <article className="lesson-workspace"><div className="lesson-heading"><span className="eyebrow">{active.level} / LESSON {String(curriculum.indexOf(active)+1).padStart(2,'0')}</span><h2>{active.title}</h2><p>JavaScript · {active.level==='beginner'?'Foundation':active.level==='intermediate'?'Application':'Problem solving'}</p></div>
    <div className="lesson-tabs" role="tablist" aria-label="Lesson steps"><button role="tab" aria-selected={tab==='learn'} onClick={()=>setTab('learn')}><BookOpen size={16}/> 01 Learn {entry.quiz&&<Check size={14}/>}</button><button role="tab" aria-selected={tab==='practice'} onClick={()=>setTab('practice')}><Code2 size={16}/> 02 Practice {entry.passed&&<Check size={14}/>}</button></div>
    {tab==='learn'?<section className="lesson-content" role="tabpanel"><h3>The idea, in plain language</h3><p>{active.concept}</p><h3>A small example</h3><pre><code>{active.example}</code></pre><h3>Think it through</h3><ol>{active.steps.map(step=><li key={step}>{step}</li>)}</ol><aside className="lesson-note"><Sparkles size={18}/><div><strong>A common surprise</strong><p>{active.pitfall}</p></div></aside><div className="knowledge-check"><span className="eyebrow">QUICK CHECK</span><h3>{active.quiz.q}</h3>{active.quiz.options.map((option,i)=><button key={option} onClick={()=>checkQuiz(i)}>{String.fromCharCode(65+i)}<span>{option}</span></button>)}{quizFeedback&&<p role="status">{quizFeedback}</p>}{entry.quiz&&<span className="success-text">✓ Knowledge check completed</span>}</div><button className="btn-brass" onClick={()=>setTab('practice')}>Try the exercise <ArrowRight size={16}/></button></section>:
    <section className="lesson-content" role="tabpanel"><h3>Your task</h3><p>{active.task}</p><div className="example-table"><h4>Examples & edge cases</h4>{active.tests.map((test,i)=><div key={i}><span>{test.label}</span><code>{JSON.stringify(test.args)} → {JSON.stringify(test.expected)}</code></div>)}</div><div className="editor-toolbar"><label htmlFor="lesson-code">JavaScript · browser worker</label><button className="btn-soft" onClick={()=>{update({code:active.starter});setRows(null);}}><RotateCcw size={14}/>Reset code</button></div><textarea id="lesson-code" className="lesson-code" spellCheck="false" value={code} onChange={e=>{update({code:e.target.value});setRows(null);}} aria-label="JavaScript solution"/><div className="practice-actions"><button className="btn-brass" disabled={running} onClick={run}><Play size={15}/>{running?'Checking…':'Run tests'}</button><button className="btn-soft" disabled={hints>=active.hints.length} onClick={()=>setHints(h=>h+1)}>Reveal hint {Math.min(hints+1,active.hints.length)}/{active.hints.length}<ChevronDown size={14}/></button></div>{active.hints.slice(0,hints).map((hint,i)=><p className="lesson-note" key={hint}>Hint {i+1}: {hint}</p>)}
      <div className="test-results" aria-live="polite">{error&&<p className="error-text">{error}</p>}{rows&&<><h3>{rows.filter(r=>r.passed).length}/{rows.length} checks passed</h3>{rows.map((row,i)=><div className={row.passed?'test-pass':'test-fail'} key={i}><strong>{row.passed?'✓':'×'} {row.label}</strong><code>Returned output: {row.actual}; expected: {row.expected}</code>{row.detail&&<small>{row.detail}</small>}</div>)}{rows.every(r=>r.passed)&&<p>{entry.quiz?'Lesson complete. Nice work — you earned 40 XP once for this lesson.':'Your code passed. Complete the knowledge check to finish this lesson.'}</p>}</>}</div>
      <details onToggle={e=>setSolution(e.currentTarget.open)}><summary>Study a worked solution</summary>{solution&&<><p>Compare the approach with your own. Passing these tests checks behavior on these cases; it does not prove every input or enforce complexity.</p><pre><code>{active.solution}</code></pre><p>{active.complexity}</p></>}</details>
    </section>}
    <footer className="lesson-footer"><span>{entry.complete?'✓ Lesson completed': 'No hearts. No penalties. Learn at your own pace.'}</span>{next&&<button className="btn-soft" onClick={()=>select(next)}>Next lesson <ArrowRight size={15}/></button>}</footer></article></div>
  </div>;
}
