const supabase = require('../config/supabase');

// Create/Update student profile
exports.createOrUpdateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profileData = req.body;

    // Validate required fields
    if (!profileData.course || !profileData.year_of_study || !profileData.state) {
      return res.status(400).json({ 
        error: 'Course, year_of_study, and state are required' 
      });
    }

    const { data, error } = await supabase
      .from('student_profiles')
      .upsert([{
        user_id: userId,
        course: profileData.course,
        year_of_study: profileData.year_of_study,
        state: profileData.state,
        annual_family_income: profileData.annual_family_income,
        category: profileData.category,
        disability_status: profileData.disability_status || false,
        udid_number: profileData.udid_number
      }], {
        onConflict: 'user_id'
      })
      .select();

    if (error) {
       return res.status(500).json({ error: error.message });
    }

    res.status(201).json({
      message: 'Profile created/updated successfully',
      profile: data[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get student profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.status(200).json({ profile: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
