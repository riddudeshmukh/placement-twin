import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Bot, FileText, Globe, Video, Code2, ArrowUpRight, Sparkles,
  ChevronDown, X, Check, Timer, Target, Mic, Scan,
} from 'lucide-react';
import { photos } from '../../assets/photoLibrary';
import { Reveal, RevealItem } from '../common/Reveal';
import { Tilt3D } from '../common/Tilt3D';
import { EASE, tapScale } from '../../lib/motion';
import './LandingPage.css';
import LearningShowcase from './LearningShowcase';

const stats = [
  {value:'5',unit:'',label:'Learning paths: Python, JavaScript, HTML, CSS and Java'},
  {value:'30',unit:'',label:'Random practice problems per language'},
  {value:'96',unit:'',label:'Lessons from beginner through advanced'},
  {value:'3',unit:'',label:'Difficulty levels, from beginner to advanced'},
];
const dossiers = [
  {id:'resume',icon:FileText,tone:'text-brass',img:'atsCard',eyebrow:'01 · Resume Engine',title:'Understand the details in your resume',body:'Upload a PDF or DOCX, or paste your text. Review the extracted skills and a transparent text-based resume assessment. The score is a practice heuristic, not an employer ATS result.',stat:{value:'4',suffix:'',label:'text signals reviewed'},checklist:['Recognized skill mentions','Section and line structure','Quantified detail and action verbs','Resume length feedback']},
  {id:'portfolio',icon:Globe,tone:'text-moss',img:'portfolioCard',eyebrow:'02 · Digital Twin',title:'Bring your work into one profile',body:'Keep your experience, projects and links together in a local portfolio workspace. Add your already-published portfolio URL to create a shareable QR code.',stat:{value:'QR',suffix:'',label:'for your real portfolio URL'},checklist:['Editable projects and repository links','Resume-derived profile details for review','Photo and portfolio URL settings','No automatic publishing']},
  {id:'interview',icon:Video,tone:'text-clay',img:'interviewPoster',eyebrow:'03 · Mock Panel',title:'Fresh practice grounded in your sources',body:'Choose your resume, a job description, or both. Select a difficulty and practice randomized prompts with source excerpts, optional voice, and honest keyword-based feedback.',stat:{value:'3',suffix:'',label:'difficulty levels'},checklist:['Resume and JD skill matching','No silent repetition of asked prompts','Text answers with optional camera and voice','Saved feedback and interview history']},
  {id:'drills',icon:Code2,tone:'text-brass',img:'codingCard',eyebrow:'04 · Practice Studio',title:'Learn the idea, then write the code',body:'Start with Hello, world!, addition and variables. Follow five step-by-step learning paths, then move on to challenges. Python and JavaScript run in the browser; HTML and CSS have previews; Java uses guided self-review.',stat:{value:'96',suffix:'',label:'progressive lessons'},checklist:['Five language and web learning paths','Examples, walkthroughs and knowledge checks','Saved drafts, notes and lesson progress','Additional challenges and JavaScript deep dives']},
];
const compareRows = [
 {without:'Unstructured resume text',withT:'Extracted skills and transparent text feedback'},
 {without:'Projects and links in different places',withT:'A local profile with your real portfolio URL and QR'},
 {without:'The same interview prompts each time',withT:'Randomized relevant prompts with browser-saved question history'},
 {without:'A code problem with no explanation',withT:'Concept notes, examples, hints, solutions and actual test results'},
];
const path = [
 {num:'01',title:'Bring your resume',body:'Upload PDF/DOCX or paste text directly.',sub:['Review extracted details','Only use skills you can support']},
 {num:'02',title:'Choose your goal',body:'Add a job description and choose your interview level.',sub:['See source excerpts','JD-only skills are marked as requirements']},
 {num:'03',title:'Practice the conversation',body:'Answer a fresh mix of technical and behavioral prompts.',sub:['Voice and camera are optional','Feedback is a clearly labeled heuristic']},
 {num:'04',title:'Build your coding skills',body:'Choose a language and work through problems at your level.',sub:['Real tests and explanations','Drafts and progress saved in this browser']},
];
const faqs = [
 {q:'Does it invent projects or experience?',a:'No. Source text is used for skill matching, and JD-only requirements are identified separately. Resume extraction is heuristic, so review the extracted details yourself.'},
 {q:'Can I practice in different languages?',a:'Yes. Learn from zero offers Python, JavaScript, HTML, CSS and Java. Python and JavaScript run in the browser; HTML/CSS have previews and checks. Java lessons use self-review and downloadable code, with no compiler connected. Random coding challenges support Python and JavaScript.'},
 {q:'Will I see a different question each time?',a:'New random question draws from unseen problems at the selected language and level. After the pool is covered, an announced review cycle starts without immediately repeating the last problem. Interview prompts require an explicit history reset when their pool is exhausted.'},
 {q:'Where is my progress stored?',a:'Your profile, drafts, bookmarks and practice history are stored in this browser. There is no backend or cross-device sync yet. You can export coding-practice progress. Media streams are not recorded by this app.'},
];

