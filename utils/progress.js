import BASE_URL from '../config';

/**
 * Fetches all results from the backend and returns a progress map
 * keyed by subject_id: { pct, status }
 *
 * Status rules (based on latest quiz result per subject):
 *   No result       → 0%,    'Not Started'
 *   score < 50%     → score%, 'Started'
 *   50% ≤ score < 80% → score%, 'In Progress'
 *   score ≥ 80%     → score%, 'Complete'
 *
 * If userId is provided, only that user's results are considered.
 */
export async function fetchProgressMap(userId) {
  try {
    const response = await fetch(`${BASE_URL}/api/results`);
    if (!response.ok) return {};
    const results = await response.json();

    // Filter to this user's results if userId is available
    const userResults = userId
      ? results.filter((r) => r.user_id === userId)
      : results;

    // Keep only the latest result per subject (highest id)
    const latestBySubject = {};
    userResults.forEach((r) => {
      if (!latestBySubject[r.subject_id] || r.id > latestBySubject[r.subject_id].id) {
        latestBySubject[r.subject_id] = r;
      }
    });

    // Build the progress map
    const map = {};
    Object.values(latestBySubject).forEach((r) => {
      const pct = r.total_questions > 0
        ? Math.round((r.score / r.total_questions) * 100)
        : 0;
      let status;
      if (pct >= 80) status = 'Complete';
      else if (pct >= 50) status = 'In Progress';
      else status = 'Started';

      map[r.subject_id] = { pct, status };
    });

    return map;
  } catch {
    return {};
  }
}

/**
 * Returns { pct, status } for a single subject from the progress map.
 * Defaults to 0% / 'Not Started' if no result exists.
 */
export function getSubjectProgress(progressMap, subjectId) {
  return progressMap[subjectId] || { pct: 0, status: 'Not Started' };
}
