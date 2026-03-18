import { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

interface InfoIconProps {
  content: string | React.ReactNode;
  variant?: 'default' | 'important' | 'warning' | 'success';
  learnMoreLink?: string;
  className?: string;
  trackingId?: string;
  pulseOnFirstVisit?: boolean;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export function InfoIcon({
  content,
  variant = 'default',
  learnMoreLink,
  className = '',
  trackingId,
  pulseOnFirstVisit = false,
  side = 'top'
}: InfoIconProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldPulse, setShouldPulse] = useState(false);

  useEffect(() => {
    if (pulseOnFirstVisit && trackingId) {
      const key = `seen_tooltip_${trackingId}`;
      if (!localStorage.getItem(key)) {
        setShouldPulse(true);
      }
    }
  }, [pulseOnFirstVisit, trackingId]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && shouldPulse && trackingId) {
      setShouldPulse(false);
      localStorage.setItem(`seen_tooltip_${trackingId}`, 'true');
    }
  };

  const getVariantColor = () => {
    switch (variant) {
      case 'important': return 'text-amber-500 hover:text-amber-400';
      case 'warning': return 'text-rose-500 hover:text-rose-400';
      case 'success': return 'text-emerald-500 hover:text-emerald-400';
      default: return 'text-blue-500 hover:text-blue-400';
    }
  };

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip open={isOpen} onOpenChange={handleOpenChange}>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={`flex items-center justify-center rounded-full ml-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:ring-offset-2 focus:ring-offset-[#18181b] ${className}`}
            aria-label="More information"
            onClick={(e) => {
                e.preventDefault();
                setIsOpen(!isOpen);
            }}
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
          >
            <div className={`relative ${shouldPulse ? 'animate-pulse' : ''}`}>
              <Info className={`w-4 h-4 ${getVariantColor()}`} />
              {shouldPulse && (
                <span className={`absolute inset-0 rounded-full animate-ping opacity-75 ${getVariantColor()}`} />
              )}
            </div>
          </button>
        </TooltipTrigger>
        <TooltipContent 
          side={side}
          className="bg-zinc-900 border border-zinc-700 text-zinc-200 p-4 max-w-[320px] shadow-2xl z-[100]"
          onPointerDownOutside={() => setIsOpen(false)}
        >
          <div className="text-sm space-y-3">
            {content}
            {learnMoreLink && (
              <a 
                href={learnMoreLink}
                className="inline-block mt-2 text-blue-400 hover:text-blue-300 text-xs font-medium transition-colors"
              >
                Learn More →
              </a>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
