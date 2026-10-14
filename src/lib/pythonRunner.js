import { runIsolatedWorker } from "./exerciseRunner.js";
import pythonRuntimeUrl from "skulpt/dist/skulpt.min.js?url";
import pythonLibraryUrl from "skulpt/dist/skulpt-stdlib.js?url";
import { evaluatePythonProgram } from "./foundationRunner.js";
import { evaluatePythonExercise } from "./pythonEvaluation.js";
let runtimePromise;
function loadRuntime() {
  if (!runtimePromise)
    runtimePromise = Promise.all(
      [pythonRuntimeUrl, pythonLibraryUrl].map(async (url) => {
        const response = await fetch(url);
        if (!response.ok)
          throw new Error(
            "Python runtime could not load. Refresh the page and try again.",
          );
        return response.text();
      }),
    ).catch((error) => {
      runtimePromise = null;
      throw error;
    });
  return runtimePromise;
}
export async function runPythonExercise(code, lesson, { signal } = {}) {
  const sources = await loadRuntime();
  if (signal?.aborted) throw new Error("Run cancelled.");
  const workerCode =
    sources.join("\n") +
    "\nconst evaluate = " +
    evaluatePythonExercise.toString() +
    `;
  onmessage=async(e)=>{try{postMessage({type:'result',rows:await evaluate(e.data.code,e.data.lesson,Sk)})}catch(error){postMessage({type:'error',message:String(error)})}};`;
  return runIsolatedWorker(
    workerCode,
    { code, lesson },
    { signal, timeout: 6000 },
  );
}

export async function runPythonProgram(
  code,
  expected,
  { signal, onOutput } = {},
) {
  const sources = await loadRuntime();
  if (signal?.aborted) throw new Error("Run cancelled.");
  const worker =
    sources.join("\n") +
    "\nconst evaluate=" +
    evaluatePythonProgram.toString() +
    `;onmessage=async(e)=>{try{postMessage({type:'result',rows:await evaluate(e.data.code,e.data.expected,Sk,text=>postMessage({type:"output",text}))})}catch(err){postMessage({type:'error',message:String(err)})}};`;
  return runIsolatedWorker(
    worker,
    { code, expected },
    { signal, timeout: 6000, onOutput },
  );
}
