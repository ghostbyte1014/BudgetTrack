import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, TrendingUp, TrendingDown, Target, Zap, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useBudget } from '../contexts/BudgetContext';

interface DailySummaryData {
  id: string;
  date: string;
  actual_spent: number;
  daily_target: number;
  surplus: number;
  deficit: number;
  tip: string;
}

export function DailySummaryView({ summary }: { summary: DailySummaryData }) {
  const { currencySymbol } = useBudget();
  const surplusDeficit = summary.surplus > 0 ? summary.surplus : -summary.deficit;
  const isSurplus = surplusDeficit >= 0;

  const displayDate = summary.date ? format(new Date(summary.date), 'MMMM d, yyyy') : 'Unknown Date';

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Daily Report</h2>
            <p className="text-sm text-zinc-500">{displayDate}</p>
          </div>
        </div>
        <Badge className={isSurplus ? 'bg-emerald-500' : 'bg-rose-500'}>
          {isSurplus ? 'Target Met' : 'Overspent'}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-zinc-400 mb-1">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Yesterday's Spend</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {currencySymbol}{summary.actual_spent.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-zinc-400 mb-1">
              <Target className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Daily Target</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {currencySymbol}{summary.daily_target.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className={`border-2 ${isSurplus ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isSurplus ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
                {isSurplus ? <TrendingUp className="w-6 h-6 text-emerald-500" /> : <TrendingDown className="w-6 h-6 text-rose-500" />}
              </div>
              <div>
                <p className="text-sm text-zinc-400">{isSurplus ? 'Surplus Saved' : 'Deficit Incurred'}</p>
                <p className={`text-2xl font-bold ${isSurplus ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {isSurplus ? '+' : ''}{currencySymbol}{Math.abs(surplusDeficit).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Pulse Insight</p>
          <p className="text-sm text-zinc-300 leading-relaxed italic">"{summary.tip}"</p>
        </div>
      </div>
    </div>
  );
}
