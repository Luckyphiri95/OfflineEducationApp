const db = require("../database/database");

// ======================
// GET PER-SUBJECT COMPLETION PROGRESS FOR A USER
// Progress = (activities completed + papers-with-questions completed + guide viewed)
//          / (all activities-with-questions + all papers-with-questions + 1-if-guide-uploaded)
// ======================
const getProgress = (req, res) => {
  const userId = req.query.user_id;

  if (!userId) {
    return res.status(400).json({ message: "user_id is required" });
  }

  db.all(`SELECT id, guide_filename FROM subjects`, [], (err, subjects) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    db.all(
      `SELECT DISTINCT activity_id, subject_id FROM quiz WHERE activity_id IS NOT NULL`,
      [],
      (err2, activityRows) => {
        if (err2) {
          return res.status(500).json({ message: "Database error" });
        }

        db.all(
          `SELECT DISTINCT paper_id, subject_id FROM quiz WHERE paper_id IS NOT NULL`,
          [],
          (err3, paperRows) => {
            if (err3) {
              return res.status(500).json({ message: "Database error" });
            }

            db.all(
              `SELECT DISTINCT activity_id FROM results WHERE user_id = ? AND type = 'activity' AND activity_id IS NOT NULL`,
              [userId],
              (err4, completedActivityRows) => {
                if (err4) {
                  return res.status(500).json({ message: "Database error" });
                }

                db.all(
                  `SELECT DISTINCT paper_id FROM results WHERE user_id = ? AND type = 'paper' AND paper_id IS NOT NULL`,
                  [userId],
                  (err5, completedPaperRows) => {
                    if (err5) {
                      return res.status(500).json({ message: "Database error" });
                    }

                    db.all(
                      `SELECT subject_id FROM guide_views WHERE user_id = ?`,
                      [userId],
                      (err6, guideViewRows) => {
                        if (err6) {
                          return res.status(500).json({ message: "Database error" });
                        }

                        const completedActivityIds = new Set(completedActivityRows.map((r) => r.activity_id));
                        const completedPaperIds = new Set(completedPaperRows.map((r) => r.paper_id));
                        const viewedGuideSubjectIds = new Set(guideViewRows.map((r) => r.subject_id));

                        const progress = subjects.map((s) => {
                          const activityIds = activityRows.filter((r) => r.subject_id === s.id).map((r) => r.activity_id);
                          const paperIds = paperRows.filter((r) => r.subject_id === s.id).map((r) => r.paper_id);
                          const hasGuide = !!s.guide_filename;

                          const total = activityIds.length + paperIds.length + (hasGuide ? 1 : 0);
                          const completedActivities = activityIds.filter((id) => completedActivityIds.has(id)).length;
                          const completedPapers = paperIds.filter((id) => completedPaperIds.has(id)).length;
                          const completedGuide = hasGuide && viewedGuideSubjectIds.has(s.id) ? 1 : 0;
                          const completed = completedActivities + completedPapers + completedGuide;

                          const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
                          let status;
                          if (total === 0) status = "No Content";
                          else if (completed === 0) status = "Not Started";
                          else if (completed < total) status = "In Progress";
                          else status = "Complete";

                          return { subject_id: s.id, total, completed, pct, status };
                        });

                        return res.status(200).json(progress);
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    );
  });
};

module.exports = {
  getProgress
};
