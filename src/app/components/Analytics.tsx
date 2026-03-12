import { useState } from 'react';
import { useBudget } from '../contexts/BudgetContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { TrendingUp, TrendingDown, AlertCircle, Target, Activity, Clock, Zap, ChevronUp, ChevronDown } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, differenceInDays } from 'date-fns';

export function Analytics() {
  const {
    currentMonthPool,
    totalSpentThisMonth,
    totalFixedCosts,
    projectedCarryOver,
    transactions,
    baseBalance,
    carryOverFromLastMonth,
    metrics,
    fixedCosts,
    weeklyBurnRate,
    financialRunway,
    spendingVelocity,
  } = useBudget();
  const [isMetricsExpanded, setIsMetricsExpanded] = useState(true);

  // Calculate ideal spending path (linear)
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const daysInMonth = differenceInDays(monthEnd, monthStart) + 1;
  const totalBudget = (metrics?.absolute_balance ?? 0) + totalSpentThisMonth + totalFixedCosts;
  // Ideal spending only targets the variable budget (Total Pool - Fixed Costs)
  const variableBudget = totalBudget - totalFixedCosts;
  const dailyIdealSpend = variableBudget / daysInMonth;

  // Generate data for the burn-down chart
  const chartData = eachDayOfInterval({ start: monthStart, end: today }).map(date => {
    const dayNumber = differenceInDays(date, monthStart) + 1;

    // Ideal spending (linear decrease)
    const idealSpent = dailyIdealSpend * dayNumber;

    // Actual spending up to this day
    const actualSpent = transactions
      .filter(t => t.type === 'expense' && new Date(t.date) <= date && t.date.startsWith(format(today, 'yyyy-MM')))
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      date: format(date, 'MMM d'),
      dayNumber,
      idealSpent: parseFloat(idealSpent.toFixed(2)),
      actualSpent: parseFloat(actualSpent.toFixed(2)),
      remaining: parseFloat((totalBudget - actualSpent).toFixed(2)),
    };
  });

  // Category breakdown
  const categoryData = transactions
    .filter(t => t.type === 'expense' && t.date.startsWith(format(today, 'yyyy-MM')))
    .reduce((acc, t) => {
      if (!acc[t.category]) {
        acc[t.category] = 0;
      }
      acc[t.category] += t.amount;
      return acc;
    }, {} as Record<string, number>);

  // Group fixed costs by category
  const fixedCostCategoryData = fixedCosts.reduce((acc, fc) => {
    if (!acc[fc.category]) {
      acc[fc.category] = 0;
    }
    acc[fc.category] += fc.amount;
    return acc;
  }, {} as Record<string, number>);

  const categoryChartData = [
    ...Object.entries(categoryData)
      .map(([category, amount]) => ({
        category,
        amount: parseFloat(amount.toFixed(2)),
        percentage: ((amount / (totalSpentThisMonth + totalFixedCosts)) * 100).toFixed(1),
        isFixedCost: false
      })),
    ...Object.entries(fixedCostCategoryData)
      .map(([category, amount]) => ({
        category: category,
        amount: parseFloat(amount.toFixed(2)),
        percentage: ((amount / (totalSpentThisMonth + totalFixedCosts)) * 100).toFixed(1),
        isFixedCost: true
      }))
  ].sort((a, b) => b.amount - a.amount);

  // Calculate burn rate
  const daysElapsed = differenceInDays(today, monthStart) + 1;
  const actualDailyBurn = totalSpentThisMonth / daysElapsed;
  const isOnTrack = actualDailyBurn <= dailyIdealSpend;

  // Projected month-end balance
  const daysRemaining = differenceInDays(monthEnd, today);
  const projectedTotalSpend = totalSpentThisMonth + (actualDailyBurn * daysRemaining);
  const projectedEndBalance = totalBudget - projectedTotalSpend - totalFixedCosts;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">The Forecast</h1>
          <p className="text-zinc-400">Analyze spending patterns and project future performance</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMetricsExpanded(!isMetricsExpanded)}
          className="text-zinc-400 hover:text-white"
        >
          {isMetricsExpanded ? (
            <><ChevronUp className="w-4 h-4 mr-2" /> Hide Metrics</>
          ) : (
            <><ChevronDown className="w-4 h-4 mr-2" /> Show Metrics</>
          )}
        </Button>
      </div>

      {/* Key Metrics */}
      {isMetricsExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* Behavioral Metrics (New) */}
          <Card className="bg-[#18181b] border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-zinc-400">Weekly Burn Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-2xl font-bold ${weeklyBurnRate > 1 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {(weeklyBurnRate * 100).toFixed(1)}%
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Activity className={`w-3 h-3 ${weeklyBurnRate > 1 ? 'text-rose-500' : 'text-emerald-500'}`} />
                    <p className="text-[10px] text-zinc-500">
                      {weeklyBurnRate > 1 ? 'Faster than planned' : 'Controlled pace'}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={weeklyBurnRate <= 1
                    ? 'border-emerald-500/50 text-emerald-500'
                    : 'border-rose-500/50 text-rose-500'}
                >
                  {weeklyBurnRate.toFixed(2)}x
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#18181b] border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-zinc-400">Financial Runway</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-2xl font-bold ${(financialRunway ?? 0) > 10 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {financialRunway !== null ? `${financialRunway} Days` : 'Determining...'}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3 text-zinc-500" />
                    <p className="text-[10px] text-zinc-500">Estimated survival</p>
                  </div>
                </div>
                <TrendingUp className={`w-8 h-8 ${(financialRunway ?? 0) > 10 ? 'text-emerald-500' : 'text-rose-500'}`} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#18181b] border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-zinc-400">Spending Velocity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-2xl font-bold ${spendingVelocity > 1 ? 'text-rose-500' : 'text-blue-500'}`}>
                    {spendingVelocity.toFixed(2)}x
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Zap className={`w-3 h-3 ${spendingVelocity > 1 ? 'text-rose-500' : 'text-blue-500'}`} />
                    <p className="text-[10px] text-zinc-500">Relative to ideal path</p>
                  </div>
                </div>
                <Target className={`w-8 h-8 ${spendingVelocity > 1 ? 'text-rose-500' : 'text-blue-500'}`} />
              </div>
            </CardContent>
          </Card>

          {/* Traditional Metrics (Restored) */}
          <Card className="bg-[#18181b] border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-zinc-400">Current Burn Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-white whitespace-nowrap overflow-hidden text-ellipsis">
                    ₱{actualDailyBurn.toFixed(2)}<span className="text-sm font-normal text-zinc-500">/day</span>
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    Target: ₱{dailyIdealSpend.toFixed(2)}/day
                  </p>
                  <p className="text-[10px] text-zinc-600 mt-2 italic">
                    *Excludes recurring bills (₱{totalFixedCosts.toLocaleString()})
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={isOnTrack
                    ? 'border-emerald-500/50 text-emerald-500'
                    : 'border-rose-500/50 text-rose-500'}
                >
                  {isOnTrack ? 'On Track' : 'Over'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#18181b] border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-zinc-400">Projected Month-End</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-2xl font-bold ${projectedEndBalance > 0 ? 'text-emerald-500' : 'text-rose-500'
                    }`}>
                    {projectedEndBalance > 0 ? '+' : ''}₱{projectedEndBalance.toFixed(0)}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    Estimated carry-over
                  </p>
                </div>
                {projectedEndBalance > 0 ? (
                  <TrendingUp className="w-8 h-8 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-8 h-8 text-rose-500" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#18181b] border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-zinc-400">Days Remaining</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">
                    {daysRemaining}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    until month end
                  </p>
                </div>
                <Target className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Spending vs Ideal Path */}
      <Card className="bg-[#18181b] border-zinc-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Actual vs Ideal Spending Path</CardTitle>
              <CardDescription className="text-zinc-400">
                Pacing for variable spending (Base Budget - Recurring Bills)
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className={`flex items-center gap-1 ${spendingVelocity > 1 ? 'border-rose-500 text-rose-500' : 'border-blue-500 text-blue-500'}`}
            >
              <Zap className="w-3 h-3" />
              Velocity: {spendingVelocity.toFixed(2)}x
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="idealGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isOnTrack ? "#22c55e" : "#ef4444"} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={isOnTrack ? "#22c55e" : "#ef4444"} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis
                  dataKey="date"
                  stroke="#71717a"
                  tick={{ fill: '#71717a', fontSize: 12 }}
                />
                <YAxis
                  stroke="#71717a"
                  tick={{ fill: '#71717a', fontSize: 12 }}
                  tickFormatter={(value) => `₱${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value: any) => [`₱${value.toFixed(2)}`, '']}
                  labelStyle={{ color: '#a1a1aa' }}
                />
                <Legend
                  wrapperStyle={{ color: '#71717a' }}
                  iconType="line"
                />
                <Area
                  type="monotone"
                  dataKey="idealSpent"
                  stroke="#3b82f6"
                  fill="url(#idealGradient)"
                  name="Ideal Spending"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="actualSpent"
                  stroke={isOnTrack ? "#22c55e" : "#ef4444"}
                  fill="url(#actualGradient)"
                  name="Actual Spending"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-zinc-400">
              No spending data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card className="bg-[#18181b] border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Spending by Category</CardTitle>
          <CardDescription className="text-zinc-400">
            Total monthly allocation including recurring bills
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categoryChartData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis
                    dataKey="category"
                    stroke="#71717a"
                    tick={{ fill: '#71717a', fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    stroke="#71717a"
                    tick={{ fill: '#71717a', fontSize: 12 }}
                    tickFormatter={(value) => `₱${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      border: '1px solid #27272a',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value: any, name: string, props: any) => [
                      `₱${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${props.payload.percentage}%)`,
                      'Amount'
                    ]}
                  />
                  <Bar
                    dataKey="amount"
                    radius={[8, 8, 0, 0]}
                  >
                    {categoryChartData.map((entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.isFixedCost ? '#3b82f6' : '#22c55e'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-6 border-t border-zinc-800/50 pt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
                  <span className="text-xs text-zinc-400">Regular Spending</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#3b82f6]" />
                  <span className="text-xs text-zinc-400">Recurring bills</span>
                </div>
              </div>
            </>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-zinc-400">
              No category data available
            </div>
          )}
        </CardContent>
      </Card>


      {/* Insights */}
      <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-500" />
            Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!isOnTrack && (
            <div className="flex gap-3 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg">
              <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium text-sm">Spending Above Target</p>
                <p className="text-sm text-zinc-400 mt-1">
                  You're spending ₱{(actualDailyBurn - dailyIdealSpend).toFixed(2)} more per day than your ideal rate.
                  Consider reducing discretionary expenses to stay on track.
                </p>
              </div>
            </div>
          )}

          {isOnTrack && projectedCarryOver > 0 && (
            <div className="flex gap-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
              <TrendingUp className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium text-sm">Great Job!</p>
                <p className="text-sm text-zinc-400 mt-1">
                  You're on track to carry over ₱{projectedCarryOver.toFixed(0)} to next month.
                  Keep up the good work!
                </p>
              </div>
            </div>
          )}

          {categoryChartData.length > 0 && (
            <div className="flex gap-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <Target className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium text-sm">Top Spending Category</p>
                <p className="text-sm text-zinc-400 mt-1">
                  <span className="text-white font-medium">{categoryChartData[0].category}</span> accounts for{' '}
                  {categoryChartData[0].percentage}% of your spending (₱{categoryChartData[0].amount.toFixed(2)}).
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}