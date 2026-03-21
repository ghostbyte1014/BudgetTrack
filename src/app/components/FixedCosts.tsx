import { useState } from 'react';
import { useBudget } from '../contexts/BudgetContext';
import { useConfirm } from '../contexts/ConfirmContext';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, Trash2, Lock, Calendar, Clock, PlayCircle } from 'lucide-react';
import { InfoIcon } from './ui/InfoIcon';
import { TOOLTIP_CONTENT } from '../constants/tooltipContent';
import { FixedCostsTutorial } from './FixedCostsTutorial';

const categories = [
  'Rent/Mortgage',
  'Insurance',
  'Subscriptions',
  'Utilities',
  'Loans',
  'Memberships',
  'Other',
];

export function FixedCosts() {
  const { fixedCosts, addFixedCost, deleteFixedCost, totalFixedCosts, metrics, currencySymbol } = useBudget();
  const { confirm } = useConfirm();
  
  const currentMonthPool = metrics ? metrics.absolute_balance + totalFixedCosts : 0;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    dueDate: '1',
    category: 'Subscriptions',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    confirm({
      title: 'Confirm Fixed Cost',
      message: `Are you sure you want to add this ${formData.category} fixed cost for ${currencySymbol}${formData.amount}?`,
      onConfirm: () => {
        addFixedCost({
          name: formData.name,
          amount: parseFloat(formData.amount),
          dueDate: parseInt(formData.dueDate),
          category: formData.category,
        });
        setFormData({
          name: '',
          amount: '',
          dueDate: '1',
          category: 'Subscriptions',
        });
        setIsDialogOpen(false);
      }
    });
  };

  const remainingBudget = currentMonthPool - totalFixedCosts;
  const fixedCostsPercentage = (totalFixedCosts / currentMonthPool) * 100;

  return (
    <div className="space-y-6">
      <FixedCostsTutorial />
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Fixed Costs Manager</h1>
          <p className="text-zinc-400">Allocate and reserve your recurring bills and subscriptions</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-orange-500 hover:text-orange-400 hover:bg-orange-500/10 border border-orange-500/20"
            onClick={() => {
              localStorage.removeItem('seen_fixed_costs_tutorial');
              window.location.reload();
            }}
          >
            <PlayCircle className="w-4 h-4 mr-2" />
            Show Tutorial
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Fixed Cost
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#18181b] border-zinc-800 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">Add Fixed Cost</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-zinc-200">Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Netflix, Rent, Car Insurance"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-[#09090b] border-zinc-700 text-white placeholder:text-zinc-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-zinc-200">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="bg-[#09090b] border-zinc-700 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate" className="text-zinc-200">Due Date (Day of Month)</Label>
                <Select 
                  value={formData.dueDate} 
                  onValueChange={(value) => setFormData({ ...formData, dueDate: value })}
                >
                  <SelectTrigger className="bg-[#09090b] border-zinc-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#18181b] border-zinc-700 max-h-60">
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                      <SelectItem key={day} value={String(day)}>
                        {day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'} of the month
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-zinc-200">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="bg-[#09090b] border-zinc-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#18181b] border-zinc-700">
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                Add Fixed Cost
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-br from-orange-900/20 to-orange-800/20 border-orange-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2" data-onboarding="fixed-costs-allocation">
            <Lock className="w-5 h-5 text-orange-500" />
            Reserved Budget Allocation
            <InfoIcon 
              content={TOOLTIP_CONTENT.reservedAllocation.detailed}
              learnMoreLink={TOOLTIP_CONTENT.reservedAllocation.learnMoreLink}
              variant="default"
              trackingId="fixed_costs_allocation"
              side="bottom"
            />
          </CardTitle>
          <CardDescription className="text-zinc-400">
            These amounts are automatically deducted from your monthly pool
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm text-zinc-400 mb-1">Total Fixed Costs</p>
                <p className="text-4xl font-bold text-orange-500">
                  {currencySymbol}{totalFixedCosts.toLocaleString()}
                </p>
              </div>
              <Badge 
                variant="outline" 
                className="border-orange-500/50 text-orange-500"
              >
                {fixedCostsPercentage.toFixed(1)}% of budget
              </Badge>
            </div>

            <div className="pt-4 border-t border-orange-700/30">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-zinc-400">Remaining for variable expenses</span>
                <span className="text-white font-medium">
                  {currencySymbol}{remainingBudget.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div 
                  className="bg-emerald-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.max(0, 100 - fixedCostsPercentage)}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fixed Costs List */}
      <Card className="bg-[#18181b] border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">
            Your Fixed Costs ({fixedCosts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {fixedCosts.length === 0 ? (
            <div className="text-center py-12">
              <Lock className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-400 mb-2">No fixed costs added yet</p>
              <p className="text-sm text-zinc-500">
                Add recurring bills to reserve them from your monthly budget
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {fixedCosts
                .sort((a, b) => a.dueDate - b.dueDate)
                .map((cost) => (
                  <div
                    key={cost.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#09090b] rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors gap-4"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Lock className="w-5 h-5 text-orange-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{cost.name}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px] border-zinc-700 text-zinc-400">
                            {cost.category}
                          </Badge>
                          <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                            <Calendar className="w-3 h-3" />
                            <span>
                              Due: {cost.dueDate}
                              {cost.dueDate === 1 ? 'st' : cost.dueDate === 2 ? 'nd' : cost.dueDate === 3 ? 'rd' : 'th'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-blue-500 font-medium">
                            <Clock className="w-3 h-3" />
                            <span>
                              {(() => {
                                const today = new Date().getDate();
                                const daysUntil = cost.dueDate >= today 
                                  ? cost.dueDate - today 
                                  : (new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - today + cost.dueDate);
                                return daysUntil === 0 ? 'Due Today' : `Due in ${daysUntil} Days`;
                              })()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-zinc-800/50 pt-3 sm:pt-0">
                      <p className="text-lg font-bold text-orange-500">
                        {currencySymbol}{cost.amount.toFixed(2)}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          confirm({
                            title: 'Delete Fixed Cost',
                            message: 'Are you sure you want to delete this fixed cost? This cannot be undone.',
                            danger: true,
                            confirmText: 'Delete',
                            onConfirm: () => deleteFixedCost(cost.id)
                          });
                        }}
                        className="text-zinc-400 hover:text-rose-500 h-8 w-8 p-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-[#18181b] border-zinc-800">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Lock className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <h4 className="text-white font-medium mb-1">How Fixed Costs Work</h4>
              <p className="text-sm text-zinc-400">
                Fixed costs are automatically subtracted from your monthly pool before calculating 
                your daily spendable amount. This ensures you always have money set aside for 
                recurring bills and subscriptions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
