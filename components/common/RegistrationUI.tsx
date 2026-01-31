
import React from 'react';

export const Button: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
  variant?: 'primary' | 'glass';
}> = ({ children, onClick, disabled, style, variant = 'primary' }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full py-5 px-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-30 disabled:grayscale ${
      variant === 'primary' 
        ? 'gradient-libido text-white shadow-xl shadow-pink/30 hover:brightness-110 active:scale-95' 
        : 'bg-slate-900 border border-white/5 text-slate-400 hover:text-white'
    }`}
    style={style}
  >
    {children}
  </button>
);

export const Input: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  type?: string;
}> = ({ value, onChange, placeholder, style, disabled, type = "text" }) => (
  <input
    type={type}
    value={value}
    disabled={disabled}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full bg-slate-900/60 border border-white/5 rounded-2xl py-4 px-6 text-[11px] font-bold text-white uppercase outline-none focus:border-pink/30 transition-all placeholder:text-slate-700 disabled:opacity-50 shadow-inner"
    style={style}
  />
);

export const Select: React.FC<{
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  style?: React.CSSProperties;
}> = ({ value, onChange, options, style }) => (
  <div className="relative w-full">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-slate-900/60 border border-white/5 rounded-2xl py-4 px-6 text-[11px] font-bold text-white uppercase outline-none focus:border-pink/30 transition-all appearance-none cursor-pointer"
      style={style}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
          {opt.label}
        </option>
      ))}
    </select>
    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600">
      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  </div>
);

export const StepHeader: React.FC<{ title: string; subtitle?: string; style?: React.CSSProperties }> = ({ title, subtitle, style }) => (
  <div className="text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700" style={style}>
    <h2 className="text-3xl font-black text-white font-outfit uppercase italic leading-tight tracking-tighter shadow-sm">{title}</h2>
    {subtitle && <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-3 opacity-80">{subtitle}</p>}
  </div>
);

export const Checkbox: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  style?: React.CSSProperties;
}> = ({ checked, onChange, label, style }) => (
  <label className={`w-full flex items-center gap-4 p-5 rounded-[2rem] border transition-all cursor-pointer group hover:bg-white/[0.02] ${checked ? 'bg-pink/5 border-pink/30' : 'bg-slate-900/40 border-white/5'}`} style={style}>
    <div className="relative flex items-center">
      <input 
        type="checkbox" 
        checked={checked} 
        onChange={(e) => onChange(e.target.checked)} 
        className="peer h-6 w-6 cursor-pointer appearance-none rounded-lg border-2 border-white/10 checked:bg-pink checked:border-pink transition-all"
      />
      <div className="absolute text-white h-4 w-4 left-1 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
      </div>
    </div>
    <span className="text-[10px] font-black text-slate-400 group-hover:text-white transition-colors uppercase tracking-widest leading-snug">{label}</span>
  </label>
);
