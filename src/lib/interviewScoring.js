// =============================================================================
// Interview answer scoring — every score is derived from the actual text the
// candidate typed or spoke. No canned scores, no fixed feedback strings.
// =============================================================================

const FILLER_WORDS = ['um', 'uh', 'like', 'basically', 'actually', 'you know', 'sort of', 'kind of'];

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function countKeywordHits(answer, keywords = []) {
  const lower = answer.toLowerCase();
  return keywords.filter(kw => lower.includes(kw.toLowerCase()));
}

function countFillerWords(answer) {
  const lower = answer.toLowerCase();
  return FILLER_WORDS.reduce((acc, w) => {
    const re = new RegExp(`\\b${escapeRegExp(w)}\\b`, 'g');
    const matches = lower.match(re);
    return acc + (matches ? matches.length : 0);
  }, 0);
}

function hasQuantification(answer) {
  return /\b\d+(\.\d+)?\s?(%|percent|ms|seconds|x|users|requests)\b/i.test(answer);
}

/** Score a single answer against its question's ideal keyword list.
 *  Returns a 0-100 score and human-readable feedback generated from what was
 *  actually detected in the answer (not a fixed string). */
export function scoreAnswer(question, answerText) {
  const answer = (answerText || '').trim();
  const words = answer ? answer.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;

  if (wordCount === 0) {
    return { score: 0, matchedKeywords: [], feedback: 'No answer was provided for this question.' };
  }

  const idealKeywords = question.idealKeywords || [];
  const matched = countKeywordHits(answer, idealKeywords);
  const keywordCoverage = idealKeywords.length > 0 ? matched.length / idealKeywords.length : 0.5;

  // Length signal: reward substantive answers, cap the benefit past ~120 words.
  const lengthSignal = Math.min(1, wordCount / 120);

  const fillerCount = countFillerWords(answer);
  const fillerPenalty = Math.min(15, fillerCount * 3);

  const quantBonus = hasQuantification(answer) ? 6 : 0;

  let score = 30 + keywordCoverage * 45 + lengthSignal * 20 + quantBonus - fillerPenalty;
  score = Math.max(5, Math.min(99, Math.round(score)));

  const feedbackParts = [];
  if (matched.length > 0) {
    feedbackParts.push(`Covered ${matched.length}/${idealKeywords.length} key concepts (${matched.slice(0, 3).join(', ')}).`);
  } else if (idealKeywords.length > 0) {
    feedbackParts.push(`Didn't mention any of the expected concepts: ${idealKeywords.slice(0, 3).join(', ')}.`);
  }
  if (wordCount < 25) {
    feedbackParts.push('Answer is quite short — expand with more concrete detail.');
  }
  if (fillerCount > 2) {
    feedbackParts.push(`Contains ${fillerCount} filler words/phrases — tighten the delivery.`);
  }
  if (quantBonus > 0) {
    feedbackParts.push('A numeric detail was detected; check that it is accurate.');
  }

  return {
    score,
    matchedKeywords: matched,
    feedback: feedbackParts.length ? feedbackParts.join(' ') : 'Response recorded. This heuristic cannot verify correctness.',
  };
}

/** Aggregate a completed session's per-question logs into an overall result.
 *  Every field is computed from the logs — nothing is a fixed constant. */
export function aggregateSession(logs) {
  const overallScore = Math.round(logs.reduce((acc, l) => acc + l.score, 0) / logs.length);

  const technicalLogs = logs.filter(l => l.kind === 'technical');
  const hrLogs = logs.filter(l => l.kind === 'hr');

  const technicalScore = technicalLogs.length
    ? Math.round(technicalLogs.reduce((a, l) => a + l.score, 0) / technicalLogs.length)
    : overallScore;
  const hrScore = hrLogs.length
    ? Math.round(hrLogs.reduce((a, l) => a + l.score, 0) / hrLogs.length)
    : overallScore;

  const totalWords = logs.reduce((acc, l) => acc + (l.userAnswer.trim().split(/\s+/).filter(Boolean).length), 0);
  const totalFillers = logs.reduce((acc, l) => acc + countFillerWords(l.userAnswer), 0);
  const avgWords = totalWords / logs.length;

  // Communication score: rewards substantive average length, penalizes filler density.
  let communicationScore = 40 + Math.min(45, (avgWords / 100) * 45) - Math.min(20, totalFillers * 3);
  communicationScore = Math.max(20, Math.min(98, Math.round(communicationScore)));

  const weakSkills = logs
    .filter(l => l.score < 70)
    .map(l => l.category)
    .filter((cat, idx, arr) => cat && arr.indexOf(cat) === idx)
    .slice(0, 3);

  const verdict = overallScore >= 80
    ? 'Strong keyword coverage — review technical correctness yourself'
    : overallScore >= 60
      ? 'Some expected concepts mentioned — review the gaps'
      : 'Low keyword coverage — revisit the concepts';

  const detailedNotes = weakSkills.length > 0
    ? `Strongest performance in ${logs.slice().sort((a, b) => b.score - a.score)[0].category}. Recommended focus areas: ${weakSkills.join(', ')}.`
    : `Consistent performance across all ${logs.length} questions with no single weak category detected.`;

  return {
    overallScore,
    technicalScore,
    hrScore,
    communicationScore,
    verdict,
    weakSkills: weakSkills.length ? weakSkills : ['General Interview Polish'],
    detailedNotes,
    date: new Date().toISOString().split('T')[0],
  };
}
