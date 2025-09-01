const { createClient } = require('@supabase/supabase-js');

// Validate required environment variables
function validateEnvVars() {
  const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }
}

// Create Supabase client lazily
function createSupabaseClient() {
  validateEnvVars();
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: false,
      detectSessionInUrl: false
    }
  });
}

// Create admin client for privileged operations
function createSupabaseAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY');
  }
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// Test connection
async function testConnection() {
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('Supabase connection test result:', error.message);
    } else {
      console.log('✅ Supabase connection successful!');
    }
  } catch (err) {
    console.log('❌ Supabase connection failed:', err.message);
  }
}

module.exports = {
  createSupabaseClient,
  createSupabaseAdminClient,
  testConnection
};
