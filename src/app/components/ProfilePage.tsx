import React, { useState, useEffect } from 'react';
import { useBudget } from '../contexts/BudgetContext';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { User, Wallet, Target, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

export function ProfilePage() {
  const { user, login, baseBalance, setBaseBalance, primaryGoal, setPrimaryGoal } = useBudget();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [budget, setBudget] = useState('');
  const [goal, setGoal] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
    setBudget(baseBalance.toString());
    setGoal(primaryGoal);
  }, [user, baseBalance, primaryGoal]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const numBudget = parseFloat(budget);
      if (isNaN(numBudget) || numBudget < 0) {
        throw new Error('Please enter a valid positive number for your budget.');
      }

      // Update local storage context temporarily for fast rendering
      login(name, email, user?.id);
      setBaseBalance(numBudget);
      setPrimaryGoal(goal);

      // Persist to Supabase
      if (user?.id) {
        const { error } = await supabase
          .from('profiles')
          .update({ name, base_balance: numBudget, primary_goal: goal })
          .eq('id', user.id);

        if (error) throw error;
        
        await supabase.auth.updateUser({ 
          data: { name }
        });
      }

      toast.success('Profile updated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
        <p className="text-zinc-400">Manage your account information and financial goals.</p>
      </div>

      <Card className="bg-[#18181b] border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <User className="w-5 h-5 text-emerald-500" />
            Personal Information
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Update your display name. Email address changes require verification.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-zinc-200">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-[#09090b] border-zinc-700 text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-200">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="bg-[#09090b] border-zinc-700 text-zinc-500 cursor-not-allowed opacity-70"
                />
                <p className="text-xs text-zinc-500">Email cannot be changed directly yet.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
              <div className="space-y-2">
                <Label htmlFor="baseBalance" className="text-zinc-200 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-emerald-500" />
                  Monthly Base Budget ($)
                </Label>
                <Input
                  id="baseBalance"
                  type="number"
                  step="0.01"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="bg-[#09090b] border-zinc-700 text-white font-mono"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="primaryGoal" className="text-zinc-200 flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-500" />
                  Primary Goal
                </Label>
                <select
                  id="primaryGoal"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full h-10 px-3 bg-[#09090b] border border-zinc-700 text-white rounded-md text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                >
                  <option value="Save more">Save more</option>
                  <option value="Stop overspending">Stop overspending</option>
                  <option value="Track debt">Track debt</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800 flex justify-end">
              <Button 
                type="submit" 
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
