const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://hkuwlazwtxwfffnpgfdd.supabase.co', 'sb_publishable_jnteoNon4vEhWscOanGZDw_i6NGG6fI');

async function testRpc() {
  const txRes = await supabase.from('payment_transactions').select('*').limit(1);
  console.log('payment_transactions data:', txRes.data);

  const usersRes = await supabase.from('users').select('*').limit(1);
  console.log('users data:', usersRes.data);
  
  const profilesRes = await supabase.from('user_profiles').select('*').limit(1);
  console.log('user_profiles data:', profilesRes.data);

  const postsRes = await supabase.from('posts').select('*').limit(1);
  console.log('posts data:', postsRes.data);
}
testRpc();
