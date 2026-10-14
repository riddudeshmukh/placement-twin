// =============================================================================
// Real file → plain text extraction. No fabricated content: if a format can't
// be parsed, the caller gets an explicit error instead of placeholder text.
// =============================================================================

import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

async function extractPdfText(arrayBuffer) {
  let pdf;
  try {
    pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  } catch (err) {
    // Known pdf.js worker bug on browsers missing very new TypedArray
    // methods (e.g. Uint8Array.prototype.toHex) surfaces as a cryptic
    // "toHex is not a function" error. Give a real, actionable message
    // instead of the raw internal exception.
    if (/toHex|toBase64|fromHex|fromBase64/i.test(err?.message || '')) {
      throw new Error('Your browser is missing a feature this PDF reader needs. Please update Chrome/Edge to the latest version, or paste your resume text directly instead.');
    }
    throw err;
  }
  let fullText = '';
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => item.str).join(' ');
    fullText += `${pageText}\n`;
  }
  return fullText;
}

async function extractDocxText(arrayBuffer) {
  const mammoth = await import('mammoth/mammoth.browser');
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value || '';
}

/** Extract real text from an uploaded resume file. Supports .pdf, .docx, and
 *  plain text (.txt/.md). Throws a descriptive error for anything else so the
 *  UI can surface a real failure instead of silently faking a result. */
export async function extractTextFromFile(file) {
  const name = file.name.toLowerCase();

  if (name.endsWith('.pdf')) {
    const buffer = await file.arrayBuffer();
    const text = await extractPdfText(buffer);
    if (!text.trim()) {
      throw new Error('This PDF appears to be a scanned image with no selectable text. Try pasting the text instead.');
    }
    return text;
  }

  if (name.endsWith('.docx')) {
    const buffer = await file.arrayBuffer();
    const text = await extractDocxText(buffer);
    if (!text.trim()) {
      throw new Error('Could not extract any text from this DOCX file.');
    }
    return text;
  }

  if (name.endsWith('.doc')) {
    throw new Error('Legacy .doc files are not supported in-browser. Please upload a .docx or .pdf, or paste the text directly.');
  }

  // Plain text / markdown / anything else: read as text.
  const text = await file.text();
  if (!text.trim()) {
    throw new Error('This file appears to be empty.');
  }
  return text;
}
