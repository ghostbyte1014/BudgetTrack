import React, { createContext, useContext, useState, useEffect } from 'react';
import { startOfMonth, endOfMonth, differenceInDays, format } from 'date-fns';
import { supabase } from '../../lib/supabase';

export interface Transaction {
  id: string;
  date: string;
  title: string;
  description?: string;
  amount: number;
  category: string;
  type: 'expense' | 'income';
  linked_fixed_cost_id?: string | null;
}

export interface FixedCost {
  id: string;
  name: string;
  amount: number;
  dueDate: number; // Day of month
  category: string;
  isSatisfied?: boolean;
}

export interface MonthlyRecord {
  month: string; // YYYY-MM
  baseBalance: number;
  carryOver: number;
  totalIncome: number;
  totalExpenses: number;
  netResult: number;
  transactions: Transaction[];
}

interface BudgetContextType {
  user: { id?: string; name: string; email: string } | null;
  login: (name: string, email: string, id?: string) => void;
  logout: () => void;
  
  // Budget settings
  baseBalance: number;
  setBaseBalance: (amount: number) => void;
  primaryGoal: string;
  setPrimaryGoal: (goal: string) => void;
  
  // Transactions
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  
  // Fixed Costs
  fixedCosts: FixedCost[];
  addFixedCost: (cost: Omit<FixedCost, 'id'>) => void;
  deleteFixedCost: (id: string) => void;
  
  // Monthly Records
  monthlyRecords: MonthlyRecord[];
  
  // Calculated values
  currentMonthPool: number;
  totalBudgetPool: number;
  totalSpentThisMonth: number;
  totalIncomeThisMonth: number;
  totalFixedCosts: number;
  dailySpendable: number;
  dailySpendableProjection: number[];
  carryOverFromLastMonth: number;
  projectedCarryOver: number;
  financialMode: 'sunny' | 'overcast' | 'stormy' | 'recovery';
  deficitTotal: number;
  markFixedCostSatisfied: (id: string, satisfied: boolean) => void;
  isLoading: boolean;
  metrics: PulseMetrics | null;
  unreadCount: number;