export default function LandingPage({ onGetStarted, onLoginClick }) {
  const [openFaq, setOpenFaq] = useState(0);
  const [menuOpen,setMenuOpen]=useState(false);
  const [scrolled,setScrolled]=useState(false);
  const reduced=useReducedMotion();
  useEffect(()=>{const update=()=>setScrolled(window.scrollY>60);update();window.addEventListener('scroll',update,{passive:true});return()=>window.removeEventListener('scroll',update);},[]);
  useEffect(()=>{const close=e=>{if(e.key==='Escape')setMenuOpen(false);};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close);},[]);

  return (
    <div className="dt-root">
      <header className={`pt-topnav ${scrolled?'is-scrolled':''}`}>
        <a href="#intro" className="pt-wordmark" aria-label="Placement Twin home">PLACEMENT<span>TWIN</span><small>LEARN. PRACTISE. PREPARE.</small></a>
        <nav id="landing-navigation" aria-label="Main navigation" className={menuOpen?'is-open':''}>{[['dossier','Workspace'],['learning','Learning paths'],['path','How it works'],['faq','Questions']].map(([id,name])=><a key={id} href={'#'+id} onClick={()=>setMenuOpen(false)}>{name}</a>)}</nav>
        <div className="pt-nav-actions"><button className="dt-ghost-btn" onClick={()=>{setMenuOpen(false);onLoginClick();}}>Sign In</button><button className="btn-brass pt-nav-start" onClick={onGetStarted}>Get started <ArrowUpRight size={14}/></button><button className="pt-menu-button" aria-label={menuOpen?'Close navigation':'Open navigation'} aria-expanded={menuOpen} aria-controls="landing-navigation" onClick={()=>setMenuOpen(!menuOpen)}>{menuOpen?'×':'☰'}</button></div>
      </header>

      {/* 1. Manifesto intro — oversized type, minimal chrome */}
      <section id="intro" className="dt-intro">
        <img className="pt-hero-image" src={photos.heroPoster} alt="Learners collaborating around laptops" fetchPriority="high"/>
        <div className="pt-hero-shade" aria-hidden="true"/>
        <div className="pt-hero-content">
        <motion.span
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="pill-tag pill-brass"
        >
          <Sparkles size={12} /> YOUR NEXT CHAPTER · ALL LEVELS WELCOME
        </motion.span>

        <h1 className="dt-intro-headline">{['CONFIDENCE','IS BUILT.','START HERE.'].map((line,i)=><span className="pt-hero-line" key={line}><motion.span initial={reduced?false:{y:'105%',opacity:0}} animate={{y:0,opacity:1}} transition={{duration:.7,delay:i*.11,ease:EASE}}>{line}</motion.span></span>)}</h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.16 }}
          className="dt-intro-lead"
        >
          Your resume, portfolio, interview practice and coding exercises in one workspace. Learn the concepts, practice at your level, and see your own progress.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.24 }}
          className="dt-intro-actions"
        >
          <motion.button className="btn-brass" onClick={onGetStarted} {...tapScale} whileHover={{ y: -2 }}>
            Build My Twin <ArrowUpRight size={15} />
          </motion.button>
          <a href="#learning" className="btn-soft">Explore learning paths <ArrowUpRight size={15}/></a>
        </motion.div>

        {/* Stat band — dense numbers instead of icon capsules */}
        <div className="dt-stat-band">
          {stats.map((s) => (
            <div key={s.label} className="dt-stat-cell">
              <span className="dt-stat-value">{s.value}<span className="dt-stat-unit">{s.unit}</span></span>
              <span className="dt-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
        </div>
      </section>
      <div className="pt-slash-divider" aria-hidden="true"/>

      {/* 2. Feature dossiers — detailed alternating rows, own stat + checklist each */}
      <section id="dossier" className="dt-dossier-section">
        <Reveal className="dt-section-kicker">
          <span className="pill-tag pill-moss">Modules</span>
          <h2>Four ways to move forward.</h2>
        </Reveal>

        {dossiers.map(({ id, icon: Icon, tone, img, eyebrow, title, body, stat, checklist }, i) => (
          <Reveal key={id} as="div" className={`dt-dossier-row ${i % 2 ? 'dt-dossier-row--rev' : ''}`}>
            <div className="dt-dossier-copy">
              <span className="dt-dossier-eyebrow"><Icon size={14} className={tone} /> {eyebrow}</span>
              <h3>{title}</h3>
              <p>{body}</p>
              <ul className="dt-checklist">
                {checklist.map((c) => (
                  <li key={c}><Check size={14} className="text-moss" /> {c}</li>
                ))}
              </ul>
            </div>

            <Tilt3D rotationFactor={5} className="dt-dossier-visual neu-float glow-ring">
              <img src={photos[img]} alt="" loading="lazy" />
              <div className="dt-dossier-stat neu-float">
                <span className="dt-dossier-stat-value">{stat.value}<span>{stat.suffix}</span></span>
                <span className="dt-dossier-stat-label">{stat.label}</span>
              </div>
            </Tilt3D>
          </Reveal>
        ))}
      </section>

      {/* 3. Comparison table — with vs without, not a feature-card repeat */}
      <section id="compare" className="dt-compare-section">
        <Reveal className="dt-section-kicker">
          <span className="pill-tag pill-brass">Comparison</span>
          <h2>What changes with a Twin</h2>
        </Reveal>

        <Reveal as="div" className="dt-compare-table neu-float">
          <div className="dt-compare-head">
            <span><X size={14} className="text-terracotta" /> Without PlacementTwin</span>
            <span><Check size={14} className="text-moss" /> With PlacementTwin</span>
          </div>
          {compareRows.map((r, i) => (
            <div key={i} className="dt-compare-row">
              <span className="dt-compare-cell dt-compare-cell--without">{r.without}</span>
              <span className="dt-compare-cell dt-compare-cell--with">{r.withT}</span>
            </div>
          ))}
        </Reveal>
      </section>

      <LearningShowcase onGetStarted={onGetStarted}/>

      {/* 4. Vertical process timeline — expanded detail per step */}
      <section id="path" className="dt-path-section">
        <Reveal className="dt-section-kicker">
          <span className="pill-tag pill-clay">Process</span>
          <h2>A clear path through your preparation</h2>
        </Reveal>

        <div className="dt-timeline">
          {path.map((p, i) => (
            <RevealItem key={p.num} className="dt-timeline-row" as="div">
              <div className="dt-timeline-rail">
                <span className="dt-timeline-dot neu-pill">{p.num}</span>
                {i < path.length - 1 && <span className="dt-timeline-line" />}
              </div>
              <div className="dt-timeline-body neu-float">
                <h4>{p.title}</h4>
                <p>{p.body}</p>
                <ul className="dt-timeline-sub">
                  {p.sub.map((s) => <li key={s}><Target size={12} className="text-brass" /> {s}</li>)}
                </ul>
              </div>
            </RevealItem>
          ))}
        </div>
      </section>

      {/* 5. FAQ accordion */}
      <section id="faq" className="dt-faq-section">
        <Reveal className="dt-section-kicker">
          <span className="pill-tag pill-moss">FAQ</span>
          <h2>Before you upload</h2>
        </Reveal>

        <Reveal as="div" className="dt-faq-list">
          {faqs.map((f, i) => {
            const open = openFaq === i;
            return (
              <div key={f.q} className={`dt-faq-item neu-float ${open ? 'dt-faq-item--open' : ''}`}>
                <button className="dt-faq-q" aria-expanded={open} onClick={() => setOpenFaq(open ? -1 : i)}>
                  <span>{f.q}</span>
                  <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={16} />
                  </motion.span>
                </button>
                {open && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="dt-faq-a"
                  >
                    {f.a}
                  </motion.p>
                )}
              </div>
            );
          })}
        </Reveal>
      </section>

      {/* 6. Closing CTA */}
      <Reveal as="section" className="dt-final-cta neu-float glow-ring">
        <Scan size={28} className="text-brass" />
        <h2>Start with what you know. Build from there.</h2>
        <p>Resume review, interview practice and coding lessons — all in your browser.</p>
        <motion.button className="btn-brass" onClick={onGetStarted} {...tapScale} whileHover={{ y: -2 }}>
          Build My Twin <ArrowUpRight size={15} />
        </motion.button>
      </Reveal>

      <footer className="dt-foot">
        <div className="dt-foot-col">
          <span className="dt-foot-brand"><Bot size={16} className="text-brass" /> PlacementTwin</span>
          <p>A focused workspace for coding knowledge and placement preparation.</p>
        </div>
        <div className="dt-foot-col">
          <span className="dt-foot-head">Modules</span>
          <a href="#dossier"><FileText size={13} /> Resume Engine</a>
          <a href="#dossier"><Mic size={13} /> Mock Panel</a>
          <a href="#dossier"><Timer size={13} /> Drill Engine</a>
        </div>
        <div className="dt-foot-col">
          <span className="pill-tag pill-moss">Local practice workspace</span>
        </div>
      </footer>
    </div>
  );
}
