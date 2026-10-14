import React, { useEffect, useRef, useState } from 'react';
import { Code2, Play, RotateCcw, CheckCircle2, Shuffle, BookOpen, Bookmark, Search, Clock, BarChart3, ArrowRight, Download, Pause } from 'lucide-react';
import { practiceBank, practiceLanguages, practiceLevels } from '../../data/practiceBank';
import { pythonSolutions, pythonNotes, pythonSteps } from '../../data/pythonPractice';
import { javascriptSolutions } from '../../data/javascriptSolutions';
import { choosePracticeQuestion, readPracticeState } from '../../lib/practiceSelection';
import { runExercise } from '../../lib/exerciseRunner';
import { photos } from '../../assets/photoLibrary';
import GuidedLessons from './GuidedLessons';
import FoundationAcademy from './FoundationAcademy';
import './PracticeStudio.css';
const formatTime = seconds => `${Math.floor(seconds/60).toString().padStart(2,'0')}:${(seconds%60).toString().padStart(2,'0')}`;
const starterFor=(question,language)=>language==='python'?`def ${question.signature}:\n    # Write your solution here\n    pass\n`:`function ${question.signature} {\n  // Write your solution here.\n}\n`;
const prepareQuestion=(question,language)=>({...question,solution:language==='python'?pythonSolutions[question.id]:question.solution});
export default function CodingChallenges({userData}) {
  const storageKey='placementtwin_practice_v9_'+(userData?.email||'guest');
  const [data,setData]=useState(()=>readPracticeState(storageKey));
  const [view,setView]=useState('foundations');
  const [language,setLanguage]=useState(()=>readPracticeState(storageKey).language||'javascript');
  const [level,setLevel]=useState(()=>readPracticeState(storageKey).level||'beginner');
  const [activeId,setActiveId]=useState(()=>{const saved=readPracticeState(storageKey),lang=saved.language||'javascript',lvl=saved.level||'beginner',key=lang+':'+lvl;return choosePracticeQuestion(practiceBank.filter(q=>q.level===lvl),saved.seen[key],saved.last[key]).question.id;});
  const [search,setSearch]=useState('');
  const [filter,setFilter]=useState('all');
  const [notice,setNotice]=useState('A fresh question is ready. Use the explorer to revisit any topic.');
  const [rows,setRows]=useState(null);
  const [error,setError]=useState('');
  const [running,setRunning]=useState(false);
  const [hintCount,setHintCount]=useState(0);
  const [solutionOpen,setSolutionOpen]=useState(false);
  const [undoCode,setUndoCode]=useState(null);
  const [saveError,setSaveError]=useState('');
  const [elapsed,setElapsed]=useState(0);
  const [clockRunning,setClockRunning]=useState(false);
  const timerStart=useRef(0),timerBase=useRef(0),controller=useRef(null);
  const active=practiceBank.find(q=>q.id===activeId)||practiceBank[0];
  const entryKey=language+':'+active.id,historyKey=language+':'+level;
  const code=data.drafts[entryKey]??starterFor(active,language);
  const pool=practiceBank.filter(q=>q.level===level);
  const visible=pool.filter(q=>{
    const key=language+':'+q.id;
    return (!search||`${q.title} ${q.task}`.toLowerCase().includes(search.toLowerCase())) && (filter==='all'||filter==='unsolved'&&!data.solved[key]||filter==='bookmarked'&&data.bookmarks.includes(key));
  });
  const solved=practiceBank.filter(q=>data.solved[language+':'+q.id]).length;
  const currentBookmarked=data.bookmarks.includes(entryKey);
  const setCode=value=>setData(old=>({...old,drafts:{...old.drafts,[entryKey]:value}}));
  useEffect(()=>{try{localStorage.setItem(storageKey,JSON.stringify(data));setSaveError('');}catch{setSaveError('Storage unavailable. Keep this page open or export your practice progress.');}},[storageKey,data]);
  // Record displayed questions, not the whole pool. StrictMode may run this twice; writes are idempotent.
  useEffect(()=>{setData(old=>{const ids=old.seen[historyKey]||[];return {...old,language,level,seen:{...old.seen,[historyKey]:[...new Set([...ids,active.id])]},last:{...old.last,[historyKey]:active.id}};});},[active.id,historyKey,language,level]);
  useEffect(()=>{if(!clockRunning)return;timerStart.current=Date.now();timerBase.current=elapsed;const id=setInterval(()=>setElapsed(timerBase.current+Math.floor((Date.now()-timerStart.current)/1000)),250);return()=>clearInterval(id);},[clockRunning]);
  useEffect(()=>()=>controller.current?.abort(),[]);
  const resetView=()=>{controller.current?.abort();setRunning(false);setRows(null);setError('');setHintCount(0);setSolutionOpen(false);setUndoCode(null);setClockRunning(false);setElapsed(0);};
  const pick=(nextLanguage=language,nextLevel=level)=>{
    const key=nextLanguage+':'+nextLevel;
    const candidates=practiceBank.filter(q=>q.level===nextLevel);
    const {question,recycled}=choosePracticeQuestion(candidates,data.seen[key]||[],data.last[key]||active.id);
    resetView();setLanguage(nextLanguage);setLevel(nextLevel);setActiveId(question.id);setSearch('');setFilter('all');
    if(recycled)setData(old=>({...old,seen:{...old.seen,[key]:[]}}));
    setNotice(recycled?'You’ve covered this level. A new shuffled review cycle has started; the previous question was excluded.':'Fresh random question. Previously seen questions stay out until the level is covered.');
  };
  const selectQuestion=q=>{resetView();setActiveId(q.id);setNotice('Topic selected from the explorer. Your previous draft was saved.');};
  const bookmark=()=>setData(old=>({...old,bookmarks:old.bookmarks.includes(entryKey)?old.bookmarks.filter(k=>k!==entryKey):[...old.bookmarks,entryKey]}));
  const run=async()=>{
    if(running)return;
    const abort=new AbortController();controller.current=abort;setRunning(true);setRows(null);setError('');const started=performance.now();
    try{
      const runCode=language==='python'?(await import('../../lib/pythonRunner')).runPythonExercise:runExercise;
      const result=await runCode(code,prepareQuestion(active,language),{signal:abort.signal});if(abort.signal.aborted)return;
      const passed=result.length===active.tests.length&&result.every(row=>row.passed);
      setRows(result);
      const attempt={id:Date.now()+'-'+Math.random().toString(16).slice(2),questionId:active.id,title:active.title,language,level,passed,passedCases:result.filter(r=>r.passed).length,totalCases:result.length,date:new Date().toISOString(),runtimeMs:Math.round(performance.now()-started),hintsUsed:hintCount,solutionViewed:solutionOpen};
      setData(old=>({...old,attempts:[attempt,...old.attempts].slice(0,200),solved:passed?{...old.solved,[entryKey]:attempt.date}:old.solved}));
      if(passed)setClockRunning(false);
    }catch(e){if(!abort.signal.aborted)setError(e.message);}
    finally{if(!abort.signal.aborted)setRunning(false);}
  };
  const exportProgress=()=>{const payload={app:'Placement Twin',version:9,exportedAt:new Date().toISOString(),...data};const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='placement-twin-practice-progress.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  const displayedTask=language==='python'?active.task.replaceAll('null','None').replaceAll('object','dictionary').replaceAll('true','True').replaceAll('false','False'):active.task;
  const explanation=language==='python'?(pythonNotes[active.id]||active.concept):active.concept;
  const steps=language==='python'?(pythonSteps[active.id]||active.steps):active.steps;
  return <div className="practice-root">
    <header className="practice-header neu-float"><div><span className="eyebrow">YOUR CODING WORKSPACE</span><h2>Practice. Understand. Improve.</h2><p>Start with Hello, world! Learn step by step, then build up to coding challenges.</p></div><button className="btn-soft" onClick={exportProgress}><Download size={14}/>Export challenge progress</button></header>
    <nav className="practice-view-tabs" aria-label="Coding workspace views">{[['foundations',BookOpen,'Learn from zero'],['practice',Code2,'Coding challenges'],['lessons',Code2,'JavaScript deep dives'],['progress',BarChart3,'Challenge progress']].map(([id,Icon,label])=><button key={id} className={view===id?'active':''} aria-current={view===id?'page':undefined} onClick={()=>{controller.current?.abort();setRunning(false);setView(id);setClockRunning(false);}}><Icon size={16}/>{label}</button>)}</nav>
    {saveError&&<p role="status" className="practice-notice">{saveError}</p>}
    {view==='foundations'?<FoundationAcademy userData={userData} onContinue={()=>setView('practice')}/>:view==='lessons'?<><p className="practice-notice">The guided JavaScript course has 18 lessons with explanations and knowledge checks. Start with Learn from zero if functions or loops are new to you.</p><GuidedLessons userData={userData}/></>:view==='progress'?<section className="practice-progress neu-float"><div className="practice-section-head"><h3>Your actual practice history</h3><span>{data.attempts.length} saved test runs</span></div><div className="practice-metrics"><span><strong>{Object.keys(data.solved).length}</strong> language/problem combinations solved</span><span><strong>{data.bookmarks.length}</strong> bookmarked</span><span><strong>{data.attempts.filter(a=>a.passed).length}</strong> successful runs</span></div><div className="mastery-table">{practiceLanguages.map(lang=><div key={lang.id}><h4>{lang.label}</h4>{practiceLevels.map(lvl=>{const questions=practiceBank.filter(q=>q.level===lvl),done=questions.filter(q=>data.solved[lang.id+':'+q.id]).length;return <div className="mastery-row" key={lvl}><span>{lvl}</span><progress max={questions.length} value={done}/><span>{done}/{questions.length}</span></div>;})}</div>)}</div>{data.attempts.length?<div className="attempt-list">{data.attempts.slice(0,30).map(a=><button className="attempt-row" key={a.id} onClick={()=>{const q=practiceBank.find(q=>q.id===a.questionId);resetView();setLanguage(a.language);setLevel(a.level);setActiveId(q.id);setView('practice');}}><CheckCircle2 size={16} className={a.passed?'text-moss':'text-muted'}/><span><strong>{a.title}</strong><small>{a.language} · {a.level} · {new Date(a.date).toLocaleString()}</small></span><span>{a.passedCases}/{a.totalCases} checks <ArrowRight size={13}/></span></button>)}</div>:<p>No test runs yet. Your results will appear here after you run code.</p>}</section>:
    <>
      <section className="practice-filters neu-float"><label>Practice language<select aria-label="Practice language" value={language} onChange={e=>pick(e.target.value,level)}>{practiceLanguages.map(l=><option key={l.id} value={l.id}>{l.label}</option>)}</select></label><label>Difficulty<select aria-label="Practice difficulty" value={level} onChange={e=>pick(language,e.target.value)}>{practiceLevels.map(l=><option key={l} value={l}>{l[0].toUpperCase()+l.slice(1)}</option>)}</select></label><button className="btn-brass" onClick={()=>pick()}><Shuffle size={15}/>New random question</button><span className="practice-counter">{solved}/30 solved in {language==='python'?'Python':'JavaScript'}<small>{pool.length-(data.seen[historyKey]||[]).filter(id=>pool.some(q=>q.id===id)).length} unseen at this level</small></span></section>
      <p className="practice-notice" role="status">{notice}</p>
      <div className="ide-workbench">
        <aside className="ide-explorer neu-float"><div className="ide-explorer-head"><img src={photos.codingCard} alt="" className="ide-explorer-art"/><div className="ide-explorer-veil"/><div className="ide-explorer-head-text"><h2>Question explorer</h2><span>{visible.length} topics · {level}</span></div></div><div className="explorer-filters"><label className="practice-search"><Search size={14}/><input aria-label="Search practice questions" placeholder="Find a topic…" value={search} onChange={e=>setSearch(e.target.value)}/></label><select aria-label="Filter question list" value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All topics</option><option value="unsolved">Unsolved</option><option value="bookmarked">Bookmarked</option></select></div><div className="ide-explorer-list">{visible.map((q,i)=><button key={q.id} aria-current={active.id===q.id?'true':undefined} className={`ide-explorer-item ${active.id===q.id?'ide-explorer-item--active neu-pill':''}`} onClick={()=>selectQuestion(q)}><span className="ide-explorer-order">{String(i+1).padStart(2,'0')}</span><span className="ide-explorer-title">{q.title}</span>{data.solved[language+':'+q.id]?<CheckCircle2 size={15} className="text-moss"/>:data.bookmarks.includes(language+':'+q.id)?<Bookmark size={14}/>:null}</button>)}{!visible.length&&<p className="explorer-empty">No matching questions. Change your search or filter.</p>}</div></aside>
        <div className="ide-main-col">
          <section className="ide-problem-strip neu-float"><div className="ide-problem-top"><div><span className="eyebrow">{level} · {language}</span><h3>{active.title}</h3></div><button className="btn-soft btn-sm" aria-pressed={currentBookmarked} onClick={bookmark}><Bookmark size={14}/>{currentBookmarked?'Bookmarked':'Bookmark'}</button></div><p className="ide-problem-desc">{displayedTask}</p><div className="practice-timer"><Clock size={14}/><span>{formatTime(elapsed)}</span><button onClick={()=>setClockRunning(v=>!v)}>{clockRunning?<Pause size={12}/>:<Play size={12}/>} {clockRunning?'Pause':'Start'} practice timer</button><small>No time limit or penalty</small></div>
          <details className="practice-explanation" open><summary><BookOpen size={15}/>Understand the concept</summary><p>{explanation}</p>{language==='javascript'&&active.example&&<pre><code>{active.example}</code></pre>}<p className="language-note">{language==='python'?'Use a def function, indentation, True/False and None. Tests pass arguments directly; do not use input().':'Return the result from the named function. Tests pass arguments directly; console.log is not a return value.'}</p></details>
          <details className="practice-examples"><summary>Examples & test cases ({active.tests.length})</summary><div className="practice-test-table">{active.tests.map((test,i)=><div key={i}><strong>{test.label}</strong><code>Input arguments: {JSON.stringify(test.args)}</code><code>Expected: {JSON.stringify(test.expected)}</code></div>)}</div><small>Examples use JSON notation: null → Python None, true → True, false → False.</small></details></section>
          <section className="ide-editor-block neu-float"><div className="editor-top-deck"><label className="env-pill-tag" htmlFor="practice-code"><Code2 size={15}/>{language==='python'?'Python · browser learning runtime':'JavaScript · browser worker'}</label><div className="editor-control-btns">{undoCode!==null&&<button className="btn-soft btn-sm" onClick={()=>{setCode(undoCode);setUndoCode(null);}}>Undo reset</button>}<button className="btn-soft btn-sm" onClick={()=>{setUndoCode(code);setCode(starterFor(active,language));setRows(null);}}><RotateCcw size={13}/>Reset code</button><button className="btn-brass btn-sm" onClick={run} disabled={running}><Play size={13}/>{running?'Running…':'Run tests'}</button></div></div><div className="code-field-viewport neu-inset"><textarea id="practice-code" aria-label="Practice code editor" className="code-editor-textarea" value={code} onChange={e=>{setCode(e.target.value);setRows(null);setError('');}} spellCheck={false} onKeyDown={e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();run();}if(e.key==='Tab'){e.preventDefault();const target=e.currentTarget,start=target.selectionStart,end=target.selectionEnd;setCode(code.slice(0,start)+'    '+code.slice(end));requestAnimationFrame(()=>{target.selectionStart=target.selectionEnd=start+4;});}}}/></div><div className="editor-footnote"><span>Draft saved on this browser · Ctrl/Cmd + Enter to run</span>{language==='python'&&<span>Python 3 syntax subset; standard library support varies.</span>}</div><div className="practice-results" aria-live="polite">{running&&<p>Running real test cases…</p>}{error&&<p className="practice-error">{error}</p>}{rows&&<><h4>{rows.filter(r=>r.passed).length}/{rows.length} checks passed</h4>{rows.map((row,i)=><div key={i} className={row.passed?'case-passed':'case-failed'}><span>{row.passed?'✓':'×'} {row.label}</span><code>Returned output: {row.actual}; expected: {row.expected}</code>{row.detail&&<small>{row.detail}</small>}</div>)}{rows.every(r=>r.passed)&&<p className="text-moss">Solved. Your progress has been saved — try a fresh question when you’re ready.</p>}</>}{!running&&!rows&&!error&&<p className="console-muted">Write your solution, then run the test cases to see exactly what passes.</p>}</div></section>
          <section className="practice-help neu-float"><div className="practice-section-head"><h3>Hints & explanation</h3><button className="btn-soft btn-sm" disabled={hintCount>=steps.length} onClick={()=>setHintCount(h=>h+1)}>Reveal hint {Math.min(hintCount+1,steps.length)}/{steps.length}</button></div>{steps.slice(0,hintCount).map((step,i)=><p className="hint-pod neu-inset" key={i}>{i+1}. {step}</p>)}<details className="worked-solution" open={solutionOpen} onToggle={e=>setSolutionOpen(e.currentTarget.open)}><summary>View worked solution & reasoning</summary><p>{explanation}</p><pre><code>{language==='python'?pythonSolutions[active.id]:javascriptSolutions[active.id]}</code></pre><h4>Why this works</h4><ol>{steps.map(step=><li key={step}>{step}</li>)}</ol><p><strong>Complexity:</strong> {active.complexity}</p><p>Tests check the included inputs. Compare the algorithm with the complexity goal; passing tests does not prove every possible input.</p></details><button className="btn-brass practice-next" onClick={()=>pick()}>Next random question <ArrowRight size={14}/></button></section>
        </div>
      </div>
    </>}
  </div>;
}
