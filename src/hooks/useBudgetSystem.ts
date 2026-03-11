import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface PulseMetrics {
  user_id: string;
  base_balance: number;
  carry_over: number;
  total_income: number;
  total_spent: number;
  unpaid_fixed_costs: number;
  absolute_balance: number;
  days_remaining: number;
  daily_spendable: number;
  current_deficit: number;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  is_read: boolean;
  created_at: string;
}

export function useBudgetSystem() {
  const [userId, setUserId] = useState<string | null>(null);

  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false);

  // 1. Authenticate & Obtain userId automatically
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUserId(data.user.id);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUserId(session?.user?.id || null);
    });

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      authListener.subscription.unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 2. Fetch Core Engine Data
  const fetchData = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    
    try {
      // Fetch Unread Notifications Count
      const { count, error: countError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (!countError && count !== null) {
        setUnreadCount(count);
      }
    } catch (error) {
      console.error("Error fetching budget architecture:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // 3. Real-Time Engine Subscriptions
  useEffect(() => {
    fetchData();

    if (!userId) return;

    // Supabase Real-Time Engine (Listens across tables concurrently)
    const channel = supabase
      .channel('budget_engine_pulse')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${userId}` }, () => {
        fetchData(); // Silently update view numbers behind the scenes
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fixed_costs', filter: `user_id=eq.${userId}` }, () => {
        fetchData(); 
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, (payload) => {
        const payloadData = payload.new as SystemNotification;
        triggerNotificationToast(payloadData);
        fetchData(); // Refresh badge counts
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchData]);

  return { unreadCount, isLoading, isOffline, refetch: fetchData };
}

// Global Notification Dispatcher
const triggerNotificationToast = (notification: SystemNotification) => {
  // Can be replaced with react-hot-toast if available in project
  if (notification.type === 'warning') {
     console.warn(`🚨 ${notification.title}: ${notification.message}`);
     alert(`🚨 ${notification.title}: ${notification.message}`);
  } else {
     console.info(`✅ ${notification.title}: ${notification.message}`);
     alert(`✅ ${notification.title}: ${notification.message}`);
  }
};
