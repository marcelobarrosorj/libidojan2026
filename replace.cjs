const fs = require('fs');
const path = require('path');

const directory = './src';

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Backgrounds
    content = content.replace(/bg-\[#0a0a0f\]/g, 'bg-[var(--libido-bg)]');
    content = content.replace(/bg-\[#0b0b0b\]/g, 'bg-[var(--libido-bg)]');
    content = content.replace(/bg-\[#000000\]/g, 'bg-[var(--libido-black)]');
    content = content.replace(/bg-\[#050508\]/g, 'bg-[var(--libido-surface)]');
    content = content.replace(/bg-\[#12121a\]/g, 'bg-[var(--libido-surface-2)]');
    content = content.replace(/bg-\[#ffb300\]/g, 'bg-[var(--libido-accent)]');
    content = content.replace(/bg-yellow-500/g, 'bg-[var(--libido-accent)]');
    content = content.replace(/bg-\[#1c1c1c\]/g, 'bg-[var(--libido-surface-2)]');
    
    // Text colors
    content = content.replace(/text-\[#ffb300\]/g, 'text-[var(--libido-accent)]');
    content = content.replace(/text-yellow-500/g, 'text-[var(--libido-accent)]');
    content = content.replace(/text-white\/30/g, 'text-[var(--libido-muted)] opacity-50');
    content = content.replace(/text-white\/40/g, 'text-[var(--libido-muted)] opacity-60');
    content = content.replace(/text-white\/50/g, 'text-[var(--libido-muted)] opacity-70');
    content = content.replace(/text-white\/60/g, 'text-[var(--libido-muted)] opacity-80');
    content = content.replace(/text-white\/70/g, 'text-[var(--libido-muted)] opacity-90');
    content = content.replace(/text-white\/80/g, 'text-[var(--libido-muted)]');
    content = content.replace(/text-white/g, 'text-[var(--libido-text)]');
    
    // Borders
    content = content.replace(/border-white\/5/g, 'border-[var(--libido-border)]');
    content = content.replace(/border-white\/10/g, 'border-[var(--libido-border)]');
    content = content.replace(/border-\[#ffb300\]/g, 'border-[var(--libido-accent)]');
    content = content.replace(/border-yellow-500\/30/g, 'border-[var(--libido-accent)] opacity-30');

    if (original !== content) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
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
