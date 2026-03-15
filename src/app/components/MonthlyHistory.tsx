import { useBudget } from '../contexts/BudgetContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { TrendingUp, TrendingDown, Calendar as CalendarIcon, Target } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export function MonthlyHistory() {
  const {
    monthlyRecords,
    baseBalance,
    budgetDisciplineScore,
    totalSpentThisMonth,
    totalIncomeThisMonth,
    totalBudgetPool,
    carryOverFromLastMonth,
    currentMonthPool,
    totalFixedCosts,
    transactions,
    currencySymbol
  } = useBudget();

  // Create a synthetic "Live" record for the current month
  const currentMonthStr = format(new Date(), 'yyyy-MM');
  const liveRecord: any = {
    month: currentMonthStr,
    baseBalance: baseBalance,
    carryOver: carryOverFromLastMonth,
    totalIncome: totalIncomeThisMonth,
    totalExpenses: totalSpentThisMonth,
    fixedCosts: totalFixedCosts,
    netResult: currentMonthPool,
    disciplineScore: budgetDisciplineScore,
    transactions: transactions.filter(t => t.date.startsWith(currentMonthStr)),
    isLive: true
  };

  // Filter out the existing database record for this month if it exists to avoid duplication
  const historicalRecords = monthlyRecords.filter(r => r.month !== currentMonthStr);

  // Combine and sort
  const sortedRecords = [liveRecord, ...historicalRecords].sort((a, b) =>
    b.month.localeCompare(a.month)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">The Bridge</h1>
          <p className="text-zinc-400">Your financial journey month by month</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 md:left-8 top-0 bottom-0 w-0.5 bg-zinc-800" />

        {sortedRecords.length === 0 ? (
          <Card className="bg-[#18181b] border-zinc-800">
            <CardContent className="py-12">
              <div className="text-center">
                <CalendarIcon className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-400">No monthly records yet</p>
                <p className="text-sm text-zinc-500 mt-2">
                  Add some transactions to see your history
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {sortedRecords.map((record, index) => {
              const monthDate = parseISO(record.month + '-01');
              const isPositive = record.netResult >= 0;
              const inputTotal = record.baseBalance + record.carryOver + record.totalIncome;

              return (
                <div key={record.month} className="relative pl-16 md:pl-20">
                  {/* Timeline dot */}
                  <div className={`absolute left-4 md:left-6 w-5 h-5 rounded-full border-4 ${isPositive
                    ? 'bg-emerald-500 border-emerald-500/30'
                    : 'bg-rose-500 border-rose-500/30'
                    }`} />

                  <Card className="bg-[#18181b] border-zinc-800 hover:border-zinc-700 transition-colors">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-white">
                            {format(monthDate, 'MMMM yyyy')}
                          </CardTitle>
                          <p className="text-sm text-zinc-400 mt-1">
                            {(record as any).isLive ? 'Live Performance' : (index === 0 ? 'Latest Record' : `${index} month${index > 1 ? 's' : ''} ago`)}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={isPositive
                            ? 'border-emerald-500/50 text-emerald-500'
                            : 'border-rose-500/50 text-rose-500'}
                        >
                          {(record as any).isLive ? 'Real-time ' : ''}{isPositive ? 'Surplus' : 'Deficit'}
                        </Badge>
                      </div>
                      {index >= 0 && (
                        <div className="mt-4 flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                              <Target className="w-6 h-6 text-blue-500" />
                            </div>
                            <div>
                              <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Discipline Score</p>
                              <p className="text-xl font-bold text-white">
                                {record.disciplineScore ?? 'N/A'}
                              </p>
                            </div>
                          </div>
                          <div className="flex-1 max-w-[150px] ml-4">
                            <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 transition-all duration-1000"
                                style={{ width: `${record.disciplineScore ?? 0}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Input */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 mb-3">
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                            <h4 className="text-sm font-medium text-zinc-400">Input</h4>
                          </div>

                          <div className="space-y-2 pl-6">
                            <div className="flex justify-between text-sm">
                              <span className="text-zinc-500">Base Budget</span>
                              <span className="text-white font-medium">
                                {currencySymbol}{record.baseBalance.toLocaleString()}
                              </span>
                            </div>

                            {record.carryOver !== 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-zinc-500">Carry-Over</span>
                                <span className={record.carryOver > 0 ? 'text-emerald-500' : 'text-rose-500'}>
                                  {record.carryOver > 0 ? '+' : ''}{currencySymbol}{record.carryOver.toLocaleString()}
                                </span>
                              </div>
                            )}

                            {record.totalIncome > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-zinc-500">Income</span>
                                <span className="text-emerald-500">
                                  +{currencySymbol}{record.totalIncome.toLocaleString()}
                                </span>
                              </div>
                            )}

                            <div className="flex justify-between text-sm pt-2 border-t border-zinc-800">
                              <span className="text-zinc-400 font-medium">Total Available</span>
                              <span className="text-white font-bold">
                                {currencySymbol}{inputTotal.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Output */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 mb-3">
                            <TrendingDown className="w-4 h-4 text-rose-500" />
                            <h4 className="text-sm font-medium text-zinc-400">Output</h4>
                          </div>

                          <div className="space-y-2 pl-6">
                            <div className="flex justify-between text-sm">
                              <span className="text-zinc-500">Expenses</span>
                              <span className="text-rose-500">
                                -{currencySymbol}{record.totalExpenses.toLocaleString()}
                              </span>
                            </div>

                            {((record as any).fixedCosts !== undefined || (record as any).isLive) && (
                              <div className="flex justify-between text-sm">
                                <span className="text-zinc-500">Reserved Fixed Costs</span>
                                <span className="text-orange-500">
                                  -{currencySymbol}{((record as any).fixedCosts || totalFixedCosts).toLocaleString()}
                                </span>
                              </div>
                            )}



                            <div className="flex justify-between text-sm">
                              <span className="text-zinc-500">Transactions</span>
                              <span className="text-zinc-400">
                                {record.transactions.length} items
                              </span>
                            </div>

                            <div className="flex justify-between text-sm pt-2 border-t border-zinc-800">
                              <span className="text-zinc-400 font-medium">Net Result</span>
                              <span className={`font-bold ${isPositive ? 'text-emerald-500' : 'text-rose-500'
                                }`}>
                                {isPositive ? '+' : ''}{currencySymbol}{record.netResult.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Performance Bar */}
                      <div className="mt-6 pt-4 border-t border-zinc-800">
                        <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
                          <span>Budget Utilization</span>
                          <span>{(((record.totalExpenses + (record.fixedCosts || 0)) / inputTotal) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden flex">
                          {/* Fixed Costs - Orange */}
                          <div
                            className="h-full bg-orange-500 transition-all duration-500"
                            style={{ width: `${Math.min(((record.fixedCosts || 0) / inputTotal) * 100, 100)}%` }}
                          />
                          {/* Expenses - Red */}
                          <div
                            className="h-full bg-rose-500 transition-all duration-500"
                            style={{ width: `${Math.min((record.totalExpenses / inputTotal) * 100, Math.max(0, 100 - ((record.fixedCosts || 0) / inputTotal) * 100))}%` }}
                          />
                          {/* Balance - Green */}
                          {isPositive && (
                            <div
                              className="h-full bg-emerald-500 transition-all duration-500"
                              style={{ width: `${Math.max(0, 100 - (((record.totalExpenses + (record.fixedCosts || 0)) / inputTotal) * 100))}%` }}
                            />
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-orange-500" />
                            <span className="text-[10px] text-zinc-500 uppercase">Fixed</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-rose-500" />
                            <span className="text-[10px] text-zinc-500 uppercase">Expenses</span>
                          </div>
                          {isPositive && (
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full bg-emerald-500" />
                              <span className="text-[10px] text-zinc-500 uppercase">Balance</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
