// Load environment variables first
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Basic middleware
app.use(cors());
app.use(express.json());

// Simple health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Hello World from Votiy API!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test Supabase connection endpoint
app.get('/debug/supabase', async (req, res) => {
  try {
    const { createSupabaseClient } = require('./config/supabase');
    const supabase = createSupabaseClient();

    // Test a simple query
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      res.json({
        status: 'error',
        message: 'Supabase query failed',
        error: error.message
      });
    } else {
      res.json({
        status: 'success',
        message: 'Supabase connection working',
        data: data
      });
    }
  } catch (err) {
    res.json({
      status: 'error',
      message: 'Failed to create Supabase client',
      error: err.message
    });
  }
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/polls', require('./routes/polls'));
app.use('/api/poll-options', require('./routes/poll-options'));
app.use('/api/poll-votes', require('./routes/poll-votes'));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Votiy API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔌 Supabase test: http://localhost:${PORT}/debug/supabase`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
  console.log(`👥 Users API: http://localhost:${PORT}/api/users`);
  console.log(`🗳️ Polls API: http://localhost:${PORT}/api/polls`);
  console.log(`📝 Poll Options API: http://localhost:${PORT}/api/poll-options`);
  console.log(`🗳️ Poll Votes API: http://localhost:${PORT}/api/poll-votes`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
