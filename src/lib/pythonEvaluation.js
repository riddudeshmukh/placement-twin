// Pure evaluator, shared by the browser's isolated worker and regression tests.
export async function evaluatePythonExercise(code, lesson, python) {
  function canonical(value) {
    if(value===undefined)return 'undefined';
    if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';
    if(value&&typeof value==='object')return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonical(value[k])).join(',')+'}';
    return JSON.stringify(value);
  }
  python.configure({
    __future__:python.python3, output:()=>{}, execLimit:2500, yieldLimit:50,
    inputfun:()=>{throw new Error('Use the function arguments instead of input().');},
    read:path=>{if(!python.builtinFiles?.files[path])throw new Error('Module unavailable in the browser runtime: '+path);return python.builtinFiles.files[path];},
  });
  const module=await python.misceval.asyncToPromise(()=>python.importMainWithBody('<practice>',false,code,true));
  const fn=module.$d[lesson.functionName];
  if(!fn)throw new Error('Define '+lesson.functionName+' using the exact function name shown in the starter.');
  const rows=[];
  for(const test of lesson.tests){
    const original=JSON.parse(JSON.stringify(test.args));
    const args=original.map(arg=>python.ffi.remapToPy(arg));
    try{
      const output=await python.misceval.asyncToPromise(()=>python.misceval.callsimOrSuspendArray(fn,args));
      const actual=canonical(python.ffi.remapToJs(output));
      const mutated=lesson.forbidMutation && canonical(args.map(arg=>python.ffi.remapToJs(arg)))!==canonical(original);
      rows.push({label:test.label,passed:actual===canonical(test.expected)&&!mutated,actual:actual?.slice(0,1200),expected:canonical(test.expected),detail:mutated?'Input was modified. This exercise requires a new result.':''});
    }catch(error){rows.push({label:test.label,passed:false,actual:String(error).slice(0,1200),expected:canonical(test.expected)});}
  }
  return rows;
}
