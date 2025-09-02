const express = require('express');
const { createSupabaseClient } = require('../config/supabase');

const router = express.Router();

// GET all users
router.get('/', async (req, res) => {
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ users: data });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = createSupabaseClient();
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.status(500).json({ error: error.message });
    }

    res.json({ user: data });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST create new user
router.post('/', async (req, res) => {
  try {
    const { email, phone, first_name, last_name, password_hash } = req.body;
    
    if (!email || !first_name || !last_name) {
      return res.status(400).json({ error: 'Email, first_name, and last_name are required' });
    }

    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from('users')
      .insert({
        email,
        phone,
        first_name,
        last_name,
        password_hash
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(400).json({ error: 'User with this email already exists' });
      }
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({ user: data });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT update user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, phone, first_name, last_name, password_hash } = req.body;
    
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from('users')
      .update({
        email,
        phone,
        first_name,
        last_name,
        password_hash,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.status(500).json({ error: error.message });
    }

    res.json({ user: data });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = createSupabaseClient();
    
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
