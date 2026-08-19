import React from 'react';
import { CheckCircle2, AlertCircle, HelpCircle, FileSearch, Sparkles } from 'lucide-react';

interface StatusBadgeProps {
  status: 'supported' | 'contested' | 'interpretive' | 'needs-source' | 'fixture';
  showIcon?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, showIcon = true, className = '' }) => {
  const config = {
    supported: {
      label: 'SUPPORTED',
      icon: CheckCircle2,
      border: 'border-atelier-teal/40',
      text: 'text-atelier-teal',
      bg: 'bg-atelier-teal/10'
    },
    contested: {
      label: 'CONTESTED',
      icon: AlertCircle,
      border: 'border-atelier-carmine/40',
      text: 'text-atelier-carmine',
      bg: 'bg-atelier-carmine/10'
    },
    interpretive: {
      label: 'INTERPRETIVE',
      icon: HelpCircle,
      border: 'border-atelier-lilac/40',
      text: 'text-atelier-lilac',
      bg: 'bg-atelier-lilac/10'
    },
    'needs-source': {
      label: 'NEEDS SOURCE',
      icon: FileSearch,
      border: 'border-atelier-gold/40',
      text: 'text-atelier-gold',
      bg: 'bg-atelier-gold/10'
    },
    fixture: {
      label: 'FIXTURE',
      icon: Sparkles,
      border: 'border-atelier-lilac/50',
      text: 'text-atelier-lilac',
      bg: 'bg-atelier-lilac/15'
    }
  }[status];

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded border text-[10px] font-mono uppercase tracking-wider ${config.border} ${config.text} ${config.bg} ${className}`}
    >
      {showIcon && <Icon className="w-3 h-3 shrink-0" aria-hidden="true" />}
      <span>{config.label}</span>
    </span>
  );
};
