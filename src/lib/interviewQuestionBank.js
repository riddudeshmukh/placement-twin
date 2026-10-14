import { originalInterviewQuestions } from '../data/mockData.js';
import { extractSkills } from './resumeAnalyzer.js';
const prefix = 'placementtwin_questions_v8_';
export function loadUsedQuestionIds(key) { try { return new Set(JSON.parse(localStorage.getItem(prefix + key) || '[]')); } catch { return new Set(); } }
export function saveUsedQuestionIds(key, ids) { try { localStorage.setItem(prefix + key, JSON.stringify([...ids])); } catch { /* session still works */ } }
export function resetUsedQuestionIds(key) { try { localStorage.removeItem(prefix + key); } catch { /* optional storage */ } }
export function markQuestionAsked(key, id) { const used = loadUsedQuestionIds(key); used.add(id); saveUsedQuestionIds(key, used); }
export function extractSkillsFromJobDescription(text) { return extractSkills(text || '').map(s => s.name); }
export function shuffle(items) { const a = [...items]; for(let i=a.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
const concepts = {
  JavaScript: ['variable scope and closures', 'promises and error handling', 'array transformations', 'object references and mutation', 'the event loop', 'modules and dependency boundaries'],
  TypeScript: ['union types and narrowing', 'interfaces and structural typing', 'generics', 'null safety', 'runtime validation versus static types', 'type-safe API responses'],
  React: ['state updates', 'component props', 'effect cleanup', 'stable list keys', 'controlled form inputs', 'rendering performance'],
  Python: ['mutable and immutable values', 'iterators and generators', 'exception handling', 'dictionary lookups', 'context managers', 'async I/O'],
  Java: ['object equality and hashCode', 'collections', 'exception handling', 'interfaces', 'thread safety', 'memory management'],
  'C++': ['value and reference semantics', 'RAII', 'smart pointers', 'iterators', 'object lifetime', 'thread safety'],
  'C#': ['value and reference types', 'LINQ', 'async and await', 'interfaces', 'exception handling', 'resource disposal'],
  'Node.js': ['asynchronous I/O', 'request validation', 'stream backpressure', 'error propagation', 'event loop blocking', 'dependency boundaries'],
  SQL: ['joins', 'indexes', 'transactions', 'query plans', 'constraints', 'pagination'],
  PostgreSQL: ['joins', 'indexes', 'transactions', 'query plans', 'constraints', 'pagination'],
  MySQL: ['joins', 'indexes', 'transactions', 'query plans', 'constraints', 'pagination'],
  MongoDB: ['document modeling', 'indexes', 'aggregation', 'atomic updates', 'schema validation', 'pagination'],
  HTML: ['semantic elements', 'form labels', 'keyboard navigation', 'document structure', 'image alternative text', 'native form validation'],
  CSS: ['the box model', 'flexbox', 'grid layout', 'responsive breakpoints', 'specificity', 'reduced-motion preferences'],
  Git: ['branches', 'merge conflicts', 'atomic commits', 'reverting changes', 'rebasing', 'code review'],
  Docker: ['images and containers', 'image layers', 'volumes', 'container networking', 'build caching', 'non-root execution'],
  'REST API': ['HTTP methods', 'status codes', 'idempotency', 'authentication', 'pagination', 'versioning'],
  Redis: ['cache expiry', 'cache invalidation', 'atomic operations', 'eviction policies', 'persistence', 'rate limiting'],
  'Data Structures': ['arrays', 'hash maps', 'stacks', 'queues', 'trees', 'graphs'],
  Algorithms: ['binary search', 'two pointers', 'sliding windows', 'sorting', 'dynamic programming', 'graph traversal'],
};
const angles = {
  beginner: [
    c => `Explain ${c} in simple language. Give a small example, walk through its output, and name one common mistake.`,
    c => `How would you use ${c} in a small feature? Describe the inputs, the steps, and one test you would write.`,
    c => `Teach ${c} to someone encountering it for the first time. What problem does it solve, and when would you avoid it?`,
    c => `Create a tiny input-and-output example for ${c}. Trace each step and explain what changes if the input is empty.`,
    c => `What is a common beginner misunderstanding about ${c}? Correct it using an example and explain how you would check the result.`,
  ],
  intermediate: [
    c => `A feature using ${c} works for normal input but fails at an edge case. Construct a concrete failing example, diagnose the cause, and explain a fix and regression test.`,
    c => `Compare two approaches to ${c}. Explain their trade-offs, choose one for a feature, and describe how you would validate the decision.`,
    c => `Walk through implementing ${c} in a maintainable application. Include error handling, boundaries between components, and a test strategy.`,
    c => `A teammate proposes a shortcut involving ${c}. Describe a plausible shortcut, an input that exposes its weakness, and a safer approach.`,
    c => `Plan a code review for a feature using ${c}. Which invariants, edge cases and tests would you check before accepting the change?`,
  ],
  advanced: [
    c => `A production feature involving ${c} degrades under load. State your assumptions, build a diagnostic plan, and explain a measured fix, trade-offs, and rollback criteria.`,
    c => `Design a safe migration of an existing implementation of ${c}. Discuss compatibility, failure modes, observability, and how you would prove the new approach works.`,
    c => `Critique a design centered on ${c}. Identify a hidden failure mode, propose an alternative, and explain the operating conditions under which each approach wins.`,
    c => `Define a performance experiment for ${c}. Choose workloads, measurements and controls, then explain what result would make you reject your design.`,
    c => `Describe an incident involving ${c}, clearly labeling it hypothetical unless it really happened. Walk through diagnosis, containment, recovery and prevention.`,
  ],
};
function excerpt(text, skill) { const line = (text || '').split(/\n|(?<=[.!?])\s+/).find(l=>l.toLowerCase().includes(skill.toLowerCase())); return line ? line.trim().slice(0, 280) : ''; }
export function buildInterviewSession({source='resume', resumeSkillNames=[], resumeText='', jdText='', candidateKey='guest', difficulty='beginner', technicalCount=4, hrCount=1}) {
  if (!angles[difficulty]) throw new Error('Choose a supported difficulty.');
  const resume = resumeText.trim() ? extractSkillsFromJobDescription(resumeText) : resumeSkillNames;
  const jd = extractSkillsFromJobDescription(jdText);
  const target = [...new Set(source==='combined' ? [...resume,...jd] : source==='jd' ? jd : source==='resume' ? resume : Object.keys(concepts))];
  if (!target.length) return {questions:[], matchedSkills:[], error:'No supported skills found. Add specific technologies to your resume or job description; unrelated questions will not be substituted.'};
  const used = loadUsedQuestionIds(candidateKey);
  let pool=[];
  target.forEach(skill=> {
    const inResume = resume.includes(skill), inJd = jd.includes(skill);
    const origin = source==='general' ? 'General practice' : inResume && inJd ? 'Resume + JD match' : inJd ? 'JD requirement · experience not assumed' : 'Resume';
    const evidence = source==='general' ? '' : excerpt(inJd ? jdText : resumeText, skill);
    const topics = concepts[skill] || [`the core purpose of ${skill}`, `error handling in ${skill}`, `testing a ${skill} feature`, `maintaining a ${skill} application`];
    topics.forEach((topic,t)=> angles[difficulty].forEach((make,a)=>pool.push({
      id:`v8:${skill}:${difficulty}:${t}:${a}`, question:`In ${skill}: ${make(topic)}${inResume && source!=='general' ? ' If you have used this in a resume project, connect your answer to that actual work; otherwise use a clearly hypothetical example.' : ''}`,
      kind:'technical', domain:skill, difficulty, skills:[skill], origin, evidence,
      idealKeywords:[...new Set([...topic.split(/\s+/).filter(w=>w.length>4), 'example', 'test'])],
      sampleTip:'State your assumptions, explain the mechanism, walk through a specific example, and check an edge case. Do not invent experience or results.',
    })));
  });
  // Retain specialist authored questions only where both skill and level match.
  pool.push(...originalInterviewQuestions.technical.filter(q=>q.difficulty.toLowerCase()===difficulty && q.skills?.some(s=>target.includes(s))).map(q=>({...q,kind:'technical', origin:'Matched topic bank', evidence:'', difficulty})));
  const fresh = shuffle(pool.filter(q=>!used.has(q.id)));
  const selected=[]; const domains=new Set();
  // Cover distinct relevant skills before taking a second prompt from one skill.
  for(const q of fresh) if(selected.length<technicalCount && !domains.has(q.domain)) {selected.push(q);domains.add(q.domain);}
  for(const q of fresh) if(selected.length<technicalCount && !selected.some(s=>s.id===q.id)) selected.push(q);
  const hr = originalInterviewQuestions.hr.map(q=>({...q,id:`v8:${q.id}`,kind:'hr',difficulty,origin:'Behavioral practice', evidence:'',question:`${q.question} Use only a real experience from your resume, coursework, or personal project. If you have no example, explain how you would approach this as a hypothetical situation.`}));
  const freshHr = shuffle(hr.filter(q=>!used.has(q.id))).slice(0,hrCount);
  const questions=shuffle([...selected,...freshHr]);
  return {questions, matchedSkills:source==='general'?null:target, poolRecycled:false, remaining: fresh.length+hr.filter(q=>!used.has(q.id)).length-questions.length, notice:questions.length<technicalCount+hrCount?'Fewer fresh questions remain for this setup. No previously asked questions were reused.':'', error:questions.length?'':'You have covered the available questions for this setup. Change difficulty or explicitly reset question history to review.'};
}
