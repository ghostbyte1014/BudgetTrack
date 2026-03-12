import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { TrendingUp, Calendar, DollarSign, Lock, Calculator, Zap } from 'lucide-react';

export function HowItWorks() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">How It Works</h1>
        <p className="text-zinc-400">Understanding the carry-over budgeting system</p>
      </div>

      {/* The Carry-Over Engine */}
      <Card className="bg-gradient-to-br from-emerald-900/20 to-emerald-800/20 border-emerald-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            The Carry-Over Engine
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Your budget rolls forward every month
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-start gap-4 p-4 bg-[#09090b] rounded-lg border border-zinc-800/50">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-blue-500 font-bold">1</span>
              </div>
              <div className="min-w-0">
                <h4 className="text-white font-medium mb-1">Opening Balance</h4>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Every month starts with your <strong className="text-white">Base Budget</strong> plus any 
                  surplus or minus any deficit from the previous month.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-4 p-4 bg-[#09090b] rounded-lg border border-zinc-800/50">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-blue-500 font-bold">2</span>
              </div>
              <div className="min-w-0">
                <h4 className="text-white font-medium mb-1">Monthly Calculation</h4>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  At the end of each month, we calculate: <br />
                  <code className="text-emerald-500 text-xs mt-1 block bg-emerald-500/5 p-1 rounded">
                    Net Result = Total Pool - Fixed Costs - Expenses
                  </code>
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-4 p-4 bg-[#09090b] rounded-lg border border-zinc-800/50">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-blue-500 font-bold">3</span>
              </div>
              <div className="min-w-0">
                <h4 className="text-white font-medium mb-1">Carry-Over</h4>
                <p className="text-sm text-zinc-400 mb-3 leading-relaxed">
                  The Net Result (positive or negative) carries forward to next month's opening balance.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="border-emerald-500/50 text-emerald-500 text-[10px] py-0.5">
                    Positive = More tomorrow
                  </Badge>
                  <Badge variant="outline" className="border-rose-500/50 text-rose-500 text-[10px] py-0.5">
                    Negative = Less tomorrow
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Allowance Formula */}
      <Card className="bg-[#18181b] border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-500" />
            Daily Spendable Formula
          </CardTitle>
          <CardDescription className="text-zinc-400">
            How we calculate your safe daily spending limit
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-4 sm:p-6 rounded-lg border border-zinc-700 overflow-x-auto">
            <p className="text-center text-lg sm:text-2xl text-white font-mono mb-2 whitespace-nowrap">
              Daily Limit = <span className="text-emerald-500">Remaining Pool</span> / Days Left
            </p>
            <p className="text-xs text-zinc-500 text-center">
              *Remaining Pool = Total Balance - Unpaid Fixed Costs
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-[#09090b] rounded-lg border border-zinc-800">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-blue-500" />
                <h4 className="text-white font-medium text-sm">Monthly Pool</h4>
              </div>
              <p className="text-xs text-zinc-400">
                Your base budget + carry-over + any income
              </p>
            </div>

            <div className="p-4 bg-[#09090b] rounded-lg border border-zinc-800">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-orange-500" />
                <h4 className="text-white font-medium text-sm">Fixed Costs</h4>
              </div>
              <p className="text-xs text-zinc-400">
                Locked recurring bills and subscriptions
              </p>
            </div>

            <div className="p-4 bg-[#09090b] rounded-lg border border-zinc-800 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-emerald-500" />
                <h4 className="text-white font-medium text-sm">Days Remaining</h4>
              </div>
              <p className="text-xs text-zinc-400">
                How many days left in the current month
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* The "No Spend" Benefit logic */}
      <Card className="bg-gradient-to-br from-emerald-900/20 to-emerald-800/20 border-emerald-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            The "No Spend" Benefit
          </CardTitle>
          <CardDescription className="text-zinc-400">
            How your daily limit grows when you save today
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-zinc-400">
            Every peso you don't spend today is redistributed across your <strong className="text-white">remaining</strong> days. 
            This means your daily allowance permanently increases for the rest of the month.
          </p>
          <div className="bg-[#09090b] p-4 rounded-lg border border-zinc-800 space-y-3">
            <h4 className="text-white font-medium text-sm">The Logic:</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold">1</div>
                <p className="text-zinc-300">Save ₱100 today.</p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold">2</div>
                <p className="text-zinc-300">If you have 10 days left, that ₱100 is split 10 ways.</p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold">3</div>
                <p className="text-zinc-400">Your daily limit <strong className="text-emerald-500">increases by ₱10</strong> for every remaining day!</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg space-y-2">
            <h4 className="text-white font-medium text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-500" />
              Example: No Spend Benefit
            </h4>
            <div className="space-y-1 text-sm">
              <p className="text-zinc-400 italic">"I have ₱1,000 left and 5 days to go..."</p>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between border-b border-white/10 pb-1">
                  <span className="text-zinc-500">Normal Daily Limit:</span>
                  <span className="text-white font-medium">₱200 / day</span>
                </div>
                <p className="text-emerald-500 text-xs font-medium">✨ You spend ₱0 today!</p>
                <div className="flex justify-between pt-1">
                  <span className="text-zinc-500">Tomorrow's New Limit:</span>
                  <span className="text-white font-bold text-lg">₱250 / day</span>
                </div>
                <p className="text-zinc-400 text-[10px]">
                  (₱1,000 balance / 4 remaining days = ₱250)
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Example Scenario */}
      <Card className="bg-[#18181b] border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Example Scenario</CardTitle>
          <CardDescription className="text-zinc-400">
            See how the carry-over system works in practice
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                January
              </h4>
              <div className="space-y-1 text-sm">
                <p className="text-zinc-400">Base Budget: <span className="text-white">₱3,000</span></p>
                <p className="text-zinc-400">Fixed Costs: <span className="text-white">₱1,400</span></p>
                <p className="text-zinc-400">Actual Spending: <span className="text-white">₱1,200</span></p>
                <p className="text-emerald-500 font-medium mt-2">
                  ✓ Net Result: +₱400 (Surplus)
                </p>
              </div>
            </div>

            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
              <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-500" />
                February
              </h4>
              <div className="space-y-1 text-sm">
                <p className="text-zinc-400">Base Budget: <span className="text-white">₱3,000</span></p>
                <p className="text-emerald-500">Carry-Over: <span className="text-emerald-500">+₱400</span></p>
                <p className="text-zinc-400">Opening Balance: <span className="text-white font-bold">₱3,400</span></p>
              </div>
            </div>

            <div className="p-4 bg-zinc-800/50 rounded-lg">
              <p className="text-sm text-zinc-300">
                <strong className="text-white">The benefit:</strong> Because you saved ₱400 in January, 
                you now have ₱3,400 to work with in February. Your daily spendable amount increases, 
                giving you more flexibility while staying on track.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
