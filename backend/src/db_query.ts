import { getAdminSupabase } from './config/supabase.js';
async function run() {
  const { data, error } = await getAdminSupabase().from('users').select('*').limit(1);
  if (error) console.error(error);
  else console.log(Object.keys(data[0] || {}));
}
run();
