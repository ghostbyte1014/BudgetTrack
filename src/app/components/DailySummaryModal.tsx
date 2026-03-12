import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { DailySummaryView } from './DailySummaryView';
import { supabase } from '../../lib/supabase';
import { Loader2 } from 'lucide-react';

interface DailySummaryModalProps {
  notificationId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DailySummaryModal({ notificationId, isOpen, onOpenChange }: DailySummaryModalProps) {
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && notificationId) {
      fetchSummary();
    }
  }, [isOpen, notificationId]);

  const fetchSummary = async () => {
    setIsLoading(true);
    // We fetch from daily_summary_notifications using the reference notification_id
    const { data, error } = await supabase
      .from('daily_summary_notifications')
      .select('*')
      .eq('notification_id', notificationId)
      .single();

    if (!error && data) {
      setSummary(data);
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#18181b] border-zinc-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white sr-only">Daily Transaction Summary</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        ) : summary ? (
          <DailySummaryView summary={summary} />
        ) : (
          <div className="h-64 flex items-center justify-center text-zinc-500">
            Summary data not found.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
