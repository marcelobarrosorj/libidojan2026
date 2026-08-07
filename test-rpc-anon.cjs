const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://hkuwlazwtxwfffnpgfdd.supabase.co', 'sb_publishable_jnteoNon4vEhWscOanGZDw_i6NGG6fI');

async function testRpc() {
  const { data, error } = await supabase.rpc('process_payment', {
    p_user_id: "test",
    p_payment_id: "test",
    p_provider: "test",
    p_status: "test",
    p_amount: 19.90
  });
  console.log('RPC process_payment error:', error ? error.message : data);

  const txRes = await supabase.from('payment_transactions').select('*').limit(1);
  console.log('payment_transactions error:', txRes.error ? txRes.error.message : 'SUCCESS');

  const usersRes = await supabase.from('users').select('*').limit(1);
  console.log('users error:', usersRes.error ? usersRes.error.message : 'SUCCESS');
  
  const profilesRes = await supabase.from('user_profiles').select('*').limit(1);
  console.log('user_profiles error:', profilesRes.error ? profilesRes.error.message : 'SUCCESS');

  const postsRes = await supabase.from('posts').select('*').limit(1);
  console.log('posts error:', postsRes.error ? postsRes.error.message : 'SUCCESS');
}
testRpc();
