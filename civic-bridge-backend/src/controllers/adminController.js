const supabase = require('../config/supabase');

exports.getAnalytics = async (req, res) => {
  try {
    // For a hackathon MVP, we can query some real numbers or return realistic mocks if tables are empty.
    
    // 1. Get total students (count of users with user_type='student')
    const { count: studentCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('user_type', 'student');

    // 2. Get total schemes available
    const { count: schemeCount } = await supabase
      .from('schemes')
      .select('*', { count: 'exact', head: true });

    // 3. Return analytics
    // If the database is still empty, fallback to some realistic baseline numbers for the dashboard
    res.status(200).json({
      students_assisted: studentCount || 120,
      scheme_matches: 245,           // Mocked for MVP unless there is a matches table
      applications_started: 98,      // Mocked for MVP
      applications_completed: 61,    // Mocked for MVP
      total_active_schemes: schemeCount || 12
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
