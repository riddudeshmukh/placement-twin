import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, BookOpen, Check } from 'lucide-react';
import lessons from '../../data/lessonPreview.json';
import { Reveal } from '../common/Reveal';
const stages=[{name:'Beginner',summary:'Understand the basics',detail:'Hello, world! · variables · first pages'},{name:'Intermediate',summary:'Connect the ideas',detail:'Collections · classes · accessible forms'},{name:'Advanced',summary:'Solve deeper problems',detail:'Recursion · memoization · responsive systems'}];
export default function LearningShowcase({onGetStarted}){
 const [level,setLevel]=useState('Beginner');
 const reduced=useReducedMotion();
 const sample=['python','javascript','html','css','java'].map(language=>lessons.find(l=>l.language===language&&l.level===level));
 return <section id="learning" className="pt-learning-showcase">
  <Reveal className="dt-section-kicker"><span className="pill-tag">THE LEARNING PATH</span><h2>Progress is built.<br/>One idea at a time.</h2><p>Start where you are. Build understanding through examples, exercises and your own code.</p></Reveal>
  <div className="pt-progression" aria-label="Three learning levels">
   <motion.div className="pt-progression-line" initial={reduced?false:{scaleX:0}} whileInView={{scaleX:1}} viewport={{once:true}} transition={{duration:reduced?0:1.1}}/>
   {stages.map((stage,i)=><div key={stage.name} className="pt-progression-stage"><span className="pt-step-number">0{i+1}</span><h3>{stage.name}</h3><strong>{stage.summary}</strong><p>{stage.detail}</p></div>)}
  </div>
  <p className="pt-progression-note"><Check size={14}/>These are learning stages, not promised timelines or verified skill ratings. Learn at your own pace.</p>
  <div className="pt-catalog-heading"><div><span className="eyebrow">EXPLORE THE CURRICULUM</span><h3>Find your next challenge.</h3></div><div className="pt-level-tabs" role="group" aria-label="Preview lesson level">{stages.map(s=><button key={s.name} aria-pressed={level===s.name} onClick={()=>setLevel(s.name)}>{s.name}</button>)}</div></div>
  <motion.div key={level} className="pt-lesson-table" initial={reduced?false:{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:reduced?0:.22}}>
   <div className="pt-table-head" aria-hidden="true"><span>Language</span><span>Sample lesson</span><span>Study time</span><span>Level</span></div>
   {sample.map(l=><div className="pt-lesson-row" key={l.id}><span className="pt-language-label"><BookOpen size={15}/>{({python:'Python',javascript:'JavaScript',html:'HTML',css:'CSS',java:'Java'})[l.language]}</span><strong>{l.title}</strong><span>~{l.minutes} min</span><span className="pt-level-badge">{l.level}</span></div>)}
  </motion.div>
  <div className="pt-catalog-foot"><p>96 lessons across five paths. Python and JavaScript run in-browser; HTML/CSS have previews; Java uses guided self-review.</p><button className="btn-brass" onClick={onGetStarted}>Start learning <ArrowUpRight size={16}/></button></div>
 </section>;
}
