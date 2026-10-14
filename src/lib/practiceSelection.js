// Selection is pure; the UI persists history only after a question is displayed.
export function choosePracticeQuestion(pool, seenIds=[], lastId=null, random=Math.random) {
  if(!pool.length)return {question:null,recycled:false};
  const seen=new Set(seenIds);
  let fresh=pool.filter(q=>!seen.has(q.id)&&q.id!==lastId);
  let recycled=false;
  if(!fresh.length){fresh=pool.filter(q=>q.id!==lastId);recycled=true;}
  if(!fresh.length)fresh=pool;
  return {question:fresh[Math.floor(random()*fresh.length)],recycled};
}
export function readPracticeState(key) {
  try{const value=JSON.parse(localStorage.getItem(key)||'{}');return {seen:{},last:{},drafts:{},solved:{},bookmarks:[],attempts:[],...value};}
  catch{return {seen:{},last:{},drafts:{},solved:{},bookmarks:[],attempts:[]};}
}
