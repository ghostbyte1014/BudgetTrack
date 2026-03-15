import React from 'react';
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Line,
  Svg,
  Font,
} from '@react-pdf/renderer';
import { format } from 'date-fns';

// Register Roboto — supports full Unicode including ₱ (U+20B1)
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5Q.ttf', fontWeight: 'normal' },
    { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc9.ttf', fontWeight: 'bold' },
  ],
});

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const s = StyleSheet.create({
  page: {
    fontFamily: 'Roboto',
    fontSize: 10,
    color: '#18181b',
    backgroundColor: '#ffffff',
    padding: '32pt 36pt 40pt 36pt',
  },

  // ── Header ─────────────────────────────────────────────────────────────
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', borderBottomWidth: 1.5, borderBottomColor: '#e4e4e7', paddingBottom: 14, marginBottom: 24 },
  headerTitle: { fontSize: 22, fontFamily: 'Roboto', fontWeight: 'bold', color: '#18181b' },
  headerSub: { fontSize: 9, color: '#71717a', marginTop: 3 },
  headerRight: { alignItems: 'flex-end' },
  headerName: { fontSize: 10, fontFamily: 'Roboto', fontWeight: 'bold', color: '#18181b' },
  headerDate: { fontSize: 8, color: '#71717a', marginTop: 2 },

  // ── Section heading ─────────────────────────────────────────────────────
  sectionRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 0.75, borderBottomColor: '#f4f4f5', paddingBottom: 5, marginBottom: 12 },
  sectionTitle: { fontSize: 13, fontFamily: 'Roboto', fontWeight: 'bold', color: '#27272a', marginLeft: 6 },
  sectionBlock: { marginBottom: 28 },

  // ── Cards grid ─────────────────────────────────────────────────────────
  cardRow3: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  cardRow2: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  card: { flex: 1, backgroundColor: '#fafafa', borderRadius: 8, padding: 12, borderWidth: 0.5, borderColor: '#f4f4f5' },
  cardLabel: { fontSize: 8, color: '#71717a', fontFamily: 'Roboto', fontWeight: 'bold', marginBottom: 4 },
  cardValue: { fontSize: 18, fontFamily: 'Roboto', fontWeight: 'bold', color: '#18181b', marginBottom: 4 },
  cardSub: { fontSize: 7.5, color: '#a1a1aa' },
  cardSubRow: { flexDirection: 'row', justifyContent: 'space-between' },

  // ── Table ───────────────────────────────────────────────────────────────
  tableContainer: { backgroundColor: '#fafafa', borderRadius: 8, padding: '10pt 14pt 14pt', borderWidth: 0.5, borderColor: '#f4f4f5' },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 0.75, borderBottomColor: '#e4e4e7', paddingBottom: 5, marginBottom: 4 },
  tableHeaderCell: { fontSize: 8, fontFamily: 'Roboto', fontWeight: 'bold', color: '#71717a', textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#f4f4f5', paddingVertical: 5 },
  tableCell: { fontSize: 9.5, color: '#27272a' },
  tableCellRight: { fontSize: 9.5, color: '#18181b', fontFamily: 'Roboto', fontWeight: 'bold', textAlign: 'right' },
  colCat: { flex: 3 },
  colAmt: { flex: 1 },

  // ── Totals ──────────────────────────────────────────────────────────────
  totalsBlock: { borderTopWidth: 1.5, borderTopColor: '#e4e4e7', marginTop: 10, paddingTop: 8 },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  totalsLabel: { fontSize: 9, fontFamily: 'Roboto', fontWeight: 'bold', color: '#71717a', textTransform: 'uppercase' },
  totalsLabelDark: { fontSize: 9, fontFamily: 'Roboto', fontWeight: 'bold', color: '#18181b', textTransform: 'uppercase' },
  totalsValue: { fontSize: 9, fontFamily: 'Roboto', fontWeight: 'bold', color: '#18181b' },
  totalsValueGreen: { fontSize: 11, fontFamily: 'Roboto', fontWeight: 'bold', color: '#059669' },
  totalsValueRed: { fontSize: 11, fontFamily: 'Roboto', fontWeight: 'bold', color: '#f43f5e' },

  // ── Audit ───────────────────────────────────────────────────────────────
  auditRow: { flexDirection: 'row', gap: 10 },
  auditCard: { flex: 1, borderWidth: 0.5, borderColor: '#f4f4f5', borderRadius: 6, padding: 10 },
  auditLabel: { fontSize: 8, color: '#a1a1aa', fontFamily: 'Roboto', fontWeight: 'bold', marginBottom: 4 },
  auditValue: { fontSize: 16, fontFamily: 'Roboto', fontWeight: 'bold', color: '#18181b' },

  // ── Footer ──────────────────────────────────────────────────────────────
  footer: { position: 'absolute', bottom: 24, left: 36, right: 36, textAlign: 'center', fontSize: 8, color: '#a1a1aa', borderTopWidth: 0.5, borderTopColor: '#e4e4e7', paddingTop: 8 },

  // ── Currency badge ─────────────────────────────────────────────────────────
  currencyBadge: { fontSize: 8, color: '#71717a', backgroundColor: '#f4f4f5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 0.5, borderColor: '#e4e4e7', marginTop: 4, alignSelf: 'flex-start' },
});

