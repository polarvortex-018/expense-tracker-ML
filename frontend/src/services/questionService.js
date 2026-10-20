import { api } from './api.js'
import { classifyQuestion, parseFinanceQuestion } from '../utils/questionParser.js'
import { searchHelp, suggestHelpTopics } from '../utils/helpSearch.js'

const round = (value) => Math.round((Number(value) || 0) * 100) / 100
const normalize = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
const itemId = (item) => item.kind === 'category' ? `category:${item.id}` : `description:${normalize(item.text)}`
const chartColors = ['#f04452', '#00b36b', '#00c18a', '#05b7cf', '#e500d7', '#f4a000', '#ffd0b4', '#4084f5', '#a9f0dc', '#9d6bff', '#ff7ca8', '#75c7ff']
const termAliases = {
  petrol: ['fuel', 'gasoline'], fuel: ['petrol', 'gasoline'], gasoline: ['petrol', 'fuel'],
  groceries: ['grocery', 'food'], grocery: ['groceries', 'food'],
  taxi: ['cab'], cab: ['taxi'], electricity: ['power'], power: ['electricity']
}

function oneEditAway(left, right) {
  if (Math.abs(left.length - right.length) > 1) return false
  let i = 0; let j = 0; let edits = 0
  while (i < left.length && j < right.length) {
    if (left[i] === right[j]) { i += 1; j += 1; continue }
    if (++edits > 1) return false
    if (left.length > right.length) i += 1
    else if (right.length > left.length) j += 1
    else { i += 1; j += 1 }
  }
  return edits + (i < left.length || j < right.length ? 1 : 0) <= 1
}

function matchesDescription(term, value) {
  const query = normalize(term)
  const description = normalize(value)
  if (!query || !description) return false
  if (description.includes(query)) return true
  if ((termAliases[query] || []).some((alias) => description.split(' ').includes(alias))) return true
  if (query.split(' ').length !== 1 || query.length < 4) return false
  return description.split(' ').some((word) => word.length >= 4 && oneEditAway(query, word))
}

function assignUniqueColors(groups) {
  const used = new Set()
  return groups.map((group, index) => {
    const existing = group.color && group.color.toLowerCase() !== '#9e9cae' ? group.color : null
    const color = existing && !used.has(existing.toLowerCase())
      ? existing
      : chartColors.find((candidate) => !used.has(candidate.toLowerCase())) || chartColors[index % chartColors.length]
    used.add(color.toLowerCase())
    return { ...group, color }
  })
}

function requestedGroups(rows, items, flow) {
  const groups = items.map((item) => ({
    id: itemId(item),
    name: item.kind === 'category' ? item.name : item.text,
    color: item.kind === 'category' ? rows.find((row) => String(row.category_id) === String(item.id))?.category_color || null : null,
    total: 0,
    count: 0
  }))
  let overlap = false

  for (const row of rows) {
    const description = normalize(row.description)
    const bucketName = normalize(row.bucket_name)
    const isOutgoingTransfer = flow === 'outgoing' && row.transaction_type === 'transfer'
    const matches = items.filter((item) => item.kind === 'category'
      ? String(row.category_id) === String(item.id) || (flow === 'outgoing' && matchesDescription(item.name, description)) || (isOutgoingTransfer && matchesDescription(item.name, bucketName))
      : matchesDescription(item.text, description) || (isOutgoingTransfer && matchesDescription(item.text, bucketName)))
    if (matches.length > 1) overlap = true
    for (const item of matches) {
      const group = groups.find((candidate) => candidate.id === itemId(item))
      group.total += Number(row.amount) || 0
      group.count += 1
    }
  }
  return { groups: overlap ? [] : assignUniqueColors(groups.filter((group) => group.count).map((group) => ({ ...group, total: round(group.total) }))), overlap }
}

function compareCategoriesByPeriod(rows, ranges) {
  if (ranges.length < 2) return []
  const categories = new Map()
  for (const row of rows) {
    const id = String(row.category_id || 'uncategorized')
    const category = categories.get(id) || { id, name: row.category_name || 'Uncategorized', color: row.category_color || null, totals: ranges.map(() => 0) }
    ranges.forEach((range, index) => {
      if (row.date >= range.startDate && row.date <= range.endDate) category.totals[index] += Number(row.amount) || 0
    })
    categories.set(id, category)
  }
  return [...categories.values()]
    .map((category) => ({ ...category, totals: category.totals.map(round), total: round(category.totals.reduce((sum, value) => sum + value, 0)) }))
    .filter((category) => category.total > 0)
    .sort((left, right) => right.total - left.total)
}

