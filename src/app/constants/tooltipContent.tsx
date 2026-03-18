export const TOOLTIP_CONTENT = {
  dailySpendable: {
    detailed: (
      <>
        <p className="font-bold text-white mb-2">Your Daily Spending Limit</p>
        <p className="text-zinc-400">
          We calculate this using yesterday's balance, so it stays fixed all day. Think of it as your daily allowance—once you know the number at breakfast, you can plan your entire day around it.
        </p>
        <p className="text-xs text-zinc-500 mt-2 p-2 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
          <strong className="text-amber-500">Key Insight:</strong> Buying lunch doesn't change this number. That's the point.
        </p>
      </>
    ),
    learnMoreLink: '/how-it-works#daily-spendable'
  },
  realTimeSafeSpend: {
    detailed: (
      <>
        <p className="font-bold text-white mb-2">Real-Time Safe Spend</p>
        <p className="text-zinc-400">
          Unlike Daily Spendable (which stays fixed), this updates instantly as you add expenses. Use it for quick checks like <em>"Can I afford this $30 item?"</em>
        </p>
        <p className="text-xs text-zinc-500 mt-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
          <span><strong>Formula:</strong> Current balance ÷ days left in the month</span>
        </p>
      </>
    ),
    learnMoreLink: '/how-it-works#safe-spend'
  },
  financialRunway: {
    detailed: (
      <>
        <p className="font-bold text-white mb-2">Financial Runway</p>
        <p className="text-zinc-400">
          Based on your average daily spending. If you have $600 and spend $20/day, your runway is 30 days.
        </p>
        <div className="mt-3 space-y-1.5 text-xs text-zinc-400">
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div><span>30+ days = Safe</span></div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></div><span>7-29 days = Caution</span></div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></div><span>&lt;7 days = Critical</span></div>
        </div>
      </>
    ),
    learnMoreLink: '/how-it-works#runway'
  },
  spendingPace: {
    detailed: (
      <>
        <p className="font-bold text-white mb-2">Spending Pace</p>
        <p className="text-zinc-400">
          How today's spending compares to your target. Resets every midnight.
        </p>
        <div className="mt-3 space-y-1.5 text-xs font-mono">
          <p className="text-emerald-400">1.0x = On pace (perfect)</p>
          <p className="text-blue-400">0.7x = Under pace (saving!)</p>
          <p className="text-rose-400">1.5x = Overspending</p>
        </div>
      </>
    ),
    learnMoreLink: '/how-it-works#pacing'
  },
  disciplineScore: {
    detailed: (
      <>
        <p className="font-bold text-white mb-2">Discipline Score</p>
        <p className="text-zinc-400">
          Starts at 100. You lose points for overspending or going into deficit. You gain/lose ±10 points based on bill payment reliability.
        </p>
        <p className="text-xs text-zinc-500 mt-2 p-2 bg-zinc-800/50 rounded-lg">
          Think of it as your financial credit score—higher is better.
        </p>
      </>
    ),
    learnMoreLink: '/how-it-works#discipline-score'
  },
  carryOver: {
    detailed: (
      <>
        <p className="font-bold text-white mb-2">The Bridge Carry-Over</p>
        <p className="text-zinc-400">
          BudgetTrack doesn't reset every month. If you overspent last month, you start this month in deficit. If you saved, you get a head start.
        </p>
        <p className="text-xs text-zinc-500 mt-2 italic border-l-2 border-zinc-700 pl-2">
          "You can't escape consequences, but you CAN recover from them."
        </p>
      </>
    ),
    learnMoreLink: '/how-it-works#bridge'
  },
  transactionTypes: {
    detailed: (
      <>
        <p className="font-bold text-white mb-2">Transaction Types</p>
        <p className="text-zinc-400">
          <strong>Expenses:</strong> Deduct from your monthly pool immediately.<br/>
          <strong>Income:</strong> Adds to your pool, increasing your Daily Spendable.
        </p>
        <p className="text-xs text-zinc-500 mt-2 p-2 bg-zinc-800/50 rounded-lg">
          If you mark an Expense as a "Fixed Cost", it satisfies that pending bill without double-deducting from your pool.
        </p>
      </>
    ),
    learnMoreLink: '/how-it-works'
  },
  reservedAllocation: {
    detailed: (
      <>
        <p className="font-bold text-white mb-2">Reserved Allocation</p>
        <p className="text-zinc-400">
          The sum of all your fixed costs. This money is instantly locked away from your Monthly Pool on day 1 so you don't accidentally spend it on variable expenses.
        </p>
      </>
    ),
    learnMoreLink: '/how-it-works'
  }
};
