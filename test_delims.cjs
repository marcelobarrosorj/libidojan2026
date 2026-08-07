const fs = require('fs');
const path = require('path');

const dir = 'supabase/migrations';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();
let failed = false;

for (const file of files) {
    const text = fs.readFileSync(path.join(dir, file), 'utf-8');
    
    // JS Regex for multiline mode requires 'm' flag instead of (?m)
    const valid_do = (text.match(/^\s*DO\s+\$\$\s*$/gm) || []).length + (text.match(/^\s*DO\s+\$\$\s+BEGIN\s*$/gm) || []).length;
    const valid_end = (text.match(/^\s*END\s*\$\$;\s*$/gm) || []).length;
    
    const invalid_patterns = {
        'DO com um dólar': text.match(/^\s*DO\s+\$(?!\$).*$/gm) || [],
        'DO sem delimitador': text.match(/^\s*DO\s*;\s*$/gm) || [],
        'END com um dólar': text.match(/^\s*END\s+\$(?!\$)\s*;\s*$/gm) || [],
        'dólares não pareados': text.split('$$').length % 2 === 0 ? [String(text.split('$$').length - 1)] : [],
    };
    
    console.log('\nARQUIVO: ' + file);
    console.log('DO $$ válidos: ' + valid_do);
    console.log('fechamentos $$; válidos: ' + valid_end);
    console.log('total de tokens $$: ' + (text.split('$$').length - 1));
    
    for (const [name, matches] of Object.entries(invalid_patterns)) {
        console.log(name + ': ' + matches.length);
        for (const match of matches) {
            console.log(JSON.stringify(match));
        }
        if (matches.length > 0) failed = true;
    }
    
    text.split('\n').forEach((line, index) => {
        if (line.includes('DO ') || line.includes('$$;') || line.includes('END $')) {
            console.log('L' + (index + 1) + ': ' + JSON.stringify(line));
        }
    });
}

if (failed) process.exit(1);
console.log('\nAUDITORIA_LITERAL=SUCESSO');