function transactionGroupIds(row, groups, flow) {
  const description = normalize(row.description)
  const bucketName = normalize(row.bucket_name)
  const isOutgoingTransfer = flow === 'outgoing' && row.transaction_type === 'transfer'
  return groups.filter((group) => {
    if (group.startDate && group.endDate) return row.date >= group.startDate && row.date <= group.endDate
    if (group.id.startsWith('category:')) {
      const categoryId = group.id.slice('category:'.length)
      return String(row.category_id) === categoryId
        || (flow === 'outgoing' && matchesDescription(group.name, description))
        || (isOutgoingTransfer && matchesDescription(group.name, bucketName))
    }
    if (group.id.startsWith('description:')) {
      return matchesDescription(group.name, description) || (isOutgoingTransfer && matchesDescription(group.name, bucketName))
    }
    return String(row.category_id || 'uncategorized') === String(group.id)
  }).map((group) => group.id)
}

function aggregate(rows, spec) {
  const uniqueRows = [...new Map(rows.map((row) => [String(row.id), row])).values()]
  const daily = new Map()
  const broadGroups = new Map()
  let total = 0

  for (const row of uniqueRows) {
    const amount = Number(row.amount) || 0
    total += amount
    daily.set(row.date, (daily.get(row.date) || 0) + amount)
    if (!spec.items.length) {
      const id = row.category_id ? String(row.category_id) : 'uncategorized'
      const group = broadGroups.get(id) || { id, name: row.category_name || 'Uncategorized', color: row.category_color || null, total: 0, count: 0 }
      group.total += amount
      group.count += 1
      broadGroups.set(id, group)
    }
  }

  const requested = spec.items.length ? requestedGroups(uniqueRows, spec.items, spec.flow) : { groups: [], overlap: false }
  const groups = spec.dateRanges?.length > 1
    ? assignUniqueColors(spec.dateRanges.map((range, index) => ({
      id: `period:${index}`,
      name: range.label || `${range.startDate} to ${range.endDate}`,
      startDate: range.startDate,
      endDate: range.endDate,
      total: round(uniqueRows.filter((row) => row.date >= range.startDate && row.date <= range.endDate).reduce((sum, row) => sum + (Number(row.amount) || 0), 0)),
      count: uniqueRows.filter((row) => row.date >= range.startDate && row.date <= range.endDate).length
    })))
    : spec.items.length
    ? requested.groups
    : assignUniqueColors([...broadGroups.values()].map((group) => ({ ...group, total: round(group.total) })))
  const largestTransaction = uniqueRows.reduce((largest, row) => !largest || Number(row.amount) > Number(largest.amount) ? row : largest, null)
  return {
    total: round(total),
    transactionCount: uniqueRows.length,
    firstDate: uniqueRows.reduce((first, row) => row.date && (!first || row.date < first) ? row.date : first, null),
    lastDate: uniqueRows.reduce((last, row) => row.date && (!last || row.date > last) ? row.date : last, null),
    activeDayCount: daily.size,
    averagePerActiveDay: daily.size ? round(total / daily.size) : 0,
    largestTransaction,
    dailyTotals: [...daily].map(([date, amount]) => ({ date, total: round(amount) })),
    groups,
    transactions: uniqueRows.map((row) => ({ ...row, groupIds: transactionGroupIds(row, groups, spec.flow) })),
    groupMode: spec.dateRanges?.length > 1 ? 'period' : spec.items.length ? 'requested' : 'category',
    categoryComparisons: compareCategoriesByPeriod(uniqueRows, spec.dateRanges || []),
    overlap: requested.overlap
  }
}

