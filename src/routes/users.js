const express = require("express");
const { supabaseAdmin } = require("../config/supabase");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Get user profile (authenticated)
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", req.user.userId)
      .single();

    if (error) {
      return res.status(500).json({ error: "Failed to fetch user profile" });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        createdAt: user.created_at
      }
    });

  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update user profile (authenticated)
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;

    const updateData = {};
    if (firstName) updateData.first_name = firstName;
    if (lastName) updateData.last_name = lastName;
    if (phone !== undefined) updateData.phone = phone;

    const { data: updatedUser, error } = await supabaseAdmin
      .from("users")
      .update(updateData)
      .eq("id", req.user.userId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: "Failed to update user profile" });
    }

    res.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        phone: updatedUser.phone
      }
    });

  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
