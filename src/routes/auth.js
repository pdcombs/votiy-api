const express = require('express');
const { createSupabaseClient } = require('../config/supabase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// User signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, first_name, last_name, phone } = req.body;

    // Validation
    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ 
        error: 'Email, password, first_name, and last_name are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }

    const supabase = createSupabaseClient();

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Create user
    const { data: user, error: createError } = await supabase
      .from('users')
      .insert({
        email,
        first_name,
        last_name,
        phone: phone || null,
        password_hash
      })
      .select('id, email, first_name, last_name, phone, created_at')
      .single();

    if (createError) {
      console.error('User creation error:', createError);
      return res.status(500).json({ error: 'Failed to create user' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        created_at: user.created_at
      },
      token
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error during signup' });
  }
});

// User signin
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    const supabase = createSupabaseClient();

    // Get user with password hash
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, phone, password_hash, created_at')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Signin successful',
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        created_at: user.created_at
      },
      token
    });

  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Internal server error during signin' });
  }
});

// User signout (client-side token removal)
router.post('/signout', authenticateToken, async (req, res) => {
  try {
    // In a stateless JWT system, signout is handled client-side
    // by removing the token. This endpoint confirms the user was authenticated.
    res.json({ 
      message: 'Signout successful. Please remove the token from client storage.' 
    });
  } catch (error) {
    console.error('Signout error:', error);
    res.status(500).json({ error: 'Internal server error during signout' });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const supabase = createSupabaseClient();
    
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, phone, created_at')
      .eq('id', req.user.userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Refresh token (optional - extend token validity)
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    const supabase = createSupabaseClient();
    
    // Verify user still exists
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', req.user.userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate new token
    const newToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Token refreshed successfully',
      token: newToken
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Internal server error during token refresh' });
  }
});

// Change password
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        error: 'Current password and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        error: 'New password must be at least 6 characters long' 
      });
    }

    const supabase = createSupabaseClient();

    // Get current user with password hash
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', req.user.userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: newPasswordHash })
      .eq('id', id);

    if (updateError) {
      return res.status(500).json({ error: 'Failed to update password' });
    }

    res.json({ message: 'Password updated successfully' });

  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Internal server error during password change' });
  }
});

module.exports = router;