const monthKey = (date) => String(date || '').slice(0, 7)
const weekKey = (date) => {
  const value = new Date(`${String(date || '').slice(0, 10)}T00:00:00`)
  if (Number.isNaN(value.getTime())) return 'Unknown week'
  const day = (value.getDay() + 6) % 7
  value.setDate(value.getDate() - day)
  return `Week of ${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
}

function analyticsGroups(rows, spec) {
  const groups = new Map()
  for (const row of rows) {
    const key = spec.groupBy === 'month' ? monthKey(row.date)
      : spec.groupBy === 'week' ? weekKey(row.date)
        : spec.groupBy === 'day' ? String(row.date || '').slice(0, 10)
          : spec.groupBy === 'account' ? String(row.account_id || 'unassigned')
            : spec.groupBy === 'bucket' ? String(row.bucket_id || 'unassigned')
              : spec.groupBy === 'description' ? normalize(row.description) || 'no description'
                : String(row.category_id || 'uncategorized')
    const current = groups.get(key) || {
      id: `analytics:${spec.groupBy}:${key}`,
      name: spec.groupBy === 'month' ? key
        : spec.groupBy === 'week' || spec.groupBy === 'day' ? key
          : spec.groupBy === 'account' ? row.account_name || 'Unassigned account'
            : spec.groupBy === 'bucket' ? row.bucket_name || 'Unassigned bucket'
              : spec.groupBy === 'description' ? row.description || 'No description'
                : row.category_name || 'Uncategorized',
      color: row.category_color || null,
      total: 0,
      count: 0,
      transactionIds: []
    }
    current.total += Number(row.amount) || 0
    current.count += 1
    current.transactionIds.push(String(row.id))
    groups.set(key, current)
  }
  return assignUniqueColors([...groups.values()].map((group) => ({ ...group, total: round(group.total) })))
}

function applyAnalytics(rows, spec, base, buckets, now = new Date(), netWorth = 0, budgetEndDate = null) {
  if (spec.intent === 'target_remaining') {
    const matched = buckets.filter((bucket) => spec.bucketIds.length ? spec.bucketIds.includes(String(bucket.id)) : true)
      .filter((bucket) => Number(bucket.target_amount) > 0)
      .map((bucket) => ({ ...bucket, remaining: round(Math.max(0, Number(bucket.target_amount) - Number(bucket.allocated_balance || 0))) }))
    if (!matched.length) return { kind: 'insight', title: 'No savings target found', message: 'Set a target amount on a savings bucket to see how much is left to reach it.' }
    return { kind: 'insight', title: 'Remaining to reach your target', message: matched.map((bucket) => `${bucket.name}: ${bucket.remaining ? `${bucket.remaining} remaining` : 'target reached'} of ${round(bucket.target_amount)}.`).join(' '), groups: matched.map((bucket) => ({ id: `bucket:${bucket.id}`, name: bucket.name, total: bucket.remaining, remaining: bucket.remaining, color: bucket.color })) }
  }
  if (spec.intent === 'daily_budget') {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfMonth = budgetEndDate ? new Date(`${budgetEndDate}T00:00:00`) : new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const daysLeft = Math.max(1, Math.round((Date.UTC(endOfMonth.getFullYear(), endOfMonth.getMonth(), endOfMonth.getDate()) - Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())) / 86400000) + 1)
    const selectedBuckets = spec.bucketIds.length
      ? buckets.filter((bucket) => spec.bucketIds.includes(String(bucket.id)) && !bucket.is_archived)
      : []
    const hasBucketSelection = spec.bucketIds.length > 0
    if (hasBucketSelection && !selectedBuckets.length) return { kind: 'insight', title: 'Bucket not found', message: 'I could not match that bucket in the active vault.' }
    const balances = hasBucketSelection
      ? selectedBuckets.map((bucket) => ({ id: bucket.id, name: bucket.name, balance: Math.max(0, Number(bucket.allocated_balance) || 0), color: bucket.color, icon: bucket.icon }))
      : [{ id: 'net-worth', name: 'Net worth', balance: Math.max(0, Number(netWorth) || 0), color: '#D4BFFF', icon: 'account_balance' }]
    const available = round(balances.reduce((sum, bucket) => sum + bucket.balance, 0))
    const dailyAmount = round(available / daysLeft)
    return {
      kind: 'insight',
      title: 'Suggested daily spending',
      dailyBudget: true,
      dailyBudgetSource: hasBucketSelection ? 'buckets' : 'net_worth',
      budgetEndDate: `${endOfMonth.getFullYear()}-${String(endOfMonth.getMonth() + 1).padStart(2, '0')}-${String(endOfMonth.getDate()).padStart(2, '0')}`,
      daysLeft,
      dailyAmount,
      available,
      message: `Using ${hasBucketSelection ? 'only the selected bucket balances' : 'your dashboard net worth'}, divided across the ${daysLeft} days left in this month, including today.`,
      groups: balances.map((bucket) => ({ id: `daily-budget:${bucket.id}`, name: bucket.name, remaining: round(bucket.balance / daysLeft), balance: round(bucket.balance), color: bucket.color, icon: bucket.icon }))
    }
  }

  if (spec.dateRanges?.length > 1) {
    return { ...base, analyticsIntent: spec.intent === 'trend' ? 'trend' : null, analyticsGroupBy: null, message: 'Compare spending across the selected periods.' }
  }

  let workingRows = [...rows]
  if (spec.intent === 'recent_amount') {
    let accumulated = 0
    workingRows = workingRows.filter((row) => {
      if (accumulated >= spec.amount) return false
      accumulated += Number(row.amount) || 0
      return true
    })
    const recent = aggregate(workingRows, { ...spec, dateRanges: [], items: [] })
    const recentGroups = analyticsGroups(workingRows, { ...spec, groupBy: 'category' })
    return { ...recent, total: round(accumulated), groups: recentGroups, groupMode: 'analytics', analyticsIntent: spec.intent, threshold: spec.amount, thresholdExceededBy: round(Math.max(0, accumulated - spec.amount)), message: `These are your most recent transactions up to the requested amount. The final transaction is included in full, so the total can exceed the amount slightly.`, transactions: recent.transactions.map((row) => ({ ...row, groupIds: recentGroups.filter((group) => group.transactionIds.includes(String(row.id))).map((group) => group.id) })) }
  }

  const groupBy = spec.groupBy || 'category'
  let groups = analyticsGroups(workingRows, { ...spec, groupBy })
  if (spec.intent === 'frequency') groups.sort((a, b) => b.count - a.count || b.total - a.total)
  else if (spec.intent !== 'trend') groups.sort((a, b) => spec.direction === 'asc' ? a.total - b.total : b.total - a.total)
  if (spec.intent === 'rank') groups = groups.slice(Math.max(0, (spec.rankPosition || 1) - 1), spec.rankPosition || 1)
  const groupMode = 'analytics'
  const rankedGroup = spec.intent === 'rank' ? groups[0] || null : null
  const rankedIds = new Set(rankedGroup?.transactionIds || [])
  const rankedSummary = spec.intent === 'rank'
    ? aggregate(workingRows.filter((row) => rankedIds.has(String(row.id))), { ...spec, items: [], dateRanges: [] })
    : null
  const groupIdsByTransaction = new Map()
  for (const group of groups) for (const id of group.transactionIds) {
    const list = groupIdsByTransaction.get(id) || []
    list.push(group.id)
    groupIdsByTransaction.set(id, list)
  }
  const transactions = base.transactions
    .filter((row) => spec.intent !== 'rank' || rankedIds.has(String(row.id)))
    .map((row) => ({ ...row, groupIds: groupIdsByTransaction.get(String(row.id)) || [] }))

  let candidates = []
  if (spec.intent === 'recurring') {
    candidates = analyticsGroups(workingRows, { ...spec, groupBy: 'description' })
      .filter((group) => group.count >= 3 && new Set(workingRows.filter((row) => normalize(row.description) === normalize(group.name)).map((row) => monthKey(row.date))).size >= 2)
      .sort((a, b) => b.count - a.count || b.total - a.total)
    groups = candidates
  }
  const averageGroups = spec.intent === 'average'
    ? (() => {
      const dates = workingRows.map((row) => String(row.date || '').slice(0, 10)).filter(Boolean).sort()
      if (!dates.length) return []
      const periodCount = groupBy === 'month'
        ? Math.max(1, (Number(monthKey(dates.at(-1)).slice(0, 4)) - Number(monthKey(dates[0]).slice(0, 4))) * 12 + Number(monthKey(dates.at(-1)).slice(5, 7)) - Number(monthKey(dates[0]).slice(5, 7)) + 1)
        : Math.max(1, Math.floor((new Date(`${dates.at(-1)}T00:00:00`) - new Date(`${dates[0]}T00:00:00`)) / 604800000) + 1)
      const total = round(workingRows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0) / periodCount)
      return [{ id: `average:${groupBy}`, name: `Average per ${groupBy}`, total, count: workingRows.length, color: chartColors[0], transactionIds: workingRows.map((row) => String(row.id)), periodCount }]
    })()
    : groups
  const selectedGroups = spec.intent === 'average' ? averageGroups : groups
  const rankedTop = rankedGroup
  const rankPosition = spec.rankPosition || 1
  const rankSuffix = rankPosition % 100 >= 11 && rankPosition % 100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[rankPosition % 10] || 'th')
  const rankDescription = rankPosition === 1
    ? (spec.direction === 'asc' ? 'lowest' : 'highest')
    : `${rankPosition}${rankSuffix}-${spec.direction === 'asc' ? 'lowest' : 'highest'}`
  const message = spec.intent === 'rank' && rankedTop
    ? `${rankedTop.name} had the ${rankDescription} spending at ${round(rankedTop.total)} across ${rankedTop.count} transactions.`
    : spec.intent === 'recurring'
      ? candidates.length ? 'These descriptions appear at least three times across multiple months. They are possible recurring expenses, not confirmed subscriptions.' : 'No repeated expense descriptions were found across multiple months.'
      : spec.intent === 'average' ? `Average ${spec.groupBy} spending is based on the full calendar span of matching records, including periods with no matching transactions.`
        : spec.intent === 'frequency' ? 'Ranked by number of matching transactions.'
          : spec.intent === 'trend' ? 'Compare the totals across the selected periods.' : `Grouped by ${groupBy}.`
  return {
    ...(rankedSummary || base),
    groups: selectedGroups,
    transactions,
    groupMode,
    analyticsIntent: spec.intent,
    analyticsGroupBy: groupBy,
    rankPosition,
    direction: spec.direction,
    message,
    averageBasis: spec.intent === 'average' ? 'active periods' : null
  }
}

const unsupported = (question) => ({
  kind: 'unsupported',
  question,
  message: 'I can help with expense totals or Cash Buddy guides. Try “How much did I spend on petrol?” or “How do I create another vault?”'
})

const unsupportedHelp = (question) => ({
  kind: 'unsupported',
  question,
  message: 'I could not find a matching Cash Buddy guide. Try one of these local guide topics or the examples below.',
  suggestions: suggestHelpTopics(question)
})

export async function answerQuestion({ question, categories, accounts = [], buckets = [], now = new Date(), netWorth = 0, overrides = null }) {
  const kind = classifyQuestion(question)
  const help = kind === 'finance' ? null : searchHelp(question)
  if (kind === 'help' || help) {
    if (!help) return kind === 'help' ? unsupportedHelp(question) : unsupported(question)
    return { kind: 'help', question, title: help.title, answer: help.answer, destination: help.destination }
  }
  if (kind !== 'finance') return unsupported(question)

  const parsed = parseFinanceQuestion(question, categories, now, { accounts, buckets })
  if (parsed.status !== 'ok') return { kind: parsed.status, question, message: parsed.message }
  if (overrides?.bucketIds) parsed.spec.bucketIds = overrides.bucketIds.map(String)
  if (overrides?.dateRanges) {
    parsed.spec.dateRanges = overrides.dateRanges
    parsed.spec.startDate = overrides.dateRanges.length === 1 ? overrides.dateRanges[0].startDate : null
    parsed.spec.endDate = overrides.dateRanges.length === 1 ? overrides.dateRanges[0].endDate : null
    parsed.spec.dateLabel = overrides.dateRanges.length
      ? overrides.dateRanges.map((range) => range.label || `${range.startDate} to ${range.endDate}`).join(' and ')
      : 'all time'
  }
  if (['target_remaining', 'daily_budget'].includes(parsed.spec.intent)) {
    return { ...applyAnalytics([], parsed.spec, null, buckets, now, netWorth, overrides?.budgetEndDate || null), question, queryFilters: { bucketIds: parsed.spec.bucketIds, dateRanges: parsed.spec.dateRanges } }
  }
  const hasDescriptionItems = parsed.spec.items.some((item) => item.kind === 'description')
  const querySpec = hasDescriptionItems ? { ...parsed.spec, items: [] } : parsed.spec
  let rows = await api.getQuestionTransactions(querySpec)
  if (hasDescriptionItems) {
    rows = rows.filter((row) => parsed.spec.items.some((item) => item.kind === 'category'
      ? String(row.category_id) === String(item.id)
        || (parsed.spec.flow === 'outgoing' && matchesDescription(item.name, row.description))
        || (parsed.spec.flow === 'outgoing' && row.transaction_type === 'transfer' && matchesDescription(item.name, row.bucket_name))
      : matchesDescription(item.text, row.description) || (parsed.spec.flow === 'outgoing' && matchesDescription(item.text, row.bucket_name))))
  }
  const interpretation = {
    periods: parsed.spec.dateRanges.map((range) => range.label || `${range.startDate} to ${range.endDate}`),
    items: parsed.spec.items.map((item) => item.name || item.text),
    accounts: accounts.filter((account) => parsed.spec.accountIds.includes(String(account.id))).map((account) => account.name),
    buckets: buckets.filter((bucket) => parsed.spec.bucketIds.includes(String(bucket.id))).map((bucket) => bucket.name)
  }
  const result = aggregate(rows, parsed.spec)
  const analytics = ['rank', 'trend', 'average', 'frequency', 'recurring', 'recent_amount', 'target_remaining', 'breakdown'].includes(parsed.spec.intent)
  const analysis = analytics ? applyAnalytics(rows, parsed.spec, result, buckets, now, netWorth) : result
  if (analysis.kind === 'insight') return { ...analysis, question }
  return { kind: 'finance', question, dateLabel: parsed.spec.dateLabel, flow: parsed.spec.flow, interpretation, transactions: rows, queryFilters: { bucketIds: parsed.spec.bucketIds, dateRanges: parsed.spec.dateRanges }, ...analysis }
}
