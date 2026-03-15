import React, { forwardRef } from 'react';
import { useBudget } from '../contexts/BudgetContext';
import { format } from 'date-fns';

// A4 dimensions in pixels at 96 DPI: 794px x 1123px
const A4_WIDTH = 794;
const A4_HEIGHT = 1123;

// Safe hex colors — no oklch, no Tailwind vars
const C = {
  white: '#ffffff',
  black: '#000000',
  zinc900: '#18181b',
  zinc800: '#27272a',
  zinc600: '#52525b',
  zinc500: '#71717a',
  zinc400: '#a1a1aa',
  zinc200: '#e4e4e7',
  zinc100: '#f4f4f5',
  zinc50:  '#fafafa',
  emerald600: '#059669',
  emerald100: '#d1fae5',
  rose500: '#f43f5e',
  rose100: '#ffe4e6',
};
interface ReportDocumentProps {
  monthDate?: Date;
  includeSummary?: boolean;
  includeLedger?: boolean;
  includeAudit?: boolean;
  
  // Dynamic historical props
  totalBudgetPool: number;
  totalUsed: number;
  baseBalance: number;
  carryOverFromLastMonth: number;
  safeSpendToday: number;
  financialRunway: number | null;
  financialHealthState: string;
  primaryGoal: string;
  categoryRows: [string, number][];
  metricDeficit: number;
  metricDailySpendable: number;
}

