const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE } = require('./index');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
  auth: { persistSession: false },
  realtime: {
    transport: ws
  }
});

module.exports = { supabase };
