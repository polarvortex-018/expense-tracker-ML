const normalize = (value) => String(value || '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .trim()

const stopWords = new Set(['a', 'an', 'are', 'can', 'do', 'does', 'for', 'how', 'i', 'in', 'is', 'me', 'my', 'of', 'on', 'the', 'to', 'what', 'where', 'with', 'work'])

const topics = [
  {
    title: 'Savings Buckets',
    answer: 'Savings Buckets label what money is set aside for. Bucket transfers change your allocation without moving money between physical accounts; money not assigned to a bucket remains in the Unallocated Funds Pool.',
    keywords: ['savings', 'bucket', 'buckets', 'allocation', 'unallocated', 'goal'],
    destination: 'faq'
  },
  {
    title: 'Salary Allocation',
    answer: 'Record your income once, configure a Salary Preset with fixed or percentage rules, then apply it to allocate those existing funds across buckets. The allocation is not new income or spending.',
    keywords: ['salary', 'allocation', 'allocate', 'preset', 'split', 'income'],
    destination: 'faq'
  },
  {
    title: 'Debt & Settlement Tracking',
    answer: 'Use Debts to track money lent or borrowed. When it is repaid, use Settle Debt to record the settlement in the selected bank account.',
    keywords: ['debt', 'debts', 'settle', 'settlement', 'lent', 'borrowed', 'repay'],
    destination: 'faq'
  },
  {
    title: 'Vaults',
    answer: 'Vaults are separate SQLite databases stored locally by the app. Use the vault name badge in the header to create or switch between them. They do not automatically sync between devices.',
    keywords: ['vault', 'vaults', 'create', 'switch', 'database', 'separate'],
    destination: 'faq'
  },
  {
    title: 'Filtering & Searching',
    answer: 'In History, filter transactions by date, transaction type, account, bucket, or category. In Cash Buddy, ask about your categories, purchase descriptions, accounts, buckets, and date ranges, then refine the answer with its bucket and date controls.',
    keywords: ['filter', 'filtering', 'search', 'history', 'date', 'category', 'account'],
    destination: 'faq'
  },
  {
    title: 'Balance Audit Log',
    answer: 'Open More → Balance Audit Log to review the trail of balance recalibrations and adjustments across accounts and buckets.',
    keywords: ['audit', 'log', 'adjustment', 'adjustments', 'balance', 'recalibration'],
    destination: 'faq'
  },
  {
    title: 'Backup & Export',
    answer: 'Under More → Backup & Export, export the active vault as a .db SQLite file, create an in-app snapshot, import a backup, or restore a snapshot. Snapshots stay in app-local storage; exported database files may be unencrypted, so protect them as sensitive financial records.',
    keywords: ['backup', 'backups', 'export', 'database', 'snapshot', 'restore', 'db'],
    destination: 'faq'
  },
  {
    title: 'Reports',
    answer: 'Open More → Reports to review spending by month, category, and bucket.',
    keywords: ['report', 'reports', 'spending', 'month', 'category', 'bucket'],
    destination: 'faq'
  },
  {
    title: 'Ask Cash Buddy',
    answer: 'Ask Cash Buddy about spending, income, money sent, category or purchase breakdowns, rankings, period comparisons, averages, trends, recurring expenses, recent spending, savings targets, or daily budgets. Combine questions with your category, account, bucket, and date names. It can correct some small spelling errors and asks you to clarify ambiguous names. Compare multiple periods in the donut chart and category table, select a chart segment to filter its transactions, or adjust the date and bucket controls. For app how-to questions, it searches the built-in local guides.',
    keywords: ['cash buddy', 'parser', 'question', 'questions', 'ask', 'spending', 'income', 'compare', 'comparison', 'average', 'recurring', 'typo', 'spelling', 'category', 'bucket', 'account', 'dates'],
    destination: 'faq'
  }
]

function rankedTopics(question) {
  const tokens = new Set(normalize(question).split(' ').filter((token) => token && !stopWords.has(token)))
  return topics.map((topic) => {
    const topicTokens = new Set([...normalize(topic.title).split(' '), ...topic.keywords])
    const matched = [...tokens].filter((token) => topicTokens.has(token)).length
    const score = tokens.size ? matched / Math.min(tokens.size, topicTokens.size) : 0
    return { topic, score, matched }
  }).sort((left, right) => right.score - left.score || right.matched - left.matched)
}

export function searchHelp(question) {
  const best = rankedTopics(question)[0]

  return best && (best.matched >= 2 || best.score >= 0.5)
    ? { ...best.topic, keywords: [...best.topic.keywords] }
    : null
}

export function suggestHelpTopics(question, limit = 3) {
  return rankedTopics(question).slice(0, limit).map(({ topic }) => ({ title: topic.title, destination: topic.destination }))
}
