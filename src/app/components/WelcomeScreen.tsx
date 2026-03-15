import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useBudget } from '../contexts/BudgetContext';
import { supabase } from '../../lib/supabase';
import { Wallet, TrendingUp, Calendar, Target, Zap, Check } from 'lucide-react';

interface WelcomeScreenProps {
  onComplete: () => void;
}

export function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const { setBaseBalance, setPrimaryGoal } = useBudget();
  const [step, setStep] = useState(1);
  const [budget, setBudget] = useState('3000');
  const [goal, setGoal] = useState('Save more');

  const goals = [
    { id: 'Save more', title: 'Save more', description: 'Focus on building your savings pool', icon: Target },
    { id: 'Stop overspending', title: 'Stop overspending', description: 'Get disciplined with daily limits', icon: Zap },
    { id: 'Track debt', title: 'Track debt', description: 'Monitor and reduce your liabilities', icon: Wallet },
  ];

  const features = [
    { icon: Zap, title: 'Daily Spendable', description: 'Know exactly how much you can spend today' },
    { icon: TrendingUp, title: 'Carry-Over Engine', description: 'Surplus rolls forward, deficits are managed' },
    { icon: Calendar, title: 'Monthly History', description: 'Track your financial journey over time' },
    { icon: Target, title: 'Smart Analytics', description: 'Forecast and optimize your spending' },
  ];

  const handleComplete = async () => {
    const amount = parseFloat(budget);
    if (!isNaN(amount) && amount > 0) {
      setBaseBalance(amount);
      setPrimaryGoal(goal);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').update({ 
          base_balance: amount, 
          primary_goal: goal
        }).eq('id', user.id);
      }

      onComplete();
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl mb-6">
              <Wallet className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">Welcome to BudgetFlow</h1>
            <p className="text-xl text-zinc-400">Smart carry-over budgeting made simple</p>
          </div>

          <Card className="bg-[#18181b] border-zinc-800 mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium text-sm mb-1">{feature.title}</h3>
                      <p className="text-zinc-400 text-xs">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button 
            onClick={() => setStep(2)} 
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 text-lg"
          >
            Get Started
          </Button>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl mb-4">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Set Your Monthly Budget</h2>
            <p className="text-zinc-400">This is your starting budget each month</p>
          </div>

          <Card className="bg-[#18181b] border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Monthly Base Budget</CardTitle>
              <CardDescription className="text-zinc-400">
                Enter the amount you want to budget each month
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="budget" className="text-zinc-200">Amount (PHP)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-lg">₱</span>
                  <Input
                    id="budget"
                    type="number"
                    step="0.01"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="bg-[#09090b] border-zinc-700 text-white text-2xl font-bold pl-8 py-6"
                    placeholder="3000"
                    autoFocus
                  />
                </div>
                <p className="text-xs text-zinc-500">
                  You can always change this later in settings
                </p>
              </div>

              <div className="space-y-2 pt-4 border-t border-zinc-800">
                <div className="flex items-start gap-2 text-sm text-zinc-400">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Demo data included to help you explore</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-zinc-400">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Sample transactions and fixed costs pre-loaded</span>
                </div>
              </div>

              <Button 
                onClick={() => setStep(3)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6"
                disabled={!budget || parseFloat(budget) <= 0}
              >
                Next: Select Your Goal
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-4">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">What is your primary goal?</h2>
          <p className="text-zinc-400">We'll adjust your experience based on this</p>
        </div>

        <div className="space-y-3 mb-8">
          {goals.map((g) => (
            <button
              key={g.id}
              onClick={() => setGoal(g.id)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                goal === g.id 
                  ? 'bg-blue-500/10 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.1)]' 
                  : 'bg-[#18181b] border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  goal === g.id ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  <g.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold ${goal === g.id ? 'text-white' : 'text-zinc-200'}`}>
                    {g.title}
                  </h3>
                  <p className="text-sm text-zinc-400">{g.description}</p>
                </div>
                {goal === g.id && (
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        <Button 
          onClick={handleComplete}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 text-lg font-bold"
        >
          Finish Onboarding
        </Button>
        <button 
          onClick={() => setStep(2)}
          className="w-full text-zinc-500 text-sm mt-4 hover:text-zinc-400 transition-colors"
        >
          Back to budget
        </button>
      </div>
    </div>
  );
}
