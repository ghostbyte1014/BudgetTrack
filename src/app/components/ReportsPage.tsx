import React, { useState, useRef, useMemo } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { FileText, Download, Loader2, PlayCircle } from 'lucide-react';
import { ReportDocument } from './ReportDocument';
import { ReportPDF } from './ReportPDF';
import { ReportsTutorial } from './ReportsTutorial';
import { pdf } from '@react-pdf/renderer';
import { toast } from 'sonner';
import { useBudget } from '../contexts/BudgetContext';
import { format, subMonths } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export function ReportsPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [includeSummary, setIncludeSummary] = useState(true);
  const [includeLedger, setIncludeLedger] = useState(true);
  const [includeAudit, setIncludeAudit] = useState(false);
  
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  const reportRef = useRef<HTMLDivElement>(null);

  const {
    primaryGoal,
    metrics,
    totalBudgetPool,
    totalSpentThisMonth,
    totalFixedCosts,
    baseBalance,
    carryOverFromLastMonth,
    currencySymbol,
    financialHealthState,
    safeSpendToday,
    financialRunway,
    user,
    transactions,
    fixedCosts,
    monthlyRecords,
  } = useBudget();

  // Generate available months dynamically from actual data
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    
    // Always include the current month as a baseline
    const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    monthsSet.add(currentMonthKey);

    // 1. Add every month that handles a transaction
    transactions.forEach(t => {
      if (t.date && t.date.length >= 7) {
        monthsSet.add(t.date.substring(0, 7)); // Extract YYYY-MM
      }
    });

    // 2. Add every month that exists in the vault/bridge history
    if (monthlyRecords && monthlyRecords.length > 0) {
      monthlyRecords.forEach(record => {
        if (record.month) {
          monthsSet.add(record.month);
        }
      });
    }

    // Convert to sorted array (newest to oldest)
    return Array.from(monthsSet)
      .sort((a, b) => b.localeCompare(a))
      .map(monthStr => {
        const [year, month] = monthStr.split('-');
        const dateObj = new Date(Number(year), Number(month) - 1, 1);
        return {
          value: monthStr,
          label: format(dateObj, 'MMMM yyyy')
        };
      });
  }, [transactions, monthlyRecords]);

  // 1. Determine if the selected month is the current live month or historical
  const isCurrentMonth = selectedMonth === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  
  // 2. Extract the correct data source based on selection
  const historicalRecord = monthlyRecords?.find(r => r.month === selectedMonth);

  // Extract values (fallback to live data if no historical record is found or it's the current month)
  const reportData = {
    monthDate: new Date(`${selectedMonth}-01T00:00:00`),
    baseBalance: isCurrentMonth ? baseBalance : (historicalRecord?.baseBalance ?? baseBalance),
    carryOver: isCurrentMonth ? carryOverFromLastMonth : (historicalRecord?.carryOver ?? 0),
    totalBudget: isCurrentMonth ? totalBudgetPool : ((historicalRecord?.baseBalance ?? baseBalance) + (historicalRecord?.carryOver ?? 0)),
    totalUsed: isCurrentMonth ? (totalSpentThisMonth + totalFixedCosts) : (historicalRecord?.totalExpenses ?? 0),
    financialHealth: isCurrentMonth ? financialHealthState.state : (historicalRecord?.netResult && historicalRecord.netResult >= 0 ? 'Stable' : 'Warning'),
    deficit: isCurrentMonth ? (metrics?.current_deficit ?? 0) : 0, // Simplified for historical
    dailySpendable: isCurrentMonth ? (metrics?.daily_spendable ?? 0) : 0, // Simplified for historical
    runway: isCurrentMonth ? financialRunway : null,
    safeSpend: isCurrentMonth ? safeSpendToday : 0,
  };

  const generatePDF = async () => {
    try {
      setIsGenerating(true);
      toast.info('Compiling report...', { id: 'pdf-gen' });

      const monthKey = format(reportData.monthDate, 'yyyy-MM');
      // Always filter transactions by the selected month string
      const filteredTransactions = transactions.filter(t => t.date.startsWith(monthKey));

      // Build category rows (group transactions + fixed costs by category)
      const categoryMap = new Map<string, number>();
      
      // If historical, we only have the transactions that were saved.
      // If live, we combine live transactions with live fixed costs.
      const itemsToGroup = isCurrentMonth 
        ? [...filteredTransactions, ...fixedCosts.map((c: any) => ({ category: c.category, amount: c.amount, type: 'expense' }))]
        : historicalRecord?.transactions || filteredTransactions;

      itemsToGroup.forEach((item: any) => {
        const key = item.category;
        categoryMap.set(key, (categoryMap.get(key) || 0) + (item.type === 'expense' ? item.amount : -item.amount));
      });
      const categoryRows = Array.from(categoryMap.entries()) as [string, number][];

      // Generate PDF using @react-pdf/renderer — pure vector output, no canvas screenshot
      const blob = await pdf(
        <ReportPDF
          userName={user?.name ?? 'User'}
          monthDate={reportData.monthDate}
          currencySymbol={currencySymbol}
          totalBudgetPool={reportData.totalBudget}
          totalUsed={reportData.totalUsed}
          baseBalance={reportData.baseBalance}
          carryOverFromLastMonth={reportData.carryOver}
          safeSpendToday={reportData.safeSpend}
          financialRunway={reportData.runway}
          financialHealthState={reportData.financialHealth}
          primaryGoal={primaryGoal}
          categoryRows={categoryRows}
          metricDeficit={reportData.deficit}
          metricDailySpendable={reportData.dailySpendable}
          includeSummary={includeSummary}
          includeLedger={includeLedger}
          includeAudit={includeAudit}
        />
      ).toBlob();

      // Trigger browser download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `BudgetTrack_Report_${new Date().getTime()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Report downloaded successfully!', { id: 'pdf-gen' });
    } catch (error) {
      console.error('PDF Generation failed', error);
      toast.error('Failed to generate PDF report', { id: 'pdf-gen' });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 flex-1 min-h-0 flex flex-col h-[calc(100vh-8rem)]">
      <ReportsTutorial />
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Reports &amp; Exports</h1>
          <p className="text-zinc-400">Configure and download your comprehensive financial transcripts.</p>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
          onClick={() => {
            localStorage.removeItem('seen_reports_tutorial');
            window.location.reload();
          }}
        >
          <PlayCircle className="w-4 h-4 mr-2" />
          Show Tutorial
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1 min-h-0">
        {/* Settings Sidebar */}
        <div className="col-span-1 border border-zinc-800 bg-[#18181b] rounded-xl p-6 h-fit sticky top-6">
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-white pb-4 border-b border-zinc-800">Configuration</h3>
            
            <div className="space-y-4 pt-2 border-b border-zinc-800 pb-6">
              <Label className="text-zinc-300 font-medium tracking-wide text-xs uppercase mb-1 drop-shadow-sm">Export Month</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger data-onboarding="export-month-select" className="w-full bg-[#09090b] border-zinc-800 h-11 transition-all duration-200">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent className="bg-[#18181b] border-zinc-800">
                  {availableMonths.map((m) => (
                    <SelectItem key={m.value} value={m.value} className="focus:bg-zinc-800 focus:text-white rounded-md cursor-pointer transition-colors duration-200 my-0.5">
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center space-x-3">
                <Checkbox 
                  id="summary" 
                  checked={includeSummary} 
                  onCheckedChange={(checked) => setIncludeSummary(checked as boolean)}
                  className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 w-5 h-5"
                />
                <Label htmlFor="summary" className="text-zinc-300 font-medium cursor-pointer">Financial Summary</Label>
              </div>
              
              <div className="flex items-center space-x-3">
                <Checkbox 
                  id="ledger" 
                  checked={includeLedger} 
                  onCheckedChange={(checked) => setIncludeLedger(checked as boolean)}
                  className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 w-5 h-5"
                />
                <Label htmlFor="ledger" className="text-zinc-300 font-medium cursor-pointer">Transaction Ledger</Label>
              </div>
              
              <div className="flex items-center space-x-3">
                <Checkbox 
                  id="audit" 
                  checked={includeAudit} 
                  onCheckedChange={(checked) => setIncludeAudit(checked as boolean)}
                  className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 w-5 h-5"
                />
                <Label htmlFor="audit" className="text-zinc-300 font-medium cursor-pointer">Audit Metrics</Label>
              </div>
            </div>

            <Button 
              onClick={generatePDF} 
              disabled={isGenerating || (!includeSummary && !includeLedger && !includeAudit)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white mt-8 h-12 text-base shadow-lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  Download PDF
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Virtual Preview Panel */}
        <div className="col-span-2 bg-zinc-950/50 rounded-xl p-6 border border-zinc-800 overflow-y-auto flex flex-col items-center shadow-inner">
          <div className="w-full flex justify-between items-center mb-6 max-w-[794px]">
             <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-widest flex items-center gap-2">
               <FileText className="w-4 h-4" />
               Live A4 Preview
             </h3>
             <span className="text-xs text-zinc-600 bg-zinc-900 px-2 py-1 rounded">Scale: 85%</span>
          </div>
          
          <div className="relative transform origin-top" style={{ transform: 'scale(0.85)', width: '794px' }}>
             <div className="shadow-2xl ring-1 ring-zinc-900/10">
               <ReportDocument 
                 ref={reportRef}
                 monthDate={reportData.monthDate}
                 includeSummary={includeSummary}
                 includeLedger={includeLedger}
                 includeAudit={includeAudit}
                 
                 // Pass dynamic extracted values for the preview instead of strictly "live" data
                 totalBudgetPool={reportData.totalBudget}
                 totalUsed={reportData.totalUsed}
                 baseBalance={reportData.baseBalance}
                 carryOverFromLastMonth={reportData.carryOver}
                 safeSpendToday={reportData.safeSpend}
                 financialRunway={reportData.runway}
                 financialHealthState={reportData.financialHealth}
                 primaryGoal={primaryGoal}
                 
                 // Group the preview ledger rows the same way we did for the PDF
                 categoryRows={isCurrentMonth 
                   ? Array.from(new Map<string, number>(
                       [...transactions.filter(t => t.date.startsWith(format(reportData.monthDate, 'yyyy-MM'))), ...fixedCosts.map(c => ({ category: c.category, amount: c.amount, type: 'expense' }))]
                         .reduce((acc, item) => {
                           const key = item.category;
                           acc.set(key, (acc.get(key) || 0) + (item.type === 'expense' ? item.amount : -item.amount));
                           return acc;
                         }, new Map<string, number>())
                     ).entries())
                   : Array.from(new Map<string, number>(
                       (historicalRecord?.transactions || []).reduce((acc, item) => {
                         const key = item.category;
                         acc.set(key, (acc.get(key) || 0) + (item.type === 'expense' ? item.amount : -item.amount));
                         return acc;
                       }, new Map<string, number>())
                     ).entries())
                 }
                 metricDeficit={reportData.deficit}
                 metricDailySpendable={reportData.dailySpendable}
               />
             </div>
          </div>
          {/* Height compensation for scaling */}
          <div style={{ height: '950px' }} />
        </div>
      </div>
    </div>
  );
}
