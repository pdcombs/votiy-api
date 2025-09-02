const express = require('express');
const { createSupabaseClient } = require('../config/supabase');

const router = express.Router();

// GET all poll options
router.get('/', async (req, res) => {
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from('poll_options')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ poll_options: data });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET poll options by poll ID
router.get('/poll/:pollId', async (req, res) => {
  try {
    const { pollId } = req.params;
    const supabase = createSupabaseClient();
    
    const { data, error } = await supabase
      .from('poll_options')
      .select('*')
      .eq('poll_id', pollId)
      .order('order_index', { ascending: true });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ poll_options: data });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET poll option by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = createSupabaseClient();
    
    const { data, error } = await supabase
      .from('poll_options')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Poll option not found' });
      }
      return res.status(500).json({ error: error.message });
    }

    res.json({ poll_option: data });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST create new poll option
router.post('/', async (req, res) => {
  try {
    const { poll_id, text, description, order_index } = req.body;
    
    if (!poll_id || !text) {
      return res.status(400).json({ 
        error: 'Poll ID and text are required' 
      });
    }

    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from('poll_options')
      .insert({
        poll_id,
        text,
        description,
        order_index: order_index || 0
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({ poll_option: data });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT update poll option
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { text, description, order_index } = req.body;
    
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from('poll_options')
      .update({
        text,
        description,
        order_index
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Poll option not found' });
      }
      return res.status(500).json({ error: error.message });
    }

    res.json({ poll_option: data });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE poll option
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = createSupabaseClient();
    
    const { error } = await supabase
      .from('poll_options')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: 'Poll option deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
