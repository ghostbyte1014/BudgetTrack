import { useBudget } from '../contexts/BudgetContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Zap, Bell, Heart, ShieldCheck, AlertTriangle, Info } from 'lucide-react';
import { format } from 'date-fns';
import { SettingsDialog } from './SettingsDialog';
import { BudgetProjection } from './BudgetProjection';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

export function Dashboard() {
  const {
    primaryGoal,
    metrics,
    unreadCount,
    isLoading,
    currentMonthPool,
    totalBudgetPool,
    totalSpentThisMonth,
    totalFixedCosts,
    carryOverFromLastMonth,
    baseBalance,
    projectedCarryOver,
    financialHealthState,
    safeSpendToday,
    predictiveAlert,
    currencySymbol,
  } = useBudget();

  const dailySpendable = metrics?.daily_spendable ?? 0;
  const isRecoveryMode = (metrics?.current_deficit ?? 0) > 0;
  const deficitTotal = metrics?.current_deficit ?? 0;
  const totalIncome = metrics?.total_income ?? 0;
  const financialMode = isRecoveryMode ? 'recovery' : 'sunny';

  const getGoalColors = () => {
    switch (primaryGoal) {
      case 'Stop overspending':
        return {
          card: 'from-amber-900/20 to-amber-800/20 border-amber-700/50',
          icon: 'text-amber-500',
          amount: dailySpendable > 0 ? 'text-amber-500' : 'text-rose-500',
          progress: 'bg-amber-500',
        };
      case 'Track debt':
        return {
          card: 'from-blue-900/20 to-blue-800/20 border-blue-700/50',
          icon: 'text-blue-500',
          amount: dailySpendable > 0 ? 'text-blue-500' : 'text-rose-500',
          progress: 'bg-blue-500',
        };
      case 'Save more':
      default:
        return {
          card: 'from-emerald-900/20 to-emerald-800/20 border-emerald-700/50',
          icon: 'text-emerald-500',
          amount: dailySpendable > 0 ? 'text-emerald-500' : 'text-rose-500',
          progress: 'bg-emerald-500',
        };
    }
  };

  const goalColors = getGoalColors();
  const totalBudget = totalBudgetPool;
  const totalUsed = totalSpentThisMonth + totalFixedCosts;
  const progressPercentage = (totalUsed / totalBudget) * 100;
  const isOnTrack = projectedCarryOver >= 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold mb-2 ${isRecoveryMode ? 'text-rose-500' : 'text-white'}`}>
            {isRecoveryMode ? 'Recovery Mode' : 'The Pulse'}
          </h1>
          <p className="text-zinc-400">{format(new Date(), 'MMMM d, yyyy')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {unreadCount > 0 && (
            <Badge variant="default" className="bg-blue-600 hover:bg-blue-700 text-white animate-pulse flex items-center gap-1">
              <Bell className="w-3 h-3" />
              {unreadCount} Alerts
            </Badge>
          )}
          <Badge 
            variant="outline" 
            className={`flex items-center gap-1 border-current ${financialHealthState.color} bg-zinc-900/50`}
          >
            <Heart className="w-3 h-3 fill-current" />
            {financialHealthState.state}
          </Badge>
          <Badge variant="outline" className="border-zinc-700 text-zinc-400">
            Goal: {primaryGoal}
          </Badge>
          <SettingsDialog />
        </div>
      </div>

      {predictiveAlert && (
        <Card className="bg-amber-500/10 border-amber-500/50 border animate-in fade-in slide-in-from-top-4 duration-500">
          <CardContent className="py-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
            </div>
            <div className="flex-1">
              <p className="text-amber-200 text-sm font-medium">Predictive Overspending Alert</p>
              <p className="text-amber-500/80 text-xs">{predictiveAlert.message}</p>
            </div>
            <Badge variant="outline" className="border-amber-500/50 text-amber-500 whitespace-nowrap">
              {predictiveAlert.daysToNegative ?? 0} Days Until Deficit
            </Badge>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <div className="animate-pulse text-zinc-500 text-sm">Loading core engine metrics...</div>
      )}

      {/* Carry-Over Badge */}
      {carryOverFromLastMonth !== 0 && (
        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${carryOverFromLastMonth > 0 ? 'bg-emerald-500/20' : 'bg-rose-500/20'
                  }`}>
                  {carryOverFromLastMonth > 0 ? (
                    <TrendingUp className="w-6 h-6 text-emerald-500" />
                  ) : (
                    <TrendingDown className="w-6 h-6 text-rose-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-zinc-400">
                    Inherited from {format(new Date(new Date().setMonth(new Date().getMonth() - 1)), 'MMMM')}
                  </p>
                  <p className={`text-2xl font-bold ${carryOverFromLastMonth > 0 ? 'text-emerald-500' : 'text-rose-500'
                    }`}>
                    {carryOverFromLastMonth > 0 ? '+' : ''}{currencySymbol}{Math.abs(carryOverFromLastMonth).toLocaleString()}
                  </p>
                </div>
              </div>
              <Badge
                variant="outline"
                className={carryOverFromLastMonth > 0
                  ? 'border-emerald-500/50 text-emerald-500'
                  : 'border-rose-500/50 text-rose-500'}
              >
                {carryOverFromLastMonth > 0 ? 'Surplus' : 'Deficit'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daily Spendable - Main Gauge */}
      <Card className={`bg-gradient-to-br border shadow-lg transition-all duration-500 ${goalColors.card}`}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className={`w-5 h-5 ${goalColors.icon}`} />
            Today's Spendable Amount
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Adjusted for your goal: {primaryGoal}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className={`text-7xl font-bold mb-4 tracking-tighter ${financialMode === 'recovery' ? 'text-zinc-600' : goalColors.amount}`}>
              {currencySymbol}{Math.abs(dailySpendable).toFixed(2)}
            </div>
            {financialMode === 'recovery' ? (
              <div className="space-y-2 mt-4 max-w-sm mx-auto">
                <p className="text-rose-500 text-sm font-medium">
                  Earn or save <span className="font-bold">{currencySymbol}{deficitTotal.toFixed(2)}</span> more to restore your Daily Pulse.
                </p>
                <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 w-full animate-pulse" />
                </div>
              </div>
            ) : (
              <p className="text-zinc-400 text-sm">
                {dailySpendable > 0
                  ? primaryGoal === 'Stop overspending'
                    ? 'Strict limit to prevent overspending'
                    : 'Safe to spend while staying on track'
                  : 'Budget exceeded - adjust spending immediately'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Safe Spend Today - Secondary Gauge */}
      <Card className="bg-zinc-900/50 border-zinc-800 shadow-sm">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-zinc-400 font-medium">Safe Spend Today</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold text-white">{currencySymbol}{safeSpendToday.toFixed(2)}</p>
                  <TooltipProvider>
                    <Tooltip shadow-none>
                      <TooltipTrigger>
                        <Info className="w-3 h-3 text-zinc-500" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-300 text-xs max-w-xs">
                        Accounts for unpaid bills due today and your daily allowance.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Health Status</p>
              <p className={`text-sm font-semibold ${financialHealthState.color}`}>
                {financialHealthState.message}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Projection Section */}
      <BudgetProjection />

      {/* Month at a Glance */}
      <Card className="bg-[#18181b] border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Month at a Glance
          </CardTitle>
          <CardDescription className="text-zinc-400">
            {format(new Date(), 'MMMM yyyy')} budget depletion
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-zinc-400">Used</span>
              <span className="text-white font-medium">
                {currencySymbol}{totalUsed.toLocaleString()} / {currencySymbol}{totalBudget.toLocaleString()}
              </span>
            </div>
            <Progress
              value={Math.min(progressPercentage, 100)}
              className="h-3 bg-zinc-800"
              indicatorClassName={progressPercentage > 100 ? 'bg-rose-500' : goalColors.progress}
            />
            <p className="text-xs text-zinc-500 mt-2">
              {progressPercentage.toFixed(1)}% of total budget used
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
            <div>
              <p className="text-xs text-zinc-400 mb-1">Projected Carry-Over</p>
              <p className={`text-xl font-bold ${projectedCarryOver > 0 ? (primaryGoal === 'Save more' ? 'text-emerald-500' : goalColors.icon) : 'text-rose-500'
                }`}>
                {projectedCarryOver > 0 ? '+' : ''}{currencySymbol}{projectedCarryOver.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-400 mb-1">Status</p>
              <Badge
                variant="outline"
                className={isOnTrack
                  ? `border-${goalColors.icon.split('-')[1]}-500/50 ${goalColors.icon}`
                  : 'border-rose-500/50 text-rose-500'}
              >
                {isOnTrack ? 'On Track' : 'Over Budget'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Breakdown */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="bg-[#18181b] border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-zinc-400">Base Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-white truncate">
                {currencySymbol}{baseBalance.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#18181b] border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-zinc-400">Total Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-white truncate">
                  {currencySymbol}{totalBudgetPool.toLocaleString()}
                </p>
                <p className="text-xs text-zinc-500">Base + Inherited</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#18181b] border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-zinc-400">Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-white truncate">
                  {currencySymbol}{totalIncome.toLocaleString()}
                </p>
                <p className="text-xs text-zinc-500">This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#18181b] border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-zinc-400">Fixed Costs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-white truncate">
                {currencySymbol}{totalFixedCosts.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#18181b] border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-zinc-400">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-500/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-rose-500" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-white truncate">
                {currencySymbol}{totalSpentThisMonth.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}