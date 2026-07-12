import BASE_URL from '../config';

/**
 * Fetches per-subject completion progress from the backend and returns a
 * map keyed by subject_id: { pct, status, completed, total }.
 *
 * Progress = (activities completed + papers-with-questions completed + guide viewed)
 *          / (all activities-with-questions + all papers-with-questions + 1-if-guide-uploaded)
 *
 * Status: 'No Content' (nothing uploaded yet), 'Not Started', 'In Progress', 'Complete'.
 */
export async function fetchProgressMap(userId) {
  if (!userId) return {};
  try {
    const response = await fetch(`${BASE_URL}/api/progress?user_id=${userId}`);
    if (!response.ok) return {};
    const rows = await response.json();

    const map = {};
    rows.forEach((r) => {
      map[r.subject_id] = {
        pct: r.pct,
        status: r.status,
        completed: r.completed,
        total: r.total,
      };
    });

    return map;
  } catch {
    return {};
  }
}

/**
 * Returns { pct, status, completed, total } for a single subject from the
 * progress map. Defaults to 0% / 'Not Started' if no data exists.
 */
export function getSubjectProgress(progressMap, subjectId) {
  return progressMap[subjectId] || { pct: 0, status: 'Not Started', completed: 0, total: 0 };
}
