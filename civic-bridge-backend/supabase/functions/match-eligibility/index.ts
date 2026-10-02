import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  if (req.method === "POST") {
    const studentData = await req.json();

    // Fetch all schemes
    const { data: schemes } = await supabase
      .from("schemes")
      .select("*")
      .eq("is_active", true);

    const matches = [];

    for (const scheme of schemes) {
      // Fetch eligibility criteria for this scheme
      const { data: criteria } = await supabase
        .from("scheme_eligibility_criteria")
        .select("*")
        .eq("scheme_id", scheme.id);

      // Check eligibility
      const { isMatched, score, reason } = checkEligibility(
        studentData,
        criteria
      );

      if (isMatched || score > 50) {
        // Store match result
        await supabase
          .from("student_scheme_matches")
          .upsert([
            {
              student_id: studentData.student_id,
              scheme_id: scheme.id,
              match_status: isMatched ? "eligible" : "possibly_eligible",
              match_score: score,
              eligibility_reason: reason,
            },
          ]);

        matches.push({
          scheme_id: scheme.id,
          scheme_name: scheme.scheme_name,
          match_score: score,
          eligibility_reason: reason,
        });
      }
    }

    return new Response(JSON.stringify({ matches }), {
      headers: { "Content-Type": "application/json" },
    });
  }
});

// Helper: Check if student meets eligibility criteria
function checkEligibility(studentData, criteria) {
  let matchedCount = 0;
  let totalCount = criteria.length;
  let reason = [];

  for (const criterion of criteria) {
    if (criterion.criterion_type === "income") {
      if (studentData.annual_family_income <= criterion.criterion_value) {
        matchedCount++;
        reason.push("✓ Family income within limit");
      } else {
        reason.push("✗ Family income exceeds limit");
      }
    }

    if (criterion.criterion_type === "category") {
      const allowed = criterion.criterion_value.split(",");
      if (allowed.includes(studentData.category)) {
        matchedCount++;
        reason.push(`✓ Category ${studentData.category} is eligible`);
      } else {
        reason.push(`✗ Category ${studentData.category} is not eligible`);
      }
    }

    if (criterion.criterion_type === "state") {
      if (criterion.criterion_value.includes(studentData.state)) {
        matchedCount++;
        reason.push(`✓ State ${studentData.state} is covered`);
      } else {
        reason.push(`✗ State ${studentData.state} is not covered`);
      }
    }
  }

  const score = Math.round((matchedCount / totalCount) * 100);
  const isMatched = score >= 80;

  return {
    isMatched,
    score,
    reason: reason.join(" "),
  };
}
