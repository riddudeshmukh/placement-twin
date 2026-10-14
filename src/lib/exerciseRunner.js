// Runs inside an opaque-origin sandbox, in a disposable Worker. No app cookies,
// storage or DOM access; CSP disallows network. The host enforces a deadline.
export async function evaluateExercise(code, lesson) {
  function canonical(value) {
    if(value === undefined) return 'undefined';
    if(Array.isArray(value)) return '['+value.map(canonical).join(',')+']';
    if(value && typeof value==='object') return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonical(value[k])).join(',')+'}';
    return JSON.stringify(value);
  }
  function freeze(value) { if(value && typeof value==='object'){Object.freeze(value);Object.values(value).forEach(freeze);}return value; }
  const fn = new Function('"use strict";\n' + code + '\nreturn typeof '+lesson.functionName+' === "function" ? '+lesson.functionName+' : null;')();
  if(!fn) throw new Error('Define the function '+lesson.functionName+' with the requested name.');
  const rows=[];
  for(const test of lesson.tests) {
    let args=structuredClone(test.args), calls=0;
    let maxCalls=null;
    if(lesson.id==='async') args[0]=Object.hasOwn(args[0],'reject')?Promise.reject(new Error(args[0].reject)):Promise.resolve(args[0].resolve);
    if(lesson.id==='retry') { const spec=args[0];maxCalls=Math.min(spec.failures+1,args[1]);args[0]=async()=>{calls++;if(calls<=spec.failures)throw new Error('Temporary failure');return spec.value;}; }
    if(lesson.forbidMutation || ['immutable','intervals','arrays'].includes(lesson.id)) args.forEach(freeze);
    try {
      const value=await fn(...args);
      const actual=canonical(value),expected=canonical(test.expected);
      rows.push({label:test.label,passed:actual===expected&&(maxCalls===null||calls===maxCalls),actual:actual?.slice(0,1200),expected,detail:maxCalls!==null?`Operation calls: ${calls}; expected: ${maxCalls}`:''});
    } catch(e) { rows.push({label:test.label,passed:false,actual:String(e.message).slice(0,1200),expected:canonical(test.expected)}); }
  }
  return rows;
}
export function runExercise(code, lesson, {signal}={}) {
  const workerCode=`const evaluate = ${evaluateExercise.toString()};\nonmessage=async(e)=>{try{postMessage({type:'result',rows:await evaluate(e.data.code,e.data.lesson)})}catch(err){postMessage({type:'error',message:String(err.message)})}};`;
  return runIsolatedWorker(workerCode,{code,lesson},{signal,timeout:3000});
}
export function runIsolatedWorker(workerCode,payload,{signal,timeout=3000,onOutput}={}) {
  return new Promise((resolve,reject)=>{
    if(signal?.aborted){reject(new Error('Run cancelled.'));return;}
    const frame=document.createElement('iframe');frame.hidden=true;frame.setAttribute('sandbox','allow-scripts');frame.title='Isolated exercise runner';
    let timer,finished=false;
    const finish=(error,rows)=>{if(finished)return;finished=true;clearTimeout(timer);window.removeEventListener('message',onMessage);signal?.removeEventListener('abort',cancel);frame.remove();if(error)reject(new Error(error));else resolve(rows);};
    const cancel=()=>finish('Run cancelled.');
    const onMessage=e=>{if(e.source!==frame.contentWindow)return;if(e.data?.type==='output'&&typeof e.data.text==='string')onOutput?.(e.data.text.slice(0,20000));if(e.data?.type==='result'&&Array.isArray(e.data.rows))finish(null,e.data.rows);if(e.data?.type==='error')finish(e.data.message);};
    window.addEventListener('message',onMessage);signal?.addEventListener('abort',cancel,{once:true});
    const safe=value=>JSON.stringify(value).replace(/</g,'\\u003c');
    frame.srcdoc=`<!doctype html><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' blob:; worker-src blob:; connect-src 'none';"><script>const u=URL.createObjectURL(new Blob([${safe(workerCode)}],{type:'text/javascript'}));const w=new Worker(u);w.onmessage=e=>{parent.postMessage(e.data,'*');if(e.data.type!=='output'){w.terminate();URL.revokeObjectURL(u)}};w.onerror=()=>parent.postMessage({type:'error',message:'Could not run this code in the isolated worker.'},'*');w.postMessage(${safe(payload)});</script>`;
    timer=setTimeout(()=>finish('Stopped after '+(timeout/1000)+' seconds. Check for an infinite loop or an unresolved operation.'),timeout);
    document.body.appendChild(frame);
  });
}
