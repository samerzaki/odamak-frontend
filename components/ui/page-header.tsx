import { cn } from '@/lib/utils';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  lead?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ eyebrow, title, lead, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex items-end gap-4 flex-wrap justify-between', className)}>
      <div>
        {eyebrow && <div className="text-[12px] font-medium text-gold mb-1">{eyebrow}</div>}
        <h1 className="font-heading text-[20px] md:text-[23px] font-semibold text-text">{title}</h1>
        {lead && <p className="mt-1.5 text-[13px] text-muted">{lead}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
