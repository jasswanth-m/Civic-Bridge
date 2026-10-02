const supabase = require('../config/supabase');

// Verify JWT token
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        error: 'No authorization token provided' 
      });
    }

    // Verify token with Supabase
    const { data, error } = await supabase.auth.verifyJWT(token);
    
    if (error || !data.user) {
      return res.status(401).json({ 
        error: 'Invalid or expired token' 
      });
    }

    req.user = {
      id: data.user.id,
      email: data.user.email
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ 
      error: 'Token verification failed' 
    });
  }
};

// Verify admin role
const requireAdmin = async (req, res, next) => {
  const { data } = await supabase
    .from('users')
    .select('user_type')
    .eq('id', req.user.id)
    .single();

  if (data?.user_type !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = { authenticateUser, requireAdmin };
