const fs = require('fs');
let content = fs.readFileSync('src/components/Onboarding.tsx', 'utf8');

// Replace standard titles
content = content.replace(/<h1 className="text-2xl font-fraunces font-medium text-\[var\(--libido-text\)\] uppercase tracking-wider italic font-fraunces font-medium">/g, 
  '<h1 className="text-3xl font-fraunces font-medium text-[var(--libido-text)] mb-2 leading-tight">');
content = content.replace(/Crie seu Perfil/g, 'Conte o essencial');

// "Como você deseja aparecer?"
content = content.replace(/<p className="text-\[var\(--libido-muted\)\] opacity-60 text-xs mt-1 mb-8 max-w-\[250px\] mx-auto">.*?<\/p>/s, 
  '<p className="text-[var(--libido-muted)] text-sm mb-8 mt-2 max-w-xs mx-auto">Como você deseja aparecer?</p>');

content = content.replace(/>ENTRAR NO RADAR</g, '>CONTINUAR →<');

// Fix buttons
content = content.replace(/text-black font-black py-4 mt-6 rounded-2xl text-xs uppercase tracking-widest disabled:opacity-50/g,
  'text-[var(--libido-text)] bg-gradient-to-r from-[var(--libido-accent)] to-[var(--libido-accent-hover)] font-bold py-4 mt-6 rounded-[16px] text-sm tracking-wide disabled:opacity-50 transition-all shadow-[0_4px_20px_rgba(216,107,63,0.15)] hover:shadow-[0_4px_25px_rgba(216,107,63,0.25)] hover:scale-[1.01] active:scale-[0.99] flex justify-center items-center gap-2');

// Fix radio buttons logic class (Solteiro / Casal)
// We want bg-[var(--libido-surface-2)] text-[var(--libido-muted)] opacity-60 for inactive
content = content.replace(/text-\[10px\] font-black uppercase/g, 'text-xs font-semibold');

// Labels
content = content.replace(/text-\[9px\] font-black uppercase text-\[var\(--libido-muted\)\] opacity-50 tracking-widest/g, 'text-[10px] font-bold tracking-[0.15em] uppercase text-[var(--libido-muted)] ml-1');
content = content.replace(/text-\[9px\] text-\[var\(--libido-muted\)\] opacity-60 font-bold uppercase/g, 'text-[10px] font-bold tracking-[0.15em] uppercase text-[var(--libido-muted)] ml-1');

// Header in Onboarding (Logo)
content = content.replace(/🔥 LIBIDO/g, 'LIBIDO<span className="text-[var(--libido-accent)]">.</span>');

fs.writeFileSync('src/components/Onboarding.tsx', content, 'utf8');
console.log("Onboarding updated");
