const supabase = require('../config/supabase');

// Check eligibility match for student profile
exports.checkMatch = async (req, res) => {
  try {
    const studentData = req.body;

    // Validate required fields
    if (!studentData.course || !studentData.state) {
      return res.status(400).json({ 
        error: 'Course and state are required' 
      });
    }

    // Get all active schemes
    const { data: schemes } = await supabase
      .from('schemes')
      .select('*')
      .eq('is_active', true);

    if (!schemes || schemes.length === 0) {
      return res.status(200).json({ matched_schemes: [], not_matched_schemes: [] });
    }

    const matchedSchemes = [];
    const notMatchedSchemes = [];

    // Check each scheme
    for (const scheme of schemes) {
      // Get eligibility criteria
      const { data: criteria } = await supabase
        .from('scheme_eligibility_criteria')
        .select('*')
        .eq('scheme_id', scheme.id);

      // Calculate match
      const { isMatched, score, reason } = checkEligibility(studentData, criteria || []);

      // Get documents
      const { data: documents } = await supabase
        .from('scheme_required_documents')
        .select('document_name')
        .eq('scheme_id', scheme.id);

      // Get official link
      const { data: steps } = await supabase
        .from('scheme_application_steps')
        .select('*')
        .eq('scheme_id', scheme.id)
        .limit(1);

      const schemeResult = {
        scheme_id: scheme.id,
        scheme_name: scheme.scheme_name,
        award_amount: scheme.award_amount,
        official_link: scheme.official_link,
        match_status: isMatched ? 'eligible' : 'possibly_eligible',
        match_score: score,
        eligibility_reason: reason,
        required_documents: documents?.map(d => d.document_name) || [],
        application_steps: steps || []
      };

      if (isMatched || score > 50) {
        matchedSchemes.push(schemeResult);
      } else {
        notMatchedSchemes.push({
          scheme_id: scheme.id,
          scheme_name: scheme.scheme_name,
          match_status: 'not_eligible',
          reason: reason
        });
      }
    }

    res.status(200).json({
      matched_schemes: matchedSchemes,
      not_matched_schemes: notMatchedSchemes
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper function to check eligibility
function checkEligibility(studentData, criteria) {
  if (!criteria || criteria.length === 0) {
    return { isMatched: true, score: 100, reason: 'No specific eligibility criteria' };
  }

  let matchedCount = 0;
  let reasons = [];

  for (const criterion of criteria) {
    if (criterion.criterion_type === 'category') {
      const allowedCategories = criterion.criterion_value.split(',');
      if (allowedCategories.includes(studentData.category)) {
        matchedCount++;
        reasons.push(`✓ Category ${studentData.category} is eligible`);
      } else {
        reasons.push(`✗ Category required: ${criterion.criterion_value}`);
      }
    }

    if (criterion.criterion_type === 'income') {
      const limit = parseFloat(criterion.criterion_value);
      if (studentData.annual_family_income && studentData.annual_family_income <= limit) {
        matchedCount++;
        reasons.push(`✓ Family income ₹${studentData.annual_family_income} is within limit ₹${limit}`);
      } else {
        reasons.push(`✗ Family income must be ≤ ₹${limit}`);
      }
    }

    if (criterion.criterion_type === 'state') {
      if (criterion.criterion_value.includes(studentData.state)) {
        matchedCount++;
        reasons.push(`✓ State ${studentData.state} is covered`);
      } else {
        reasons.push(`✗ State must be in: ${criterion.criterion_value}`);
      }
    }

    if (criterion.criterion_type === 'disability') {
      if (studentData.disability_status === true) {
        matchedCount++;
        reasons.push(`✓ Applicable for students with disabilities`);
      }
    }
  }

  const score = Math.round((matchedCount / criteria.length) * 100);
  const isMatched = score >= 80;

  return {
    isMatched,
    score,
    reason: reasons.join(' | ')
  };
}
