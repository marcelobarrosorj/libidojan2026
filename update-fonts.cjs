const fs = require('fs');
const path = require('path');

const directory = './src';

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace "font-outfit" with "font-fraunces" if present (or just add font-fraunces to large headings)
    content = content.replace(/font-outfit/g, 'font-fraunces font-medium');
    
    // Some titles might just be "font-bold" or "font-black"
    // We want to add font-fraunces to h1, h2, h3 and some specific texts.
    // Replace text-2xl font-black with font-fraunces text-2xl font-medium
    content = content.replace(/text-2xl font-black/g, 'text-2xl font-fraunces font-medium');
    content = content.replace(/text-3xl font-bold/g, 'text-3xl font-fraunces font-medium');
    content = content.replace(/text-2xl font-bold/g, 'text-2xl font-fraunces font-medium');

    // Remove uppercase and tracking-wider from titles that now use Fraunces, as Fraunces usually looks better without uppercase and heavy tracking.
    // Wait, let's just let it be, Fraunces can handle uppercase if needed, but the design shows sentence case for "Calor que convida."
    // Let's replace "uppercase tracking-widest" on headings.
    
    // Remove shadow-[#ffb300]
    content = content.replace(/shadow-\[#ffb300\]/g, 'shadow-[var(--libido-accent)]');
    
    if (original !== content) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated fonts in ${filePath}`);
    }
}

function walkDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            replaceInFile(fullPath);
        }
    });
}

walkDir(directory);
