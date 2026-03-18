import { useState } from 'react';
import { useBudget } from '../contexts/BudgetContext';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Plus, Search, Trash2, TrendingDown, TrendingUp, PlayCircle } from 'lucide-react';
import { format, differenceInDays, endOfMonth } from 'date-fns';
import { InfoIcon } from './ui/InfoIcon';
import { TOOLTIP_CONTENT } from '../constants/tooltipContent';
import { VaultTutorial } from './VaultTutorial';

const categories = [
  'Groceries',
  'Dining',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Healthcare',
  'Utilities',
  'Other',
];

export function Transactions() {
  const { 
    transactions, 
    addTransaction, 
    deleteTransaction,
    totalFixedCosts,
    fixedCosts,
    markFixedCostSatisfied,
    metrics,
    currencySymbol,
  } = useBudget();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    category: 'Other',
    type: 'expense' as 'expense' | 'income',
    date: format(new Date(), 'yyyy-MM-dd'),
    isFixedCost: false,
    fixedCostId: 'none',
  });

  const itemsPerPage = 15;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTransaction({
      title: formData.title,
      description: formData.description,
      amount: parseFloat(formData.amount),
      category: formData.category,
      type: formData.type,
      date: formData.date,
      linked_fixed_cost_id: formData.isFixedCost && formData.fixedCostId !== 'none' ? formData.fixedCostId : undefined,
    });
    
    // Auto-satisfaction is handled by PostgreSQL trigger mark_fixed_cost_paid

    setFormData({
      title: '',
      description: '',
      amount: '',
      category: 'Other',
      type: 'expense',
      date: format(new Date(), 'yyyy-MM-dd'),
      isFixedCost: false,
      fixedCostId: 'none',
    });
    setIsDialogOpen(false);
  };

  // Calculate daily impact for each transaction
  const calculateDailyImpact = (transaction: any) => {
    const transactionDate = new Date(transaction.date);
    const monthEnd = endOfMonth(transactionDate);
    const daysRemaining = differenceInDays(monthEnd, transactionDate) + 1;
    
    if (daysRemaining <= 0 || transaction.type === 'income') return 0;
    
    // Fallback to base calculation or zero if metrics are missing
    const availablePool = metrics 
      ? metrics.absolute_balance
      : 0;

    return transaction.amount / daysRemaining;
  };

  // Extract unique months from transactions for the filter dropdown
  const uniqueMonths = Array.from(new Set(transactions.map(t => t.date.substring(0, 7)))).sort().reverse();

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
                         t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
    const matchesMonth = filterMonth === 'all' || t.date.startsWith(filterMonth);
    return matchesSearch && matchesCategory && matchesMonth;
  });

  // Paginate
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <VaultTutorial />
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">The Vault</h1>
          <p className="text-zinc-400">All your transactions in one place</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-blue-500 hover:text-blue-400 hover:bg-blue-500/10"
            onClick={() => {
              localStorage.removeItem('seen_vault_tutorial');
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
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#18181b] border-zinc-800 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">Add New Transaction</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type" className="text-zinc-200 flex items-center gap-2">
                  Type
                  <InfoIcon 
                    content={TOOLTIP_CONTENT.transactionTypes.detailed}
                    learnMoreLink={TOOLTIP_CONTENT.transactionTypes.learnMoreLink}
                    variant="default"
                    trackingId="vault_transaction_type"
                  />
                </Label>
                <Select
                  value={formData.type} 
                  onValueChange={(value: 'expense' | 'income') => 
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger className="bg-[#09090b] border-zinc-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#18181b] border-zinc-700">
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.type === 'expense' && (
                <div className="flex items-center space-x-2 py-2">
                  <Switch 
                    id="isFixedCost" 
                    checked={formData.isFixedCost}
                    onCheckedChange={(checked) => setFormData({ ...formData, isFixedCost: checked })}
                  />
                  <Label htmlFor="isFixedCost" className="text-zinc-200">Is this a pre-allocated Fixed Cost?</Label>
                </div>
              )}

              {formData.type === 'expense' && formData.isFixedCost && (
                <div className="space-y-2">
                  <Label className="text-zinc-200">Select Fixed Cost</Label>
                  <Select 
                    value={formData.fixedCostId} 
                    onValueChange={(value) => {
                      const cost = fixedCosts.find(c => c.id === value);
                      if (cost) {
                        setFormData({ 
                          ...formData, 
                          fixedCostId: value, 
                          title: cost.name, 
                          amount: cost.amount.toString(), 
                          category: cost.category 
                        });
                      } else {
                        setFormData({ ...formData, fixedCostId: value });
                      }
                    }}
                  >
                    <SelectTrigger className="bg-[#09090b] border-zinc-700 text-white">
                      <SelectValue placeholder="Select cost..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#18181b] border-zinc-700">
                      <SelectItem value="none">Select...</SelectItem>
                      {fixedCosts.map(cost => (
                        <SelectItem key={cost.id} value={cost.id} disabled={cost.isSatisfied}>
                          {cost.name} ({currencySymbol}{cost.amount}) {cost.isSatisfied ? '(Already Paid)' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="title" className="text-zinc-200">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Grocery Shopping"
                  className="bg-[#09090b] border-zinc-700 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-zinc-200">Description (Optional)</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., Milk, Eggs, Bread"
                  className="bg-[#09090b] border-zinc-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-zinc-200">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="bg-[#09090b] border-zinc-700 text-white"
                  required
                />
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

              <div className="space-y-2">
                <Label htmlFor="date" className="text-zinc-200">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="bg-[#09090b] border-zinc-700 text-white"
                  required
                />
              </div>

              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                Add Transaction
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-[#18181b] border-zinc-800">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#09090b] border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="bg-[#09090b] border-zinc-700 text-white">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent className="bg-[#18181b] border-zinc-700">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterMonth} onValueChange={setFilterMonth}>
              <SelectTrigger className="bg-[#09090b] border-zinc-700 text-white">
                <SelectValue placeholder="Filter by month" />
              </SelectTrigger>
              <SelectContent className="bg-[#18181b] border-zinc-700">
                <SelectItem value="all">All Months</SelectItem>
                {uniqueMonths.map(month => (
                  <SelectItem key={month} value={month}>
                    {format(new Date(month + '-01'), 'MMMM yyyy')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card className="bg-[#18181b] border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">
            Transactions ({filteredTransactions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {paginatedTransactions.length === 0 ? (
              <p className="text-center text-zinc-400 py-8">No transactions found</p>
            ) : (
              // Group paginated transactions by month for visual separation
              Object.entries(
                paginatedTransactions.reduce((groups, transaction) => {
                  const month = format(new Date(transaction.date), 'MMMM yyyy');
                  if (!groups[month]) groups[month] = [];
                  groups[month].push(transaction);
                  return groups;
                }, {} as Record<string, typeof paginatedTransactions>)
              ).map(([month, monthTransactions]) => (
                <div key={month} className="space-y-3">
                  <div className="flex items-center gap-4 py-2">
                    <div className="h-px flex-1 bg-zinc-800" />
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{month}</span>
                    <div className="h-px flex-1 bg-zinc-800" />
                  </div>
                  {monthTransactions.map((transaction) => {
                    const dailyImpact = calculateDailyImpact(transaction);
                    return (
                      <div
                        key={transaction.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#09090b] rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors gap-4"
                      >
                        <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                          <div className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center ${
                            transaction.type === 'income' 
                              ? 'bg-emerald-500/20' 
                              : 'bg-rose-500/20'
                          }`}>
                            {transaction.type === 'income' ? (
                              <TrendingUp className="w-5 h-5 text-emerald-500" />
                            ) : (
                              <TrendingDown className="w-5 h-5 text-rose-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium break-words">
                              {transaction.title}
                            </p>
                            {transaction.description && (
                              <p className="text-sm text-zinc-500 break-words -mt-0.5">
                                {transaction.description}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <p className="text-xs text-zinc-400">
                                {format(new Date(transaction.date), 'MMM d, yyyy')}
                              </p>
                              <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-400">
                                {transaction.category}
                              </Badge>
                              {dailyImpact > 0 && (
                                <Badge variant="outline" className="text-xs border-rose-500/50 text-rose-500">
                                  Daily Impact: -{currencySymbol}{dailyImpact.toFixed(2)}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-zinc-800/50">
                          <p className={`text-lg font-bold ${
                            transaction.type === 'income' ? 'text-emerald-500' : 'text-rose-500'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}{currencySymbol}{transaction.amount.toFixed(2)}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTransaction(transaction.id)}
                            className="text-zinc-400 hover:text-rose-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="bg-[#09090b] border-zinc-700 text-white hover:bg-zinc-800"
              >
                Previous
              </Button>
              <span className="text-sm text-zinc-400">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="bg-[#09090b] border-zinc-700 text-white hover:bg-zinc-800"
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