// ---------------------------------------------------------------------------
// Prop types
// ---------------------------------------------------------------------------
interface ReportPDFProps {
  userName: string;
  monthDate: Date;
  currencySymbol: string;
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
  includeSummary: boolean;
  includeLedger: boolean;
  includeAudit: boolean;
}

// ---------------------------------------------------------------------------
// Dot icon (stand-in for SVG icons — react-pdf doesn't support lucide-react)
// ---------------------------------------------------------------------------
function GreenDot() {
  return (
    <Svg width="10" height="10" viewBox="0 0 10 10">
      <Line x1="2" y1="5" x2="4" y2="8" strokeWidth={1.5} stroke="#059669" />
      <Line x1="4" y1="8" x2="8" y2="2" strokeWidth={1.5} stroke="#059669" />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// PDF Document
// ---------------------------------------------------------------------------
export function ReportPDF({
  userName, monthDate, currencySymbol,
  totalBudgetPool, totalUsed, baseBalance, carryOverFromLastMonth,
  safeSpendToday, financialRunway, financialHealthState, primaryGoal,
  categoryRows, metricDeficit, metricDailySpendable,
  includeSummary, includeLedger, includeAudit,
}: ReportPDFProps) {
  const monthStr = format(monthDate, 'MMMM yyyy');
  const endingBalance = totalBudgetPool - totalUsed;
  // Numbers only — currency symbol shown once in header
  const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* ── Header ─────────────────────────────────────────────────── */}
        <View style={s.headerRow}>
          <View>
            <Text style={s.headerTitle}>BudgetFlow Transcript</Text>
            <Text style={s.headerSub}>{monthStr}</Text>
            <Text style={s.currencyBadge}>All amounts in {currencySymbol}</Text>
          </View>
          <View style={s.headerRight}>
            <Text style={s.headerName}>{userName}</Text>
            <Text style={s.headerDate}>Generated: {format(new Date(), 'MMM d, yyyy')}</Text>
          </View>
        </View>

        {/* ── Financial Summary ───────────────────────────────────────── */}
        {includeSummary && (
          <View style={s.sectionBlock}>
            <View style={s.sectionRow}>
              <GreenDot />
              <Text style={s.sectionTitle}>Financial Summary</Text>
            </View>

            <View style={s.cardRow3}>
              <View style={s.card}>
                <Text style={s.cardLabel}>TOTAL BUDGET</Text>
                <Text style={s.cardValue}>{fmt(totalBudgetPool)}</Text>
                <View style={s.cardSubRow}>
                  <Text style={s.cardSub}>Base: {fmt(baseBalance)}</Text>
                  <Text style={s.cardSub}>Inherited: {carryOverFromLastMonth > 0 ? '+' : ''}{fmt(carryOverFromLastMonth)}</Text>
                </View>
              </View>

              <View style={s.card}>
                <Text style={s.cardLabel}>TOTAL USED</Text>
                <Text style={s.cardValue}>{fmt(totalUsed)}</Text>
                <Text style={s.cardSub}>{((totalUsed / totalBudgetPool) * 100).toFixed(1)}% of total budget</Text>
              </View>

              <View style={s.card}>
                <Text style={s.cardLabel}>FINANCIAL HEALTH</Text>
                <Text style={[s.cardValue, { fontSize: 14, marginTop: 2 }]}>{financialHealthState}</Text>
                <Text style={s.cardSub}>Goal: {primaryGoal}</Text>
              </View>
            </View>

            <View style={s.cardRow2}>
              <View style={s.card}>
                <Text style={s.cardLabel}>SAFE SPEND TODAY</Text>
                <Text style={[s.cardValue, { fontSize: 16 }]}>{fmt(safeSpendToday)}</Text>
              </View>
              <View style={s.card}>
                <Text style={s.cardLabel}>FINANCIAL RUNWAY</Text>
                <Text style={[s.cardValue, { fontSize: 16 }]}>{financialRunway ? `${financialRunway} Days` : 'Infinite'}</Text>
              </View>
            </View>
          </View>
        )}

        {/* ── Transaction Ledger ──────────────────────────────────────── */}
        {includeLedger && (
          <View style={s.sectionBlock}>
            <View style={s.sectionRow}>
              <GreenDot />
              <Text style={s.sectionTitle}>Transaction Ledger Summary</Text>
            </View>

            <View style={s.tableContainer}>
              {/* Header */}
              <View style={s.tableHeader}>
                <View style={s.colCat}><Text style={s.tableHeaderCell}>Category</Text></View>
                <View style={s.colAmt}><Text style={[s.tableHeaderCell, { textAlign: 'right' }]}>Amount</Text></View>
              </View>

              {/* Rows */}
              {categoryRows.length === 0 ? (
                <Text style={{ fontSize: 9, color: '#71717a', textAlign: 'center', paddingVertical: 10 }}>No transactions for this period.</Text>
              ) : (
                categoryRows.map(([category, amount]) => (
                  <View key={category} style={s.tableRow}>
                    <View style={s.colCat}><Text style={[s.tableCell, { textTransform: 'capitalize' }]}>{category}</Text></View>
                    <View style={s.colAmt}><Text style={s.tableCellRight}>{fmt(amount)}</Text></View>
                  </View>
                ))
              )}

              {/* Totals */}
              {categoryRows.length > 0 && (
                <View style={s.totalsBlock}>
                  <View style={s.totalsRow}>
                    <Text style={s.totalsLabel}>Total Expenses</Text>
                    <Text style={s.totalsValue}>{fmt(totalUsed)}</Text>
                  </View>
                  <View style={s.totalsRow}>
                    <Text style={s.totalsLabelDark}>Ending Balance</Text>
                    <Text style={endingBalance >= 0 ? s.totalsValueGreen : s.totalsValueRed}>
                      {endingBalance < 0 ? '-' : ''}{fmt(Math.abs(endingBalance))}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* ── Audit Metrics ───────────────────────────────────────────── */}
        {includeAudit && (
          <View style={s.sectionBlock}>
            <View style={s.sectionRow}>
              <GreenDot />
              <Text style={s.sectionTitle}>System Audit Metrics</Text>
            </View>
            <View style={s.auditRow}>
              <View style={s.auditCard}>
                <Text style={s.auditLabel}>CURRENT DEFICIT</Text>
                <Text style={s.auditValue}>{fmt(metricDeficit)}</Text>
              </View>
              <View style={s.auditCard}>
                <Text style={s.auditLabel}>DAILY SPENDABLE (ADJUSTED)</Text>
                <Text style={s.auditValue}>{fmt(metricDailySpendable)}</Text>
              </View>
            </View>
          </View>
        )}

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <Text style={s.footer}>BudgetTrack Financial Ledger — Confidential — Page 1</Text>

      </Page>
    </Document>
  );
}
