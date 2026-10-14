import { runIsolatedWorker } from "./exerciseRunner.js";

export function evaluateJavaScriptProgram(code, expected, onOutput) {
  const lines = [];
  const console = {
    log: (...args) => {
      if (lines.length >= 200)
        throw new Error("Output limit reached. Check your loop.");
      lines.push(
        args
          .map((v) =>
            typeof v === "string" ? v : (JSON.stringify(v) ?? String(v)),
          )
          .join(" "),
      );
      if (lines.join("\n").length > 20000)
        throw new Error("Output limit reached.");
      onOutput?.(lines.join("\n"));
    },
  };
  let error = "";
  try {
    new Function("console", '"use strict";\n' + code)(console);
  } catch (e) {
    error = String(e.message || e);
  }
  const actual = lines.join("\n").slice(0, 20000);
  return [
    {
      label: "Program output",
      passed: !error && actual.trimEnd() === expected.trimEnd(),
      error,
      actual,
      expected,
    },
  ];
}
export function runJavaScriptProgram(
  code,
  expected,
  { signal, onOutput } = {},
) {
  const worker = `const evaluate=${evaluateJavaScriptProgram.toString()};onmessage=e=>{try{postMessage({type:'result',rows:evaluate(e.data.code,e.data.expected,text=>postMessage({type:"output",text}))})}catch(err){postMessage({type:'error',message:String(err.message)})}};`;
  return runIsolatedWorker(
    worker,
    { code, expected },
    { signal, timeout: 3000, onOutput },
  );
}
export async function evaluatePythonProgram(code, expected, python, onOutput) {
  let output = "";
  python.configure({
    __future__: python.python3,
    execLimit: 2500,
    yieldLimit: 50,
    output: (value) => {
      output += value;
      onOutput?.(output.slice(0, 20000));
      if (output.length > 20000)
        throw new Error("Output limit reached. Check your loop.");
    },
    inputfun: () => {
      throw new Error(
        "These lessons use values in the code; input() is not enabled.",
      );
    },
    read: (path) => {
      if (!python.builtinFiles?.files[path])
        throw new Error("Module not available: " + path);
      return python.builtinFiles.files[path];
    },
  });
  let error = "";
  try {
    await python.misceval.asyncToPromise(() =>
      python.importMainWithBody("<lesson>", false, code, true),
    );
  } catch (e) {
    error = String(e);
  }
  return [
    {
      label: "Program output",
      passed: !error && output.trimEnd() === expected.trimEnd(),
      error,
      actual: output.trimEnd(),
      expected,
    },
  ];
}
export function checkHTML(code, checks) {
  const doc = new DOMParser().parseFromString(code, "text/html");
  return checks.map((check) => {
    const nodes = [...doc.querySelectorAll(check.selector)];
    const node = nodes[0];
    const actual =
      check.count !== undefined
        ? String(nodes.length)
        : check.attribute
          ? (node?.getAttribute(check.attribute) ?? "(attribute missing)")
          : (node?.textContent.trim() ?? "(element missing)");
    const expected =
      check.count !== undefined
        ? String(check.count)
        : check.attribute
          ? check.value
          : (check.text ?? "nonempty text");
    const passed =
      check.count !== undefined
        ? nodes.length === check.count
        : !!node &&
          (!check.attribute ||
            node.getAttribute(check.attribute) === check.value) &&
          (check.text === undefined ||
            node.textContent.trim() === check.text) &&
          (!check.nonempty || !!node.textContent.trim());
    return { label: check.label, passed, actual, expected };
  });
}
export function sanitizedHTML(code) {
  const doc = new DOMParser().parseFromString(code, "text/html");
  doc
    .querySelectorAll("script,iframe,object,embed,base,meta,link")
    .forEach((n) => n.remove());
  doc.querySelectorAll("*").forEach((n) => {
    for (const attr of Array.from(n.attributes))
      if (
        /^on/i.test(attr.name) ||
        ["href", "action", "formaction", "srcdoc"].includes(attr.name)
      )
        n.removeAttribute(attr.name);
  });
  return doc.body.innerHTML;
}
export function makePreview(code, language, fixture = "", studyPhoto = "") {
  let content = language === "html" ? sanitizedHTML(code) : fixture;
  const assetURL = new URL(studyPhoto, window.location.href).href;
  content = content
    .replace(/src=["']study(?:-small)?\.jpg["']/g, `src="${assetURL}"`)
    .replace(/srcset=["'][^"']*study[^"']*["']/g, "");
  const css = language === "css" ? code.replace(/</g, "\\3c ") : "";
  return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data: ${new URL(studyPhoto, window.location.href).origin}; form-action 'none';"><style>body{font-family:system-ui,sans-serif;padding:16px;margin:0;overflow-wrap:anywhere;color:#172033;background:white;}button,input{font:inherit;max-width:100%;}img{max-width:100%;}${css}</style></head><body>${content}</body></html>`;
}
function runCSSAtWidth(code, fixture, checks, width, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error("Run cancelled."));
      return;
    }
    const frame = document.createElement("iframe");
    frame.title = "Isolated CSS checks";
    frame.setAttribute("sandbox", "allow-scripts");
    frame.style.cssText = `position:fixed;left:-10000px;top:0;width:${width}px;height:600px;opacity:0;pointer-events:none;border:0;`;
    let done = false;
    let timer;
    const finish = (error, rows) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      window.removeEventListener("message", receive);
      signal?.removeEventListener("abort", cancel);
      frame.remove();
      if (error) reject(new Error(error));
      else resolve(rows);
    };
    const cancel = () => finish("Run cancelled.");
    const receive = (e) => {
      if (e.source === frame.contentWindow && e.data?.type === "css-result")
        finish(null, e.data.rows);
    };
    window.addEventListener("message", receive);
    signal?.addEventListener("abort", cancel, { once: true });
    const safe = (x) => JSON.stringify(x).replace(/</g, "\\u003c");
    frame.srcdoc = `<!doctype html><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';"><body><script>document.body.innerHTML=${safe(fixture)};const style=document.createElement('style');style.textContent=${safe(code)};document.head.appendChild(style);setTimeout(function inspect(){if(innerWidth!==${width}){setTimeout(inspect,16);return;}const rows=${safe(checks)}.map(c=>{const node=document.querySelector(c.selector);if(c.action==='focus'&&node)node.focus();const actual=node?getComputedStyle(node).getPropertyValue(c.property).trim():'(missing element)';const tracks=actual.split(/\\s+/).map(parseFloat);const passed=c.value==='three-equal'?tracks.length===3&&tracks.every(x=>Number.isFinite(x)&&x>0&&Math.abs(x-tracks[0])<1):actual===c.value;return {label:c.label,passed,actual,expected:c.value};});parent.postMessage({type:'css-result',rows},'*');},30);</script>`;
    timer = setTimeout(
      () =>
        finish("CSS checks timed out. Simplify the stylesheet and try again."),
      3000,
    );
    document.body.appendChild(frame);
  });
}
export async function checkCSS(code, lesson, { signal } = {}) {
  const rows = [];
  for (const width of new Set(lesson.checks.map((c) => c.width || 800)))
    rows.push(
      ...(await runCSSAtWidth(
        code,
        lesson.fixture,
        lesson.checks.filter((c) => (c.width || 800) === width),
        width,
        signal,
      )),
    );
  return rows;
}
