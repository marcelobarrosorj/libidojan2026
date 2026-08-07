const fs = require('fs');
const path = 'supabase/migrations/20260730150000_reconcile_core_schema.sql';
let content = fs.readFileSync(path, 'utf8');

// Use a function to avoid the special replacement pattern "$$"
content = content.replace(/DO \$ BEGIN/g, () => 'DO $$ BEGIN');
content = content.replace(/END \$;/g, () => 'END $$;');

fs.writeFileSync(path, content);
console.log('Fixed core syntax again');
