const normalize = (value) => String(value || '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .trim()

const stopWords = new Set(['a', 'an', 'are', 'can', 'do', 'does', 'for', 'how', 'i', 'in', 'is', 'me', 'my', 'of', 'on', 'the', 'to', 'what', 'where', 'with', 'work'])

const topics = [
  {
    title: 'Savings Buckets',
    answer: 'Savings Buckets are virtual goal allocations within your money. You can move allocated funds between buckets, while money not assigned to a bucket remains in the Unallocated Funds Pool.',
    keywords: ['savings', 'bucket', 'buckets', 'allocation', 'unallocated', 'goal'],
    destination: 'faq'
  },
  {
    title: 'Salary Allocation',
    answer: 'Log income, configure a Salary Preset with fixed or percentage rules, then apply it to split unallocated funds across target buckets.',
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
    answer: 'Vaults are isolated SQLite databases on your device. Use the vault name badge in the header to create or switch between separate finance vaults.',
    keywords: ['vault', 'vaults', 'create', 'switch', 'database', 'separate'],
    destination: 'faq'
  },
  {
    title: 'Filtering & Searching',
    answer: 'In History, filter transactions by date range, transaction type, account, bucket, or category.',
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
    answer: 'Under More → Backup & Export, export the active database as a .db SQLite file or create a local snapshot restore point.',
    keywords: ['backup', 'backups', 'export', 'database', 'snapshot', 'restore', 'db'],
    destination: 'faq'
  },
  {
    title: 'Reports',
    answer: 'Open More → Reports to review spending by month, category, and bucket.',
    keywords: ['report', 'reports', 'spending', 'month', 'category', 'bucket'],
    destination: 'faq'
  }
]

export function searchHelp(question) {
  const tokens = new Set(normalize(question).split(' ').filter((token) => token && !stopWords.has(token)))
  if (!tokens.size) return null

  let best = null
  for (const topic of topics) {
    const topicTokens = new Set([...normalize(topic.title).split(' '), ...topic.keywords])
    const matched = [...tokens].filter((token) => topicTokens.has(token)).length
    const score = matched / Math.min(tokens.size, topicTokens.size)
    if (matched && (!best || score > best.score || (score === best.score && matched > best.matched))) {
      best = { topic, score, matched }
    }
  }

  return best && (best.matched >= 2 || best.score >= 0.5)
    ? { ...best.topic, keywords: [...best.topic.keywords] }
    : null
}
