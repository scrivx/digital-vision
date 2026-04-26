type BadgeVariant = 'default' | 'success' | 'error' | 'warning' | 'primary' | 'muted';

const variants: Record<BadgeVariant, string> = {
  default:  'bg-[#F1F5F9] text-[#475569]',
  primary:  'bg-[#EFF6FF] text-[#2563EB]',
  success:  'bg-[#ECFDF5] text-[#059669]',
  error:    'bg-[#FEF2F2] text-[#DC2626]',
  warning:  'bg-[#FFFBEB] text-[#D97706]',
  muted:    'bg-[#F8FAFC] text-[#94A3B8] border border-[#E2E8F0]',
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export default function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold',
        variants[variant],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
}
