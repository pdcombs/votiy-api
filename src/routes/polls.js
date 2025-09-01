const express = require("express");
const { body, validationResult } = require("express-validator");
const { supabaseAdmin } = require("../config/supabase");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Get all polls (public)
router.get("/", async (req, res) => {
  try {
    const { data: polls, error } = await supabaseAdmin
      .from("polls")
      .select(`
        *,
        creator:users(first_name, last_name),
        options:poll_options(*)
      `)
      .eq("is_public", true)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ error: "Failed to fetch polls" });
    }

    res.json({ polls });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get user polls (authenticated)
router.get("/my-polls", authenticateToken, async (req, res) => {
  try {
    const { data: polls, error } = await supabaseAdmin
      .from("polls")
      .select(`
        *,
        options:poll_options(*)
      `)
      .eq("creator_id", req.user.userId)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ error: "Failed to fetch user polls" });
    }

    res.json({ polls });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create new poll (authenticated)
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { title, description, startDate, endDate, options } = req.body;

    const { data: poll, error: pollError } = await supabaseAdmin
      .from("polls")
      .insert({
        title,
        description,
        start_date: startDate,
        end_date: endDate,
        creator_id: req.user.userId,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (pollError) {
      return res.status(500).json({ error: "Failed to create poll" });
    }

    res.status(201).json({
      message: "Event created successfully",
      poll
    });

  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
