const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

const { createClient } = require('@supabase/supabase-js');

// Create an admin client just for registration to bypass IP rate limits
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Register new user
exports.register = async (req, res) => {
  try {
    const { email, password, full_name, college_id } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ 
        error: 'Email, password, and full_name are required' 
      });
    }

    // Create user in Supabase Auth using Admin API (bypasses rate limits)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name,
        college_id
      }
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    // Create user record in users table
    const { data: userData, error: dbError } = await supabaseAdmin
      .from('users')
      .insert([{
        id: authData.user.id,
        email: email,
        full_name: full_name,
        college_id: college_id,
        user_type: 'student'
      }])
      .select();

    if (dbError) {
      console.warn("Soft Warning: Could not insert into 'users' table, but Auth was successful. Proceeding...", dbError.message);
    }

    res.status(201).json({
      message: 'Registration successful',
      user_id: authData.user.id,
      email: email,
      user_type: 'student'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Get user type
    const { data: userData } = await supabase
      .from('users')
      .select('user_type')
      .eq('id', data.user.id)
      .single();

    res.status(200).json({
      access_token: data.session.access_token,
      user_id: data.user.id,
      email: data.user.email,
      user_type: userData?.user_type || 'student'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