export const ReportDocument = forwardRef<HTMLDivElement, ReportDocumentProps>(
  ({ 
    monthDate = new Date(), 
    includeSummary = true, 
    includeLedger = true, 
    includeAudit = false,
    totalBudgetPool,
    totalUsed,
    baseBalance,
    carryOverFromLastMonth,
    safeSpendToday,
    financialRunway,
    financialHealthState,
    primaryGoal,
    categoryRows,
    metricDeficit,
    metricDailySpendable
  }, ref) => {
    const { user, currencySymbol } = useBudget();

    const monthStr = format(monthDate, 'MMMM yyyy');
    const endingBalance = totalBudgetPool - totalUsed;

    const healthColor = financialHealthState?.includes('Stable') ? C.emerald600
      : financialHealthState?.includes('Warning') || financialHealthState?.includes('Risk') ? '#ca8a04' : C.rose500;

    const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
      <div
        id="report-document"
        ref={ref}
        style={{
          width: `${A4_WIDTH}px`,
          minHeight: `${A4_HEIGHT}px`,
          backgroundColor: C.white,
          color: C.black,
          padding: '32px 36px',
          fontFamily: "'Arial', sans-serif",
          letterSpacing: 'normal',
          boxSizing: 'border-box',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: `2px solid ${C.zinc200}`, paddingBottom: '16px', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: C.zinc900, margin: 0 }}>BudgetFlow Transcript</h1>
            <p style={{ color: C.zinc500, marginTop: '4px', fontSize: '14px' }}>{monthStr}</p>
            <div style={{ display: 'inline-block', backgroundColor: C.zinc100, border: `1px solid ${C.zinc200}`, color: C.zinc500, fontSize: '11px', padding: '2px 8px', borderRadius: '4px', marginTop: '6px' }}>
              All amounts in {currencySymbol}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '14px', fontWeight: 500, color: C.zinc900, margin: 0 }}>{user?.name}</p>
            <p style={{ fontSize: '12px', color: C.zinc500, marginTop: '4px' }}>Generated: {format(new Date(), 'MMM d, yyyy')}</p>
          </div>
        </div>

        {/* Financial Summary */}
        {includeSummary && (
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: `1px solid ${C.zinc100}`, paddingBottom: '8px', marginBottom: '16px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.emerald600} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: C.zinc800, margin: 0 }}>Financial Summary</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              {/* Total Budget */}
              <div style={{ backgroundColor: C.zinc50, borderRadius: '12px', padding: '20px', border: `1px solid ${C.zinc100}` }}>
                <p style={{ fontSize: '13px', color: C.zinc500, fontWeight: 500, marginBottom: '4px' }}>Total Budget</p>
                <p style={{ fontSize: '24px', fontWeight: 700, color: C.zinc900, margin: '0 0 8px 0' }}>{fmt(totalBudgetPool)}</p>
                <div style={{ fontSize: '11px', color: C.zinc400, display: 'flex', justifyContent: 'space-between' }}>
                  <span>Base: {fmt(baseBalance)}</span>
                  <span>Inherited: {carryOverFromLastMonth > 0 ? '+' : ''}{fmt(carryOverFromLastMonth)}</span>
                </div>
              </div>

              {/* Total Used */}
              <div style={{ backgroundColor: C.zinc50, borderRadius: '12px', padding: '20px', border: `1px solid ${C.zinc100}` }}>
                <p style={{ fontSize: '13px', color: C.zinc500, fontWeight: 500, marginBottom: '4px' }}>Total Used</p>
                <p style={{ fontSize: '24px', fontWeight: 700, color: C.zinc900, margin: '0 0 8px 0' }}>{fmt(totalUsed)}</p>
                <p style={{ fontSize: '11px', color: C.zinc400, margin: 0 }}>{((totalUsed / totalBudgetPool) * 100).toFixed(1)}% of total budget</p>
              </div>

              {/* Financial Health */}
              <div style={{ backgroundColor: C.zinc50, borderRadius: '12px', padding: '20px', border: `1px solid ${C.zinc100}` }}>
                <p style={{ fontSize: '13px', color: C.zinc500, fontWeight: 500, marginBottom: '4px' }}>Financial Health</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <HeartPulse color={healthColor} />
                  <p style={{ fontSize: '18px', fontWeight: 700, color: C.zinc900, margin: 0 }}>{financialHealthState}</p>
                </div>
                <p style={{ fontSize: '11px', color: C.zinc400, marginTop: '8px' }}>Goal: {primaryGoal}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={{ backgroundColor: C.zinc50, borderRadius: '12px', padding: '20px', border: `1px solid ${C.zinc100}` }}>
                <p style={{ fontSize: '13px', color: C.zinc500, fontWeight: 500, marginBottom: '4px' }}>Safe Spend Today</p>
                <p style={{ fontSize: '20px', fontWeight: 700, color: C.zinc900, margin: 0 }}>{fmt(safeSpendToday)}</p>
              </div>
              <div style={{ backgroundColor: C.zinc50, borderRadius: '12px', padding: '20px', border: `1px solid ${C.zinc100}` }}>
                <p style={{ fontSize: '13px', color: C.zinc500, fontWeight: 500, marginBottom: '4px' }}>Financial Runway</p>
                <p style={{ fontSize: '20px', fontWeight: 700, color: C.zinc900, margin: 0 }}>{financialRunway ? `${financialRunway} Days` : 'Infinite'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Transaction Ledger */}
        {includeLedger && (
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: `1px solid ${C.zinc100}`, paddingBottom: '8px', marginBottom: '16px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.emerald600} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: C.zinc800, margin: 0 }}>Transaction Ledger Summary</h2>
            </div>

            <div style={{ backgroundColor: C.zinc50, borderRadius: '12px', padding: '20px', border: `1px solid ${C.zinc100}` }}>
              {/* Header row */}
              <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', fontSize: '11px', fontWeight: 600, color: C.zinc500, textTransform: 'uppercase', paddingBottom: '8px', borderBottom: `1px solid ${C.zinc200}` }}>
                <span>Category</span>
                <span style={{ textAlign: 'right' }}>Amount</span>
              </div>

              {/* Category rows */}
              {categoryRows.length === 0 ? (
                <p style={{ textAlign: 'center', color: C.zinc500, padding: '16px 0', fontSize: '14px' }}>No transactions available for this period.</p>
              ) : (
                categoryRows.map(([category, amount]) => (
                  <div key={category} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', padding: '8px 0', borderBottom: `1px solid ${C.zinc100}` }}>
                    <span style={{ color: C.zinc800, fontWeight: 500, textTransform: 'capitalize', fontSize: '14px' }}>{category}</span>
                    <span style={{ textAlign: 'right', fontWeight: 500, color: C.zinc900, fontSize: '14px' }}>
                      {fmt(amount)}
                    </span>
                  </div>
                ))
              )}

              {/* Totals */}
              {categoryRows.length > 0 && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: `2px solid ${C.zinc200}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: C.zinc500, textTransform: 'uppercase' }}>Total Expenses</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: C.zinc900 }}>{fmt(totalUsed)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: C.zinc900, textTransform: 'uppercase' }}>Ending Balance</span>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: endingBalance >= 0 ? C.emerald600 : C.rose500 }}>
                      {endingBalance < 0 ? '-' : ''}{fmt(Math.abs(endingBalance))}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Audit Metrics */}
        {includeAudit && (
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: `1px solid ${C.zinc100}`, paddingBottom: '8px', marginBottom: '16px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.emerald600} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: C.zinc800, margin: 0 }}>System Audit Metrics</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ border: `1px solid ${C.zinc100}`, borderRadius: '8px', padding: '16px' }}>
                <p style={{ fontSize: '11px', color: C.zinc400, fontWeight: 500, marginBottom: '4px' }}>Current Deficit</p>
                <p style={{ fontSize: '18px', fontWeight: 700, color: C.zinc900, margin: 0 }}>{fmt(metricDeficit)}</p>
              </div>
              <div style={{ border: `1px solid ${C.zinc100}`, borderRadius: '8px', padding: '16px' }}>
                <p style={{ fontSize: '11px', color: C.zinc400, fontWeight: 500, marginBottom: '4px' }}>Daily Spendable (Adjusted)</p>
                <p style={{ fontSize: '18px', fontWeight: 700, color: C.zinc900, margin: 0 }}>{fmt(metricDailySpendable)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: '64px', paddingTop: '24px', borderTop: `1px solid ${C.zinc200}`, textAlign: 'center', fontSize: '11px', color: C.zinc400 }}>
          BudgetTrack Financial Ledger — Confidential — Page 1
        </div>
      </div>
    );
  }
);

ReportDocument.displayName = 'ReportDocument';

function HeartPulse({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
    </svg>
  );
}
