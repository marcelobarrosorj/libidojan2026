const fs = require('fs');
let content = fs.readFileSync('src/components/Feed.tsx', 'utf8');

const headerHTML = `<div className="flex flex-col mb-6 mt-2">
  <div className="text-[var(--libido-accent)] text-[10px] font-bold tracking-[0.2em] uppercase mb-1">Boa noite</div>
  <div className="flex justify-between items-center">
    <h1 className="text-3xl font-fraunces font-medium text-[var(--libido-text)]">Descobrir</h1>
    <button className="text-[var(--libido-muted)]"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="4" x2="14" y2="4"></line><line x1="10" y1="4" x2="3" y2="4"></line><line x1="21" y1="12" x2="12" y2="12"></line><line x1="8" y1="12" x2="3" y2="12"></line><line x1="21" y1="20" x2="16" y2="20"></line><line x1="12" y1="20" x2="3" y2="20"></line><line x1="14" y1="2" x2="14" y2="6"></line><line x1="8" y1="10" x2="8" y2="14"></line><line x1="16" y1="18" x2="16" y2="22"></line></svg></button>
  </div>
</div>`;

content = content.replace(/<div className="flex-1 flex flex-col p-5 bg-\[var\(--libido-bg\)\] text-\[var\(--libido-text\)\] overflow-y-auto no-scrollbar min-h-0">/, 
  `<div className="flex-1 flex flex-col p-5 bg-[var(--libido-bg)] text-[var(--libido-text)] overflow-y-auto no-scrollbar min-h-0">
      ${headerHTML}`);

fs.writeFileSync('src/components/Feed.tsx', content, 'utf8');
console.log("Feed updated");
