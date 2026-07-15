import { apiGet } from './api';

/**
 * Fetches per-subject completion progress from the backend and returns a
 * map keyed by subject_id: { pct, status, completed, total }.
 *
 * Progress = (activities completed + papers-with-questions completed + guide viewed)
 *          / (all activities-with-questions + all papers-with-questions + 1-if-guide-uploaded)
 *
 * Status: 'No Content' (nothing uploaded yet), 'Not Started', 'In Progress', 'Complete'.
 *
 * Network-first with a cache fallback (see utils/api.js) — offline, this
 * returns whatever was last fetched for this user.
 */
export async function fetchProgressMap(userId) {
  if (!userId) return {};
  const { data: rows } = await apiGet(`/api/progress?user_id=${userId}`, `progress:${userId}`);
  if (!Array.isArray(rows)) return {};

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
}

/**
 * Returns { pct, status, completed, total } for a single subject from the
 * progress map. Defaults to 0% / 'Not Started' if no data exists.
 */
export function getSubjectProgress(progressMap, subjectId) {
  return progressMap[subjectId] || { pct: 0, status: 'Not Started', completed: 0, total: 0 };
}
