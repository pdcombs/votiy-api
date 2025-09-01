const express = require("express");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { supabaseAdmin } = require("../config/supabase");

const router = express.Router();

// Validation middleware
const validateSignup = [
  body("email").isEmail().normalizeEmail(),
  body("phone").optional().isMobilePhone(),
  body("password").isLength({ min: 6 }),
  body("firstName").trim().isLength({ min: 1 }),
  body("lastName").trim().isLength({ min: 1 })
];

const validateLogin = [
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty()
];

// User signup
router.post("/signup", validateSignup, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: "Validation failed", 
        details: errors.array() 
      });
    }

    const { email, phone, password, firstName, lastName } = req.body;

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return res.status(409).json({ 
        error: "User already exists with this email" 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user in Supabase auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        firstName,
        lastName,
        phone
      }
    });

    if (authError) {
      return res.status(500).json({ 
        error: "Failed to create user account" 
      });
    }

    // Create user profile
    const { data: profileUser, error: profileError } = await supabaseAdmin
      .from("users")
      .insert({
        id: authUser.user.id,
        email,
        phone,
        first_name: firstName,
        last_name: lastName,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      return res.status(500).json({ 
        error: "Failed to create user profile" 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: authUser.user.id, email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
    );

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: profileUser.id,
        email: profileUser.email,
        firstName: profileUser.first_name,
        lastName: profileUser.last_name
      },
      token
    });

  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ 
      error: "Internal server error during signup" 
    });
  }
});

// User login
router.post("/login", validateLogin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: "Validation failed", 
        details: errors.array() 
      });
    }

    const { email, password } = req.body;

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.signInWithPassword({
      email,
      password
    });

    if (authError) {
      return res.status(401).json({ 
        error: "Invalid email or password" 
      });
    }

    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (profileError) {
      return res.status(500).json({ 
        error: "Failed to retrieve user profile" 
      });
    }

    const token = jwt.sign(
      { userId: authData.user.id, email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
    );

    res.json({
      message: "Login successful",
      user: {
        id: userProfile.id,
        email: userProfile.email,
        firstName: userProfile.first_name,
        lastName: userProfile.last_name
      },
      token
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      error: "Internal server error during login" 
    });
  }
});

module.exports = router;