  // Behavioral Analytics (Phase 1-8)
  financialHealthState: {
    state: 'Stable' | 'Warning' | 'Risk' | 'Deficit' | 'Critical';
    color: string;
    message: string;
  };
  safeSpendToday: number;
  weeklyBurnRate: number;
  financialRunway: number | null;
  spendingVelocity: number;
  budgetDisciplineScore: number;
  predictiveAlert: {
    message: string;
    daysToNegative: number | null;
  } | null;
}
import { PulseMetrics } from '../../hooks/useBudgetSystem';

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id?: string, name: string; email: string } | null>(null);
  const [baseBalance, setBaseBalance] = useState(3000);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([]);
  const [monthlyRecords, setMonthlyRecords] = useState<MonthlyRecord[]>([]);
  const [primaryGoal, setPrimaryGoal] = useState<string>('Save more');
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Sync with Supabase Auth

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({ 
          id: session.user.id,
          name: session.user.user_metadata?.name || 'User', 
          email: session.user.email || '' 
        });
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ 
          id: session.user.id,
          name: session.user.user_metadata?.name || 'User', 
          email: session.user.email || '' 
        });
      } else {
        setUser(null);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);


  const fetchData = async () => {
    if (!user?.id) return;
    setIsLoading(true);

    try {
      const [transRes, costsRes, profileRes, notifRes, recordsRes] = await Promise.all([
        supabase.from('transactions').select('*').eq('user_id', user.id).order('date', { ascending: false }),
        supabase.from('fixed_costs').select('*').eq('user_id', user.id).order('due_date', { ascending: true }),
        supabase.from('profiles').select('base_balance, primary_goal').eq('id', user.id).single(),
        supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_read', false),
        supabase.from('monthly_records').select('*').eq('user_id', user.id).order('month', { ascending: false })
      ]);

      if (transRes.data) {
        const mappedTransactions = (transRes.data as any[]).map((t: any) => ({
          id: t.id,
          date: t.date,
          title: t.title,
          description: t.description,
          amount: Number(t.amount),
          category: t.category,
          type: t.type,
          linked_fixed_cost_id: t.linked_fixed_cost_id || null,
        }));
        setTransactions(mappedTransactions);
      }
      if (costsRes.data) {
        const mappedCosts = (costsRes.data as any[]).map((c: any) => ({
          id: c.id,
          name: c.name,
          amount: Number(c.amount),
          dueDate: c.due_date,
          category: c.category,
          isSatisfied: c.is_satisfied,
        }));
        setFixedCosts(mappedCosts);
      }
      if (profileRes.data) {
        setBaseBalance(Number(profileRes.data.base_balance));
        setPrimaryGoal(profileRes.data.primary_goal);
      }
      if (notifRes.count !== null) setUnreadCount(notifRes.count);
      if (recordsRes.data) {
        const mappedRecords = (recordsRes.data as any[]).map((r: any) => ({
          month: r.month,
          baseBalance: Number(r.base_balance),
          carryOver: Number(r.carry_over),
          totalIncome: Number(r.total_income),
          totalExpenses: Number(r.total_expenses),
          netResult: Number(r.net_result),
          transactions: [],
        }));
        setMonthlyRecords(mappedRecords);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    if (!user?.id) return;
    
    // Subscribe to specific tables
    const sub = supabase.channel('budget_context_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` }, () => {
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fixed_costs', filter: `user_id=eq.${user.id}` }, () => {
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` }, () => {
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, () => {
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'monthly_records', filter: `user_id=eq.${user.id}` }, () => {
        fetchData();
      })
      .subscribe();

    return () => { supabase.removeChannel(sub); };
  }, [user?.id]);


  const login = (name: string, email: string, id?: string) => {
    setUser({ name, email, id });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!user?.id) return;

    // 1. Client-Side Automation: Mark Fixed Cost Paid
    if (transaction.linked_fixed_cost_id) {
      await markFixedCostSatisfied(transaction.linked_fixed_cost_id, true);
    }

    const { data, error } = await supabase.from('transactions').insert({
      user_id: user.id,
      date: transaction.date,
      title: transaction.title,
      description: transaction.description || null,
      amount: transaction.amount,
      category: transaction.category,
      type: transaction.type,
      linked_fixed_cost_id: transaction.linked_fixed_cost_id || null,
    }).select().single();

    if (error) {
      console.error('addTransaction failed:', error);
      return;
    }

    // Optimistic update — add to local state immediately
    if (data) {
      const mapped: Transaction = {
        id: data.id,
        date: data.date,
        title: data.title,
        description: data.description || null,
        amount: Number(data.amount),
        category: data.category,
        type: data.type,
        linked_fixed_cost_id: data.linked_fixed_cost_id || null,
      };
      setTransactions(prev => [mapped, ...prev]);
    }

    // 2. Client-Side Automation: Deficit Alert
    const impact = transaction.type === 'expense' ? -transaction.amount : transaction.amount;
    const projectedPool = currentMonthPool + impact;
    
    if (projectedPool < 0 && currentMonthPool >= 0) {
      await supabase.from('notifications').insert({
        user_id: user.id,
        title: 'Deficit Alert',
        message: `Your recent transaction "${transaction.title}" pushed your balance to -₱${Math.abs(projectedPool).toFixed(2)}. Adjust spending to recover!`,
        type: 'warning'
      });
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user?.id) return;
    
    const transaction = transactions.find(t => t.id === id);
    if (transaction?.linked_fixed_cost_id) {
       await markFixedCostSatisfied(transaction.linked_fixed_cost_id, false);
    }

    // Optimistic update — remove from local state immediately
    setTransactions(prev => prev.filter(t => t.id !== id));

    await supabase.from('transactions').delete().eq('id', id).eq('user_id', user.id);
  };

  const addFixedCost = async (cost: Omit<FixedCost, 'id'>) => {
    if (!user?.id) return;
    const { data, error } = await supabase.from('fixed_costs').insert({
      user_id: user.id,
      name: cost.name,
      amount: cost.amount,
      due_date: cost.dueDate,
      category: cost.category,
    }).select().single();

    if (error) {
      console.error('addFixedCost failed:', error);
      return;
    }

    // Optimistic update
    if (data) {
      const mapped: FixedCost = {
        id: data.id,
        name: data.name,
        amount: Number(data.amount),
        dueDate: data.due_date,
        category: data.category,
        isSatisfied: data.is_satisfied,
      };
      setFixedCosts(prev => [...prev, mapped]);
    }
  };

  const deleteFixedCost = async (id: string) => {
    if (!user?.id) return;
    // Optimistic update — remove from local state immediately
    setFixedCosts(prev => prev.filter(c => c.id !== id));
    await supabase.from('fixed_costs').delete().eq('id', id).eq('user_id', user.id);
  };

  const markFixedCostSatisfied = async (id: string, satisfied: boolean) => {
    if (!user?.id) return;
    await supabase.from('fixed_costs').update({ is_satisfied: satisfied }).eq('id', id).eq('user_id', user.id);
  };

  // --- THICK FRONTEND ENGINE ---
  const currentMonth = format(new Date(), 'yyyy-MM');
  const currentMonthTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
  
  const totalSpentThisMonth = currentMonthTransactions.filter((t: Transaction) => t.type === 'expense').reduce((sum: number, t: Transaction) => sum + t.amount, 0);
  // Optional chaining fallback below to treat missing property as false
  const totalIncomeThisMonth = currentMonthTransactions.filter((t: Transaction) => t.type === 'income' && !(t as any).is_future_carryover).reduce((sum: number, t: Transaction) => sum + t.amount, 0);
  
  const totalFixedCosts = fixedCosts.reduce((sum: number, c: FixedCost) => sum + c.amount, 0);
  const unpaidFixedCosts = fixedCosts.filter((f: FixedCost) => !f.isSatisfied).reduce((sum: number, c: FixedCost) => sum + c.amount, 0);

  const currentRecord = monthlyRecords.find((r: MonthlyRecord) => r.month === currentMonth);
  const carryOverFromLastMonth = currentRecord ? currentRecord.carryOver : 0;

  const absoluteBalance = baseBalance + carryOverFromLastMonth + totalIncomeThisMonth - totalSpentThisMonth - unpaidFixedCosts;
  
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const currentDay = new Date().getDate();
  const daysRemaining = Math.max(daysInMonth - currentDay + 1, 1);
  
  const totalBudgetPool = baseBalance + carryOverFromLastMonth;
  const currentMonthPool = absoluteBalance;
  const dailySpendable = Math.max(0, absoluteBalance / daysRemaining);
  const currentDeficit = absoluteBalance < 0 ? Math.abs(absoluteBalance) : 0;

  // Calculate 5-day projection if no spending occurs starting today
  const dailySpendableProjection = Array.from({ length: 5 }, (_, i) => {
    const projectedDaysRemaining = daysRemaining - (i + 1);
    if (projectedDaysRemaining < 1) return 0;
    return Math.max(0, absoluteBalance / projectedDaysRemaining);
  });

  const projectedCarryOver = currentMonthPool;
  const financialMode = currentDeficit > 0 ? 'recovery' : 'sunny';
  const deficitTotal = currentDeficit;
  
  // Maintain backward-compatible metrics object so Dashboard wrapper doesn't break
  const generatedMetrics: PulseMetrics = {
    user_id: user?.id || '',
    base_balance: baseBalance,
    carry_over: carryOverFromLastMonth,
    total_income: totalIncomeThisMonth,
    total_spent: totalSpentThisMonth,
    unpaid_fixed_costs: unpaidFixedCosts,
    absolute_balance: absoluteBalance,
    days_remaining: daysRemaining,
    daily_spendable: dailySpendable,
    current_deficit: currentDeficit
  };

  // --- PHASE 1: FINANCIAL HEALTH STATES ---
  const totalMonthlyBudget = totalBudgetPool;
  const healthRatio = totalMonthlyBudget > 0 ? (absoluteBalance / totalMonthlyBudget) : 0;
  
  let financialHealthState: BudgetContextType['financialHealthState'];
  if (absoluteBalance < -(0.2 * totalMonthlyBudget)) {
    financialHealthState = { state: 'Critical', color: 'text-red-600', message: 'Urgent: Significant budget deficit!' };
  } else if (absoluteBalance < 0) {
    financialHealthState = { state: 'Deficit', color: 'text-rose-500', message: 'Recovery Mode: Balance below zero.' };
  } else if (healthRatio < 0.1) {
    financialHealthState = { state: 'Risk', color: 'text-orange-500', message: 'Warning: Daily allowance is shrinking.' };
  } else if (healthRatio < 0.2) {
    financialHealthState = { state: 'Warning', color: 'text-amber-500', message: 'Alert: Spending approaching limit.' };
  } else {
    financialHealthState = { state: 'Stable', color: 'text-emerald-500', message: 'Stable: Financially on track.' };
  }

  // --- PHASE 2: SAFE SPEND TODAY ---
  const billsDueToday = fixedCosts
    .filter(f => f.dueDate === currentDay && !f.isSatisfied)
    .reduce((sum, f) => sum + f.amount, 0);
  const safeSpendToday = Math.max(0, dailySpendable - billsDueToday);

  // --- PHASE 3: WEEKLY BURN RATE ---
  const startOfWeek = new Date();
  startOfWeek.setDate(currentDay - startOfWeek.getDay()); // Simple start of week (Sunday)
  const startOfWeekStr = format(startOfWeek, 'yyyy-MM-dd');
  
  const weeklyExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense' && t.date >= startOfWeekStr)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const idealWeeklyBudget = (totalMonthlyBudget / daysInMonth) * 7;
  const weeklyBurnRate = idealWeeklyBudget > 0 ? weeklyExpenses / idealWeeklyBudget : 0;

  // --- PHASE 4: FINANCIAL RUNWAY ---
  const averageDailySpend = currentDay > 1 ? totalSpentThisMonth / (currentDay - 1) : totalSpentThisMonth;
  const financialRunway = (absoluteBalance > 0 && averageDailySpend > 0) 
    ? Math.floor(absoluteBalance / averageDailySpend) 
    : null;

  // --- PHASE 6: SPENDING VELOCITY ---
  const idealSpendingToDate = (totalMonthlyBudget / daysInMonth) * currentDay;
  const spendingVelocity = idealSpendingToDate > 0 ? totalSpentThisMonth / idealSpendingToDate : 0;

  // --- PHASE 7: BUDGET DISCIPLINE SCORE ---
  let score = 100;
  // Penalty for overspending relative to budget
  if (totalSpentThisMonth > totalMonthlyBudget) {
    score -= Math.min(40, ((totalSpentThisMonth - totalMonthlyBudget) / totalMonthlyBudget) * 100);
  }
  // Penalty for deficit days (simplified as current deficit)
  if (absoluteBalance < 0) score -= 20;
  // Bonus/Penalty for bill reliability
  const paidBillsRatio = fixedCosts.length > 0 
    ? fixedCosts.filter(f => f.isSatisfied).length / fixedCosts.length 
    : 1;
  score += (paidBillsRatio - 0.5) * 20; // Up to +10 or -10
  
  const budgetDisciplineScore = Math.max(0, Math.min(100, score));

  // --- PHASE 8: PREDICTIVE OVERSPENDING ALERTS ---
  const projectedTotalSpending = averageDailySpend * daysInMonth;
  let predictiveAlert: BudgetContextType['predictiveAlert'] = null;
  
  if (projectedTotalSpending > totalMonthlyBudget) {
    const daysToNegative = absoluteBalance > 0 && averageDailySpend > 0 
      ? Math.floor(absoluteBalance / averageDailySpend) 
      : 0;
    predictiveAlert = {
      message: `At your current spending pace, your balance will become negative in approximately ${daysToNegative} days.`,
      daysToNegative
    };
  }

  return (
    <BudgetContext.Provider
      value={{
        user,
        login,
        logout,
        baseBalance,
        setBaseBalance,
        primaryGoal,
        setPrimaryGoal,
        transactions,
        addTransaction,
        deleteTransaction,
        fixedCosts,
        addFixedCost,
        deleteFixedCost,
        monthlyRecords,
        currentMonthPool,
        totalBudgetPool,
        totalSpentThisMonth,
        totalIncomeThisMonth,
        totalFixedCosts,
        dailySpendable,
        dailySpendableProjection,
        carryOverFromLastMonth,
        projectedCarryOver,
        financialMode,
        deficitTotal,
        markFixedCostSatisfied,
        isLoading,
        metrics: generatedMetrics,
        unreadCount,
        financialHealthState,
        safeSpendToday,
        weeklyBurnRate,
        financialRunway,
        spendingVelocity,
        budgetDisciplineScore,
        predictiveAlert
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within BudgetProvider');
  }
  return context;
}