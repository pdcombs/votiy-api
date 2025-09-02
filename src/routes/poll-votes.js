const express = require('express');
const { createSupabaseClient } = require('../config/supabase');

const router = express.Router();

// GET all poll votes
router.get('/', async (req, res) => {
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from('poll_votes')
      .select(`
        *,
        user:users!poll_votes_user_id_fkey(id, email, first_name, last_name),
        option:poll_options!poll_votes_option_id_fkey(id, text, description),
        poll:polls!poll_votes_poll_id_fkey(id, title)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ poll_votes: data });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET votes by poll ID
router.get('/poll/:pollId', async (req, res) => {
  try {
    const { pollId } = req.params;
    const supabase = createSupabaseClient();
    
    const { data, error } = await supabase
      .from('poll_votes')
      .select(`
        *,
        user:users!poll_votes_user_id_fkey(id, email, first_name, last_name),
        option:poll_options!poll_votes_option_id_fkey(id, text, description)
      `)
      .eq('poll_id', pollId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ poll_votes: data });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET votes by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const supabase = createSupabaseClient();
    
    const { data, error } = await supabase
      .from('poll_votes')
      .select(`
        *,
        option:poll_options!poll_votes_option_id_fkey(id, text, description),
        poll:polls!poll_votes_poll_id_fkey(id, title)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ poll_votes: data });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET vote by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = createSupabaseClient();
    
    const { data, error } = await supabase
      .from('poll_votes')
      .select(`
        *,
        user:users!poll_votes_user_id_fkey(id, email, first_name, last_name),
        option:poll_options!poll_votes_option_id_fkey(id, text, description),
        poll:polls!poll_votes_poll_id_fkey(id, title)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Poll vote not found' });
      }
      return res.status(500).json({ error: error.message });
    }

    res.json({ poll_vote: data });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST create new poll vote
router.post('/', async (req, res) => {
  try {
    const { poll_id, option_id, user_id } = req.body;
    
    if (!poll_id || !option_id || !user_id) {
      return res.status(400).json({ 
        error: 'Poll ID, option ID, and user ID are required' 
      });
    }

    const supabase = createSupabaseClient();
    
    // Check if user already voted on this poll
    const { data: existingVote, error: checkError } = await supabase
      .from('poll_votes')
      .select('id')
      .eq('poll_id', poll_id)
      .eq('user_id', user_id)
      .single();

    if (existingVote) {
      return res.status(400).json({ 
        error: 'User has already voted on this poll' 
      });
    }

    const { data, error } = await supabase
      .from('poll_votes')
      .insert({
        poll_id,
        option_id,
        user_id
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({ poll_vote: data });
  } catch (error) {
    if (error.code === 'PGRST116') {
      // No existing vote found, which is fine
    } else {
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    
    // Continue with vote creation
    try {
      const { poll_id, option_id, user_id } = req.body;
      const supabase = createSupabaseClient();
      
      const { data, error: insertError } = await supabase
        .from('poll_votes')
        .insert({
          poll_id,
          option_id,
          user_id
        })
        .select()
        .single();

      if (insertError) {
        return res.status(500).json({ error: insertError.message });
      }

      res.status(201).json({ poll_vote: data });
    } catch (insertError) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// PUT update poll vote
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { option_id } = req.body;
    
    if (!option_id) {
      return res.status(400).json({ error: 'Option ID is required' });
    }

    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from('poll_votes')
      .update({
        option_id
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Poll vote not found' });
      }
      return res.status(500).json({ error: error.message });
    }

    res.json({ poll_vote: data });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE poll vote
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = createSupabaseClient();
    
    const { error } = await supabase
      .from('poll_votes')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: 'Poll vote deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
