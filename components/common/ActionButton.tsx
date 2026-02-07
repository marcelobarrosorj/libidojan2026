
import React from 'react';
import { Loader2 } from 'lucide-react';

interface ActionButtonProps {
  label: string;
  loadingLabel?: string;
  onClick: () => void | Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'glass' | 'danger' | 'amber';
  className?: string;
  type?: 'button' | 'submit';
}

const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  loadingLabel = 'Aguarde...',
  onClick,
  loading = false,
  disabled = false,
  icon,
  variant = 'primary',
  className = '',
  type = 'button'
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'gradient-libido text-white shadow-xl shadow-amber-500/20 hover:brightness-110 active:scale-95';
      case 'secondary':
        return 'gradient-purple text-white shadow-xl shadow-purple-600/20 hover:brightness-110 active:scale-95';
      case 'glass':
        return 'bg-slate-900 border-2 border-amber-500/30 text-amber-500 hover:bg-amber-500/10 active:scale-95';
      case 'amber':
        return 'bg-amber-500 text-black shadow-xl shadow-amber-500/30 hover:bg-amber-400 active:scale-95';
      case 'danger':
        return 'bg-slate-900 border-2 border-rose-500/30 text-rose-500 hover:bg-rose-500/10 active:scale-95';
      default:
        return '';
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        relative w-full py-4 px-6 rounded-2xl font-black uppercase tracking-widest text-xs 
        transition-all duration-300 flex items-center justify-center gap-3
        disabled:opacity-50 disabled:grayscale disabled:pointer-events-none
        ${getVariantClasses()}
        ${className}
      `}
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin" size={18} />
          <span>{loadingLabel}</span>
        </>
      ) : (
        <>
          {icon}
          <span>{label}</span>
        </>
      )}
    </button>
  );
};

export default ActionButton;
