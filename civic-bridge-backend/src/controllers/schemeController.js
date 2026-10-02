const supabase = require('../config/supabase');

// Get all active schemes
exports.getAllSchemes = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('schemes')
      .select('id, scheme_name, scheme_code, award_amount, deadline_date, ministry')
      .eq('is_active', true)
      .order('scheme_name');

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({ schemes: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get scheme details with eligibility criteria and documents
exports.getSchemeDetails = async (req, res) => {
  try {
    const { schemeId } = req.params;

    // Get scheme info
    const { data: scheme, error: schemeError } = await supabase
      .from('schemes')
      .select('*')
      .eq('id', schemeId)
      .single();

    if (schemeError || !scheme) {
      return res.status(404).json({ error: 'Scheme not found' });
    }

    // Get eligibility criteria
    const { data: criteria } = await supabase
      .from('scheme_eligibility_criteria')
      .select('*')
      .eq('scheme_id', schemeId);

    // Get required documents
    const { data: documents } = await supabase
      .from('scheme_required_documents')
      .select('*')
      .eq('scheme_id', schemeId);

    // Get application steps
    const { data: steps } = await supabase
      .from('scheme_application_steps')
      .select('*')
      .eq('scheme_id', schemeId)
      .order('step_number');

    res.status(200).json({
      scheme: {
        ...scheme,
        eligibility_criteria: criteria || [],
        required_documents: documents || [],
        application_steps: steps || []
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
