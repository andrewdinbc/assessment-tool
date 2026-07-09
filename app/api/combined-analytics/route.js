// Combined analytics: merges Mastery Studio's real teacher analytics with
// assessment-tool's own rubric-based review data. Honest note: assessment-
// tool doesn't have a rubric-review data system built yet (this app is
// still early-stage - see README), so that half returns a clear
// "not yet available" flag rather than fake data. When assessment-tool's
// own review system is built, wire its real query in below where marked.

const TEACHER_EMAIL = 'andrewsinbc3@gmail.com'; // single-teacher personal deployment for now

export async function GET() {
  try {
    const secret = process.env.MICRO_UNIT_SYNC_SECRET;
    let masteryStudioData = null;
    let masteryStudioError = null;

    if (!secret) {
      masteryStudioError = 'MICRO_UNIT_SYNC_SECRET not configured on this app';
    } else {
      try {
        const res = await fetch(
          `https://math-mastery-three.vercel.app/api/analytics?teacherEmail=${encodeURIComponent(TEACHER_EMAIL)}`,
          { headers: { 'x-micro-unit-sync-secret': secret } }
        );
        const data = await res.json();
        if (!res.ok) masteryStudioError = data.error || `status ${res.status}`;
        else masteryStudioData = data;
      } catch (e) {
        masteryStudioError = 'Could not reach Mastery Studio: ' + e.message;
      }
    }

    // TODO: wire in assessment-tool's own rubric-review aggregation once
    // that system exists (currently unbuilt - see README). Structure should
    // match masteryStudioData's shape (overview/patterns/strengths/
    // areasForGrowth) so the UI can render both uniformly.
    const assessmentToolData = null;
    const assessmentToolNote = 'Rubric-based review system not yet built in Assessment Tool - showing Mastery Studio data only for now.';

    return Response.json({
      masteryStudio: { data: masteryStudioData, error: masteryStudioError, source: 'Mastery Studio (math practice)' },
      assessmentTool: { data: assessmentToolData, note: assessmentToolNote, source: 'Assessment Tool (rubric-based review)' },
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
