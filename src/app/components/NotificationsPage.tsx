import { useEffect, useState } from 'react';
import { useBudgetSystem, SystemNotification } from '../../hooks/useBudgetSystem';
import { useBudget } from '../contexts/BudgetContext';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Bell, CheckCircle2, AlertTriangle, Info, Trash2 } from 'lucide-react';

export function NotificationsPage() {
  const { unreadCount, refetch } = useBudgetSystem();
  const { user } = useBudget();
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserNotifications = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setNotifications(data as SystemNotification[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUserNotifications();
  }, [user?.id]);

  const markAsRead = async (id: string) => {
    if (!user?.id) return;

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', user.id);
    
    // Optimistic update
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    );
    refetch(); // Trigger hook to update global badge
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    refetch();
  };

  const deleteNotification = async (id: string) => {
    if (!user?.id) return;

    await supabase
      .from('notifications')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
      
    setNotifications(prev => prev.filter(n => n.id !== id));
    refetch();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-5 h-5 text-rose-500" />;
      case 'success': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Bell className="w-8 h-8 text-emerald-500" />
            System Alerts
          </h1>
          <p className="text-zinc-400">Manage your BudgetFlow proactive notifications</p>
        </div>
        
        {unreadCount > 0 && (
          <Button 
            onClick={markAllAsRead}
            variant="outline" 
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            Mark all as read
          </Button>
        )}
      </div>

      <Card className="bg-[#18181b] border-zinc-800">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-zinc-500 animate-pulse">Loading alerts...</div>
          ) : notifications.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-zinc-600" />
              </div>
              <h3 className="text-xl font-medium text-zinc-300 mb-2">You're all caught up!</h3>
              <p className="text-zinc-500">The proactive system will notify you of any issues.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/50">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-6 flex gap-4 transition-colors ${
                    notification.is_read ? 'bg-transparent' : 'bg-emerald-500/5 hover:bg-emerald-500/10'
                  }`}
                >
                  <div className="mt-1">
                    {getIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-semibold ${notification.is_read ? 'text-zinc-300' : 'text-white'}`}>
                        {notification.title}
                        {!notification.is_read && (
                          <Badge className="ml-3 bg-emerald-500 hover:bg-emerald-600 text-white border-0">New</Badge>
                        )}
                      </h4>
                      <span className="text-xs text-zinc-500">
                        {new Date(notification.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className={`text-sm ${notification.is_read ? 'text-zinc-500' : 'text-zinc-400'}`}>
                      {notification.message}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 justify-center pl-4 border-l border-zinc-800/50 ml-4">
                    {!notification.is_read && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Mark Read
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-8 text-xs text-rose-500/70 hover:text-rose-400 hover:bg-rose-500/10"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
