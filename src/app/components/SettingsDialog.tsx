import { useState } from 'react';
import { useBudget } from '../contexts/BudgetContext';
import { supabase } from '../../lib/supabase';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Settings } from 'lucide-react';

export function SettingsDialog() {
  const { user, baseBalance, setBaseBalance } = useBudget();
  const [isOpen, setIsOpen] = useState(false);
  const [newBalance, setNewBalance] = useState(baseBalance.toString());

  const handleSave = async () => {
    const amount = parseFloat(newBalance);
    if (!isNaN(amount) && amount > 0) {
      setBaseBalance(amount);
      if (user?.id) {
        await supabase.from('profiles').update({ base_balance: amount }).eq('id', user.id);
      }
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
          <Settings className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#18181b] border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Budget Settings</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Configure your monthly base budget
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="baseBalance" className="text-zinc-200">
              Monthly Base Budget
            </Label>
            <Input
              id="baseBalance"
              type="number"
              step="0.01"
              value={newBalance}
              onChange={(e) => setNewBalance(e.target.value)}
              className="bg-[#09090b] border-zinc-700 text-white"
            />
            <p className="text-xs text-zinc-500">
              This is your starting budget each month before carry-overs
            </p>
          </div>
          <Button 
            onClick={handleSave}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
