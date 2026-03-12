import { useState } from 'react';
import { useBudget } from '../contexts/BudgetContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { TrendingUp, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { addDays, format } from 'date-fns';
import { Button } from './ui/button';

export function BudgetProjection() {
  const { dailySpendableProjection, dailySpendable, financialMode, currencySymbol } = useBudget();
  const [isExpanded, setIsExpanded] = useState(false);

  if (financialMode === 'recovery' || dailySpendable <= 0) {
    return null;
  }

  return (
    <Card className="bg-[#18181b] border-zinc-800 border-dashed">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              The "No Spend" Benefit
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Future daily limits if you spend {currencySymbol}0 today
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-zinc-400 hover:text-white"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </Button>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="space-y-3">
            {dailySpendableProjection.map((amount, index) => {
              const date = addDays(new Date(), index + 1);
              const increase = amount - dailySpendable;
              
              if (amount <= 0) return null;

              return (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50 hover:border-emerald-500/30 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-medium text-zinc-400 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-colors">
                      +{index + 1}d
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{format(date, 'EEEE')}</p>
                      <p className="text-xs text-zinc-500">{format(date, 'MMM d')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-emerald-400">{currencySymbol}{amount.toFixed(2)}</p>
                      <p className="text-[10px] text-emerald-500/70 flex items-center justify-end gap-1">
                        <ArrowRight className="w-2 h-2" />
                        +{currencySymbol}{increase.toFixed(2)} / day
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 pt-4 border-t border-zinc-800/50">
            <Badge variant="outline" className="text-[10px] border-zinc-800 text-zinc-500 w-full justify-center py-1">
              Projection assumes zero spending from today until the selected day
            </Badge>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
