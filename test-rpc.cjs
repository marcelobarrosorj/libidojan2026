const { createClient } = require('@supabase/supabase-js');
const { config } = require('dotenv');
config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase.rpc('process_payment', {
    p_user_id: "test",
    p_payment_id: "test",
    p_provider: "test",
    p_status: "test",
    p_amount: 19.90
  });
  console.log('Error:', error);
}
check();
